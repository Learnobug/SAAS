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
    console.log("rrom",room);
    console.log("roomowner",roomOwner);
    if (!room || !room.currentSong || room.timeline == null  || roomOwner) return;

    console.log("room data:", room);
    if (videoref.current) {
      setVideoId(room.currentSong);
      videoref.current.seekTo(videoref.current.getCurrentTime()+Number(room.timeline));
      setPlaying(true);
    }
  }, [room]); 

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
