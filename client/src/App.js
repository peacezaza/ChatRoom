import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your server URL

function App() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    socket.on('connection', () => {
      console.log('User Connected');
      // Handle incoming data
    });
  }, []);

  useEffect(() => {
    const chat_page = document.querySelector('.chat_page');

    socket.on('message', (data) => {
      setChatMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup function to remove event listener when component unmounts
    return () => {
      socket.off('message');
    };
  }, []); // Empty dependency array to ensure this effect runs only once

  const sendMessage = () => {
    socket.emit('message', message);
    setMessage('');
  };

  return (
    <div style={{ display: 'grid', justifyItems: 'center' }}>
      <div className='chat_page' style={{ width: '400px', height: '500px', backgroundColor: 'gray' }}>
        {chatMessages.map((chatMessage, index) => (
          <p key={index}>{chatMessage}</p>
        ))}
      </div>
      <div>
        <input
          className='send_message'
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
    </div>
  );
}

export default App;
