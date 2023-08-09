import React, { useState } from "react";
import logo from '../Images/Untitled-1.png';
import axios from 'axios';
import { useNavigate, NavLink } from "react-router-dom";
function Register() {

    const history = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [address, setAddress] = useState('');
    const [dob, setDob] = useState('');
    const [phone, setPhone] = useState('');
    //const bcrypt = require('bcrypt');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(name);
        console.log(email);
        console.log(pass);
        console.log(address);
        console.log(dob);
        console.log(phone);

        try{
            //const hashedPassword = await bcrypt.hash(pass, 10);
            await axios.post("http://localhost:8000/Register",{
                name,email,pass,address,dob,phone
            })
            .then(res=>{
                if(res.data[0]=="exist"){
                    alert("User already exists with this email please use another Email address or Sign In");
                }else if(res.data[0]=="notexist"){
                    const nextSpaceIndex = res.data[1].name.indexOf(' ');
                    if (nextSpaceIndex !== -1) {
                        history("/Guest",{state:{id:email,id2:res.data[1].name.substring(0, nextSpaceIndex),id3:res.data[1]}})
                    }else{
                        history("/Guest",{state:{id:email,id2:res.data[1].name,id3:res.data[1]}})
                    }
                }
            })
            .catch(e=>{
                alert("Wrong Details!");
                console.log(e);
            })
        }catch(e){
            console.log(e);
        }
    }

    return  (
        <div>
        <div className="img-top"><img src={logo} className="img-sz" alt="Logo"></img></div>
        <div className="auth-form-container">
            <form className="register-form" onSubmit={handleSubmit} action="POST">
                <label htmlFor="name">Full Name</label> 
                <input value={name} onChange={(e) => setName(e.target.value)} type='name' placeholder="Full Name" id="name" name="name" />
                <label htmlFor="email">Email</label> 
                <input value={email} onChange={(e) => setEmail(e.target.value)} type='email' placeholder="Email" id="email" name="email" />
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type='password' placeholder="****************" id="password" name="password" />
                <label htmlFor="address">Address</label> 
                <input value={address} onChange={(e) => setAddress(e.target.value)} type='text' placeholder="Complete address with postcode" id="address" name="address" />
                <label htmlFor="dob">Date of Birth</label>
                <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" id="dob" name="dob" />
                <label htmlFor="phone">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" id="phone" name="phone" pattern="+[0-9]{2}-[0-9]{10}" placeholder="Enter in +44 xxxxxxxxxx format"></input>
                <button className="Register" type="Submit">Register</button>
            </form>

            {/* For adding a space after the Form */}
            <spacer type="vertical" width="100" height="100">&nbsp;&nbsp;</spacer> 

            {/* Login page button on Register Page */}
            <NavLink to='/'><button className="link-btn">Already have an Account? Login Here!</button></NavLink>

            {/* Guest page button on Register Page */}
            {/* <NavLink to='/'><button className="link-btn">Enter as Guest User</button></NavLink> */}
        </div>
        </div>
    )
}

export default Register