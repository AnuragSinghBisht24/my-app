import React from 'react';
import './About.css';
import picture from '../../Images/Anurag.jpg';
import picture2 from '../../Images/chabuddy.jpg';
import picture3 from '../../Images/Alfred.png';

export const About = (props) => { 
    
    return(
        <div>
            <div className="about-us-container">
            <div className="header">
                <h1 className='h1'>About Us</h1>
            </div>
            <div className="main-content">
                <div className="section">
                    <h2 className='h2'>YOUR ITEMS! YOUR PROFITS!</h2>
                    <div className='text-bubble'><p className='pl'>
                    Welcome to Alfred's Auctionhouse, the ultimate destination for buying and selling anything through various types of auctions. Our platform offers a seamless and user-friendly experience, allowing individuals and businesses to connect and transact with ease.
                    </p></div>
                    <div className='text-bubble'><p className='pl'>
                    At Alfred's Auctionhouse, we believe in the power of auctions to bring people together and create excitement. Our platform embraces the diversity of items that can be sold, ranging from unique antiques and collectibles to modern electronics and fashion trends. Whether you have a rare vintage item or the latest tech gadget, our auction platform provides the perfect marketplace to showcase and sell your products.
                    </p></div>
                    <div className='text-bubble'><p className='pl'>
                    Our beloved mascot, Alfred, an Irish Wolfhound dog, embodies the spirit of our business. Just like Alfred, we are loyal and dedicated to ensuring the success of our users. We strive to create an inclusive and welcoming environment where everyone can participate and find the items they desire.
                    </p></div>
                    <div className='text-bubble'><p className='pl'>
                    With Alfred's Auctionhouse, you have full control over your auction experience. List your items, set your desired auction parameters, and watch as potential buyers engage and compete for your products. Our platform is designed to maximize your profits, ensuring that your items receive the attention they deserve.
                    </p></div>
                    <div className='text-bubble'><p className='pl'>
                    Our slogan, "Your Items Your Profits," encapsulates our commitment to empowering sellers and helping them achieve their financial goals. We understand that every item has its unique value, and we are here to ensure that you receive the best returns for your offerings.
                    </p></div>
                    <div className='text-bubble'><p className='pl'>
                    Join Alfred's Auctionhouse today and experience the thrill of buying and selling through our dynamic auction platform. Whether you're a seasoned auction enthusiast or new to the world of online auctions, our user-friendly interface and dedicated support team will guide you every step of the way.
                    </p></div>
                    <div className='text-bubble'><p className='pl'>
                    Unlock the potential of your items and embark on a successful auction journey with Alfred's Auctionhouse. Start selling and let us help you turn your items into profits!
                    </p></div>
                </div>
                <div className="section">
                    <h2 className='h2'>Our Team</h2>
                    <div className="team-member">
                        <img src={picture} alt="Anurag Singh Bisht" />
                        <h3 className='h3'>Anurag Singh Bisht</h3>
                        <p className='p'>Founder</p>
                    </div>
                    <div className="team-member">
                        <img src={picture2} alt="Chabuddy G" />
                        <h3 className='h3'>Chabuddy G</h3>
                        <p className='p'>Co-Founder</p>
                    </div>
                    <div className="team-member">
                        <img src={picture3} alt="Chabuddy G" />
                        <h3 className='h3'>Alfred the Wolfhound</h3>
                        <p className='p'>Mascot</p>
                    </div>
                </div>
            </div>
            <div className="footer">
                <p className='p'>&copy; 2023 Alfred's Auctionhouse. All rights reserved.</p>
            </div>
            </div>
        </div>
    )
}
export default About;