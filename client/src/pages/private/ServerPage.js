// ServerPage.js

import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import axios from "axios";
import io from 'socket.io-client'; // Import Socket.IO client
import Channel from './Component/Channel';
import './ServerPage.css'; // Import your CSS file here

function ServerPage() {
    const [socket, setSocket] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [serverList, setServerList] = useState([]);
    const [serverClicked, setServerClicked] = useState(false);
    const [serverName, setServerName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [username , setUsername] = useState('');
    const [hoveredServer, setHoveredServer] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`http://127.0.0.1:5000/verify?token=${token}`)
                .then(response => {
                    // Handle successful response
                    // console.log('message', response.data.message);
                    setUsername(response.data.username)
                    // console.log(response.data.username)
                    // setServerList(response.data); // Assuming the response is an array of server data
                })
                .catch(error => {
                    // Handle error
                    console.error('message', error);
                });
            axios.get(`http://127.0.0.1:5000/getServerList?token=${token}`)
                .then(response => {
                    setServerList(response.data);
                    console.log(response.data)

                })
                .catch(error => {
                    console.error('Error loading server list:', error);
                });
            
        } else {
            console.log('No token found');
        }

        const socket = io('http://localhost:5000');
        setSocket(socket);

        socket.on('receiveMessage', (data) => {
            if (data.room === roomName) {
                setMessages((prevMessages) => [...prevMessages, data]);
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [roomName]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
    };

    const handleUpload = () => {
        let name = document.querySelector(".AddServerName").value;
        if (selectedImage != null) {
            convertImageToBase64(selectedImage, function (base64String) {
                let data = { serverName: name, base64String, channelList: [] };
                setServerList([...serverList, data]);
                setSelectedImage(null)
                let jwt = localStorage.getItem('token');
                axios.post('http://127.0.0.1:5000/addServer', { name, base64String, jwt })
                    .then(() => {
                        // Add the new server data to the serverList state
                        // setServerList([...serverList, data]);
                    })
                    .catch(error => console.error('Error uploading image:', error));
            });
        } else {
            console.log("Error: No image selected");
        }
    };

    const handleServerClick = (server) => {
        setRoomName(server.serverName);
        setServerClicked(true);
        setServerName(server.serverName);
    };

    const handleSendMessage = () => {
        if (socket && chatInput.trim() !== '') {
            console.log(roomName)
            socket.emit('chatMessage', { room: roomName, message: chatInput ,username:username});
            setChatInput('');
        }
    };

    const handleGetMessage = (e) => {
        setChatInput(e.target.value);
    };

    const handleDataFromChild = (data) => {
        console.log(data)
        // let chat = document.querySelector('.messages')
        if (roomName === serverName || roomName !== `${serverName}-${data}`) {
            setRoomName(`${serverName}-${data}`);
        }
        // setMessages([])
        axios.get('http://127.0.0.1:5000/getMessage', {
            params: {
                serverName: serverName,
                channelName: data
            }
        })
        .then(response => {
            console.log(response.data.messages);
            setMessages(response.data.messages)

        })
        .catch(error => {
            console.error('There was a problem with the request:', error);
        });
        // ?serverName=exampleServer&channelName=exampleChannel
        // chat.remove()
    };

    const convertImageToBase64 = (file, callback) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64String = event.target.result;
            callback(base64String);
        };
        reader.readAsDataURL(file);
    };
    const handleServerButtonHover = (server) => {
        setHoveredServer(server);
    };

    // Function to handle mouse leave from server button
    const handleMouseLeave = () => {
        setHoveredServer(null);
    };

    return (
        <div className='con'>
            <div className="side-bar">
                <div>
                    <div className="server-list">
                        {serverList.map((server, index) => (
                            <div key={index}>
                                <Popup
                                    trigger={
                                        <button
                                            className="server-button"
                                            onClick={() => handleServerClick(server)}
                                            onMouseEnter={() => handleServerButtonHover(server)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <img src={server.base64String} alt={`Server ${index}`} className="server-image" />
                                        </button>
                                    }
                                    position="right center"
                                    mouseEnterDelay={200}
                                    mouseLeaveDelay={300}
                                    on="hover"
                                    contentStyle={{ padding: '5px' ,margin:'0px 0px 0px 10px ',width:'80px',opacity: '0.5'}} // Adjust as per your requirement
                                    arrow={false}
                                    closeOnDocumentClick
                                    open={hoveredServer === server}
                                >
                                    <div>{server.serverName}</div>
                                </Popup>
                            </div>
                        ))}
                    </div>
                    <Popup trigger={<button className='addServer'><img src={"/plus.png"} alt="Add Server" /></button>} modal position="center center" className="custom-popup">
                        {close => (
                            <div className='window-add-server'>
                                <h2>Add Server</h2>
                                <div>
                                    <label>Server Name </label>
                                    <input type='text' className='AddServerName' placeholder='Enter Name Server' />
                                </div>
                                <div>
                                    <br />
                                    <input type="file" accept="image/*" onChange={handleImageChange} />
                                    {selectedImage && (
                                        <div>
                                            <img src={URL.createObjectURL(selectedImage)} alt="Selected" style={{ maxWidth: '30px', maxHeight: '30px' }} />
                                            <button onClick={() => {
                                                handleUpload();
                                                close(); // Close the popup after uploading
                                            }}>Add Server</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Popup>
                </div>
            </div>
            <div className="content">
                <div className='nav-bar'>
                    <div className='profile-image'>
                        <img src={"/profile-user.png"}/>
                    </div>
                    {/* <p className='name'>{username}</p> */}
                </div>
                <div className='channel'>
                    <div className='side-bar-channel'>
                        {serverClicked && <Channel propFromParent={serverName} childToParent={handleDataFromChild} />}
                    </div>
                    <div className='chat'>
                        <div>
                            <div className='messages'>
                                {messages.map((msg, index) => (
                                    <div key={index} className={`message-container ${msg.username === username ? 'message-right' : 'message-left'}`}>
                                        <div>
                                            <div className={`${msg.username === username ? 'align-right' : 'align-left'}`}>
                                                {msg.username}
                                            </div>
                                            <div className="message">{msg.message}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {serverClicked&&<div>
                                <div>
                                    <input type='text' className='ChatInput' placeholder='TypeHere...' value={chatInput} onChange={handleGetMessage} />
                                </div>
                                <div>
                                    <button className='SubmitChat' onClick={handleSendMessage}></button>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServerPage;
