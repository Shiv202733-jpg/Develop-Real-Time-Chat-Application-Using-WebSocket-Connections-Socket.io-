import React from 'react';
import Chat from './Chat';

function App() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'Arial' }}>
      <h1>Socket.io Chat — Real Time</h1>
      <Chat />
    </div>
  );
}

export default App;
