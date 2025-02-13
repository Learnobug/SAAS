"use client"; 

let instance = null;

export default function getSocket() {
    if (!instance || instance.readyState === WebSocket.CLOSED) {
        instance = new WebSocket('https://saas-production-4d96.up.railway.app/');
    }
    return instance;
}
