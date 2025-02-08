"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const router= useRouter();

  function generateRoomCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  const handleCreateRoom = async () => {
    const code= generateRoomCode();
    console.log(code);
    router.push(`/room/${code}`);
  };
  const handleJoinRoom = async () => {
    if(roomCode.length===6){
      router.push(`/room/${roomCode}`);
    }
  };
  return (
    <div>
      <button onClick={handleCreateRoom}>
        Create a room
      </button>
      <input value ={roomCode} onChange={(e)=> setRoomCode(e.target.value)}  type="text" placeholder="Enter room code" />
      <button onClick={handleJoinRoom}>
        Join room
      </button>
    </div>
  );
}
