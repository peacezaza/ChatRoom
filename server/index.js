const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { addUser, checkPassword, usersDatabase , checkDuplicateUser, checkDuplicateEmail , addServerList} = require('./user.js');
const {addMessage , messages} = require('./message.js')
const { addServer, saveDatabase ,getBase64StringByName, getChannelList, addChannel} = require('./chatServer.js');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socket = require("socket.io");
const jwt = require('jsonwebtoken');
const secretKey = 'secret_key';

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
  let username = requestData.username;
  // console.log(usersDatabase); // Now, usersDatabase is available for logging
  // res;
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  if (checkPassword(username, password)) {

    return res.header('Authorization', token).status(201).send({messages:"Login success!",token});
  } else {
    res.status(401).send("Login fail");
  }
});

// Register endpoint
app.post('/register', (req, res) => {
  const requestData = req.body;
  const jsonString = JSON.stringify(requestData, null, 2);
  // const hashedPassword = hashPassword(requestData.password);
  if(checkDuplicateUser(requestData.username) || checkDuplicateEmail(requestData.email)){
    return res.status(409).send("Already Exists")
  }
  else{
    addUser(requestData.username, requestData.password, requestData.email);
    console.log(requestData);
    console.log("TAP")
    return res.status(201).send("Welcome");
  }
});

app.post('/addServer' , (req,res) => {
  const requestData = req.body;
  console.log(requestData);
  addServer(requestData.name,requestData.base64String);
  jwt.verify(requestData.jwt, secretKey, (err, decoded) => {
    if (err) {
        console.log('JWT verification failed:', err);
    } else {
        console.log('JWT verified successfully:', decoded);
        addServerList(decoded.username,requestData.name)
    }
  });
})

app.get('/verify' , (req,res) => {
  const token = req.query.token;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    else{
      return res.status(200).json({ message: 'valid token' });
    }
  })
})

app.get('/getServerList', (req, res) => {
  const token = req.query.token; // Assuming token is passed as a query parameter
  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: 'Invalid token' });
      } else {
          const username = decoded.username; // Extract username from the token
          const user = usersDatabase.find(u => u.username === username);

          if (user && Array.isArray(user.ServerList) && user.ServerList.length > 0) {
              // Construct response object with server names and base64 strings
              const response = user.ServerList.map(server => {
                  // Assuming you have a function to retrieve base64 string for each server
                  const base64String = getBase64StringByName(server);
                  const channelList = getChannelList(server)
                  return { serverName: server, base64String, channelList};
              });
              res.status(200).json(response);
          } else {
              res.status(404).json({ message: 'User not found or no servers available' });
          }
      }
  });
});


app.post('/addChannel',(req,res) => {
    try{
        const requestData = req.body;
        console.log(requestData);
        addChannel(requestData.serverName, requestData.channelName)
    }
    catch(error){
        console.log(error)
        res.send(error)
    }
});

app.get('/getChannel',(req,res) =>{
    try{
        const serverName = req.query.name;

        // Assuming getChannelList() returns some data
        const channelList = getChannelList(serverName);
        // console.log(channelList)

        // Sending the response back to the client
        res.json(channelList);
    }
    catch(error){
        res.json(error);
    }
});



// Example function to retrieve base64 string for a server
function getBase64StringForServer(serverName) {
  // Your logic to retrieve base64 string for the server
  return 'base64_string_here';
}
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
