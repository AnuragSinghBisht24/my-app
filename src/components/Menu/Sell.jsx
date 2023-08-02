import React, {useEffect,useState} from 'react';
import './Sell.css';
import axios from 'axios'
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import socketIOClient from 'socket.io-client';


export const Sell = () => { 


    /* const declarations */
    const [socket, setSocket] = useState(null);
    const location =useLocation()
    const [item, setItem] = useState({
        type: '',
        itemName: '',
        description: '',
        category: '',
        startingPrice: '',
        reservePrice: '',
        contactName: '',
        email: '',
        phone: '',
        auctionStart: '',
        auctionEnd: '',
    });
    const [items2, setItems2] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [dutchFilteredItems, setdutchFilteredItems] = useState([]);
    const [sealedFilteredItems, setsealedFilteredItems] = useState([]);


    /* const that specifies the property parameters for the slider */
    const settings = {
        dots: true,
        infinite: true,
        speed: 900,
        slidesToShow: 1,
        slidesToScroll: 1,
    };


    /* useEffect hook to set the Dutch Auction items that are currently active, Fired initially to setup SocketIO on socket 8000 */
    useEffect(() => {
        const socket = socketIOClient('http://localhost:8000');
        setSocket(socket);

        // Cleanup: disconnect from the Socket.io server
        return () => {
            socket.disconnect();
        };
    }, []);

    
    /* useEffect to make use of axios to get the data from backend to enter into the const 'items', fired initially i.e. dependency array is empty */
    useEffect(() => {
        const fetchItems = async () => {
            try {
                // Fetch items from the database using Axios
                axios.get('http://localhost:5000/api/items')
                    .then(response => {
                        setItems2(response.data);
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


    /* useEffect to send socketIO i.e. socket.emit messages to server to update backend as per the timer on auctions, fired whenever filteredItems changes */
    useEffect(() => {


        {/* Interval to filter every second */}
        const interval = setInterval(() => {


            {/* For the English Auctions updations */}
            filteredItems.forEach((item) => {
                const itemId = item._id;
                const start = item.startingPrice;
                const n = item.currentBidder;
                if (
                    item.auctionStart !== null &&
                    item.auctionEnd !== null &&
                    moment(item.auctionEnd).subtract(1, 'hour') > moment() &&
                    moment(item.auctionStart).subtract(1, 'hour') < moment() &&
                    item.type === "English Auction" && 
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
                    item.type === "English Auction" && 
                    item.endnotif !== 'TRUE' && 
                    item.active !== "FINISHED"
                ) {
                    console.log("HERE IN SELL")
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


            {/* For the Dutch Auctions updations */}
            {/*dutchFilteredItems.forEach((item) => {
                const itemId = item._id;
                const start = item.startingPrice;
                const n = item.currentBidder;
                if (
                    item.auctionStart !== null &&
                    item.auctionEnd !== null &&
                    moment(item.auctionEnd).subtract(1, 'hour') > moment() &&
                    moment(item.auctionStart).subtract(1, 'hour') < moment()
                ) {
                    item.active = 'ACTIVE';
                    socket.emit('bid-active', { itemId });
                }
                else if (
                    item.auctionStart !== null &&
                    item.auctionEnd !== null &&
                    moment(item.auctionEnd).subtract(1, 'hour') <= moment() 
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
            });*/}

            {/* For the Sealed Bid Auctions updations */}
            sealedFilteredItems.forEach((item) => {
                const itemId = item._id;
                const start = item.startingPrice;
                const n = item.currentBidder;
                if (
                    item.auctionStart !== null &&
                    item.auctionEnd !== null &&
                    moment(item.auctionEnd).subtract(1, 'hour') > moment() &&
                    moment(item.auctionStart).subtract(1, 'hour') < moment()
                ) {
                    item.active = 'ACTIVE';
                    socket.emit('bid-active', { itemId });
                }
                else if (
                    item.auctionStart !== null &&
                    item.auctionEnd !== null &&
                    moment(item.auctionEnd).subtract(1, 'hour') <= moment() &&
                    item.type === "Sealed Bid Auction" && 
                    item.endnotif !== 'TRUE' && 
                    item.active !== "FINISHED"
                ) {
                    item.active = 'FINISHED';
                    socket.emit('bid-finished-sealed', { itemId , start , n });
                }
            }

            );
        }, 1000);

        return () => clearInterval(interval);
    }, [filteredItems,dutchFilteredItems,sealedFilteredItems]);


    /* useEffect to set the Filtered Items and Dutch Filtered Items to display Your Auctions as per type */
    useEffect(() => {
        // Filter items based on contactName when the items2 state changes
        setFilteredItems(items2.filter(item => item.contactName === location.state.id3.name && item.type == "English Auction"));
        setdutchFilteredItems(items2.filter(item => item.contactName === location.state.id3.name && item.type == "Dutch Auction"));
        setsealedFilteredItems(items2.filter(item => item.contactName === location.state.id3.name && item.type == "Sealed Bid Auction"));
    }, [items2, location.state.id3.name]);


    /* On change fires setItem to set the values */
    const handleChange = (e) => {
        setItem({ ...item, [e.target.name]: e.target.value });
    };


    /* Submit button sends the data to backend using axios to upload an AuctionItem */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Perform actions with the submitted item data
        try {
            const itemData = {
                ...item,
                auctionStart: moment(item.auctionStart).add(1, 'hour'),
                auctionEnd: moment(item.auctionEnd).add(1, 'hour'),
                location: location.state
            };
            const response = await axios.post('http://localhost:5000/api/auctionItems', itemData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(response);

            if (response.data == "pass") {
                console.log('Auction item added successfully!');
                // Reset form fields
                setItem({
                    type: '',
                    itemName: '',
                    description: '',
                    category: '',
                    startingPrice: '',
                    reservePrice: '',
                    contactName: '',
                    email: '',
                    phone: '',
                    auctionStart: '',
                    auctionEnd: '',
                });
                alert('Auction item added successfully!');
            } else {
                console.error('Failed to add auction item.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    /* To trigger the Start Auction button to start the auction for the concerned item */
    const handleClick = async (itemId) => {
        if (socket !== null) {
            socket.emit('status', { itemId });
        }
    };
    
    return (
        <div>
            <div className='container-sell'>

                {/* To show the form to enter an Auctionitem into the database */}

                {/* header that says "Get the best price for your item" */}
                <div className="header">
                    <h1 className='h1'>Get the best price for your item</h1>
                </div>

                {/* MAIN CONTENT for the form */}
                <div className="main-content">
                    <div className='section'>
                        <form onSubmit={handleSubmit} className="auction-form">
                            <label>Auction Type:</label>
                            <input type="text" name="type" list="aname" placeholder='Please choose from dropdown options' onChange={handleChange}/>
                                <datalist id="aname">
                                    <option value="English Auction" />
                                    <option value="Dutch Auction" />
                                    <option value="Sealed Bid Auction" />
                                </datalist>

                            <label>Item Name:</label>
                            <input type="text" name="itemName" value={item.itemName} onChange={handleChange} />

                            <label>Description:</label>
                            <textarea name="description" value={item.description} onChange={handleChange} />

                            <label>Category:</label>
                            <input type="text" name="category" value={item.category} onChange={handleChange} />

                            <label>Starting Price:</label>
                            <input type="text" name="startingPrice" value={item.startingPrice} onChange={handleChange} />

                            {/* Start and End Datetime only required for English Auctions */}
                            {(item.type === "English Auction" || item.type === "Sealed Bid Auction") && (
                            <>
                            <label>Auction Start:</label>
                            <input type="datetime-local" name="auctionStart" value={item.auctionStart} onChange={handleChange} />

                            <label>Auction End:</label>
                            <input type="datetime-local" name="auctionEnd" value={item.auctionEnd} onChange={handleChange} />
                            </>
                            )}

                            {/* Bid Rate only required for Dutch Auctions */}
                            {(item.type === 'Dutch Auction') && (
                                <>
                                <label>Bid Rate:</label>
                                <input type="number" name="bidrate" value={item.bidrate} onChange={handleChange} /> 
                                </>
                            )}

                            <button type="submit" className='btn-submit-sell'>Submit</button>
                        </form>
                    </div>
                </div>


                {/* header that says "Your items" for English Auctions */}
                <div className="header">
                    <h1 className='h1'>Your English Auctions</h1>
                </div>


                {/* MAIN CONTENT for Your items */}
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

                                {(item.active == 'INACTIVE') ?
                                <div>
                                <label className="product-label">Starting Price</label>
                                <p className="product-price">{item.startingPrice}</p>
                                </div>
                                :null}

                                {(item.active == 'ACTIVE') ?
                                <div>
                                <label className="product-label">Current Price</label>
                                <p className="product-price">{item.startingPrice}</p>
                                </div>
                                :null}
                                
                                {(item.active == 'FINISHED' && item.bidWinner!='NONE') ?
                                <div>
                                <label className="product-label">Sold To</label>
                                <p className="product-price">{item.bidWinner}</p>
                                <label className="product-label">Sold At</label>
                                <p className="product-price">{item.winnerPrice}</p>
                                </div>
                                :null}

                                {(item.active == 'FINISHED' && item.bidWinner=='NONE') ?
                                <div>
                                <label className="product-label">Sold To</label>
                                <p className="product-price">UNSOLD</p>
                                <label className="product-label">Unsold At</label>
                                <p className="product-price">{item.winnerPrice}</p>
                                </div>
                                :null}

                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <label className="product-label">Start DateTime</label>
                                    : null}
                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <p className="product-category">{moment(item.auctionStart).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                                    : null}
                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <label className="product-label">End DateTime</label>
                                    : null}
                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <p className="product-category">{moment(item.auctionEnd).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                                    : null}

                                <label className="product-label">Product Category</label>
                                <p className="product-category">{item.category}</p>
                                


                                <label className="product-label">Status</label>
                                <p className="product-price">{item.active}</p>
                                {(item.active=='INACTIVE')?<button className='bid-button' onClick={() => handleClick(item._id)}>Start Auction</button>:null}
                            </div>
                        ))}
                    </Slider>
                </div>


                {/* header that says "Your items" for Dutch Auctions */}
                <div className="header">
                    <h1 className='h1'>Your Dutch Auctions</h1>
                </div>


                {/* MAIN CONTENT for Your items */}
                <div className='main-content'>
                    <Slider className="slider" {...settings}>
                        {dutchFilteredItems.map(item => (
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
                                :null}

                                {(item.active == 'ACTIVE') ?
                                <div>
                                <label className="product-label">Current Price</label>
                                <p className="product-price">{item.startingPrice}</p>
                                </div>
                                :null}
                                
                                {(item.active == 'FINISHED' && item.bidWinner!='NONE' && item.type == 'English Auction') ?
                                <div>
                                <label className="product-label">Sold To</label>
                                <p className="product-price">{item.bidWinner}</p>
                                <label className="product-label">Sold At</label>
                                <p className="product-price">{item.winnerPrice}</p>
                                </div>
                                :null}

                                {(item.active == 'FINISHED' && item.type == 'Dutch Auction') ?
                                <div>
                                <label className="product-label">Sold To</label>
                                <p className="product-price">{item.bidWinner}</p>
                                <label className="product-label">Sold At</label>
                                <p className="product-price">{item.winnerPrice}</p>
                                </div>
                                :null}

                                {(item.active == 'FINISHED' && item.bidWinner=='NONE') ?
                                <div>
                                <label className="product-label">Sold To</label>
                                <p className="product-price">UNSOLD</p>
                                <label className="product-label">Unsold At</label>
                                <p className="product-price">{item.winnerPrice}</p>
                                </div>
                                :null}

                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <label className="product-label">Start DateTime</label>
                                    : null}
                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <p className="product-category">{moment(item.auctionStart).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                                    : null}
                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <label className="product-label">End DateTime</label>
                                    : null}
                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <p className="product-category">{moment(item.auctionEnd).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                                    : null}

                                <label className="product-label">Product Category</label>
                                <p className="product-category">{item.category}</p>
                                


                                <label className="product-label">Status</label>
                                <p className="product-price">{item.active}</p>
                                {(item.active=='INACTIVE')?<button className='bid-button' onClick={() => handleClick(item._id)}>Start Auction</button>:null}
                            </div>
                        ))}
                    </Slider>
                </div>


                {/* header that says "Your items" for Sealed Bid Auctions */}
                <div className="header">
                    <h1 className='h1'>Your Sealed Bid Auctions</h1>
                </div>


                {/* MAIN CONTENT for Your items */}
                <div className='main-content'>
                    <Slider className="slider" {...settings}>
                        {sealedFilteredItems.map(item => (
                            <div key={item._id} className="slider-item">
                                <label className="product-label">Auction Type</label>
                                <h2 className="product-price">{item.type}</h2>
                                <label className="product-label">Product Name</label>
                                <h2 className="product-name">{item.itemName}</h2>
                                <label className="product-label">Product Description</label>
                                <p className="product-description">{item.description}</p>

                                {(item.active == 'INACTIVE') ?
                                <div>
                                <label className="product-label">Minimum Bid Price</label>
                                <p className="product-price">{item.startingPrice}</p>
                                </div>
                                :null}

                                {(item.active == 'FINISHED' && item.bidWinner!='NONE') ?
                                <div>
                                <label className="product-label">Sold To</label>
                                <p className="product-price">{item.bidWinner}</p>
                                <label className="product-label">Sold At</label>
                                <p className="product-price">{item.winnerPrice}</p>
                                </div>
                                :null}

                                {(item.active == 'FINISHED' && item.bidWinner=='NONE') ?
                                <div>
                                <label className="product-label">Sold To</label>
                                <p className="product-price">UNSOLD</p>
                                <label className="product-label">Unsold At</label>
                                <p className="product-price">{item.winnerPrice}</p>
                                </div>
                                :null}

                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <label className="product-label">Start DateTime</label>
                                    : null}
                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <p className="product-category">{moment(item.auctionStart).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                                    : null}
                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <label className="product-label">End DateTime</label>
                                    : null}
                                {(item.auctionStart !== null && item.auctionEnd !== null && moment(item.auctionEnd).subtract(1, 'hour')>moment()) ?
                                    <p className="product-category">{moment(item.auctionEnd).subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}</p>
                                    : null}

                                <label className="product-label">Product Category</label>
                                <p className="product-category">{item.category}</p>
                                


                                <label className="product-label">Status</label>
                                <p className="product-price">{item.active}</p>
                                {(item.active=='INACTIVE')?<button className='bid-button' onClick={() => handleClick(item._id)}>Start Auction</button>:null}
                            </div>
                        ))}
                    </Slider>
                </div>


                {/* FOOTER for Sell.jsx */}
                <div className="footer2">
                    <p className='p'>&copy; 2023 Alfred's Auctionhouse. All rights reserved.</p>
                </div>
            </div>
        </div>
    );

}
export default Sell;