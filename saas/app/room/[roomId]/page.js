"use client";
import { use, useState, useEffect } from "react";
import YouTubeVideo from "@/components/Video";
import { useParams } from "next/navigation";
import axios from "axios";
import getSocket from "@/app/getSocket";

export default function RoomPage() {
  const [song, setSong] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [queue, setQueue] = useState([]);
  const { roomId } = useParams();
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [seekTime, setSeekTime] = useState(null);
  const [newvideoId, setNewVideoId] = useState(null);
  const [map, setMap] = useState(new Map());
  const [skipvotes, setSkipvotes] = useState(0);
  const [skipmap, setSkipmap] = useState(new Map());
  const [songskiped, setSongSkiped] = useState(false);
  const [roomOwner, setRoomOwner] = useState(false);
 
  const [room, setRoom] = useState({
    Users: 0,
    skipvotes: 0,
    currentSong: null,
    queue: [],
    timeline: 0,
  });

  const API_KEY = "AIzaSyC7vHD2boW3PSryqZbgcYZG_sYWHGoBcPI";

  const fetchdata = async (videoId) => {
    const res = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${API_KEY}`
    );
    const data = res.data.items[0];

    const song = {
      title: data.snippet.title,
      id: videoId,
      thumbnail: data.snippet.thumbnails.default.url,
      upvotes: 0,
    };
    const updatedQueue = [...room.queue, song];
    const ws = getSocket();
    if (room.currentSong === null) {
      ws.send(
        JSON.stringify({ type: "CurrentSong", roomId, videoId, TimeLine: 0 })
      );
      ws.send(JSON.stringify({ type: "Queue", roomId, queue: updatedQueue }));
    } else {
      ws.send(JSON.stringify({ type: "Queue", roomId, queue: updatedQueue }));
    }
  };

  const handleAddSong = () => {
    const url = JSON.stringify(song);
    const videoId = url.split("=")[1].split('"')[0];
    console.log(videoId);
    fetchdata(videoId);
    setSong("");
  };

  const sendQueueUpdate = () => {
    const ws = getSocket();
  
    const updateQueue = () => {
      ws.send(JSON.stringify({ type: "Queue", roomId, queue: room.queue }));
      
    };

    if (ws.readyState === WebSocket.OPEN) {
      updateQueue();
    } else {
      ws.addEventListener("open", updateQueue, { once: true });

      return () => ws.removeEventListener("open", updateQueue);
    }
  };


  

  useEffect(() => {
    if (!roomId) return;

    const ws = getSocket();

    const sendJoinRoom = () => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log("WebSocket connected");
        ws.send(JSON.stringify({ type: "joinRoom", roomId }));
        console.log("Joining room:", roomId);
      } else {
        ws.addEventListener("open", sendJoinRoom, { once: true });
      }
    };

    sendJoinRoom();

    return () => {
      ws.removeEventListener("open", sendJoinRoom);
    };
  }, []);

  useEffect(() => {
    const ws = getSocket();

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.type === "Users") {
        console.log("Users Received:", data.Users);
        setRoom((prevRoom) => ({ ...prevRoom, Users: data.Users }));
      }
      if (data.type == "Queue") {
        console.log("Queue Received:", data.queue);
        setRoom((prevRoom) => ({ ...prevRoom, queue: data.queue }));
      }
      if (data.type == "roomOwner") {
        setRoomOwner(true);
        console.log("You are the owner of the room");
      }
      if (data.type == "Skipvotes") {
        setRoom((prevRoom) => ({ ...prevRoom, skipvotes: data.skipvotes }));
      }

      
        if (data.type == "CurrentSong") {
          console.log("CurrentSong Received:", data.videoId);
          if (room.currentSong === null) {
            setRoom((prevRoom) => ({
              ...prevRoom,
              currentSong: data.videoId,
              timeline: data.TimeLine,
            }));
          }
        }
        console.log(room);
      
    };
    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [room]);

 
 

  const handleupvote = (id) => {
     
    if (map.has(id)) {
      return;
    }

    setMap(new Map(map).set(id, 1));


    const newQueue = room.queue.map((song) => {
      if (song.id === id) {
        return { ...song, upvotes: song.upvotes + 1 };
      }
      return song;
    });

    newQueue.sort((a, b) => b.upvotes - a.upvotes);

    setRoom((prevRoom) => ({ ...prevRoom, queue: newQueue }));
    
    const ws = getSocket();

     if (ws.readyState === WebSocket.OPEN) {
        console.log("handleupvotes",newQueue);
        ws.send(JSON.stringify({ type: "HandleUpvotes", roomId, queue: newQueue }));
      } 
  };

 

  const handleSkipSong = () => {
    const ws = getSocket();
    if (skipmap.has(roomId)) {
      return;
    }
    setSkipmap(new Map(skipmap).set(roomId, 1));
    setRoom((prevRoom) => ({ ...prevRoom, skipvotes: room.skipvotes + 1 }));
    const newSkipvotes = room.skipvotes + 1;
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "Skipvotes", roomId, skipvotes: newSkipvotes }));
      } 


  };

  useEffect(() => {
    if (videoId || newvideoId) return;

    const updatedQueue = () => {
      setQueue((prevQueue) => {
        if (prevQueue.length === 0) return [];

        const nextVideoId = prevQueue[0]?.id || null;
        console.log("before queue", prevQueue);
        console.log("videoId to play next:", nextVideoId);

        setVideoId(nextVideoId);
        setNewVideoId(nextVideoId);
        console.log(videoId);
        const updatedQueue = prevQueue.slice(1);
        return updatedQueue;
      });
      console.log("after queue", queue);
      sendQueueUpdate();
    };
    if (songskiped) {
      updatedQueue();
      setSongSkiped(false);
    }
  }, [songskiped]);

  useEffect(() => {}, [queue]);
  return (
    <div className="bg-gray-900 text-white min-h-screen flex">
      <div className="container mx-auto p-4 text-center flex-1">
        <h1 className="text-3xl font-bold mb-4">Welcome to the room</h1>
        {room.Users >= 1 ? (
          <p>Users in the room: {room.Users}</p>
        ) : (
          <p>Users in the room: {room.Users}</p>
        )}
        <p className="mb-4">Add Your Own Song</p>
        <input
          value={song}
          onChange={(e) => setSong(e.target.value)}
          type="text"
          placeholder="Enter song name"
          className="p-2 border border-gray-500 rounded mb-4 w-full max-w-md mx-auto text-black"
        />
        <button
          onClick={handleAddSong}
          className="p-2 bg-blue-600 hover:bg-blue-800 text-white rounded mb-4"
        >
          Add Song
        </button>
        {room.currentSong && (
          <>
            <YouTubeVideo
              params={{
                id: room.currentSong.id,
                room: room,
                setRoom: setRoom,
                roomOwner: roomOwner,
                roomId: roomId,
              }}
            />
            <div>
              <button
                onClick={handleSkipSong}
                className="py-1 px-2 bg-green-600 hover:bg-green-800 text-white rounded"
              >
                {" "}
                Skip : {room.skipvotes}
              </button>
            </div>
          </>
        )}
      </div>
      <div className="w-1/3 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Queue</h2>
        {room.queue.map((song) => (
          <div
            key={song.id}
            className="flex items-center justify-between p-2 border-b border-gray-700"
          >
            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-16 h-16 mr-4"
            />
            <div className="flex-1 text-left">
              <p className="font-semibold">{song.title}</p>
              <p>
                <button
                  onClick={() => handleupvote(song.id)}
                  className="py-1 px-2 bg-green-600 hover:bg-green-800 text-white rounded"
                >
                  Upvotes
                </button>{" "}
                : {song.upvotes}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
