"use client"
import { useState, useEffect, useRef } from "react"
import getSocket from "@/app/getSocket"
import { Send } from "lucide-react"

export default function ChatBox({ roomId }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const ws = getSocket()

    const handleMessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data)
      if (data.type === "chat") {
        setMessages((prevMessages) => [...prevMessages, data.message])
      }
    }

    ws.addEventListener("message", handleMessage)

    return () => {
      ws.removeEventListener("message", handleMessage)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (inputMessage.trim() === "") return

    const ws = getSocket()
    ws.send(
      JSON.stringify({
        type: "chat",
        roomId: roomId,
        message: inputMessage,
      }),
    )

    setInputMessage("")
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg  rounded-lg p-4 flex flex-col h-80">
      <h2 className="text-2xl font-semibold mb-4">Chat</h2>
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 text-white">
            <span className="font-bold">{msg.user}: </span>
            <span>{msg}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-grow p-2 rounded-l-md text-black"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-md transition duration-300 flex items-center"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}

