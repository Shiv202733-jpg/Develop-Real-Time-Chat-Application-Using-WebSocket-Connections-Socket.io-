import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:5000"; // server address

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]); // {id, name, text, time}
  const [userCount, setUserCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const s = io(SOCKET_SERVER_URL);
    setSocket(s);

    s.on('connect', () => {
      console.log('connected to socket server', s.id);
    });

    s.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    s.on('user_count', (count) => {
      setUserCount(count);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    // auto-scroll
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!socket) return;
    if (!name.trim()) {
      alert('Enter your name first');
      return;
    }
    if (!messageText.trim()) return;

    const msg = {
      name: name.trim(),
      text: messageText,
      time: new Date().toLocaleTimeString()
    };

    socket.emit('send_message', msg);
    setMessageText('');
  };

  const onEnterPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <div style={{ marginBottom: 8 }}>
        <strong>Users online:</strong> {userCount}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ flex: '0 0 200px', padding: 6 }}
        />
        <input
          placeholder="Type a message..."
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          onKeyDown={onEnterPress}
          style={{ flex: 1, padding: 6 }}
        />
        <button onClick={sendMessage} style={{ padding: '6px 12px' }}>Send</button>
      </div>

      <div style={{ height: 300, overflowY: 'auto', border: '1px solid #eee', padding: 8, borderRadius: 4 }}>
        {messages.length === 0 && <div style={{ color: '#555' }}>No messages yet.</div>}
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>{m.time} — <strong>{m.name}</strong></div>
            <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 6, display: 'inline-block' }}>{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
