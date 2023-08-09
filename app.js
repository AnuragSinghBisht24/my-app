/* Using Express */
const express = require("express")

/* Two types of schemas in mongo - User and AuctionItem */
const { User, AuctionItem } = require("./mongo");

// Import necessary functions from the crypto-js library
const { AES, enc } = require('crypto-js');

// Secret key used for encryption/decryption (must be the same as used in Bid.js)
const secretKey = 'your-secret-key';

const cors = require("cors")
const app = express()
const bcrypt = require('bcrypt');
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

/* To use moment function for time */
const moment = require('moment');


/* For SocketIO to facilitate bidding*/
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
      origin: ["http://localhost:3000","http://localhost:3001","http://localhost:3002"],
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });


/* SocketIO Event handlers */
io.on('connection', socket => {
    console.log("SOCKETIO FIRED");

    console.log('Client connected:', socket.id);

    // Bid event handler for making a English Auction or Sealed Bid Auction Active when timer crosses
    socket.on('bid-active', async ({ itemId }) => {
        try{
            const updatedItem = await AuctionItem.findByIdAndUpdate(
                itemId,
                {
                    $set: {
                        active: 'ACTIVE',
                    }
                },
                { new: true }
            );
        }catch(e){
            console.log(e);
        }
    });

    // Bid event for decreasing Dutch auction price every second
    socket.on('dutch-price', async({ itemId , start , self }) => {
        try{

            const item = await AuctionItem.findById(itemId);
            if (item && item.type === 'Dutch Auction') {

                const newStartingPrice = item.startingPrice - 1;

                const updatedItem = await AuctionItem.findByIdAndUpdate(
                    itemId,
                    {
                        $set: {
                            startingPrice: newStartingPrice,
                        }
                    },
                    { new: true }
                );
                io.emit('bidUpdate', updatedItem);
            }
            
            
        }catch(e){
            console.log(e);
        }
    });


    // ******BID EVENT HANDLER TO FINISH AN AUCTION WHEN TIMER ENDS OR AUCTION EXPIRES******

    // Bid event for ending English Auction
    socket.on('bid-finished', async ({ itemId , start , n }) => {
        try{
            console.log("BID-FINISHED");
            const updatedItem = await AuctionItem.findByIdAndUpdate(
                itemId,
                {
                    $set: {
                        active: 'FINISHED',
                        bidWinner: n,
                        winnerPrice: start,
                        endnotif: 'TRUE'
                    }
                },
                { new: true }
            );
            
            io.emit('bidSuccessend', {itemId, start, n});
        }catch(e){
            console.log(e);
        }
    });

    // Bid event for ending Sealed Bid Auction
    socket.on('bid-finished-sealed', async ({ itemId }) => {
        try{
            console.log("BID-FINISHED-SEALED");
            //Get the item using the itemId
            const item = await AuctionItem.findById(itemId);
            
            if (item && item.endnotif !== "TRUE") {
                // Get the highest bid from the bidSchema
                /*const highestBid = item.bids.reduce((max, bid) => (bid.price > max ? bid.price : max), 0);
    
                // Find the highest bidder using the highest bid
                const highestBidder = item.bids.find((bid) => bid.price === highestBid)?.name || 'UNSOLD';*/
                
                const decryptedBids = item.bids.map((bid) => {
                    const decryptedPrice = AES.decrypt(bid.price, secretKey).toString(enc.Utf8);
                    return {
                        name: bid.name,
                        price: parseFloat(decryptedPrice),
                    };
                });
    
                // Find the highest bid and corresponding bidder using the decrypted prices
                let highestBid = 0;
                let highestBidder = 'UNSOLD';
    
                decryptedBids.forEach((bid) => {
                    if (bid.price > highestBid) {
                        highestBid = bid.price;
                        highestBidder = bid.name;
                    }
                });

                console.log(highestBid);
                console.log(highestBidder);
                // Update the AuctionItem with the highest bidder and winning price
                const updatedItem = await AuctionItem.findByIdAndUpdate(
                    itemId,
                    {
                        $set: {
                            active: 'FINISHED',
                            bidWinner: highestBidder.toString(),
                            winnerPrice: highestBid.toString(),
                            endnotif: 'TRUE',
                        },
                    },
                    { new: true }
                );
                console.log('IM HERE ISNT IT')
                // Emit the updated item to all connected clients
                io.emit('bidUpdate', updatedItem);
                
            }
            const item2 = await AuctionItem.findById(itemId);
            io.emit('bidSuccessend', {itemId, start: item2.winnerPrice , n: item2.bidWinner} );
            
        }catch(e){
            console.log(e);
        }
    });

    // Bid event for ending Dutch Auction when price ends
    socket.on('dutch-bid-finish', async({ itemId }) => {
        try{
            console.log("IN DUTCH-BID-FINISH");
            const updatedItem = await AuctionItem.findByIdAndUpdate(
                itemId,
                {
                    $set: {
                        active: 'FINISHED',
                        bidWinner: 'UNSOLD'
                    }
                },
                { new: true }
            );
        }catch(e){
            console.log(e);
        }
    });


    // ******BID EVENT HANDLER FOR NEW BIDS******

    //Bid event for handling new English Auction Bid
    socket.on('bid', async ({ itemId, newPrice, name, current, astart, aend, date}) => {
        try {
            console.log("IN BID")
            console.log(moment(aend))
            console.log(moment(date))
            // Update the starting price of the item in the database
            if(moment(aend)<moment(date).add(1,"minute")){
                const updatedItem = await AuctionItem.findByIdAndUpdate(
                    itemId,
                    {
                        $set: {
                            startingPrice: newPrice,
                            currentBidder: name,
                            prevBidder: current,
                            active: 'ACTIVE',
                            auctionEnd: moment(date).add(1,"hour").add(2,"minute")
                        }
                    },
                    { new: true }
                );
                console.log('Updated item:', updatedItem);
                    
                // Emit the updated item to all connected clients
                io.emit('bidUpdate', updatedItem);

                //Emit the notification to all clients
                io.emit('bidSuccess', { itemId, newPrice, name });
            }
            else{
                console.log("IN ELSE")
                const updatedItem = await AuctionItem.findByIdAndUpdate(
                    itemId,
                    {
                        $set: {
                            startingPrice: newPrice,
                            currentBidder: name,
                            prevBidder: current,
                            active: 'ACTIVE',
                        }
                    },
                    { new: true }
                );
                console.log('Updated item:', updatedItem);

                // Emit the updated item to all connected clients
                io.emit('bidUpdate', updatedItem);

                //Emit the notification to all clients
                io.emit('bidSuccess', { itemId, newPrice, name });
            }
            

            
        } catch (error) {
            console.log(error);
        }
    });

    //Bid event for handling new Dutch Auction Bid
    socket.on('bid-dutch', async({ itemId , price, n}) => {
        try{
            console.log("IN BID-DUTCH");
            const updatedItem = await AuctionItem.findByIdAndUpdate(
                itemId,
                {
                  $set: {
                    active: 'FINISHED',
                    bidWinner: n,
                    winnerPrice: price
                  },
                },
                { new: true }
              );

              io.emit('bidSuccess', { itemId, newPrice, n });
        }catch(e){
            console.log(e);
        }
    });

    //Bid event for handling new Sealed Auction Bid
    socket.on('bid-sealed', async({ itemId , price, n }) => {
        try{

            // Get the item using the itemId
            const item = await AuctionItem.findById(itemId);

            if (item) {
                // Create a new bid object with the bidder's name and bid price
                const newBid = {
                    name: n,
                    price: price,
                };
    
                // Push the new bid to the bidSchema array
                item.bids.push(newBid);
    
                // Save the updated item back to the database
                await item.save();
    
                // Emit the updated item to all connected clients
                io.emit('bidUpdate', item);
            }

        }catch(e){
            console.log(e);
        }
    });


    // ******BID EVENT HANDLER TO START AUCTION RIGHT NOW******
    socket.on('status', async ({ itemId }) => {
        try {
            // Update the auction item in the database
            const updatedItem = await AuctionItem.findByIdAndUpdate(
            itemId,
            {
              $set: {
                active: 'ACTIVE',
                auctionStart: (new Date()).setHours((new Date()).getHours() + 1), // Set the start datetime as the current datetime
              },
            },
            { new: true }
          );
      
          console.log('Updated item:', updatedItem);
      
          // Emit the updated item to all connected clients
          io.emit('statusUpdate', updatedItem);
        } catch (error) {
          console.log(error);
        }
      });


    // Disconnect event handler
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

});


// API endpoint to handle form submission and save data to MongoDB
app.post('/api/auctionItems', async (req, res) => {
    
    console.log('THIS IS THE BODY');
    console.log(req.body);
    try{
        const { type, itemName, description, category, startingPrice, reservePrice, duration, auctionStart, auctionEnd, location} = req.body
        
        const data = {
            type: type,
            itemName: itemName,
            description: description,
            email: location.id3.email,
            category: category,
            startingPrice: startingPrice,
            reservePrice: reservePrice,
            duration: duration,
            contactName: location.id3.name,
            phone: location.id3.phone,
            auctionStart: auctionStart,
            auctionEnd: auctionEnd
        }
        console.log(data);
        console.log("PASS DONE");
        /* As the data doesn't exist we will say insert 'data' in mongodb */
        const newItem = await AuctionItem.create(data);
        console.log(newItem);
        res.json("pass")
    }
    catch(e){
        console.log(e);
        res.status(500).json({ error: 'Failed to save auction item to the database.' });
        res.json("fail")
    }
    console.log('INTHIRD');
});


app.get("/api/items", cors(), async (req, res) => {
    try {
        const items = await AuctionItem.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch auction items from the database." });
    }
})


/* Fired when Email is getting matched */
app.post("/", async (req, res) => {

    const { email, pass } = req.body /* req.body structure is like this = { email: '', pass: '' } */

    try {
        const check = await User.findOne({ email: email })

        if (check) {

            /* If email exists we send response that 'exist' */
            console.log("Email match")
            res.json(["exist", check])

        }
        else {

            /* If email doesn't exist we send response that 'notexist' */
            console.log("Email doesn't match")
            res.json(["notexist"])
        }

    }
    catch (e) {
        res.json("fail")
    }
    console.log('Email check done and inside Home Page');
})

app.post("/Register", async (req, res) => {
    const { email, pass, address, name, dob, phone } = req.body
    //const hashedPassword = await bcrypt.hash(pass, 10);
    const data = {
        name: name,
        address: address,
        phone: phone,
        email: email,
        pass: pass,
        dob: dob,
    }
    console.log('IN REGISTER START')
    try {
        const check = await User.findOne({ email: email })
        console.log('IN REGISTER START TRY');
        console.log(check);
        if (check) {
            /* If email exists we send response that 'exist' */
            res.json(["exist"]);
            console.log("exist");
        }
        else {
            console.log(data);
            /* As the data doesn't exist we will say insert 'data' in mongodb 
            await collection.insertMany([data])*/
            const newItem = await User.create(data); 
            console.log("Inserted document:", newItem);
            /* If email doesn't exist we send response that 'notexist' */
            res.json(["notexist",data]);
            console.log("notexist");
        }

    }
    catch (e) {
        res.json("fail")
    }
    console.log('INREGISTER');
})

app.listen(5000, () => {
    console.log("data Server is listening on port 5000");
});

server.listen(8000, () => {
    console.log("Server is listening on port 8000");
});

