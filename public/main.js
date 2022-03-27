const socket = io();

const currentConnections = document.querySelector(".current-connections");

const chatForm = document.getElementById("chat-form");
const sendButton = document.getElementById("submit-input");
const messageInput = document.getElementById("chat-box");

const messageContainer = document.querySelector(".message-container");

const signinForm = document.getElementById("signin-form");
const usernameInput = document.querySelector(".username");
const roomInput = document.querySelector(".room");

const userList = document.querySelector(".user-list");

let menuOpen = false;



// var UsersRoom;
const clientData = {
    username: "",
    room: "",
    socketID: "",
};



/*
    data: username,room
*/
socket.on("user-joined-room", (username, room, roomMemberList) => {

    if(username == clientData.username){
        
        messageContainer.innerHTML = "";

        console.log(roomMemberList)
        userList.innerHTML = "";
        roomMemberList.forEach(el => {
            const userElement = `<li><p>${el}</p></li>`; 
            userList.innerHTML += userElement;
        });
    }
    else{
        
        const element = `<li class="join-leave-message"><p>${username} Joined ${room}</p></li>`
        messageContainer.innerHTML += element;

        console.log(roomMemberList)
        userList.innerHTML = "";
        roomMemberList.forEach(el => {
            const userElement = `<li><p>${el}</p></li>`; 
            userList.innerHTML += userElement;
        });

     
    }    
});

socket.on("user-left-room", (username, room, roomMemberList) => {
    
        const element = `<li class="join-leave-message"><p>${username} Left ${room}</p></li>`
        messageContainer.innerHTML += element;   

        console.log(username + " left " + room);
        console.log(roomMemberList);

        userList.innerHTML = "";
        roomMemberList.forEach(el => {
            const userElement = `<li><p>${el}</p></li>`; 
            userList.innerHTML += userElement;
        });
});

socket.on("receivedMessage", (data) =>{

    addMsgToUI(data, false);
});

// socket.on("disconnect", () => {
//     socket.emit("disconnect", clientData);
//   });


/*
    Submitting a simple username sign in request
    Places client into the General Room
*/
signinForm.addEventListener('submit', (event) => {

    event.preventDefault();
    sendSignIn();
});

function sendSignIn(){

    clientData.username = usernameInput.value;
    clientData.room = "general";
    clientData.socketID = socket.id;
    

    document.getElementById(`${clientData.room}`).style.backgroundColor = "rgb(" + 32 + "," + 34 + "," + 37 + ")";

    console.log(clientData.username + " is signing into " + clientData.room);
    
    socket.emit("sendSignIn", clientData);

    document.querySelector(".signin-container").style.display = "none";
    document.querySelector(".container").style.display = "flex";

}


/*
    Sending a Chat Message
*/
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log("Made it IN");
    sendMessage();
});




function sendMessage(){
    console.log("IN THIS BITCH");
    const data = {
        username: clientData.username,
        room: clientData.room,
        message: messageInput.value,
        date: new Date()
    }
    
    socket.emit("sentMessage", data);
    addMsgToUI(data, true);
    messageInput.value = '';
   
}

function addMsgToUI(data, isOwnMessage){

    const element = `<li class="${isOwnMessage ? 'sentMessageBubble' : 'receivedMessageBubble'}">
        <p class="bubbleName">${data.username}</p> 
        <p class="bubbleMessage">${data.message}</p>
        <p class="bubbleDate">${moment(data.date).format("MMM. D. h:mm A ")}</p> 
        </li>`

    messageContainer.innerHTML += element;
    
}

/*
selectRoom

*/
function selectRoom(newRoom){

    if(newRoom == clientData.room){
        return;
    }

    socket.emit("switchRoom", newRoom, clientData);

    //set previous selected room background to default colour.
    document.getElementById(`${clientData.room}`).style.backgroundColor = "rgb(" + 54 + "," + 57 + "," + 63 + ")";

    //set new room button background to dark to show selected
    document.getElementById(`${newRoom}`).style.backgroundColor = "rgb(" + 32 + "," + 34 + "," + 37 + ")";

    //watch this could cause issue.
    clientData.room = newRoom;
}

function toggleNav() {
    
    if(menuOpen){
        document.querySelector(".navigation-panel").style.display = "none";
        menuOpen = false;
    }
    else{
        document.querySelector(".navigation-panel").style.display = "flex";
        menuOpen = true;

        
    }
    
  }
  

