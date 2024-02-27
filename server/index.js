const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { addUser, checkPassword, usersDatabase } = require('./user.js');
const {addMessage , messages} = require('./message.js')
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socket = require("socket.io");

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());

// API Endpoints

// Sleep Function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Login endpoint
app.post('/login',  (req, res) => {
  const requestData = req.body;
  let password = requestData.password;
  password = password.toString()
  // console.log(usersDatabase); // Now, usersDatabase is available for logging
  if (checkPassword(requestData.username, password)) {
    return res.status(201).send("Login success!");
  } else {
    res.status(401).send("Login fail");
  }
});

// Register endpoint
app.post('/register', (req, res) => {
  const requestData = req.body;
  const jsonString = JSON.stringify(requestData, null, 2);
  // const hashedPassword = hashPassword(requestData.password);
  addUser(requestData.username, requestData.password, requestData.email);
  console.log(requestData);
  return res.status(201).send("Welcome");
});

// WebSocket (Socket.io) integration

server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust the origin as needed
    credentials: true,
  },
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle chat messages
  socket.on('message', (data) => {
    console.log('Received message:', data);
    addMessage(data,'kong')
    // Handle incoming data, you can also broadcast it to other connected clients
    io.emit('message', data);
  });

  // Handle other events here

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
