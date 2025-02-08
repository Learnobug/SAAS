"use client"; 

let instance = null;

export default function getSocket() {
    if (!instance || instance.readyState === WebSocket.CLOSED) {
        instance = new WebSocket('ws://localhost:3001');
    }
    return instance;
}
