import eventlet 
eventlet.monkey_patch()
from flask import Flask, jsonify, request, render_template
import random
import string
import os
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from Rate_ai import rate_roast
from Rate_ai import generate_roast

USED_FILE = "used.txt"
app = Flask(__name__, template_folder="templates", static_folder="static")
ROOMS_FILE = "rooms.txt"
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")
CORS(app)
room_notifications = {}
def generate_room_code():
    used_codes = load_used_codes()  # Load the used codes
    active_codes = load_room_codes()  # Load the active room codes

    while True:
        code = ''.join(random.choices(string.digits, k=6))  # Generate a random 6-digit code
        if code not in used_codes and code not in active_codes:

            return code
def load_used_codes():
    try:
        with open(USED_FILE, 'r') as f:
            return set(line.strip() for line in f.readlines())  # Return a set of used room codes
    except FileNotFoundError:
        return set()  # If the file doesn't exist, return an empty set


def add_used_code(code):
    with open(USED_FILE, 'a') as f:
        f.write(code + '\n')


# Route to handle POST request to add a room code to 'used.txt'
@app.route('/addRoomCode', methods=['POST'])
def add_room_code():
    data = request.get_json()  # Parse JSON data sent from the client
    code = data.get('code')  # Extract the room code from the JSON data

    if code:
        add_used_code(code)  # Append the room code to 'used.txt'
        return jsonify({'message': f'Room code {code} added successfully!'}), 200
    else:
        return jsonify({'error': 'Room code not provided!'}), 400


@app.route('/Chat/<code>')
def chat(code):
    return render_template('Chat.html', code=code)
def save_room_code(code):
    try:
        with open(ROOMS_FILE, "a") as file:
            file.write(code + "\n")
    except Exception as e:
        print(f"Error saving room code: {e}")
        return False
    return True

def load_room_codes():
    try:
        if not os.path.exists(ROOMS_FILE):
            return []
        with open(ROOMS_FILE, "r") as file:
            return [line.strip() for line in file.readlines()]
    except Exception as e:
        print(f"Error loading room codes: {e}")
        return []


@app.route('/check-room', methods=['GET'])
def check_room():
    room_code = request.args.get('roomcode')

    # Read the room codes from the file
    with open(ROOMS_FILE, 'r') as file:
        rooms = file.readlines()

    # Check if the room code is in the list
    if room_code + '\n' in rooms:
        return jsonify({"status": "found"})
    else:
        return jsonify({"status": "not_found"})

@app.route('/fetch-random-room', methods=['GET'])  # Changed route name
@app.route('/fetch-random-room', methods=['GET'])
def fetch_random_room():
    # Read the room codes from the file
    with open(ROOMS_FILE, 'r') as file:
        rooms = [room.strip() for room in file.readlines()]  # Strip whitespace and newlines

    print("All Rooms:", rooms)  # Debugging

    # Filter rooms that start with '!'
    filtered_rooms = [room for room in rooms if room.startswith("!")]

    print("Filtered Rooms:", filtered_rooms)  # Debugging

    if filtered_rooms:
        random_room = random.choice(filtered_rooms)  # Pick a random room
        clean_room_code = random_room[1:]  # Remove the "!" at the beginning
        return jsonify({"status": "found", "roomcode": clean_room_code})
    else:
        return jsonify({"status": "not_found"})
# Serve the main page
@app.route("/")
def index():
    return render_template("index.html")

# API to generate a new room code
@app.route("/generate", methods=["POST"])
def generate():
    code = generate_room_code()
    save_room_code(code)
    return jsonify({"room_code": code})

# API to get all room codes
@app.route("/rooms", methods=["GET"])
def get_rooms():
    return jsonify({"rooms": load_room_codes()})

# API to get a specific room code
@app.route("/room/<code>", methods=["GET"])
def get_room(code):
    rooms = load_room_codes()
    if code in rooms:
        return jsonify({"room_code": code})
    return jsonify({"error": "Room not found"}), 404

# API to get a random room code
@app.route("/random-room", methods=["GET"])
def get_random_room():
    rooms = load_room_codes()
    if rooms:
        return jsonify({"room_code": random.choice(rooms)})
    return jsonify({"error": "No rooms available"}), 404


@app.route("/delete-room", methods=["POST"])
def delete_room():
    code = request.json.get("room_code")
    rooms = load_room_codes()

    # Remove both the normal code and the version that starts with "!"
    modified = False
    if code in rooms:
        rooms.remove(code)
        modified = True
    if f"!{code}" in rooms:
        rooms.remove(f"!{code}")
        modified = True

    # Save the updated room list
    if modified:
        with open(ROOMS_FILE, "w") as file:
            for room in rooms:
                file.write(room + "\n")
        return jsonify({"message": "Room code deleted successfully"})
    else:
        return jsonify({"error": "Room not found"}), 404
def load_room_codes1():
    try:
        if not os.path.exists(USED_FILE):
            return []
        with open(USED_FILE, "r") as file:
            return [line.strip() for line in file.readlines()]
    except Exception as e:
        print(f"Error loading room codes: {e}")
        return []
@app.route("/delete-room1", methods=["POST"])
def delete_room1():
    code = request.json.get("room_code")
    rooms = load_room_codes1()

    # Remove both the normal code and the version that starts with "!"
    modified = False
    if code in rooms:
        rooms.remove(code)
        modified = True
    if f"!{code}" in rooms:
        rooms.remove(f"!{code}")
        modified = True

    # Save the updated room list
    if modified:
        with open(USED_FILE, "w") as file:
            for room in rooms:
                file.write(room + "\n")
        return jsonify({"message": "Room code deleted successfully"})
    else:
        return jsonify({"error": "Room not found"}), 404
@app.route("/generate-public", methods=["POST"])
def generate_public():
    data = request.json
    code = data.get("room_code")

    # Ensure that the provided room code exists in the rooms file
    rooms = load_room_codes()

    if code not in rooms:
        return jsonify({"error": "Room code does not exist"}), 404

    public_code = "!" + code  # Prepend "!" to make it public

    # Save the public room code
    save_room_code(public_code)

    return jsonify({"room_code": public_code})


@app.route("/delete-public-room", methods=["POST"])
def delete_public_room():
    data = request.get_json()  # This will get the JSON data from the request body

    if not data or 'room_code' not in data:
        return jsonify({"error": "Room code is required"}), 400  # Check if room_code is sent

    code = data.get("room_code")

    if not code.startswith("!"):
        return jsonify({"error": "Room code must be public (start with '!')"}), 400

    rooms = load_room_codes()

    # Remove the room code from the list
    updated_rooms = [room for room in rooms if room != code]

    if len(updated_rooms) == len(rooms):
        return jsonify({"error": "Public room code not found"}), 404

    # Save the updated room list to the file
    with open(ROOMS_FILE, "w") as file:
        for room in updated_rooms:
            file.write(room + "\n")

    return jsonify({"message": f"Public room code {code} deleted successfully."})

def check_room_exists(room_code):
    try:
        with open(ROOMS_FILE, "r") as file:
            rooms = {line.strip() for line in file.readlines()}
        return room_code in rooms
    except FileNotFoundError:
        return False

@socketio.on("check_room")
def handle_check_room(data):
    room_code = data.get("room_code")
    if check_room_exists(room_code):
        emit("room_found", {"room_code": room_code}, broadcast=True)  # Broadcast to all clients

@socketio.on("check_room1")
def handle_check_room1(data):
    room_code = data.get("room_code")

    emit("room_found1", {"room_code": room_code}, broadcast=True)  # Broadcast to all clients

@socketio.on("check_room2")
def handle_check_room2(data):
    room_code = data.get("room_code")

    emit("room_found2", {"room_code": room_code}, broadcast=True)  # Broadcast to all clients

@socketio.on("check_room3")
def handle_check_room3(data):
    room_code = data.get("room_code")

    emit("room_found3", {"room_code": room_code}, broadcast=True)  # Broadcast to all clients

@socketio.on("check_room4")
def handle_check_room4(data):
    room_code = data.get("room_code")

    emit("room_found4", {"room_code": room_code}, broadcast=True)  # Broadcast to all clients
@socketio.on("check_room5")
def handle_check_room5(data):
    room_code = data.get("room_code")

    emit("room_found5", {"room_code1": room_code}, broadcast=True)  # Broadcast to all clients


@socketio.on('send_code')
def handle_send_code10(data):
    room_code = data.get("code")
    # Broadcast the received code to all connected clients
    emit('receive_code', {'code': room_code}, broadcast=True)

# Event for the button click, assigning random code to users
@socketio.on('player_data')
def handle_player_data(data):
    # Extracting both playerName and gameCode from the data
    player_name = data.get('playerName')
    game_code = data.get('gameCode')  # Extract the gameCode (or code)

    # Broadcasting both playerName and gameCode to all clients
    emit('receive_data', {'playerName': player_name, 'gameCode': game_code}, broadcast=True, include_self=False)

@socketio.on('player_data1')
def handle_player_data1(data):
    # Extracting both playerName and gameCode from the data
    player_name = data.get('playerName')
    game_code = data.get('gameCode')
    points = data.get('Points')

    # Broadcasting both playerName and gameCode to all clients
    emit('receive_data1', {'playerName': player_name, 'gameCode': game_code,'Points': points}, broadcast=True, include_self=False)
@socketio.on('player_data2')
def handle_player_data2(data):
    # Extracting both playerName and gameCode from the data
    points = data.get('Points')
    game_code = data.get('gameCode')  # Extract the gameCode (or code)

    # Broadcasting both playerName and gameCode to all clients
    emit('receive_data2', {'Points': points, 'gameCode': game_code}, broadcast=True, include_self=False)

@app.route('/rate', methods=['POST'])
def rate():
    try:
        data = request.get_json()
        roast = data.get('roast', '')
        print("Received roast:", roast)

        result = rate_roast(roast)
        print("Roast score:", result)

        return jsonify({'result': result})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
@app.route('/generate_roast', methods=['POST'])
def generate_roast_api():
    try:
        data = request.get_json()
        target = data.get('target', '')
        print("Generating roast for:", target)

        roast = generate_roast(target)
        print("Generated roast:", roast)

        return jsonify({'roast': roast})
    except Exception as e:
        print("Error generating roast:", e)
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host="0.0.0.0", port=port)


#socketio.run(app, debug=True)








