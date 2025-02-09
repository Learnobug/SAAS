"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();

  function generateRoomCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  const handleCreateRoom = async () => {
    const code = generateRoomCode();
    console.log(code);
    router.push(`/room/${code}`);
  };

  const handleJoinRoom = async () => {
    if (roomCode.length === 6) {
      router.push(`/room/${roomCode}`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black h-screen flex flex-col justify-center items-center text-white">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-2">Welcome to Music Hub</h1>
        <p className="text-xl">Tune in Together, Vibe as one</p>
      </header>
      <div className="flex flex-col items-center space-y-4">
        <button 
          onClick={handleCreateRoom} 
          className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          Create a room
        </button>
        <input 
          value={roomCode} 
          onChange={(e) => setRoomCode(e.target.value)} 
          type="text" 
          placeholder="Enter room code" 
          className="p-3 border border-gray-500 rounded-lg text-black w-64 text-center shadow-md"
        />
        <button 
          onClick={handleJoinRoom} 
          className="bg-green-600 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          Join room
        </button>
      </div>
      <footer className="mt-8 text-center">
        <p>&copy; 2023 Music Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
