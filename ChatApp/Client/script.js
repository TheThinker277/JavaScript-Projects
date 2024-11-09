const messageInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-btn');
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

const serverUrl = `${protocol}://${window.location.host}`
const socket = new WebSocket(serverUrl);

socket.onopen = function(event){
    console.log('Connected to WebSocket Server');
};

socket.onerror = function(event){
    console.log('Connection Error', error);
}

sendButton.addEventListener('click', function() {
    const message = messageInput.value.trim();
    if (message) {
        socket.send(message);
        messageInput.value = '';
    }
});

messageInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        console.log('this owrk')
        event.preventDefault();
        sendButton.click();
    }
});

socket.onmessage = async function(event){
    const chatBox = document.getElementById('chat-box');
    const newMessage = document.createElement('div');
    newMessage.textContent = await event.data.text();
    console.log(event, event.data);
    chatBox.appendChild(newMessage);
}