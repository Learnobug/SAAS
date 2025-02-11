import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 }); 
const rooms = new Map(); 

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // console.log(data);
            if (data.type === "joinRoom") {
                const roomId = data.roomId;
                console.log(`Joining room: ${roomId}`);

                if (!rooms.has(roomId)) {
                    rooms.set(roomId, new Set());
                }
                else{
                    rooms.get(roomId).forEach(client => {
                            console.log("requesting timeline");
                            client.send(JSON.stringify({ type: "sendTimeLine"})); 
                        });
                    if(!newroomUser[roomId]) newroomUser[roomId]=[];
                   newroomUser[roomId].push(ws);
                }
                rooms.get(roomId).add(ws);
                // console.log(rooms);
                // ws.send(`You have joined room ${roomId}`);
            } 
            else if (data.type === "message") {
                const roomId = data.roomId;
                const msg = data.message;
                console.log(`Message in room ${roomId}: ${msg}`);

                // Broadcast message to all clients in the room
                if (rooms.has(roomId)) {
                    rooms.get(roomId).forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            // client.send(`Room ${roomId}: ${msg}`);
                        }
                    });
                }
            }
            else if(data.type==='Queue')
            {
                const roomId= data.roomId;
                const queue =  data.queue;
                // console.log("queue recieved",queue);
                if (rooms.has(roomId)) {
                    // console.log("rr",sockets);
                    rooms.get(roomId).forEach(client => {
                        //  console.log("client",client);
                            client.send(JSON.stringify({ type: "QueueUpdated", queue: queue })); 
                    });
                }
            }
            else if(data.type==='sendTimeLine')
            {
                console.log("timeline sent");
                const roomId= data.roomId;
                const playedSeconds = data.playedSeconds;
                const videoId = data.videoId;
                const queue = data.queue;
                // console.log("queue recieved",queue);
                if(newroomUser[roomId]) {
                    
                    newroomUser[roomId].forEach(client => {
                        //  console.log("client",client);
                            client.send(JSON.stringify({ type: "sendT", playedSeconds:playedSeconds , videoId:videoId , queue:queue })); 
                    });
                    newroomUser[roomId]=[];
                }
            }
            
        } catch (error) {
            console.log("Invalid JSON message received:", message);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        rooms.forEach((clients, roomId) => {
            clients.delete(ws);
            if (clients.size === 0) {
                rooms.delete(roomId);
            }
        });
    });
});

console.log('WebSocket server running on ws://localhost:3001');
