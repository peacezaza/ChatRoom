const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

let usersDatabase = [];
const databaseFilePath = path.join(__dirname, 'public', 'database', 'users.json');

function initializeDatabase() {
  try {
    const data = fs.readFileSync(databaseFilePath, 'utf8');
    usersDatabase = JSON.parse(data);
  } catch (error) {
    console.log('Database file not found. Initializing a new database.');
  }
}

function saveDatabase() {
  const data = JSON.stringify(usersDatabase, null, 2);
  fs.writeFileSync(databaseFilePath, data, 'utf8');
  console.log('Database saved successfully.');
}

function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

function checkPassword(username, password) {
  const user = usersDatabase.find((u) => (u.username === username || u.email === username) );

  if (user) {
    return bcrypt.compareSync(password, user.password);
  }

  return false; // User not found
}

function addUser(username, password, email) {
  const hashedPassword = hashPassword(password);
  const newUser = {
    id: usersDatabase.length + 1,
    username,
    password: hashedPassword,
    email,
  };
  usersDatabase.push(newUser);
  saveDatabase();
  console.log('User added successfully.');
}

initializeDatabase();

module.exports = {
  addUser,
  checkPassword,
  usersDatabase, // Exporting the usersDatabase array for use in other files
};
