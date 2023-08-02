import "./App.css";
import Login from "./components/Login"
import Register from "./components/Register"
import Guest from "./components/Guest"
import React, { useState , useEffect } from 'react';
import ScrollToBottomArrow from "./ScrollToBottomArrow";
import ScrollToTopArrow from "./ScrollToTopArrow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import socketIOClient from 'socket.io-client';

function App() {
  

  // State variable to store the current price for each bid notification
  const [notifications, setNotifications] = useState([]);
  const [bidSuccessendNotifications, setBidSuccessendNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  
  
  // Function to handle new notifications for Bids
  const handleNewNotification = (data) => {
    setNotifications(prevNotifications => [...prevNotifications, data]);

    // After 3 seconds, remove the notification
    setTimeout(() => {
      setNotifications(prevNotifications => prevNotifications.filter(item => item !== data ));
    }, 3000);
  };


  // Function to handle new notifications for bidSuccessend
  const handleNewendNotification = (data) => {
    const id = Math.floor(Date.now() / 1000)
    setBidSuccessendNotifications(prevNotifications => [...prevNotifications, {...data, id}]);
    console.log('Anurag has reached here');
    console.log(data);
    
    setTimeout(() => {
      setBidSuccessendNotifications(prevNotifications => prevNotifications.filter(item => item.id !== id ));
    }, 3000);
  };


  // SocketIO connect and disconnect
  useEffect(() => {
    console.log("Inside SocketIo fired");
    // Connect to the Socket.io server
    const socket = socketIOClient('http://localhost:8000');
    setSocket(socket);

    // Cleanup: disconnect from the Socket.io server
    return () => {
        socket.disconnect();
    };
  }, []);


  // useEffect to listen for "bidSuccess" notification event
  useEffect(() => {
    
    if (socket) {
      // Listen for the "bidSuccess" event from the server
      socket.on('bidSuccess', (data) => {
        // Handle new notification
        handleNewNotification(data);
      });

      // Listen for the "bidSuccessend" event from the server
      socket.on('bidSuccessend', (data) => {
        
        console.log('Anurag is NOW here');
        handleNewendNotification(data);
      });
    }

    // Clean up the socket listener when the component unmounts
    return () => {
      if (socket) {
        socket.off('bidSuccess');
        socket.off('bidSuccessend');
      }
    };

  }, [socket]);


  return (
    <div>

      {/* Display the notifications from SocketIO for Bids */}
      <div className="notification-container">
        <div>
          {/* Display notifications */}
          {notifications.map((notification, index) => (
            <div key={index} className="notification">
              <p>{`${notification.name} has placed a bid of ${notification.newPrice} on item ID: ${notification.itemId}`}</p>
            </div>
          ))}
        </div>
      </div>
       
      {/* Display the notifications for bidSuccessend */}
      <div className="notification-container">
        <div>
          {/* Display bidSuccessend notifications */}
          {bidSuccessendNotifications.map((notification, index) => (
            <div key={index} className="notification">
              <p>{`Auction for item ID ${notification.itemId} has ended. ${notification.n} is the winner with a price of ${notification.start}.`}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="App-top">
        <Router>
          <Routes>
            <Route path="/Guest" element={<Guest />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </Router>
        <div className="App-scroll-arrow">
          <ScrollToBottomArrow />
        </div>
        <div>
          <ScrollToTopArrow />
        </div>
      </div>
    </div>
  );
}

export default App;
