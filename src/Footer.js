import React from 'react';
import "./Footer.css";
import facebook from './Images/facebook.png';
import twitter from './Images/twitter.png';
import instagram from './Images/instagram.png';

function Footer() {
    return (
      <div className='footer-out'>
        <div className='footer-first'>
          <h2>Contact Information</h2>
          <p><strong>Phone :</strong> +44 7341193866</p>
          <p><strong>Email :</strong> anurag.singh.bisht.1998@gmail.com</p>
          <p><strong>Address :</strong> Flat C2 Leazes Parade Newcastle Upon Tyne NE2 4LB</p>
        </div>
  
        <div className='footer-second'>
          <h2>Follow Us</h2>
          <p>Connect with us on social media</p>
          <div>
            <a href='facebook.com/example'><img src={facebook} className="image-css" alt='Facebook link'></img></a>
            <a href='twitter.com/example'><img src={twitter} className="image-css" alt='Twitter link'></img></a>
            <a href='instagram.com/example'><img src={instagram} className="image-css" alt='Instagram link'></img></a>
          </div>
        </div>
  
        <div className='footer-third'>
          <h2>Quick Links</h2>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/faq">FAQs</a>
            </li>
            <li>
              <a href="/terms">Terms and Conditions</a>
            </li>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
          </ul>
        </div>
      </div>
    );
}

export default Footer;