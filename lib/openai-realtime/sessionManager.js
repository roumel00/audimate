const { WebSocket } = require("ws")

let session = {}

function handleCallConnection(ws, openAIApiKey) {
  cleanupConnection(session.twilioConn)
  session.twilioConn = ws
  session.openAIApiKey = openAIApiKey

  ws.on("message", (data) => {
    handleTwilioMessage(data)
  })

  ws.on("error", (err) => {
    console.error("[Call] WebSocket error:", err)
    ws.close()
  })

  ws.on("close", (code, reason) => {
    console.log(`[Call] Twilio WebSocket closed. Code: ${code}, Reason: ${reason || "(none)"}`)
    cleanupConnection(session.modelConn)
    cleanupConnection(session.twilioConn)
    session.twilioConn = undefined
    session.modelConn = undefined
    session.streamSid = undefined
    session.lastAssistantItem = undefined
    session.responseStartTimestamp = undefined
    session.latestMediaTimestamp = undefined
    if (!session.frontendConn) session = {}
  })
}

function handleFrontendConnection(ws) {
  cleanupConnection(session.frontendConn)
  session.frontendConn = ws

  ws.on("message", (data) => {
    handleFrontendMessage(data)
  })

  ws.on("error", (err) => {
    console.error("[Frontend] WebSocket error:", err)
    ws.close()
  })

  ws.on("close", (code, reason) => {
    console.log(`[Frontend] Frontend WebSocket closed. Code: ${code}, Reason: ${reason || "(none)"}`)
    cleanupConnection(session.frontendConn)
    session.frontendConn = undefined
    if (!session.twilioConn && !session.modelConn) session = {}
  })
}

function handleTwilioMessage(data) {
  const msg = parseMessage(data)
  if (!msg) return

  switch (msg.event) {
    case "start":
      session.streamSid = msg.start.streamSid
      session.latestMediaTimestamp = 0
      session.lastAssistantItem = undefined
      session.responseStartTimestamp = undefined
      tryConnectModel()
      break

    case "media":
      session.latestMediaTimestamp = msg.media.timestamp
      if (isOpen(session.modelConn)) {
        jsonSend(session.modelConn, {
          type: "input_audio_buffer.append",
          audio: msg.media.payload,
        })
      }
      break

    case "close":
      console.log("[Call] Received Twilio 'close' event")
      closeAllConnections()
      break
  }
}

function handleFrontendMessage(data) {
  const msg = parseMessage(data)
  if (!msg) return

  console.log("[Frontend] Parsed frontend message:", msg.type)

  if (isOpen(session.modelConn)) {
    console.log(msg)
    jsonSend(session.modelConn, msg)
  }

  if (msg.type === "session.update") {
    console.log("[Frontend] Updated saved session config")
    session.saved_config = msg.session
  }
}
// function handleFrontendMessage(data) {
//   const msg = parseMessage(data);
//   if (!msg) return;

//   console.log("[Frontend → Server] RX:", msg.type, msg.item?.content?.[0]?.text || "");

//   if (msg.type === "session.update") {
//     console.log("[Frontend] Updated saved session config");
//     session.saved_config = msg.session;
//   }

//   if (!session.pendingFrontendMsgs) {
//     session.pendingFrontendMsgs = [];
//   }

//   if (isOpen(session.modelConn)) {
//     jsonSend(session.modelConn, msg);
//   } else {
//     session.pendingFrontendMsgs.push(msg);
//     console.log(
//       `[Frontend] Queued message (${session.pendingFrontendMsgs.length} waiting)`
//     );
//   }
// }


function tryConnectModel() {
  if (!session.twilioConn || !session.streamSid || !session.openAIApiKey) {
    console.log("[Model] Missing info to connect model, skipping...")
    return
  }
  if (isOpen(session.modelConn)) {
    console.log("[Model] Model connection already open, skipping...")
    return
  }

  console.log("[Model] Connecting to OpenAI Realtime Model...")
  session.modelConn = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
    headers: {
      Authorization: `Bearer ${session.openAIApiKey}`,
      "OpenAI-Beta": "realtime=v1",
    },
  })

  session.modelConn.on("open", () => {
    console.log("[Model] Model WebSocket opened")

    const config = session.saved_config || {}
    jsonSend(session.modelConn, {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        turn_detection: { type: "server_vad" },
        voice: "ash",
        input_audio_transcription: { model: "whisper-1" },
        input_audio_format: "g711_ulaw",
        output_audio_format: "g711_ulaw",
        ...config,
      },
    })

    // if (session.pendingFrontendMsgs?.length) {
    //   session.pendingFrontendMsgs.forEach((m) => jsonSend(session.modelConn, m));
    //   session.pendingFrontendMsgs.forEach((m) => console.log(m));
    //   session.pendingFrontendMsgs = [];
    // }

    jsonSend(session.modelConn, { type: "response.create" })
  })

  session.modelConn.on("message", (data) => {
    console.log("[Model] Received model message")
    handleModelMessage(data)
  })

  session.modelConn.on("error", (err) => {
    console.error("[Model] Model WebSocket error:", err)
    closeModel()
  })

  session.modelConn.on("close", (code, reason) => {
    console.log(`[Model] Model WebSocket closed. Code: ${code}, Reason: ${reason || "(none)"}`)
    closeModel()
  })
}

function handleModelMessage(data) {
  const event = parseMessage(data)
  if (!event) return

  // Log all events from the model for debugging
  console.log("[Model] Received event type:", event.type)

  // Forward all events to the frontend if connected
  if (isOpen(session.frontendConn)) {
    jsonSend(session.frontendConn, event)
  } else {
    console.log("[Model] Frontend not connected, can't forward event")
  }

  switch (event.type) {
    case "input_audio_buffer.speech_started":
      handleTruncation()
      break

    case "input_audio_transcription.delta":
      // Log transcription deltas
      console.log("[Model] Transcription delta:", event.delta)
      break

    case "input_audio_transcription.completed":
      // Log completed transcriptions
      console.log("[Model] Transcription completed:", event.transcript)
      break

    case "response.audio.delta":
      if (session.twilioConn && session.streamSid) {
        if (session.responseStartTimestamp === undefined) {
          session.responseStartTimestamp = session.latestMediaTimestamp || 0
        }
        if (event.item_id) session.lastAssistantItem = event.item_id

        jsonSend(session.twilioConn, {
          event: "media",
          streamSid: session.streamSid,
          media: { payload: event.delta },
        })

        jsonSend(session.twilioConn, {
          event: "mark",
          streamSid: session.streamSid,
        })
      }
      break
  }
}

function handleTruncation() {
  if (!session.lastAssistantItem || session.responseStartTimestamp === undefined) return

  console.log("[Model] Handling truncation")

  const elapsedMs = (session.latestMediaTimestamp || 0) - (session.responseStartTimestamp || 0)
  const audio_end_ms = elapsedMs > 0 ? elapsedMs : 0

  if (isOpen(session.modelConn)) {
    jsonSend(session.modelConn, {
      type: "conversation.item.truncate",
      item_id: session.lastAssistantItem,
      content_index: 0,
      audio_end_ms,
    })
  }
}

function closeModel() {
  console.log("[Model] Closing model connection")
  cleanupConnection(session.modelConn)
  session.modelConn = undefined
}

function closeAllConnections() {
  console.log("[Session] Closing all connections")
  cleanupConnection(session.twilioConn)
  cleanupConnection(session.modelConn)
  cleanupConnection(session.frontendConn)

  session = {}
}

function cleanupConnection(ws) {
  if (ws) ws.close()
}

function parseMessage(data) {
  try {
    return JSON.parse(data.toString())
  } catch (error) {
    console.error("[Parse] Error parsing message:", error)
    return null
  }
}

function jsonSend(ws, obj) {
  if (isOpen(ws)) {
    ws.send(JSON.stringify(obj))
  }
}

function isOpen(ws) {
  return ws && ws.readyState === WebSocket.OPEN
}

module.exports = {
  handleCallConnection,
  handleFrontendConnection,
}
