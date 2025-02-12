"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import getSocket from "@/app/getSocket";

export default function YouTubeVideo({ params }) {
  const videoref = useRef(null);
  const { id, room, setRoom, roomOwner, roomId } = params;
  const [playing, setPlaying] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [mute, setMute] = useState(true);
  const [playedSeconds, setPlayedSeconds] = useState(0);

   useEffect(()=>{
    const ws = getSocket();
    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.type === "ChangeSong") {
        console.log("ChangeSong Received:", data.videoId);
        setVideoId(data.videoId);
        setRoom((prevRoom) => ({ ...prevRoom, currentSong: data.videoId }));
        setPlaying(true);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
   },[])

  useEffect(() => {
    if (!roomOwner) return;
    const ws = getSocket();
    let interval;

    const sendTime = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "CurrentSong",
            videoId: room.currentSong,
            TimeLine: playedSeconds,
            roomId: roomId,
          })
        );
      }
    };

    interval = setInterval(() => {
      sendTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [roomOwner, playedSeconds]);

  useEffect(() => {
    if (!id && !room?.currentSong) return;
    setVideoId(id);
    setPlaying(true);
  }, [id, room?.currentSong]);

  useEffect(() => {
    if (!room || !room.currentSong || room.timeline == null || roomOwner) return;
  
    const checkPlayerReady = () => {
      if (videoref.current && videoref.current.getCurrentTime) {
        const currentTime = videoref.current.getCurrentTime();
        if (currentTime !== null && !isNaN(currentTime)) {
          setVideoId(room.currentSong);
          console.log("Setting video ID, current time:", currentTime);
          videoref.current.seekTo(currentTime + Number(room.timeline));
          setPlaying(true);
        } else {
          console.log("Player not ready, retrying...");
          setTimeout(checkPlayerReady, 500);
        }
      }
    };
  
    checkPlayerReady();
  }, [room, videoref]);
  
  

  return (
    <ReactPlayer
      ref={videoref}
      url={`https://www.youtube.com/watch?v=${room.currentSong}`}
      controls
      playing={true}
      muted={mute}
      onSeek={() => setPlaying(true)}
      onProgress={({ playedSeconds }) => setPlayedSeconds(playedSeconds)}
    />
  );
}
