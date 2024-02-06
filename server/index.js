const express = require('express');
const bodyParser = require('body-parser');
const { addUser, checkPassword, usersDatabase } = require('./user.js');

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});















// -------------------------- api ---------------------------------------

app.post('/login', (req, res) => {
  const requestData = req.body;
  console.log(usersDatabase); // Now, usersDatabase is available for logging
  if (checkPassword(requestData.username, requestData.password)) {
    return res.send("Login success!");
  } else {
    res.send("Login fail");
  }
});

app.post('/register', (req, res) => {
  const requestData = req.body;
  const jsonString = JSON.stringify(requestData, null, 2);
  // const hashedPassword = hashPassword(requestData.password);
  addUser(requestData.username, requestData.password, requestData.email);
  console.log(requestData);
  return res.status(404).send("Welcome");
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
