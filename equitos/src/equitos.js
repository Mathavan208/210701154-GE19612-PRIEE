import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css'
import './equitos.css'
function Equitos() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');

    const sendMessage = async () => {
        if (inputText.trim() === '') return;

        const newMessages = [...messages, { sender: 'user', message: inputText }];
        setMessages(newMessages);
        setInputText('');

        try {
            const response = await axios.post('http://127.0.0.1:5000/chat', { message: inputText });
            console.log(response);
            const responseData = response.data;
            const botMessage = responseData.message;

            const updatedMessages = [...newMessages, { sender: 'bot', message: botMessage }];
            setMessages(updatedMessages);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    return (
        <div className="container chat-container">
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                        <p>{msg.message}</p>
                    </div>
                ))}
            </div>
            <div className="input-container">

    <div className='form-group'>
        <label style={{color:'white'}}>ENTER YOUR MESSAGE</label>
        <input
                    type="text"
                    className="form-control"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    onClick={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="btn btn-primary" onClick={sendMessage}>Send</button>
    </div>
               
            </div>
        </div>
    );
}

export default Equitos;
