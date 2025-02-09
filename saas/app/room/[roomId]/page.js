"use client";
import { use, useState,useEffect } from "react";
import YouTubeVideo from "@/components/Video";
import { useParams } from "next/navigation";
import axios from "axios";
import getSocket from "@/app/getSocket";

export default function RoomPage(){
    const [song, setSong] = useState("");
    const [videoId, setVideoId] = useState(null);
    const [queue, setQueue] = useState([]);
    const { roomId } = useParams();
   const [playedSeconds, setPlayedSeconds] = useState(0);
   const [seekTime, setSeekTime] = useState(null);
   const [newvideoId, setNewVideoId] = useState(null);

    const API_KEY = "AIzaSyC7vHD2boW3PSryqZbgcYZG_sYWHGoBcPI";
 
    const handleAddSong = () => {
    const url= JSON.stringify(song);
    const videoId =   url.split('=')[1].split('"')[0];
   console.log(videoId);
    fetchdata(videoId);
   setVideoId(videoId);
   sendQueueUpdate();
    
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

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.type === "QueueUpdated") {
                console.log("Queue updated:", data.queue);
                setQueue(data.queue);
                
            }
        };

        return () => {
            ws.removeEventListener("open", sendJoinRoom);
        };
    }, []);

    useEffect(() => {
        
        const ws = getSocket();

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.type === "sendTimeLine")
                {
                    if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "sendTimeLine", roomId, playedSeconds , videoId }));
                    }
                }  
                if(data.type === "sendT")
                    {
                        console.log(data);
                        console.log("timeline recieved");
                        setSeekTime(data.playedSeconds);
                        setVideoIdfun(data.videoId);
                        
                    }
        };

    },[videoId,playedSeconds]);

    const setVideoIdfun = (videoId) => {
        console.log("videoIdxsx",videoId);
        setNewVideoId(videoId);
    
    };


    const sendQueueUpdate = () => {
       
        const ws = getSocket();
    
        const updateQueue = () => {
            ws.send(JSON.stringify({ type: "Queue", roomId, queue }));
            console.log("Queue sent:", queue);
        };
    
        if (ws.readyState === WebSocket.OPEN) {
            updateQueue();
        } else {
            ws.addEventListener("open", updateQueue, { once: true });
    
            return () => ws.removeEventListener("open", updateQueue);
        }
    };
    
  


    const handleupvote = (id) => {
        const newQueue = queue.map((song) => {
            if (song.id === id) {
                return { ...song, upvotes: song.upvotes + 1 };
            }
            return song;
        });

        newQueue.sort((a, b) => b.upvotes - a.upvotes);
        
        setQueue(newQueue);
    }

    const fetchdata = async (videoId) => {
        const res=await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${API_KEY}`);
        const data = res.data.items[0];
   
        const song = {
            title: data.snippet.title,
            id: videoId,
            thumbnail: data.snippet.thumbnails.default.url,
            upvotes: 0,
        }
        setQueue([...queue, song]);
    }

    useEffect(() => {
       

    }, [queue]);


    return (
        <div className="container mx-auto p-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to the room</h1>
            <p className="mb-4">Add Your Own Song</p>
            <input
                value={song}
                onChange={(e) => setSong(e.target.value)}
                type="text"
                placeholder="Enter song name"
                className="p-2 border border-gray-300 rounded mb-4 w-full max-w-md mx-auto"
            />
            <button onClick={handleAddSong} className="p-2 bg-blue-500 text-white rounded mb-4">Add Song</button>
            {queue.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-2 border-b border-gray-300">
                    <img src={song.thumbnail} alt={song.title} className="w-16 h-16 mr-4" />
                    <div className="flex-1 text-left">
                        <p className="font-semibold">{song.title}</p>
                        <p>
                            <button onClick={() => handleupvote(song.id)} className="p-1 bg-green-500 text-white rounded">Upvotes</button>: {song.upvotes}
                        </p>
                    </div>
                </div>
            ))}
            {(videoId || newvideoId) && (
                <YouTubeVideo
                    params={{
                        id: videoId,
                        queue: queue,
                        setQueue: setQueue,
                        setPlayedSeconds: setPlayedSeconds,
                        seekTime,
                        newvideoId: newvideoId,
                    }}
                />
            )}
        </div>
    );
}