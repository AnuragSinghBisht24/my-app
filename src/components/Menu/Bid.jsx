import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import socketIOClient from 'socket.io-client';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { AES, enc } from 'crypto-js';

export const Bid = (props) => { 
    
    /* const declarations */
    const location =useLocation()
    const name =location.state.id3.name;
    const email =location.state.id3.email;
    const [items, setItems] = useState([]);
    const [socket, setSocket] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');


    /* Timer Code for the Items */

    // State variable to store the remaining time for each item
    const [remainingTime, setRemainingTime] = useState({});


    // State variable to store the current price for each Dutch Auction item
    const [remainingprice, setRemainingPrice] = useState({});


    // Function to calculate the remaining time for each item
    const calculateRemainingTime = (auctionEnd) => {
        const endTime = moment(auctionEnd).subtract(1, 'hour');
        const currentTime = moment();
        const duration = moment.duration(endTime.diff(currentTime));
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        return `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
    };


    //Display the current price in case of Dutch Auctions
    const dutchprice = (itemId) => {
        const price = remainingprice[itemId];
        if (price) {
            return (
                <p className='item'>
                    {price}
                </p>
            );
        }
        return null;
    } 


    // useEffect to Update the remaining time every second or Update the remaining price 
    useEffect(() => {

        // JS SetInterval function used to execute certain function
        const interval = setInterval(() => {
            try {

                // Fetch items from the database using Axios
                axios.get('http://localhost:5000/api/items')
                    .then(response => {
                        setItems(response.data);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
            const updatedRemainingTime = {};
            const updatedRemainingPrice = {};
            items.forEach((item) => {
                const itemId = item._id;
                const start = item.startingPrice;
                const n = item.currentBidder;
                const self = location.state.id3.name;
                if (
                    item.auctionStart !== null &&
                    item.auctionEnd !== null &&
                    moment(item.auctionEnd).subtract(1, 'hour') > moment() &&
                    moment(item.auctionStart).subtract(1, 'hour') < moment()
                ) {
                    if(item.type == 'English Auction' || item.type == 'Sealed Bid Auction'){
                        updatedRemainingTime[item._id] = calculateRemainingTime(item.auctionEnd);
                    item.active = 'ACTIVE';
                    socket.emit('bid-active', { itemId });
                    }
                }
                else if (
                    (item.auctionStart !== null &&
                    item.auctionEnd !== null &&
                    moment(item.auctionEnd).subtract(1, 'hour') <= moment())
                ) {
                    if (item.currentBidder !== 'NONE' && item.type == 'English Auction' && item.endnotif !== 'TRUE' && item.active !== "FINISHED") 
                    {
                        item.endnotif = 'TRUE';
                        item.bidWinner = item.currentBidder;
                        item.winnerPrice = item.startingPrice;
                        socket.emit('bid-finished', { itemId, start, n });
                    }
                    else if (item.type == 'Sealed Bid Auction' && item.endnotif !== 'TRUE' && item.active !== "FINISHED") {
                        item.endnotif = 'TRUE';
                        socket.emit('bid-finished-sealed', {itemId});
                        
                    }
                }
                else if (item.startingPrice == 0 && item.type == 'Dutch Auction' && item.bidWinner == null)
                {
                    socket.emit('dutch-bid-finish', { itemId } );
                }


                if(item.type == 'Dutch Auction' && item.active === 'ACTIVE' && item.bidWinner==null && item.winnerPrice==null){
                    if(item.bidrate!= null){
                        updatedRemainingPrice[itemId] = item.startingPrice;
                        console.log(start+self);
                        socket.emit('dutch-price',{ itemId });
                    }
                }

            });
            setRemainingTime(updatedRemainingTime);
            setRemainingPrice(updatedRemainingPrice);
        }, 1000);

        return () => clearInterval(interval);
    }, [items]);


    // Display the remaining time for each item
    const renderRemainingTime = (itemId) => {
        const time = remainingTime[itemId];
        if (time) {
            return (
                <p className="item">
                    {time}
                </p>
            );
        }
        return null;
    };


    /* For getting all the AuctionItems from backend */
    useEffect(() => {
        console.log("Inside fetching the data");
        // Fetch items from the database using Axios
        axios.get('http://localhost:5000/api/items')
            .then(response => {
                setItems(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);


    /* For real time database updation using SocketIO */
    useEffect(() => {
        console.log("Inside SocketIo fired");
        // Connect to the Socket.io server
        const socket = socketIOClient('http://localhost:8000');
        setSocket(socket);
        console.log(socket);

        // Listen for bid updates from the server
        socket.on('bidUpdate', updatedItem => {
            // Update the item in the local state
            setItems(prevItems => {
                const updatedItems = prevItems.map(item => {
                    if (item._id == updatedItem._id) {
                        return updatedItem;
                    } else {
                        return item;
                    }
                });
                return updatedItems;

            });
        });

        // Cleanup: disconnect from the Socket.io server
        return () => {
            socket.disconnect();
        };
    }, []);


    {/* Display the Start Datetime and End Datetime if the auction is not FINISHED */}
    const handleBid = (type, itemId, currentPrice, active, current, semail, astart, aend) => {
        
        console.log(astart)
        console.log(aend)
        var date = moment();
        var astart = moment(astart).subtract(1, 'hour');
        var aend = moment(aend).subtract(1, 'hour');
        console.log(date)
        console.log(astart)
        console.log(aend)
        
        if(type == 'English Auction'){
            if (current !== name) {

                console.log("Inside HandleBid Fired");
                // Prompt the user to enter a new bid amount
                const newPrice = prompt('Enter your bid amount:');
                if (newPrice && Number(newPrice) > currentPrice) {
    
                    // Send the bid amount to the server
                    console.log("EMIT TO SEND BID INFO");
                    if (socket !== null) {
                        socket.emit('bid', { itemId, newPrice, name, current, astart, aend, date });
                    }
                }
            }else{
                alert('You are the current bidder, wait for counter bids to bid again.')
            }
        }
        else if(type == 'Dutch Auction'){
            if(currentPrice>0 && currentPrice!= null && active == 'ACTIVE'){
                const n = location.state.id3.name;
                console.log("Inside Dutch HandleBid Fired");
                console.log("currentPrice"+currentPrice)
                console.log("n"+n)
                if(socket != null) {
                    socket.emit('bid-dutch', { itemId, price: currentPrice, n: n});
                }
            }
            else{
                alert('Wait for the auction to start OR The AuctionItem is bugged please contact Help Section.')
            }
        }
        else if(type == 'Sealed Bid Auction'){
            const newPrice = prompt('Enter your bid amount:');
            if(newPrice!= null && newPrice > currentPrice){
                if(newPrice>currentPrice && newPrice!= null && active == "ACTIVE"){
                    const n = location.state.id3.name;
                    if(socket!= null) {
                        // Convert the newPrice to a string (AES encryption takes a string input)
                        const newPriceString = newPrice.toString();

                        // Encrypt the newPrice using AES and a secret key (you should keep this key secure)
                        const secretKey = 'your-secret-key';
                        const encryptedPrice = AES.encrypt(newPriceString, secretKey).toString();
                        socket.emit('bid-sealed', { itemId, price: encryptedPrice, n: name });
                        alert('Shhhhhh!!!! Sealed Bid Successfully placed')
                    }
                }
                console.log("Inside Sealed Bid Auction HandleBid Fired");
            }else{
                alert("The amount needs to be higher than the Minimum Price");
            }
        }
        else{
            alert('The AuctionItem is bugged please contact Help Section.')
        }
        
    };


    {/* const settings that contains the values for the slider's metrics */}
    const settings = {
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
    };


    {/* const searchedItems that contains the filtered values as per the Search Bar value in searchQuery */}
    const searchedItems = items.filter(
        item =>
            (item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase())) &&
            item.active.toLowerCase().includes('active')
    );


    {/* Fired when value is entered in Search Bar (className: 'search-bar') i.e. onchange and the value passed is used to set searchQuery using setSearchQuery */}
    const handleSearchInputChange = event => {
        setSearchQuery(event.target.value);
    };


    return (
        
        <div className="about-us-container">

            <div className="header">
                <h1 className='h1'>Start Bidding Today!!</h1>
            </div>

            <div className="main-content">

                {/* Search Bar for the following Slider */}
                <input
                    className="search-bar"
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                />

                {/* Display the Slider to show all ACTIVE  AuctionItems */}
                <Slider className="slider" {...settings}>
                    {searchedItems.map(item => (
                        
                        <div key={item._id} className="slider-item">


                            {/* Display the Name, Description and Current Price */}
                            <h2 className="item-name">{item.itemName}</h2>
                            <p className="item-description">{item.description}</p>

                            {(item.type == 'English Auction') ?
                            <div>
                            <strong><p className="item-price">Current Price:</p></strong><p className='item'>${item.startingPrice}</p>
                            </div>
                            : null}

                            {/* Display the Start Datetime and End Datetime if the auction is not FINISHED */}
                            {(item.auctionStart !== null && item.type == 'English Auction' && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                <label className="item-price">Start DateTime</label>
                                : null}
                            {(item.auctionStart !== null && item.type == 'English Auction' && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                <p className="item">{moment(item.auctionStart).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                                : null}
                            {(item.auctionStart !== null && item.type == 'English Auction' && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                <label className="item-price">End DateTime</label>
                                : null}
                            {(item.auctionStart !== null && item.type == 'English Auction' && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                <p className="item">{moment(item.auctionEnd).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                                : null}


                            {/* Display the Seller's Details */}
                            <strong><p className="item-price">Seller's Name:</p></strong><p className='item'>{item.contactName}</p>
                            <strong><p className="item-price">Seller's Email Address:</p></strong><p className='item'>{item.email}</p>


                            {/* Display the current and previous Bidder */}
                            {(item.type == 'English Auction') ?
                            <div>
                            <strong><p className="item-price">Current Bidder:</p></strong><p className='item'>{item.currentBidder}</p>
                            <strong><p className="item-price">Previous Bidder:</p></strong><p className='item'>{item.prevBidder}</p>
                            </div>
                            : null}


                            {/* Display the winner and winning price of the AuctionItem */}
                            {(item.bidWinner!==null || item.winnerPrice!==null) ?
                            <div>
                            <strong><p className="item-price">Winner:</p></strong><p className='item'>{item.bidWinner}</p>
                            </div>
                            : null}

                            {(item.winnerPrice!==null || item.bidWinner!==null) ?
                            <div>
                            <strong><p className="item-price">Winning Price:</p></strong><p className='item'>{item.winnerPrice}</p>
                            </div>
                            : null}


                            {/* Display the live Time Remaining if the AuctionItem is ACTIVE */}
                            {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                <strong><label className="item-price">Time Remaining:</label></strong>
                                : null}
                            {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                renderRemainingTime(item._id)
                                : null}

                            {/* Display the current price if it is a Dutch Auction */}
                            {(item.type == 'Dutch Auction') && (item.active == 'ACTIVE') ?
                                <div>
                                <strong><label className="item-price">Current Price</label></strong>
                                </div>
                                : null}
                            {(item.type == 'Dutch Auction') && (item.active == 'ACTIVE') ?
                                dutchprice(item._id)
                                : null}


                            {/* Display the status of the Auction Item */}
                            <strong><p className="item-price">Status:</p></strong><p className='item'>{item.active}</p>


                            {/*Place Bid button only visible if Auction active*/}
                            {(name!==item.currentBidder && email!==item.email && item.active!=='INACTIVE' && item.active!==null && item.active!== 'FINISHED' && item.auctionStart!==null && item.auctionEnd!==null && moment(item.auctionStart).subtract(1, 'hour') < moment() && moment(item.auctionEnd).subtract(1, 'hour') > moment() && item.type == "English Auction") ||
                            (name!==item.currentBidder && email!==item.email && item.active!=='INACTIVE' && item.active!==null && item.active!== 'FINISHED' && item.type == 'Dutch Auction') ||
                            (name!==item.currentBidder && email!==item.email && item.active!=='INACTIVE' && item.active!==null && item.active!== 'FINISHED' && item.auctionStart!==null && item.auctionEnd!==null && moment(item.auctionStart).subtract(1, 'hour') < moment() && moment(item.auctionEnd).subtract(1, 'hour') > moment() && item.type == "Sealed Bid Auction") ?
                            <button className="bid-button" onClick={() => handleBid(item.type,item._id, item.startingPrice, item.active, item.currentBidder, item.email, item.auctionStart, item.auctionEnd)} > Place Bid </button>
                            : null}
                            

                            {/* If user is winning then display */}
                            {(name==item.currentBidder && item.active=='ACTIVE' && item.type == 'English Auction')?
                            <p className='winner'>YOU ARE WINNING</p>
                            :null}


                            {/* If user has won then display */}
                            {(name==item.currentBidder && item.active=='FINISHED')?
                            <p className='winner'>YOU HAVE WON THIS AUCTION</p>
                            :null}
                        </div>
                    ))}
                </Slider>


            </div>
        </div>
    )    
}
export default Bid;