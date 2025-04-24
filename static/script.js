var socket = io("http://127.0.0.1:5000", {
        transports: ["websocket", "polling"]  // Ensure WebSocket and polling are allowed
    });
var socketChat = io("http://127.0.0.1:5000/Chat", {
    transports: ["websocket", "polling"]
});
function generateCode() {
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += Math.floor(Math.random() * 10);  // Random digit between 0-9
      }
      return code;
    }

function generateRoomCode() {
            fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json()) // Parse the JSON response
            .then(data => {
                if (data.room_code) {
                    // Show the generated room code in an alert
                   const popup = document.getElementById("popup");
                   document.getElementById("room-code").innerText = data.room_code;
                   popup.style.display = "block";
                   setTimeout(() => popup.classList.add("show"), 10);
                } else {
                    // If there's no room code in the response
                    alert("Error generating room code.");
                }
            })
            .catch(error => {
                // Handle errors if the API call fails
                console.error('Error:', error);
                alert("There was an error generating the room code.");
            });
        }

function closePopup() {
    const loading = document.getElementById("loading");
    const playerStatus = document.getElementById("player-status");
    const startGameBtn = document.getElementById("start-game");
    const popup = document.getElementById("popup");
    let roomCode = document.getElementById('room-code').textContent;
    let isPub = document.getElementById("public-room");
    socket.emit("check_room3", { room_code: roomCode });
    popup.classList.remove("show");
    loading.style.display = "none";
    playerStatus.style.display = "none";
    startGameBtn.style.display = "none";
    setTimeout(() => (popup.style.display = "none"), 300);
    fetch('/delete-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_code: roomCode })  // Send room code as JSON in the request body
            })
    isPub.checked = false;
    togglePublicRoom()
}

function togglePublicRoom() {
    const loading = document.getElementById("loading");
    const playerStatus = document.getElementById("player-status");
    const startGameBtn = document.getElementById("start-game");
    let roomCode = document.getElementById('room-code').textContent;
    let isPub = document.getElementById("public-room");

    if (isPub.checked){
    loading.style.display = "block";
    playerStatus.style.display = "none";
    startGameBtn.style.display = "none";
    fetch('/generate-public', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_code: roomCode })  // Send the existing room code
            })
    //setTimeout(() => {
        //  loading.style.display = "none";
      //  playerStatus.style.display = "block";
      //  startGameBtn.style.display = "block";
    //}, 3000);
    }
    if(!isPub.checked) {

        loading.style.display = "none";
        playerStatus.style.display = "none";
        startGameBtn.style.display = "none";
        fetch('/delete-public-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_code: "!"+ roomCode })  // Send room code to delete
            })
    }
}

function joinRoom() {
    const joinRoomPopup = document.getElementById("join-room-popup");
    document.getElementById("room-loading").style.display = "none";
    document.getElementById("join-room-status").style.display = "none";

    // Show the popup
    joinRoomPopup.style.display = "block";
    setTimeout(() => joinRoomPopup.classList.add("show"), 10);
}


function attemptJoinRoom() {
    const roomCode = document.getElementById("room-input").value;
    const roomLoading = document.getElementById("room-loading");
    const statusMessage = document.getElementById("join-room-status");
    const room = document.getElementById("room-status");
    statusMessage.style.display = "none";
    roomLoading.style.display = "block";
     socket.emit("check_room", { room_code: roomCode });



            fetch(`/check-room?roomcode=${roomCode}`)
                .then(response => response.json())
                .then(data => {


                    if (data.status === "found") {
                        statusMessage.innerText = "Waiting for creator to start...";
                        statusMessage.className = "status-message room-found show";
                        roomLoading.style.display = "none";
                        room.innerText = roomCode;
                        room.style.display = "block";
                    } else {
                        statusMessage.innerText = "Room not found";
                        statusMessage.className = "status-message room-not-found show";
                        roomLoading.style.display = "none";
                    }
                })


        statusMessage.style.display = "block";

}


function closeJoinPopup() {
    const joinPopup = document.getElementById("join-popup");
    const roomCode = document.getElementById("random-room-code").textContent;
    joinPopup.classList.remove("show");
    setTimeout(() => joinPopup.style.display = "none", 300);
    socket.emit("check_room1", { room_code: roomCode });
}
function closeJoinRoomPopup() {
    const joinRoomPopup = document.getElementById("join-room-popup");
    let roomCode = document.getElementById("room-status").textContent;
    joinRoomPopup.classList.remove("show");

    socket.emit("check_room2", { room_code: roomCode });
    setTimeout(() => joinRoomPopup.style.display = "none", 300);
}
function joinRandomRoom() {
    const joinPopup = document.getElementById("join-popup");
    const loading = document.getElementById("join-loading");
    const roomCodeDisplay = document.getElementById("join-room-code");
    const roomCodeSpan = document.getElementById("random-room-code");
    const waitingMessage = document.getElementById("waiting-message");

    // Show popup and loading
    joinPopup.style.display = "block";
    setTimeout(() => joinPopup.classList.add("show"), 10);

    loading.style.display = "block";
    roomCodeDisplay.style.display = "none";
    waitingMessage.style.display = "none";
    fetch('/fetch-random-room')
    .then(response => response.json())
    .then(data => {
        if (data.status === "found") {

            loading.style.display = "none"; // Hide loading
            roomCodeSpan.innerText = data.roomcode; // Set room code
            roomCodeDisplay.style.display = "block"; // Show room code
            roomCodeDisplay.classList.add("show");
            waitingMessage.style.display = "block"; // Show "waiting for creator" message
            waitingMessage.classList.add("show");
            let roomcode = document.getElementById("random-room-code").textContent;
            socket.emit("check_room", { room_code: roomcode });

        } else {
            console.log("No rooms found!");
        }
    })
    // Simulate searching for a room
     // Simulate 3s delay for searching
}
function start(){
    let roomCode = document.getElementById('room-code').textContent;

    socket.emit("check_room4", { room_code: roomCode });
    fetch('/addRoomCode', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code: roomCode })  // Send the room code as a JSON object
})

    setTimeout(() => {
        window.location.href = `/Chat/${roomCode}`;
    }, 1000);

}





socket.on("room_found", (data) => {
        let currentRoomCode = document.getElementById("room-code").textContent;
        const loading = document.getElementById("loading");
        const playerStatus = document.getElementById("player-status");
        const startGameBtn = document.getElementById("start-game");
        if (data.room_code === currentRoomCode) {
             loading.style.display = "none";
             playerStatus.style.display = "block";
             startGameBtn.style.display = "block";
             fetch('/delete-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_code: currentRoomCode })  // Send room code as JSON in the request body
            })

        }
    });
    socket.on("room_found1", (data) => {
        let currentRoomCode = document.getElementById("room-code").textContent;
        const loading = document.getElementById("loading");
        const playerStatus = document.getElementById("player-status");
        const startGameBtn = document.getElementById("start-game");
        const popup = document.getElementById("popup");
        let isPub = document.getElementById("public-room");

        if (data.room_code === currentRoomCode) {
             closePopup()
        }
    });
    socket.on("room_found2", (data) => {
        let currentRoomCode = document.getElementById("room-code").textContent;
        const loading = document.getElementById("loading");
        const playerStatus = document.getElementById("player-status");
        const startGameBtn = document.getElementById("start-game");
        const popup = document.getElementById("popup");
        let isPub = document.getElementById("public-room");
        if (data.room_code === currentRoomCode) {
             closePopup()
        }
    });
    socket.on("room_found3", (data) => {
        let roomCode2 = document.getElementById("room-status").textContent;
        let roomCode1 = document.getElementById("random-room-code").textContent;
        const statusMessage = document.getElementById("join-room-status");
        if (data.room_code === roomCode1) {
             statusMessage.innerText = "Room lost";
             const joinPopup = document.getElementById("join-popup");

            joinPopup.classList.remove("show");
        }
        if (data.room_code === roomCode2){
            const joinPopup = document.getElementById("join-popup");
            joinPopup.classList.remove("show");
            statusMessage.innerText = "Room lost";
            const room = document.getElementById("room-status");
            room.innerText = "";
        }
    });
    socket.on("room_found4", (data) => {
        let roomCode2 = document.getElementById("room-status").textContent;
        let roomCode1 = document.getElementById("random-room-code").textContent;
        if (data.room_code === roomCode2) {
            window.location.href = `/Chat/${roomCode2}`;
        }
        if (data.room_code === roomCode1) {

            window.location.href = `/Chat/${roomCode1}`;
        }
    });
    socket.on("connect_error", (err) => {
        console.error("Socket Connection Error:", err);
    });









