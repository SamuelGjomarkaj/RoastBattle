const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;
const ROOMS_FILE = "rooms.txt";

app.use(express.json());
app.use(cors());

// Function to read rooms from file
function readRooms() {
    if (!fs.existsSync(ROOMS_FILE)) return [];
    return fs.readFileSync(ROOMS_FILE, "utf-8").split("\n").filter(line => line.trim() !== "");
}

// Function to write a new room to file
function writeRoom(roomCode) {
    fs.appendFileSync(ROOMS_FILE, roomCode + "\n");
}

// Create a new room
app.post("/create-room", (req, res) => {
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    writeRoom(roomCode);
    res.json({ success: true, roomCode });
});

// Join a room
app.post("/join-room", (req, res) => {
    const { roomCode } = req.body;
    const rooms = readRooms();

    if (rooms.includes(roomCode)) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Join a random available room
app.get("/join-random", (req, res) => {
    const rooms = readRooms();

    if (rooms.length > 0) {
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        res.json({ success: true, roomCode: randomRoom });
    } else {
        res.json({ success: false });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
