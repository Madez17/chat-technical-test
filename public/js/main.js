const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const giftForm = document.getElementById('gif-form');
const modal = document.getElementById('contentGifs');
const divImgs = document.getElementById('chargeGifs');
const closeModal = document.getElementById('closeModal');


// get params url
const urlParams = new URLSearchParams(window.location.search);
const userNameParam = urlParams.get('username');
const roomParam = urlParams.get('room');

const dataUser = {
    userNameParam,
    roomParam
};

const socket = io();

socket.on('message', message => {
    outputMessage(message);

    // Scroll down messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('roomUsers', ({ room, users }) => {
    outputRoom(room);
    outputUsers(users);
});

// Message submit 
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    if (msg === '/giphy') {
        modal.classList.remove('hidden');
        modal.classList.add('parent-content')
    } else {
        // Emit this message from client to server
        socket.emit('chatMessage', msg);
    }


    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Join chatroom
socket.emit('joinRoom', dataUser);


// Dom Manipulation 
const outputMessage = (message) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span> </p><p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

const outputRoom = (room) => {
    const chatRoom = document.getElementById('room-name');
    chatRoom.innerHTML = room;
}

const outputUsers = (users) => {
    const userList = document.getElementById('users');
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

// Ghiphy API
const giphySearch = (keyword) => {
    const giphyApiKey = '5aGTYUKP5r5KB44v5mHX6jYlQiuEhG0e';

    return fetch(`https://api.giphy.com/v1/gifs/search?q=${keyword}&api_key=${giphyApiKey}&limit=5`)
        .then(response => response.json());
}

// Append Image
const appendImage = (img) => {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('img-container');
    imageContainer.appendChild(img);
    divImgs.append(imageContainer); 
}

// get input value

giftForm.addEventListener('submit', e => {
    e.preventDefault();
    const msg = e.target.elements.gif.value;
    e.target.elements.gif.value = '';
    e.target.elements.gif.focus();

    urlImageGif(msg);
});

// Get url image gifs
const urlImageGif = async (searchKeyword) => {
    const result = await giphySearch(searchKeyword);
    divImgs.innerHTML = '';
    result.data.forEach(data => {
        let img = document.createElement('img');
        img.src = data.images.original.url;
        img.addEventListener('click', () => {
            socket.emit('chatMessage', `<img src="${data.images.original.url}" />`);
            modal.classList.add('hidden');
            modal.classList.remove('parent-content');
            divImgs.innerHTML = '';
        })
        appendImage(img);
    });
}

// close MOdal
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('parent-content');
});