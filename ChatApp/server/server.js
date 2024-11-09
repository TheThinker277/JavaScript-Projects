const express = require('express');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');

app.use(express.static('../client'));

const wss = new WebSocket.Server({server:http});

wss.on('connection', (ws)=>{
    console.log('New Client Connected');
    ws.on('message',(message)=>{
        console.log('Received'+ message);
        wss.clients.forEach(client => {
            if(client != ws && client.readyState === WebSocket.OPEN)
                {
                    client.send(message);
                }
        });
    })
    ws.on('close',()=>{
        console.log('Client Disconnected');
    })
})

http.listen(1337,()=>{
    console.log('server is listening to port 1337')
})