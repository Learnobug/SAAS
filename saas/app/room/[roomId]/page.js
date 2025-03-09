"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import getSocket from "@/app/getSocket"
import YouTubeVideo from "@/components/Video"
import ChatBox from "@/components/Chatbox"
import { SkipForward, ThumbsUp, Send } from "lucide-react"

export default function RoomPage() {
  const [song, setSong] = useState("")
  const [room, setRoom] = useState({
    Users: 0,
    skipvotes: 0,
    currentSong: null,
    queue: [],
    timeline: 0,
  })
  const { roomId } = useParams()
  const [map, setMap] = useState(new Map())
  const [skipmap, setSkipmap] = useState(new Map())
  const [roomOwner, setRoomOwner] = useState(false)

  const API_KEY = "AIzaSyC7vHD2boW3PSryqZbgcYZG_sYWHGoBcPI"

  useEffect(() => {
    if (!roomId) return
    const ws = getSocket()
    const sendJoinRoom = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "joinRoom", roomId }))
      } else {
        ws.addEventListener("open", sendJoinRoom, { once: true })
      }
    }
    sendJoinRoom()
    return () => {
      ws.removeEventListener("open", sendJoinRoom)
    }
  }, [roomId])

  useEffect(() => {
    const ws = getSocket()
    const handleMessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "Users") {
        setRoom((prevRoom) => ({ ...prevRoom, Users: data.Users }))
      } else if (data.type === "Queue") {
        setRoom((prevRoom) => ({ ...prevRoom, queue: data.queue }))
      } else if (data.type === "roomOwner") {
        setRoomOwner(true)
      } else if (data.type === "Skipvotes") {
        setRoom((prevRoom) => ({ ...prevRoom, skipvotes: data.skipvotes }))
      } else if (data.type === "CurrentSong") {
        if (room.currentSong === null) {
          setRoom((prevRoom) => ({
            ...prevRoom,
            currentSong: data.videoId,
            timeline: data.TimeLine,
          }))
        }
      }
    }
    ws.addEventListener("message", handleMessage)
    return () => {
      ws.removeEventListener("message", handleMessage)
    }
  }, [room])

  const fetchdata = async (videoId) => {
    const res = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${API_KEY}`,
    )
    const data = res.data.items[0]
    const song = {
      title: data.snippet.title,
      id: videoId,
      thumbnail: data.snippet.thumbnails.default.url,
      upvotes: 0,
    }
    const updatedQueue = [...room.queue, song]
    room.queue.sort((a, b) => b.upvotes - a.upvotes)
    const ws = getSocket()
    ws.send(JSON.stringify({ type: "Queue", roomId, queue: updatedQueue }))
  }

  const handleAddSong = () => {
    const url = song;
    const params = new URL(url).searchParams;
    const videoId = params.get("v");
    fetchdata(videoId)
    setSong("")
  }

  const handleupvote = (id) => {
    if (map.has(id)) return
    setMap(new Map(map).set(id, 1))
   console.log("upvote",id);
    // setRoom((prevRoom) => ({ ...prevRoom, queue: newQueue }))
    const ws = getSocket()
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "HandleUpvotes", roomId,songId:id }))
    }
  }

  const handleSkipSong = () => {
    const ws = getSocket()
    if (skipmap.has(room.currentSong.id)) return
    setSkipmap(new Map(skipmap).set(room.currentSong.id, 1))
    const newSkipvotes = room.skipvotes + 1
    setRoom((prevRoom) => ({ ...prevRoom, skipvotes: newSkipvotes }))
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "Skipvotes", roomId, skipvotes: newSkipvotes }))
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white min-h-screen flex flex-col md:flex-row">
      <div className="md:w-2/3 p-6 flex flex-col">
        <h1 className="text-4xl font-bold mb-4">Music Room: {roomId}</h1>
        <p className="mb-4">Users in the room: {room.Users}</p>

        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Add a Song</h2>
          <div className="flex">
            <input
              value={song}
              onChange={(e) => setSong(e.target.value)}
              type="text"
              placeholder="Enter YouTube URL"
              className="flex-grow p-2 rounded-l-md text-black"
            />
            <button
              onClick={handleAddSong}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-md transition duration-300 flex items-center"
            >
              <Send size={20} className="mr-2" />
              Add
            </button>
          </div>
        </div>

        {room.currentSong && (
          <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Now Playing</h2>
            <YouTubeVideo
              params={{
                id: room.currentSong.id,
                room: room,
                setRoom: setRoom,
                roomOwner: roomOwner,
                roomId: roomId,
              }}
            />
            <button
              onClick={handleSkipSong}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-300 flex items-center"
            >
              <SkipForward size={20} className="mr-2" />
              Skip ({room.skipvotes})
            </button>
          </div>
        )}
      </div>

      <div className="md:w-1/3 p-6 flex flex-col">
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6 mb-6 flex-grow overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4">Queue</h2>
          {room.queue.map((song) => (
            <div key={song.id} className="flex items-center p-2 border-b border-gray-700 last:border-b-0">
              <img
                src={song.thumbnail || "/placeholder.svg"}
                alt={song.title}
                className="w-16 h-16 object-cover rounded mr-4"
              />
              <div className="flex-grow">
                <p className="font-semibold truncate">{song.title}</p>
                <button
                  onClick={() => handleupvote(song.id)}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-sm transition duration-300 flex items-center"
                >
                  <ThumbsUp size={16} className="mr-1" />
                  Upvote ({song.upvotes})
                </button>
              </div>
            </div>
          ))}
        </div>

        <ChatBox roomId={roomId} />
      </div>
    </div>
  )
}

