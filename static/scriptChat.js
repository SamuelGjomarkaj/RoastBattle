let playerName = '';
let opponentName = '';
let playerScore = 0;
let opponentScore = 0;
let timerInterval;
let path = window.location.pathname;
let me = false;
let opp = false;
let code = path.split('/').pop();

var socket = io("http://192.168.100.26:5000", {
        transports: ["websocket", "polling"]  // Ensure WebSocket and polling are allowed
    });
var socketChat = io(`http://127.0.0.1:5000/Chat/${code}`, {
    transports: ["websocket", "polling"]
});

        // Listen for random_code event from server
function score(roast, message){
    fetch('/rate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ roast: roast })
})
.then(res => res.json())
.then(data => {
    num = data.result;
    let variation = 1 + (Math.random() * 0.2 - 0.1);
    if (num < 5) {
        console.log(num)
        // Subtract 20 for each unit below 5
        av = Math.ceil(((num - 5)*20)*variation);
        givePoint('player',av);
        socket.emit('player_data1', { playerName: message, gameCode: code, Points: av});
    addMessage(message, 'user', playerName);
    } else if (num > 5) {
        // Add 20 for each unit above 5
        console.log(num)
        av = Math.ceil(((num - 5)*20)*variation);
        givePoint('player',av);
       socket.emit('player_data1', { playerName: message, gameCode: code, Points: av});
    addMessage(message, 'user', playerName);
    } else {
        // If the number is exactly 5, no change
        console.log(num)
        av = Math.ceil(((num - 4.5)*20)*variation);
        givePoint('player',av);
       socket.emit('player_data1', { playerName: message, gameCode: code, Points: av});
    addMessage(message, 'user', playerName);
    }


});

}
function enterBattle() {
    const nickname = document.getElementById("nickname").value.trim();
    if (!nickname) return alert("Please enter your nickname");

    playerName = nickname;
    const data = { playerName, code };
    socket.emit('player_data', { playerName: playerName, gameCode: code });
    document.getElementById("player-name").innerText = playerName;

    document.getElementById("nickname-container").style.display = "none";
    document.getElementById("battle-container").style.display = "flex";
    me = true;
    if (opp){
    startTimer();}
}
socket.on('receive_data', function(data) {
    const playername = data.playerName;
    const codes = data.gameCode
    if (code === codes) {

        document.getElementById("opponent-name").innerText = playername;
        opp = true;
        if (me){
    startTimer();}
    }
   });


function sendRoast() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();

    score(input.value, message)
    if (!message) return;
input.disabled = true;
document.getElementById('chat-input').placeholder = "Wait for the cooldown";
enableInputAfter20Sec()
//givePoint('player',points);

       // givePoint('opponent');

}
socket.on('receive_data1', function(data) {
    const mesage = data.playerName;
    const codes = data.gameCode;
    const input = document.getElementById("chat-input");
    const points = data.Points
    let opponentname = document.getElementById("opponent-name").textContent;
    if (code === codes) {

        addMessage(mesage, 'opponent', opponentname);}
        givePoint('opponent', points);
    input.disabled = false;
    document.getElementById('chat-input').placeholder = "Type your roast...";
   });
socket.on('receive_data2', function(data) {
    const codes = data.gameCode;
    const points = data.Points
    let opponentname = document.getElementById("opponent-name").textContent;
    if (code === codes) {
        givePoint('opponent', points);
  }

   });

function addMessage(text, sender, name) {
    const chatBox = document.getElementById("chat-box");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", sender === 'user' ? "user-msg" : "opponent-msg");

    msgDiv.innerText = text;

    const nameTag = document.createElement("div");
    nameTag.className = "msg-name";
    nameTag.innerText = name;

    msgDiv.appendChild(nameTag);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function givePoint(player, points) {
    let scoreElement;
    const input = document.getElementById("chat-input");
    if (player === "player") {
        scoreElement = document.getElementById("player-score");
    } else {
        scoreElement = document.getElementById("opponent-score");
    }

    input.value = "";
let currentScore = parseInt(scoreElement.innerText);

if (points < 0 && currentScore + points < 0) {
    scoreElement.innerText = 0;
} else {
    scoreElement.innerText = currentScore + points;
}
const pointEffect = document.createElement("div");
      if(points < 0){
    pointEffect.innerText = `${points}`;
    pointEffect.style.color = "red";
    }
    else{
    pointEffect.innerText = `+${points}`;
    pointEffect.style.color = "gold";
    }


    pointEffect.style.position = "absolute";

    // Randomize position near the score element
    const offsetX = Math.random() * 80 - 40;  // Random X offset within -30 to 30 px
    const offsetY = Math.random() * 80 - 40;  // Random Y offset within -30 to 30 px
    pointEffect.style.left = scoreElement.offsetLeft + 10 + offsetX + "px";
    pointEffect.style.top = scoreElement.offsetTop - 10 + offsetY + "px";


    pointEffect.style.fontSize = "1.9rem";
    pointEffect.style.fontWeight = "bold";
    pointEffect.style.opacity = "1";
    pointEffect.style.pointerEvents = "none";
    pointEffect.style.transition = "opacity 1s ease-out, transform 1s ease-out";

    document.body.appendChild(pointEffect);

    setTimeout(() => {
        pointEffect.style.opacity = "0";
        pointEffect.style.transform = "translateY(-25px)";
    }, 100);

    setTimeout(() => {
        pointEffect.remove();
    }, 1000);
}



function startTimer() {
    let timeLeft = 300; // 5 minutes
    const timerDisplay = document.getElementById("timer");

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            showWinner();
            fetch('/delete-room1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_code: code })  // Send room code as JSON in the request body
            })
        }
    }, 1000);
}

function showWinner() {
    const popup = document.getElementById("result-popup");
    const winnerText = document.getElementById("winner-text");
    let playerscore = document.getElementById("player-score").textContent;
    let opponentscore = document.getElementById("opponent-score").textContent;
    let opponentname = document.getElementById("opponent-name").textContent;
    if (playerscore > opponentscore) {
        winnerText.innerText = `${playerName} Wins! 🔥`;
    } else if (opponentscore > playerscore) {
        winnerText.innerText = `${opponentname} Wins! 😔`;
    } else {
        winnerText.innerText = `It's a Tie! 🤝`;
    }

    popup.classList.remove("hidden");
}

 function enableInputAfter20Sec() {
    const input = document.getElementById('chat-input');

    setTimeout(() => {
      if (input.disabled === false){
          input.disabled = false;

      document.getElementById('chat-input').placeholder = "Type your roast...";}
    }, 20000); // 20 seconds
  }
// ✅ Press Enter to send message
document.getElementById("chat-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendRoast();
    }
});
