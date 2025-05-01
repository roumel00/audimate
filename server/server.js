const express = require("express")
const { WebSocketServer, WebSocket } = require("ws")
const { createServer } = require("http")
const { readFileSync } = require("fs")
const { join } = require("path")
const cors = require("cors")
const dotenv = require("dotenv")
const { handleCallConnection, handleFrontendConnection } = require("./sessionManager")

dotenv.config({ path: ".env.local" })

const PORT = Number.parseInt(process.env.REALTIME_PORT || "8081", 10)
const PUBLIC_URL = process.env.REALTIME_PUBLIC_URL || ""
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY environment variable is required")
  process.exit(1)
}

const app = express()
app.use(cors())
const server = createServer(app)
const wss = new WebSocketServer({ server })

app.use(express.urlencoded({ extended: false }))

const twimlPath = join(__dirname, "twiml.xml")
const twimlTemplate = readFileSync(twimlPath, "utf-8")

app.get("/public-url", (req, res) => {
  res.json({ publicUrl: PUBLIC_URL })
})

app.all("/twiml", (req, res) => {
  try {
    const wsUrl = new URL(PUBLIC_URL)
    wsUrl.protocol = "wss:"
    wsUrl.pathname = `/call`

    const twimlContent = twimlTemplate.replace("{{WS_URL}}", wsUrl.toString())
    res.type("text/xml").send(twimlContent)
  } catch (err) {
    console.error("Error generating TwiML:", err)
    res.status(500).send("Internal Server Error")
  }
})

let currentCall = null
let currentLogs = null

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`)
  const parts = url.pathname.split("/").filter(Boolean)

  if (parts.length < 1) {
    ws.close()
    return
  }

  const type = parts[0]

  try {
    if (type === "call") {
      if (currentCall) currentCall.close()
      currentCall = ws
      handleCallConnection(currentCall, OPENAI_API_KEY)
    } else if (type === "logs") {
      if (currentLogs) currentLogs.close()
      currentLogs = ws
      handleFrontendConnection(currentLogs)
    } else {
      ws.close()
    }
  } catch (err) {
    console.error(`Error handling WebSocket connection (${type}):`, err)
    ws.close()
  }

  // Always attach error listeners to WebSocket connections
  ws.on("error", (err) => {
    console.error(`WebSocket error on ${type} connection:`, err)
  })

  ws.on("close", (code, reason) => {
    console.log(`WebSocket closed (${type}), code: ${code}, reason: ${reason}`)
  })
})

server.on("error", (err) => {
  console.error("HTTP Server error:", err)
})

function startServer() {
  server.listen(PORT, () => {
    console.log(`OpenAI Realtime server running on http://localhost:${PORT}`)
  })
}

startServer()
