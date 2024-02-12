const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

let messages = [];
const databaseFilePath = path.join(__dirname, 'public', 'database', 'message.json');

function initializeDatabase() {
  try {
    const data = fs.readFileSync(databaseFilePath, 'utf8');
    messages = JSON.parse(data);
  } catch (error) {
    console.log('Database file not found. Initializing a new database.');
  }
}

function saveDatabase() {
  const data = JSON.stringify(messages, null, 2);
  fs.writeFileSync(databaseFilePath, data, 'utf8');
  console.log('Database saved successfully.');
}

// function hashPassword(password) {
//   const saltRounds = 10;
//   return bcrypt.hashSync(password, saltRounds);
// }

// function checkPassword(username, password) {
//   const user = usersDatabase.find((u) => u.username === username);

//   if (user) {
//     return bcrypt.compareSync(password, user.password);
//   }

//   return false; // User not found
// }

function addMessage(message,username)
{
    const now = new Date
    const year = now.getFullYear()
    const month = now.getMonth()+1
    const day = now.getDate()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const second = now.getSeconds()
    const newMessage = {
        id: `${day}-${month}-${year}-${hours}-${minutes}-${second}`,
        message,
        username,
      };
    messages.push(newMessage)
    saveDatabase()
    console.log('Message added successfully.');
}

// function addUser(username, password, email) {
//   const hashedPassword = hashPassword(password);
//   const newUser = {
//     id: usersDatabase.length + 1,
//     username,
//     password: hashedPassword,
//     email,
//   };
//   usersDatabase.push(newUser);
//   saveDatabase();
//   console.log('User added successfully.');
// }

initializeDatabase();

module.exports = {
  addMessage,// Exporting the usersDatabase array for use in other files
};
