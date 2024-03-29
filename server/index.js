const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { addUser, checkPassword, usersDatabase , checkDuplicateUser, checkDuplicateEmail , addServerList,getAllUsers} = require('./user.js');
// const {addMessage , messages} = require('./message.js')
const { addServer, saveDatabase ,getBase64StringByName, getChannelList, addChannel,addMessage,getMessage} = require('./chatServer.js');
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
  const token = jwt.sign({ username }, secretKey, { expiresIn: '24h' });
  if (checkPassword(username, password)) {

    return res.header('Authorization', token).status(201).send({messages:"Login success!",token,username});
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

app.get('/getAllUsers', (req, res) => {
  const allUsers = getAllUsers();
  res.status(200).json(allUsers);
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
      console.log(decoded.username)
      return res.status(401).json({ message: 'Invalid token' , username : decoded.username});
    }
    else{
      return res.status(200).json({ message: 'valid token' , username : decoded.username});
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

app.post('/joinServer' , (req , res) => {
  try{
    const requestData = req.body;
    console.log(requestData);
    addServerList( requestData.username,requestData.serverName)
  }
  catch(error){
      console.log(error)
      res.send(error)
  }
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

app.get('/getMessage', (req, res) => {
  // Extract serverName and channelName from query parameters
  const { serverName, channelName } = req.query;

  // Check if both serverName and channelName are provided
  if (!serverName || !channelName) {
      return res.status(400).json({ error: 'Both serverName and channelName are required.' });
  }

  // Call getMessage function to retrieve messages
  const messages = getMessage(serverName, channelName);

  if (messages) {
      // If messages are found, send them in the response
      return res.status(200).json({ messages });
  } else {
      // If no messages are found or channel not found, send an error response
      return res.status(404).json({ error: 'Messages not found or channel not found.' });
  }
});



// Example function to retrieve base64 string for a server
function getBase64StringForServer(serverName) {
  // Your logic to retrieve base64 string for the server
  return 'base64_string_here';
}
// WebSocket (Socket.io) integration



const io = socket(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust the origin as needed
    credentials: true,
  },
});

// Socket.io events
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // Handle chat messages
//   socket.on('message', (data) => {
//     console.log('Received message:', data);
//     addMessage(data,'kong')
//     // Handle incoming data, you can also broadcast it to other connected clients
//     io.emit('message', data);
//   });

//   // Handle other events here

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });
io.on('connection', (socket) => {
  console.log('New user connected');

  // Handle joining a room
  socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
  });

  // Handle chat message
  socket.on('chatMessage', (data) => {
      io.to(data.room).emit('message', data);
      console.log(`Room Name : ${data.room} , Message : ${data.message}`)
      const  tmp = data.room.split("-");
      console.log(tmp[0] +" "+tmp[1]);
      // console.log(data.room)
      addMessage(tmp[0],tmp[1],{username:data.username,message:data.message})
      io.emit('receiveMessage', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});


server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});