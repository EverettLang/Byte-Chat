/*
Node.js server
Express.js, Socket.io
Handles Logic regarding chat room communication
*/
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Chat server on port ${PORT}`));

const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

//Room selections
const roomMap = new Map();
roomMap.set("general",[]);
roomMap.set("javascript",[]);
roomMap.set("java",[]);
roomMap.set("python",[]);
roomMap.set("c++",[]);
roomMap.set("c#",[]);

io.on("connection", onClientConnection);

function onClientConnection(socket){

    console.log("Socket Connected ", socket.id);
    

    socket.on("disconnect", () => {

        console.log("Socket Disconnected ", socket.id);

    });

    /*
    Handles Sign in on intro screen, adds user to general room
    Data: Username and Room
    */
    socket.on("sendSignIn", (data) => {

        socket.join(data.room);
        
        //TODO:adding for room users
        roomMap.set(data.room.toLowerCase(), [...roomMap.get(data.room.toLowerCase()), data.username]);
        console.log(roomMap.get(data.room.toLowerCase()));
        

        console.log(`Socket ID: ${socket.id} Username: ${data.username} signed into room ${data.room}`);
        
        io.in(data.room).emit("user-joined-room", data.username, data.room, roomMap.get(data.room.toLowerCase()));
    });

     /*
    Handles room swap.
    Data: Username, Room, newRoom info
    */
    socket.on("switchRoom", (newRoom, data) => {
        
        const index = roomMap.get(data.room.toLowerCase()).indexOf(data.username);
        if (index !== -1) {
            const temp = roomMap.get(data.room.toLowerCase());
            temp.splice(index,1);
            roomMap.set(data.room.toLowerCase(), temp);
          }
          console.log(roomMap.get(data.room.toLowerCase()));

        socket.leave(data.room);
        io.in(data.room).emit("user-left-room", data.username, data.room, roomMap.get(data.room.toLowerCase()));
        console.log(data.username + " left room " + data.room);
    

        socket.join(newRoom);
        data.room = newRoom;//TODO: This might need to be looked at

        roomMap.set(data.room.toLowerCase(), [...roomMap.get(data.room.toLowerCase()), data.username]);
        console.log(roomMap.get(data.room.toLowerCase()));


        io.in(newRoom).emit("user-joined-room", data.username, data.room, roomMap.get(data.room.toLowerCase()) );//switch "to" to "in"



        console.log(data.username + " joined room " + data.room);

        
    });

     /*
    Handles Messages between users in each room
    Data: Message, user, room
    */
    socket.on("sentMessage", (data) => {
        console.log(data);
        socket.to(data.room).emit("receivedMessage", data);
    });
}



