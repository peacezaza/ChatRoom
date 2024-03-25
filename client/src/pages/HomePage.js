import SignIn from './SignIn'
import { Outlet, Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import HomePage from './HomePage.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App(){
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`http://127.0.0.1:5000/verify?token=${token}`)
                .then(response => {
                    // Handle successful response
                    console.log('message', response.data);
                    navigate('/message');
                    // setServerList(response.data); // Assuming the response is an array of server data
                })
                .catch(error => {
                    // Handle error
                    console.error('message', error);
                });
        } else {
            console.log('No token found');
        }
    })
    
    const divStyle = {
        backgroundImage: `url('page_rec.png')`,
        backgroundSize: 'cover',
        width: '100vw',
        height: '100vh',
    };
    const textStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'white',
        color: 'black',
        width: '60vw',
        height: '5vh',
        fontSize: '20px',
        borderRadius: '30px',
        textAlign: 'center',
        marginTop: '25px',
    };
    const buttonStyle = {
        backgroundColor: '#ffffff',
        border: 'none',
        color: 'black',
        fontSize: '20px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: '20px',
        borderRadius: '30px',
    };
    const handleHover = (event) => {
        event.target.style.backgroundColor = 'gray'; // New background color on hover
    };
    const handleLeave = (event) => {
        event.target.style.backgroundColor = 'white'; // Restore default background color
    };
    const handleCrickDown = async (event) => {
        event.target.style.backgroundColor = 'black'; // When Crick
        console.log("GO");
    };
    const handleCrickUp = (event) => {
        event.target.style.backgroundColor = 'white'; // When Crick
    };

    return (
        <div style={divStyle}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <img src="write_circle.png" alt="Logo" width={65} height={65} style={{margin: 20}}/>
                <img src="logos_braze-icon.png" alt="Logo" width={50} height={50} style={{position: 'absolute', top: 24, left: 27}}/>
                <h1 style={textStyle}>About</h1>

                <div style={{marginTop: '4.5vh', justifyContent: 'space-between'}}>
                    <Link to={'/signup'}><input type="submit" value={"Sign up"} style={buttonStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave} onMouseDown={handleCrickDown} onMouseUp={handleCrickUp} /></Link>
                    <Link to={'/signin'}><input type="submit" value={"Sign in"} style={buttonStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave} onMouseDown={handleCrickDown} onMouseUp={handleCrickUp} /></Link>
                </div>
            </div>

            <div className="white-text-box">
                <h1 className='centerText'>IMAGINE PLACE...</h1>
                <p className='centerText'>...where you can belong to a school club, a gaming group, or a worldwide art community.
                    Where just you and a handful of friends can spend time together. A place that makes it easy
                    to talk every day and hang out more often.</p>
            </div>
        </div>
    )
}

export default App;