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
    <div className="bg-gray-800 h-screen flex flex-col justify-center items-center">
      <button 
        onClick={handleCreateRoom} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Create a room
      </button>
      <input 
        value={roomCode} 
        onChange={(e) => setRoomCode(e.target.value)} 
        type="text" 
        placeholder="Enter room code" 
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <button 
        onClick={handleJoinRoom} 
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Join room
      </button>
    </div>
  );
}
