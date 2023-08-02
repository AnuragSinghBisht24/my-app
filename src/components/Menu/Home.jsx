import React, { useEffect, useState } from 'react';
import './Home.css';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import socketIOClient from 'socket.io-client';

export const Home = () => { 


    /* const declarations */
    const location =useLocation()
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [filteredItemsDutch, setFilteredItemsDutch] = useState([]);
    const [socket, setSocket] = useState(null);


    /* const that specifies the property parameters for the slider */
    const settings = {
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
    };


    /* const searchQuery that contains the search value */
    const [searchQuery, setSearchQuery] = useState('');


    /* useEffect to make use of axios to get the data from backend to enter into the const 'items', fired initially i.e. dependency array is empty */
    useEffect(() => {
        const fetchItems = async () => {
            try {
                // Fetch items from the database using Axios
                axios.get('http://localhost:5000/api/items')
                    .then(response => {
                        setItems(response.data);
                        console.log(response.data)
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        }
        fetchItems();

        const interval = setInterval(fetchItems, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);


    /* useEffect to send socketIO i.e. socket.emit messages to server to update backend as per the timer on auctions, checks every second alongwith the timer */
    useEffect(() => {
        const interval = setInterval(() => {
            filteredItems.forEach((item) => {
                const itemId = item._id;
                const start = item.startingPrice;
                const n = item.currentBidder;
                if (
                    item.auctionStart !== null &&
                    item.auctionEnd !== null &&
                    moment(item.auctionEnd).subtract(1, 'hour') > moment() &&
                    moment(item.auctionStart).subtract(1, 'hour') < moment() &&
                    (item.type === "English Auction" || item.type === "Sealed Bid Auction") && 
                    item.endnotif !== 'TRUE' && 
                    item.active !== "FINISHED"
                ) {
                    item.active = 'ACTIVE';
                    socket.emit('bid-active', { itemId });
                }
                else if (
                    item.auctionStart !== null &&
                    item.auctionEnd !== null &&
                    moment(item.auctionEnd).subtract(1, 'hour') <= moment() &&
                    (item.type === "English Auction") && 
                    item.endnotif !== 'TRUE' && 
                    item.active !== "FINISHED"
                ) {
                    item.active = 'FINISHED';
                    if(item.currentBidder!=='NONE'){
                        item.bidWinner = item.currentBidder;
                        item.winnerPrice = item.startingPrice;
                        socket.emit('bid-finished', { itemId , start , n });
                    }
                    else{
                        socket.emit('bid-finished', { itemId , start , n });
                    }
                }
            });
        }, 1000);
    }, []);


    /* useEffect hook to setup SocketIO connection, Fired initially to setup SocketIO on socket 8000 */
    useEffect(() => {
        const socket = socketIOClient('http://localhost:8000');
        setSocket(socket);

        // Cleanup: disconnect from the Socket.io server
        return () => {
            socket.disconnect();
        };
    }, []);


    /* useEffect hook to set the English Auction items that are currently active, Fired when 'items' or 'location' changes as specified in dependency array */
    useEffect(() => {

        // Filter items based on contactName when the items state changes
        setFilteredItems(items.filter(item => /*item.contactName === location.state.id3.name &&*/item.active == 'ACTIVE' && item.type === 'English Auction'));

    }, [items, location.state.id3.name]);


    /* useEffect hook to set the Dutch Auction items that are currently active, Fired when 'items' or 'location' changes as specified in dependency array */
    useEffect(() => {

        // Filter items based on contactName when the items state changes
        setFilteredItemsDutch(items.filter(item => /*item.contactName === location.state.id3.name &&*/item.active == 'ACTIVE' && item.type === 'Dutch Auction'));

    }, [items, location.state.id3.name]);


    /* const that contains the items to be displayed in the All Auctions slider as per search filter */
    const searchedItems = items.filter(

        item =>
            item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.active.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.contactName.toLowerCase().includes(searchQuery.toLowerCase())

    );


    /* Function to set the value for const searchQuery when entered in search bar */
    const handleSearchInputChange = event => {

        if(searchedItems!==null){
            setSearchQuery(event.target.value);
        }else{
            alert("No Items found with the given search keyword");
        }

    };


    /* RETURN FUNCTION WITH UI CODE FOR HOME.JSX */
    return (

        <div className='about-us-container'>


            {/* UI CODE FOR "All Auctions" SLIDERS ON THE HOME PAGE "STARTS" */}  

            {/* Only display if there is data in searchedItems */}

            {(searchedItems.length>=1)?
            <div>
            <div className="header">
                <h1 className='h1'>All Auctions</h1>
            </div>
            <div className='main-content'>
            <input className="search-bar" type="text" placeholder="Search" value={searchQuery} onChange={handleSearchInputChange} />    
            <Slider className="slider" {...settings}>
                {searchedItems.map(item => (
                    <div key={item._id} className="slider-item">
                        <label className="product-label">Auction Type</label>
                        <h2 className="product-price">{item.type}</h2>
                        <label className="product-label">Product Name</label>
                        <h2 className="product-name">{item.itemName}</h2>
                        <label className="product-label">Product Description</label>
                        <p className="product-description">{item.description}</p>

                        {(item.active == 'INACTIVE') ?
                            <div>
                                <label className="product-label">Starting Price</label>
                                <p className="product-price">{item.startingPrice}</p>
                            </div>
                            : null}

                        {(item.active == 'ACTIVE') ?
                            <div>
                                <label className="product-label">Current Price</label>
                                <p className="product-price">{item.startingPrice}</p>
                            </div>
                            : null}

                        {(item.active == 'FINISHED' && item.bidWinner != 'NONE') ?
                            <div>
                                <label className="product-label">Sold To</label>
                                <p className="product-price">{item.bidWinner}</p>
                                <label className="product-label">Sold At</label>
                                <p className="product-price">{item.winnerPrice}</p>
                            </div>
                            : null}

                        {(item.active == 'FINISHED' && item.bidWinner == 'NONE') ?
                            <div>
                                <label className="product-label">Sold To</label>
                                <p className="product-price">UNSOLD</p>
                                <label className="product-label">Unsold At</label>
                                <p className="product-price">{item.winnerPrice}</p>
                            </div>
                            : null}

                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <label className="product-label">Start DateTime</label>
                            : null}
                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <p className="product-category">{moment(item.auctionStart).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                            : null}
                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <label className="product-label">End DateTime</label>
                            : null}
                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <p className="product-category">{moment(item.auctionEnd).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                            : null}

                        <label className="product-label">Product Category</label>
                        <p className="product-category">{item.category}</p>
                        <h4 className="seller-heading">Seller Details</h4>
                        <label className="product-label">Mobile</label>
                        <p className="seller-phone">{item.phone}</p>
                        <label className="product-label">Name</label>
                        <p className="seller-contact">{item.contactName}</p>
                        <label className="product-label">Email</label>
                        <p className="seller-email">{item.email}</p>

                        {(item.bidWinner) ?
                            <div>
                                <label className="product-label">Winner:</label>
                                <p className='seller-email'>{item.bidWinner}</p>
                            </div>
                            : null}

                        {(item.winnerPrice) ?
                            <div>
                                <label className="product-label">Winning Price:</label>
                                <p className='seller-email'>{item.winnerPrice}</p>
                            </div>
                            : null}

                        <label className="product-label">Status</label>
                        <p className="product-price">{item.active}</p>

                    </div>
                ))}
            </Slider>
            </div>
            </div>
            :
            <div>
            <div className="header">
                <h1 className='h1'>All Auctions</h1>
            </div>
            <div className='no-auctions'>
                <h2>No live auctions currently, Please check later.</h2>
            </div>
            </div>
            }


            {/* UI CODE FOR "Live Auctions by Type" SLIDERS ON THE HOME PAGE "STARTS" */}  

            {/* Only display if there is data in filteredItems or filteredItemsDutch */}
            
            {(filteredItems.length>=1||filteredItemsDutch.length>=1)?
            <div className="header">
                <h1 className='h1'>Live Auctions by Type</h1>
            </div>
            :
            <div>
            <div className="header">
                <h1 className='h1'>Live Auctions by Type</h1>
            </div>
            <div className='no-auctions'><h2>No live auctions currently, Please check later.</h2></div>
            </div>
            }


            {/* UI CODE FOR "English Auction" SLIDER ON HOME PAGE */}

            {/* Only display the English Auction slider if there is data in filteredItems */}     

            {(filteredItems.length>=1)? 
            <div>               
            <div className="header-second">
                <h1 className='h1'>Live English Auctions</h1>
            </div>
            <div className='main-content'>
            <Slider className="slider" {...settings}>
                {filteredItems.map(item => (
                    <div key={item._id} className="slider-item">
                        <label className="product-label">Auction Type</label>
                        <h2 className="product-price">{item.type}</h2>
                        <label className="product-label">Product Name</label>
                        <h2 className="product-name">{item.itemName}</h2>
                        <label className="product-label">Product Description</label>
                        <p className="product-description">{item.description}</p>
                        <label className="product-label">Starting Price</label>
                        <p className="product-price">{item.startingPrice}</p>

                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <label className="product-label">Start DateTime</label>
                            : null}
                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <p className="product-category">{moment(item.auctionStart).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                            : null}
                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <label className="product-label">End DateTime</label>
                            : null}
                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <p className="product-category">{moment(item.auctionEnd).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                            : null}

                        <label className="product-label">Product Category</label>
                        <p className="product-category">{item.category}</p>
                        <h2 className="seller-heading">Seller Details</h2>
                        <label className="product-label">Mobile</label>
                        <p className="seller-phone">{item.phone}</p>
                        <label className="product-label">Name</label>
                        <p className="seller-contact">{item.contactName}</p>
                        <label className="product-label">Email</label>
                        <p className="seller-email">{item.email}</p>
                        <label className="product-label">Status</label>
                        <p className="product-price">{item.active}</p>
                    </div>
                ))}
            </Slider>   
            </div>
            </div>
            : 
            null}


            {/* UI CODE FOR "Dutch Auction" SLIDER ON HOME PAGE */}

            {/* Only display the Dutch Auction slider if there is data in filteredItemsDutch */}

            {(filteredItemsDutch.length>=1)? 
            <div>
            <div className="header-second">
                <h1 className='h1'>Live Dutch Auctions</h1>
            </div>
            <div className='main-content'>
            <Slider className="slider" {...settings}>
                {filteredItemsDutch.map(item => (
                    <div key={item._id} className="slider-item">
                        <label className="product-label">Auction Type</label>
                        <h2 className="product-price">{item.type}</h2>
                        <label className="product-label">Product Name</label>
                        <h2 className="product-name">{item.itemName}</h2>
                        <label className="product-label">Product Description</label>
                        <p className="product-description">{item.description}</p>
                        <label className="product-label">Current Price</label>
                        <p className="product-price">{item.startingPrice}</p>

                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <label className="product-label">Start DateTime</label>
                            : null}
                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <p className="product-category">{moment(item.auctionStart).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                            : null}
                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <label className="product-label">End DateTime</label>
                            : null}
                        {(item.auctionStart !== null && item.auctionEnd !== null) ?
                            <p className="product-category">{moment(item.auctionEnd).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                            : null}

                        <label className="product-label">Product Category</label>
                        <p className="product-category">{item.category}</p>
                        <h2 className="seller-heading">Seller Details</h2>
                        <label className="product-label">Mobile</label>
                        <p className="seller-phone">{item.phone}</p>
                        <label className="product-label">Name</label>
                        <p className="seller-contact">{item.contactName}</p>
                        <label className="product-label">Email</label>
                        <p className="seller-email">{item.email}</p>
                        <label className="product-label">Status</label>
                        <p className="product-price">{item.active}</p>
                    </div>
                ))}
            </Slider>         
            </div>
            </div>
            : 
            null}
            
            {/* UI CODE FOR 'Live Auctions by Type' SLIDERS ON THE HOME PAGE "ENDS" */}

        </div>

    );
}

export default Home;