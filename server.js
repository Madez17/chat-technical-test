const path = require('path');
const express = require('express');
const app = express();
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

//settings
app.set('port', process.env.PORT || 3000);

//static files
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'RV/DEV';

//start the server
const server = app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
})

// web socket
const socketIo = require('socket.io');
const io = socketIo(server);

io.on('connection', (socket) => {

    // Listen user data
    socket.on('joinRoom', ({ userNameParam, roomParam}) => {
        const user = userJoin(socket.id, userNameParam, roomParam);
        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(botName, `Hey ${user.username}, welcome to our chat <i class="far fa-laugh-beam smille"></i> !`));

        //Message when user is connenct
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has Joined the chat`));

        // send users and room data
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
        });

    });

    // Message when user is disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the room`));

            // send users and room data
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });

    // Listen For a chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

});