const mongoose = require("mongoose")

mongoose.connect("mongodb://0.0.0.0:27017/react-login-tut")
    .then(() => {
        console.log("mongodb connected");
    })
    .catch(() => {
        console.log('failed');
    });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    }
});


const bidSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    price: {
        type: String,
        required: false
    }
});


const auctionItemSchema = new mongoose.Schema({
    endnotif: {
        type: String,
        required: false,
        default: 'FALSE'
    },
    type: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    startingPrice: {
        type: String,
        required: true
    },
    contactName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    currentBidder: {
        type: String,
        required: false,
        default: 'NONE'
    },
    prevBidder: {
        type: String,
        required: false,
        default: 'NONE'
    },
    active: {
        type: String,
        required: true,
        default: 'INACTIVE'

    },
    auctionStart: {
        type: Date,
        required: false,
        default: null
    },
    auctionEnd: {
        type: Date,
        required: false,
        default: null
    },
    bidWinner: {
        type: String,
        required: false,
        default: null
    },
    winnerPrice: {
        type: String,
        required: false,
        default: null
    },
    bidrate: {
        type: Number,
        required: false,
        default: 1
    },
    bids: [bidSchema]
});


const User = mongoose.model("User", userSchema);
const AuctionItem = mongoose.model("AuctionItem", auctionItemSchema);
/* To get the Mongo file collections in any file */
module.exports = {
    User,
    AuctionItem
};