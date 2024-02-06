// const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const databaseFilePath = path.join(__dirname, 'public', 'database', 'users.json');
app.use(express.static(__dirname+'/public'))
// const databasePath = path.join(__dirname, '/public/database/user.db');
// const db = new sqlite3.Database('public/database/user.json/user.db');
let usersDatabase = [];
// const user_json = require('database/user.json');

function initializeDatabase() {
  try {
    const data = fs.readFileSync(databaseFilePath, 'utf8');
    usersDatabase = JSON.parse(data);
  } catch (error) {
    // File might not exist yet, which is okay
    console.log('Database file not found. Initializing a new database.');
  }
}


function saveDatabase() {
  const data = JSON.stringify(usersDatabase, null, 2);
  fs.writeFileSync(databaseFilePath , data, 'utf8');
  console.log('Database saved successfully.');
}

function addUser(username, password, email) {
  const newUser = {
    id: usersDatabase.length + 1,
    username,
    password,
    email,
  };
  usersDatabase.push(newUser);
  saveDatabase();
  console.log('User added successfully.');
}

function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

function checkPassword(username, password) {
  const user = usersDatabase.find((u) => u.username === username);

  if (user) {
    return bcrypt.compareSync(password, user.password);
  }

  return false; // User not found
}

app.use(bodyParser.json()); 


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});



// app.get('/get/user' ,(req , res)=>
// {
  
// })

app.post('/login' , (req , res)=>
{
  initializeDatabase();
  const requestData = req.body; //get data for front-end 
  console.log(usersDatabase)
  if(checkPassword(requestData["username"] , requestData["password"])) // check username and password
  {
    res.send("Login success!")
  }
  else
  {
    res.send("Login fail")
  }

})


app.post('/register' ,(req , res)=>
{
  const requestData = req.body; // รับข้อมูลจากfront โดยมี username email password
  const jsonString = JSON.stringify(requestData, null, 2);
  const hashedPassword = hashPassword(requestData["password"]); // hash password
  addUser(requestData["username"] , hashedPassword , requestData["email"]) // add to database
  console.log(requestData)
  res.send("welcom")
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});

