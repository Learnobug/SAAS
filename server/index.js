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
                    rooms.set(roomId, {
                        Users: [],
                        skipvotes: 0,
                        currentSong: null,
                        queue: [],
                        timeline: 0
                    });
                    ws.send(JSON.stringify({ type: "roomOwner"  }));
                }
                const room = rooms.get(roomId);
                room.Users.push(ws);
                if(room.Users.length>0)
                {
                    ws.send(JSON.stringify({ type: "Queue", queue: room.queue }));
                    if(room.currentSong){
                    console.log("Sending Current Song to client");
                    ws.send(JSON.stringify({ type: "CurrentSong", videoId: room.currentSong, TimeLine: room.timeline }));
                    }
                }

                // console.log("Users in room:", room.Users.length);
                room.Users.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                        console.log("Sending Users count to client");
                        client.send(JSON.stringify({ type: "Users", Users: room.Users.length }));
                    }
                });
            }
            if(data.type=="Queue")
            {
                const roomId = data.roomId;
                const queue = data.queue;
                const room = rooms.get(roomId);
                room.queue = queue;
                room.Users.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                        console.log("Sending Queue to client");
                        client.send(JSON.stringify({ type: "Queue", queue }));
                    }
                });
            }
            if(data.type=='CurrentSong')
            {
                // console.log("Current Song Received:", data);
                const roomId = data.roomId;
                const videoId = data.videoId;
                const TimeLine = data.TimeLine;
                if(!rooms.has(roomId)) return;
                
                const room = rooms.get(roomId);
                room.currentSong = videoId;
                room.timeline = TimeLine;
                room.Users.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                        
                        client.send(JSON.stringify({ type: "CurrentSong", videoId, TimeLine }));
                    }
                });
            }
            if(data.type=='HandleUpvotes')
            {
                const roomId = data.roomId;
                const room = rooms.get(roomId);
                const queue  = data.queue;
                room.queue = queue;
                room.Users.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                        console.log("Sending Queue to client");
                        client.send(JSON.stringify({ type: "Queue", queue }));
                    }
                });
            }
            if(data.type=="Skipvotes")
            {
                const roomId = data.roomId;
                const room = rooms.get(roomId);
                const skipvotes = data.skipvotes;
                room.skipvotes = skipvotes;
                // remove first song from queue
                console.log("Skipvotes",room.skipvotes);


                if( room.skipvotes>=room.Users.length/2 && room.queue.length>=2){
                   console.log("Skipvotes",room.skipvotes);
                // remove top song from queue
                room.queue.shift();
                 // get top song from queue
                 const topSong = room.queue[0];
                 room.currentSong = topSong.id;
                room.timeline = 0;
                room.skipvotes=0;
                console.log("Sending Current Song to client", room);
                room.Users.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                        console.log("Sending Queue to client");
                        client.send(JSON.stringify({ type: "Queue", queue: room.queue }));
                    }
                });
                
                room.Users.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                        console.log("Sending Current Song to client");
                        client.send(JSON.stringify({ type: "CurrentSong", videoId: room.currentSong, TimeLine: room.timeline }));
                        client.send(JSON.stringify({ type: "ChangeSong", videoId: room.currentSong, TimeLine: room.timeline }));
                    }
                });
               
            }
        
                room.Users.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                        console.log("Sending Skipvotes to client");
                        client.send(JSON.stringify({ type: "Skipvotes", skipvotes: room.skipvotes }));
                    }
                });
            
        }

        } catch (error) {
            console.log(error);
            console.log("Invalid JSON message received:", message);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        
        rooms.forEach((room, roomId) => {
            room.Users = room.Users.filter(client => client !== ws);
            if (room.Users.length === 0) {
                rooms.delete(roomId);
            }
        });
    });
});

console.log('WebSocket1 server running on ws://localhost:3001');
