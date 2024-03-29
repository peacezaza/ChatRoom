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
    const [userList , setUserList] = useState([]);
    const [showUserList , setShowUserList] = useState([]);

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
            
            axios.get(`http://127.0.0.1:5000/getAllUsers`)
                .then(response => {
                    setUserList(response.data);
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

    const handleKeyPress = (event) =>{
        if(event.key == "Enter"){
            handleSendMessage();
        }
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
    
    const handleLoadUser = () => {
        let substring = document.querySelector('.search-input').value
        const filteredUsers = userList.filter(user => user.username.includes(substring));
        // Now, filteredUsers contains only the users whose username contains the specified substring
        setShowUserList(filteredUsers)
        console.log(filteredUsers);
        // You can perform further operations with filteredUsers as needed
    };
    const handleAddMember = (username) => {
        // Toggle logic
        const token = localStorage.getItem('token');
        setShowUserList(prevList => {
            const newList = prevList.map(user => {
                if (user.username === username) {
                    return { ...user, isAdding: !user.isAdding };
                }
                return user;
            });
            return newList;
        });
        axios.post('http://127.0.0.1:5000/joinServer', { username , serverName})
            .then(() => {
                console.log("Join Server")

                axios.get(`http://127.0.0.1:5000/getServerList?token=${token}`)
                    .then(response => {
                        setServerList(response.data);
                        console.log(response.data)

                    })
                    .catch(error => {
                        console.error('Error loading server list:', error);
                    });
            })
            .catch(error => console.error('Error uploading image:', error));
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
                                        <button onClick={handleUpload}>Add Server</button>
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
                        <button style={{width:'50px',height:'50px',display:'flex',justifyContent:'center',alignItems:'center',borderRadius:'50%',padding:'20px'}} onClick={()=>{localStorage.removeItem('token');window.location.reload()}}><img src={"/profile-user.png"}/></button>
                    </div>
                    {/* <p className='name'>{username}</p> */}
                </div>
                <div className='channel'>
                    <div className='side-bar-channel'>
                        {serverClicked && <Channel propFromParent={serverName} childToParent={handleDataFromChild} />}
                        {serverClicked&&<div className='other-seting'>
                        <Popup
                            trigger={
                                <button>
                                    <img src={'/add-user.png'} />
                                </button>
                            }
                            position="center"
                            contentStyle={{ padding: '5px' ,margin:'0px 0px 0px 10px ',width:'600px',height:'600px'}}
                            modal
                            >
                                {
                                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                                        <h1>Add Member</h1>
                                        <div className='search' style={{display:'flex',width:'100%',alignItems:'center',justifyContent:'center'}}>
                                            <input className='search-input' style={{width:'90%' , height:'30px'}} placeholder='Enter Username' onChange={handleLoadUser}></input>
                                            {/* <button className='search-button' style={{width:'10px',height:'10px',borderRadius:'100%',padding:'20px'}}>search</button> */}
                                        </div>
                                        <div className='All-Member' style={{display:'flex',width:'80%',height:'80%',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                                            {showUserList.map((element, index) => (
                                                <div key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                                    <div style={{ flexGrow: 1 }}>{element.username}</div>
                                                    <button style={{ backgroundColor: 'green', width: '60px', height: '30px' }} onClick={() => handleAddMember(element.username)}>
                                                        {element.isAdding ? 'Cancel' : 'Add'}
                                                    </button>
                                                </div>
                                            ))}
                                            {/* <div>fdsf</div>
                                            <div>fdsf</div>
                                            <div>fdsf</div>
                                            <div>fdsf</div> */}
                                        </div>
                                    </div>
                                }
                        </Popup>
                            <button>
                                <img src={'/settings.png'}/>
                            </button>

                        </div>}
                    </div>
                    <div className='chat'>
                        <div>
                            <div style={{width:'100%',height:'100%',overflowY:'scroll'}}>
                                <div className='messages-chat'>
                                    {messages.map((msg, index) => (
                                        <div key={index} style={{margin:'20px 0px 0px 0px'}} className={`message-container ${msg.username === username ? 'message-right' : 'message-left'}`}>
                                            <div>
                                                <div style={{margin:'0px 0px 5px 0px'}} className={`${msg.username === username ? 'align-right' : 'align-left'}`}>
                                                    {msg.username}
                                                </div>
                                                <div className={`${msg.username === username ? 'align-right-message' : 'align-left-message'}`}>{msg.message}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {serverClicked&&<div >
                                <div>
                                    <input type='text' className='ChatInput' placeholder='TypeHere...' value={chatInput} onChange={handleGetMessage} onKeyDown={handleKeyPress}/>
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
