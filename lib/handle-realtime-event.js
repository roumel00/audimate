export default function handleRealtimeEvent(evt, setItems) {
  setItems((prev) => {
    const items = [...prev]
    const byId = (id) => items.find((m) => m.id === id)

    if (
      ["conversation.item.created", "conversation.item.create"].includes(evt.type) &&
      evt.item?.type === "message" &&
      evt.item.role === "user"
    ) {
      const { id } = evt.item
      if (!byId(id)) {
        const initialContent =
          evt.item.content && evt.item.content.length > 0
            ? evt.item.content[0]?.text || evt.item.content[0]?.input_text || ""
            : ""

        items.push({
          id,
          type: "message",
          role: "user",
          content: [{ type: "text", text: initialContent }],
          created_at: new Date().toISOString(),
        })
      }
    }

    if (evt.type === "input_audio_transcription.delta") {
      const { item_id, delta } = evt
      if (!delta) return items

      let msg = byId(item_id)
      if (!msg) {
        msg = {
          id: item_id,
          type: "message",
          role: "user",
          content: [{ type: "text", text: "" }],
          created_at: new Date().toISOString(),
        }
        items.push(msg)
      }

      const currentText = msg.content[0].text || ""
      msg.content[0].text = currentText + delta
    }

    if (evt.type === "conversation.item.input_audio_transcription.completed") {
      const userMessages = items.filter((item) => item.role === "user")
      if (userMessages.length > 0) {
        const latestUserMsg = userMessages[userMessages.length - 1]
        latestUserMsg.content = [{ type: "text", text: evt.transcript }]
      } else {
        const newId = `user-${Date.now()}`
        items.push({
          id: newId,
          type: "message",
          role: "user",
          content: [{ type: "text", text: evt.transcript }],
          created_at: new Date().toISOString(),
        })
      }
    }

    if (evt.type === "input_audio_transcription.completed") {
      const { item_id, transcript } = evt
      const msg = byId(item_id)
      if (msg) {
        msg.content = [{ type: "text", text: transcript }]
      }
    }

    if (evt.type === "response.message.delta") {
      // const { item_id, delta } = evt;
      // you can implement live assistant typing here if desired
    }

    if (evt.type === "response.output_item.done" && evt.item) {
      const { item } = evt

      if (item.type === "message") {
        let content
        if (item.content && item.content.length > 0) {
          content =
            item.content[0]?.transcript ||
            item.content[0]?.text ||
            (typeof item.content[0] === "string" ? item.content[0] : JSON.stringify(item.content))
        } else {
          content = JSON.stringify(item.content)
        }

        items.push({
          id: item.id,
          type: "message",
          role: "assistant",
          content: item.content,
          created_at: new Date().toISOString(),
        })
      }
    }

    return items
  })
}
