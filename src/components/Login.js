import React, { useState } from "react";
import logo from '../Images/Untitled-1.png';
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

function Login() {
    
    const history = useNavigate();

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(email);
        console.log(pass);

        try{
            await axios.post("http://localhost:8000/",{
                email,pass
            })
            .then(res=>{
                
                if(res.data[0]=="exist"){
                    console.log("INSIDE EMAIL MATCHED")
                    const nextSpaceIndex = res.data[1].name.indexOf(' ');
                    if (nextSpaceIndex !== -1) {
                        history("/Guest",{state:{id:email,id2:res.data[1].name.substring(0, nextSpaceIndex),id3:res.data[1]}})
                    }else{
                        history("/Guest",{state:{id:email,id2:res.data[1].name,id3:res.data[1]}})
                    }
                }
                else if(res.data[0]=="notexist"){
                    alert("User doesn't exist or Password Error. Please Register yourself or enter a valid Email address and Password pair.");
                }
            })
            .catch(e=>{
                alert("Wrong Details!");
                console.log(e);
            })
        }
        catch(e){
            console.log(e);
        }
    }

    return (
        <div className="outer-margin">
        <div className="img-top"><img src={logo} className="img-sz" alt="Logo"></img></div>
        <div className="auth-form-container">
            <form className="login-form" onSubmit={handleSubmit} action="POST">
                <label htmlFor="email">Email</label>
                <input value={email} onSelect={(e) => setEmail(e.target.value)} onChange={(e) => setEmail(e.target.value)} type='email' placeholder="youremail@xyz.com" id="email" name="email" />
                <label htmlFor="password">Password</label>
                <input value={pass} onSelect={(e) => setPass(e.target.value)} onChange={(e) => setPass(e.target.value)} type='password' placeholder="****************" id="password" name="password" />
                <button className="Login" type="Submit">Log In</button>
            </form>
            {/* For adding a space after the Form */} 
            <spacer type="vertical" width="100" height="100">&nbsp;&nbsp;</spacer> 

            {/* For Register page button on Login Page */}
            <NavLink to='/Register'><button className="link-btn">Don't have an Account? Register Now!</button></NavLink>

            {/* For Guest page button on Login Page */}
            {/* <NavLink to='/'><button className="link-btn">Enter as Guest User</button></NavLink> */}
        </div>
        </div> 
    )
}

export default Login