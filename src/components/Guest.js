import React, { useState , useEffect } from "react";
import logo from '../Images/Untitled-1.png';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Home from "./Menu/Home"
import Bid from "./Menu/Bid"
import Sell from "./Menu/Sell"
import About from "./Menu/About"
import Navbar from "./Menu/Navbar"


export const Guest = () => { 

    const location =useLocation()
    /*console.log(location)*/

    const [currentForm, setCurrentForm] = useState('Home')
    const toggleForm = (formName) => {
        setCurrentForm(formName);
    }


    return(
        <div>
            <div className="img-top"><img src={logo} className="img-sz" alt="Logo"></img></div>
            <div className="Top"><h3>Hey {location.state.id2}! Woof! Woof! Great to see you back! <NavLink to='/'><button className="Logout">Log Out</button></NavLink></h3>
            </div>
            {/*console.log(location.state.id3)*/}
            <div className="nav-style">
            <Navbar onFormSwitch = {toggleForm} />
            </div>
            <div>
            {
                currentForm === "Home" ? <Home /> : currentForm === "About" ? <About /> : ''
            }
            </div>
            <div>
            {
                currentForm === "Bid" ? <Bid /> : currentForm === "Sell" ? <Sell /> : ''
            }
            </div>
        </div>
    )
}

export default Guest