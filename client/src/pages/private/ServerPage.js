import'./ServerPage.css'
import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import axios from "axios";





function ServerPage(){
    const [selectedImage, setSelectedImage] = useState(null);
    const [serverList, setServerList] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`http://127.0.0.1:5000/getServerList?token=${token}`)
                .then(response => {
                    // Handle successful response
                    console.log('Server list:', response.data);
                    setServerList(response.data); // Assuming the response is an array of server data
                })
                .catch(error => {
                    // Handle error
                    console.error('Error loading server list:', error);
                });
        } else {
            console.log('No token found');
        }
    }, []); // Empty dependency array to only run once on component mount
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
    };
    function convertImageToBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64String = event.target.result;
            callback(base64String);
        };
        reader.readAsDataURL(file);
    };
    const handleUpload =  () => {
        // Here you can implement the logic to upload the selected image
        let name = document.querySelector(".AddServerName").value;
        if(selectedImage != null){
            let a = "";
            convertImageToBase64(selectedImage, function(base64String) {
                console.log('Base64 string:', base64String);
                let jwt = localStorage.getItem('token');
                const response =  axios.post('http://127.0.0.1:5000/addServer', {name ,base64String,jwt});
                window.location.reload();
            });
            console.log("Selected image:", selectedImage);

        }
        else{
            console.log("Error")
        }
    };
    return(
        <div className='con'>
            <div className="side-bar">
                <div>
                    {/* <button className='addServer'><img src={"/plus.png"} /></button> */}
                    <div className="server-list">
                        {serverList.map((server, index) => (
                            <div key={index}>
                                <button className="addServer">
                                    <img src={server.base64String} alt={`Server ${index}`} className="server-image" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Popup trigger={<button className='addServer'><img src={"/plus.png"} /></button>} modal position="center center" className="custom-popup">
                        {close => (
                            <div className='window-add-server'>
                                <h2>Add Server</h2>
                                {/* <p>This is the content of the popup.</p> */}
                                <div>
                                    <label>Server Name </label>
                                    <input type='text' className='AddServerName' placeholder='Enter Name Server'/>
                                </div>
                                <div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} />
                                    {selectedImage && (
                                        <div>
                                            <img src={URL.createObjectURL(selectedImage)} alt="Selected" style={{ maxWidth: '30px', maxHeight: '30px' }} />
                                            <button onClick={handleUpload}>Add Server</button>
                                        </div>
                                    )}
                                </div>
                                {/* <button onClick={close}>Close Popup</button> */}
                            </div>
                        )}
                    </Popup>
                </div>
            </div>
            <div className="content">
                <div className='nav-bar'></div>
                <div className='channel'>
                    <div className='side-bar-channel'></div>
                    <div className='chat'>
                        <div>
                            <input type='text' className='ChatInput' placeholder='TypeHere...'/>
                        </div>
                        <div>
                            <button className='SubmitChat'></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}




export default ServerPage