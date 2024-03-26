const fs = require('fs');
const path = require('path');


let databaseFilePath = "";

function addServer(name, base64String) {
    databaseFilePath = path.join(__dirname, 'public', 'database', 'servers' , `${name}.json`);
    initializeDatabase(name, base64String);
}


function getBase64StringByName(name) {
    const filePath = path.join(__dirname, 'public', 'database', 'servers', `${name}.json`);
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        // return jsonData.base64String;
        return jsonData[1].base64String;
    } catch (error) {
        console.log('Error reading database file:', error);
        return null;
    }
}

function initializeDatabase(name, base64String) {
    try {
        const data = fs.readFileSync(databaseFilePath, 'utf8');
        console.log('Database file already exists.');
    } catch (error) {
        console.log('Database file not found. Initializing a new database.');
        saveDatabase({"name":name},{ base64String });
    }
}

function saveDatabase(name, data) {
    let channelList = []
    let datas = [name,data, {"channelList":channelList}]
    const jsonData = JSON.stringify(datas, null, 2);
    fs.writeFileSync(databaseFilePath, jsonData, 'utf8');
    console.log('Database saved successfully.');
}

function addChannelList(serverName, channelName){
    const filePath = path.join(__dirname, 'public', 'database', 'servers', `${serverName}.json`);

    try{
        const data = fs.readFileSync(filePath, 'utf8')

        console.log(data)

    }
    catch (error){
        console.log("Error adding Channel");
        return null;
    }

}

function getChannelList(serverName){
    const filePath = path.join(__dirname, 'public', 'database', 'servers', `${serverName}.json`);

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        // return jsonData.base64String;
        return jsonData[2].channelList;
    } catch (error) {
        console.log('Error reading channelList:', error);
        return null;
    }
}

function addChannel(serverName, channelName) {
    const filePath = path.join(__dirname, 'public', 'database', 'servers', `${serverName}.json`);

    try {
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Access the channelList array
        let channelList = data[2].channelList;

        // Check if channelName already exists in the channelList
        if (!channelList.includes(channelName)) {
            // If not, push the new channelName to the channelList
            channelList.push(channelName);

            // Update the data array with the new channelList
            data[2].channelList = channelList;

            // Convert the updated data back to JSON
            const jsonData = JSON.stringify(data, null, 2);

            // Write the updated JSON data back to the file
            fs.writeFileSync(filePath, jsonData, 'utf8');

            console.log('Channel added successfully!');
        }


        // // Assuming the JSON structure is an object with a channelList array
        // if (Array.isArray(data.channelList)) {
        //     // Push the new channelName to the channelList array
        //     data.channelList.push(channelName);
        //
        //     // Write the modified data back to the file
        //     fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        //     console.log('Channel added successfully.');
        // } else {
        //     console.log('Invalid data structure in the JSON file.');
        // }
    } catch (error) {
        console.log('Error reading or writing database file:', error);
    }


}


module.exports = {
    addServer,
    getBase64StringByName, // Adding this function to export
    saveDatabase,
    getChannelList,
    addChannel
};
