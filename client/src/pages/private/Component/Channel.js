import React, {useEffect, useState} from "react";
import './Channel.css';
import axios from "axios";

export default function Channel({propFromParent , childToParent}) {
    const [showPopup, setShowPopup] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [channelList, setChannelList] = useState([]);
    // const { propFromParent } = propFromParent;

    useEffect(() => {
        if (propFromParent) { // Check if propFromParent exists
            // Function to fetch channel list
            const fetchChannelList = async () => {
                try {
                    const response = await axios.get('http://127.0.0.1:5000/getChannel', {
                        params: {
                            name: propFromParent // Pass server name as a query parameter
                        }
                    });
                    setChannelList(response.data); // Assuming response.data is an array of channels
                    console.log(response.data)
                } catch(error) {
                    console.log(error);
                }
            };

            // Call fetchChannelList when component mounts and propFromParent exists
            fetchChannelList();
        }
    }, [propFromParent]);

    const handleButtonClick = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setChannelName('');
    };

    const handleInputChange = (e) => {
        setChannelName(e.target.value);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        console.log("Channel Name:", channelName);
        handleClosePopup();
        let data = {Name:channelName,channelMessage:[]};
        setChannelList([...channelList, data]);
        try {
            const response = await axios.post('http://127.0.0.1:5000/addChannel', { channelName, serverName: propFromParent });
        } catch(error) {
            console.log(error);
        }
    };

    const handleChannelClick =(channel) =>{
    }

    return (
        <>
            <div className='add-channel'>
                <h2>Chat Channel</h2>
                <button onClick={handleButtonClick}><img src='/plus.png' alt="Add Channel"/></button>
            </div>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h2 style={{color:'white'}}>Add New Channel</h2>
                        <form onSubmit={handleFormSubmit}>
                            <input
                                type="text"
                                placeholder="Enter channel name"
                                value={channelName}
                                onChange={handleInputChange}
                            />
                            <div>
                                <button type="submit">Create</button>
                                <button onClick={handleClosePopup}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Display channel list */}
            <div>
                {/*<h2>Channel List</h2>*/}
                <div className="button-channel">
                    {channelList.map(channel => (
                        <button onClick={() => childToParent(channel.Name)}>
                            {(channel.Name)}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}