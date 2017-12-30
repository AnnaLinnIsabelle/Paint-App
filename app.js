/**
 * Created by Linn on 2017-12-23.
 */
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index); //app.use(express.static(__dirname + '/public'));

const server = http.createServer(app);

const io = socketIo(server);

let drawings = [];
let connectedClients = 0;


io.on("connection", socket => {
    console.log("New client connected");
    connectedClients++;
    socket.emit('initial_room', 'room_'+ connectedClients.toString());
    socket.emit('saved_drawings', drawings);

    socket.on('subscribe', (room) => {
        console.log('joining room', room);
        socket.join(room);
    });

    socket.on('unsubscribe', (room) => {
        console.log('leaving room', room);
        socket.leave(room);
    });

    socket.on('draw_line', function(data) {
        io.in(data.room).emit('draw_line', { line: data.line });
    });

    socket.on('update_client_history', (data) => {
        io.in(data.room).emit('update_client_history');
    });

    socket.on('undo_latest', (data) => {
        console.log('undo', data.room);
        io.in(data.room).emit('undo_latest');
    });

    socket.on('image_drop_accept', (data) => {
        io.in(data.room).emit('image_drop_accept', data.imgURL);
    });

    socket.on('save_drawing', (data) => {
        let index = drawings.findIndex(drawing => drawing.name === data.name);
        if (index > -1) {
            drawings[index].url = data.url;
        } else {
            drawings.push(data);
        }
    });

    socket.on("disconnect", () => console.log("client disconnected"));
});

server.listen(port, () => console.log(`Listening on port ${port}`));