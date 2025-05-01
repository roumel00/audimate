const { WebSocket } = require("ws")

let session = { usage: { input: 0, output: 0 } }

function handleCallConnection(ws, openAIApiKey) {
  cleanupConnection(session.twilioConn)
  session.twilioConn = ws
  session.openAIApiKey = openAIApiKey

  ws.on("message", (data) => handleTwilioMessage(data))
  ws.on("error", () => ws.close())
  ws.on("close", () => {
    cleanupConnection(session.modelConn)
    cleanupConnection(session.twilioConn)
    session.twilioConn = undefined
    session.modelConn = undefined
    session.streamSid = undefined
    session.lastAssistantItem = undefined
    session.responseStartTimestamp = undefined
    session.latestMediaTimestamp = undefined
    if (!session.frontendConn) session = { usage: { input: 0, output: 0 } }
  })
}

function handleFrontendConnection(ws) {
  cleanupConnection(session.frontendConn)
  session.frontendConn = ws

  ws.on("message", (data) => handleFrontendMessage(data))
  ws.on("error", () => ws.close())
  ws.on("close", () => {
    cleanupConnection(session.frontendConn)
    session.frontendConn = undefined
    if (!session.twilioConn && !session.modelConn) session = { usage: { input: 0, output: 0 } }
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
      closeAllConnections()
      break
  }
}

function handleFrontendMessage(data) {
  const msg = parseMessage(data)
  if (!msg) return

  if (isOpen(session.modelConn)) {
    jsonSend(session.modelConn, msg)
  }

  if (msg.type === "session.update") {
    session.saved_config = msg.session
  }
}

function tryConnectModel() {
  if (!session.twilioConn || !session.streamSid || !session.openAIApiKey) return
  if (isOpen(session.modelConn)) return

  session.modelConn = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
    headers: {
      Authorization: `Bearer ${session.openAIApiKey}`,
      "OpenAI-Beta": "realtime=v1",
    },
  })

  session.modelConn.on("open", () => {
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

    jsonSend(session.modelConn, { type: "response.create" })
  })

  session.modelConn.on("message", (data) => handleModelMessage(data))
  session.modelConn.on("error", () => closeModel())
  session.modelConn.on("close", () => closeModel())
}

function handleModelMessage(data) {
  const event = parseMessage(data)
  if (!event) return

  jsonSend(session.frontendConn, event)

  switch (event.type) {
    case "input_audio_buffer.speech_started":
      handleTruncation()
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

    case "response.done":
    case "response.output_item.done":
      if (event.response?.usage) {
        const u = event.response.usage
        session.usage.input  += u.input_tokens  ?? 0
        session.usage.output += u.output_tokens ?? 0
      }

      jsonSend(session.frontendConn, {
        event: "usage",
        usage: session.usage
      })

      break
  }
}

function handleTruncation() {
  if (!session.lastAssistantItem || session.responseStartTimestamp === undefined) return

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

  if (session.twilioConn && session.streamSid) {
    jsonSend(session.twilioConn, {
      event: "clear",
      streamSid: session.streamSid,
    });
  }

  session.lastAssistantItem = undefined;
  session.responseStartTimestamp = undefined;
}

function closeModel() {
  cleanupConnection(session.modelConn)
  session.modelConn = undefined
  if (!session.twilioConn && !session.frontendConn) session = { usage: { input: 0, output: 0 } }
}

function closeAllConnections() {
  console.log("[Session] Closing all connections")
  cleanupConnection(session.twilioConn)
  cleanupConnection(session.modelConn)
  cleanupConnection(session.frontendConn)

  session = { usage: { input: 0, output: 0 } }
}

function cleanupConnection(ws) {
  if (isOpen(ws)) ws.close()
}

function parseMessage(data) {
  try {
    return JSON.parse(data.toString())
  } catch {
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
