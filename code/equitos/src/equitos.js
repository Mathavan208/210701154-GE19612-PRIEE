import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useTransition, animated } from 'react-spring';
import 'animate.css';
import 'bootstrap/dist/css/bootstrap.css';
import './equitos.css';

function Equitos() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const { transcript, listening, resetTranscript } = useSpeechRecognition();
    const [typingTimer, setTypingTimer] = useState(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (message) => {
        if (message.trim() === '') return;

        const newMessage = { sender: 'user', message };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputText('');

        try {
            const response = await axios.post('http://127.0.0.1:5000/chat', { message });
            const botMessage = response.data.message;

            setMessages((prevMessages) => [...prevMessages, { sender: 'bot', message: botMessage }]);
            speakMessage(botMessage);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSendMessage = () => {
        sendMessage(inputText);
    };

    const speakMessage = (message) => {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = 'en-US'; // Always speak in English
        window.speechSynthesis.speak(speech);
    };

    useEffect(() => {
        if (listening) {
            clearTimeout(typingTimer);
            setTypingTimer(setTimeout(async () => {
                if (transcript) {
                    sendMessage(transcript);
                    resetTranscript();
                }
            }, 5000));
        }
        return () => clearTimeout(typingTimer);
    }, [transcript, listening]);

    const handleSpeechRecognition = () => {
        if (!listening) {
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        } else {
            SpeechRecognition.stopListening();
        }
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const messageTransitions = useTransition(messages, {
        from: { opacity: 0, transform: 'translateY(-20px)' },
        enter: { opacity: 1, transform: 'translateY(0)' },
        leave: { opacity: 0, transform: 'translateY(-20px)' },
    });

    return (
        <div className="container chat-container animate__animated animate__fadeIn">
            <h1>LAW CHATBOT</h1>

            <div className="chat-wrapper">
                <div className="chat-messages">
                    {messageTransitions((style, item, t, i) => (
                        <animated.div
                            key={i}
                            style={style}
                            className={`message ${item.sender === 'user' ? 'user animate__animated animate__bounceIn' : 'bot animate__animated animate__bounceIn'}`}
                        >
                            <p>{item.message}</p>
                        </animated.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="input-container">
                    <div className="form-group">
                        <label className="input-label">Enter your message</label>
                        <input
                            type="text"
                            className="form-control input-field"
                            value={inputText}
                            onChange={handleInputChange}
                            placeholder="Type a message..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                    </div>

                    <div className="button-container">
                        <button className="btn send-btn" onClick={handleSendMessage}>
                            <img src="https://img.icons8.com/ios/50/ffffff/sent.png" alt="Send" className="btn-icon" />
                            Send
                        </button>
                        <button onClick={handleSpeechRecognition} className="listen-button btn btn-secondary">
                            <img src="https://img.icons8.com/ios/50/ffffff/microphone.png" alt="Speak" className="btn-icon" />
                            {listening ? "Stop Listening" : "Start Listening"}
                        </button>
                    </div>
                    {transcript && <p className="transcript">Transcript: {transcript}</p>}
                </div>
            </div>
        </div>
    );
}

export default Equitos;
