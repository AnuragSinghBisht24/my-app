import React, { useState } from 'react';
import './Navbar.css';

const Navbar = (props) => {
  const [activeTab, setActiveTab] = useState(1);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if(index==1){
        props.onFormSwitch("Home");
    }else if(index==2){
        props.onFormSwitch("Bid");
    }else if(index==3){
        props.onFormSwitch("Sell");
    }else if(index==4){
        props.onFormSwitch("About");
    }
  };

  return (
    <div className="navbar">
      <a
        className={`tab ${activeTab === 1 ? 'active' : ''}`}
        onClick={() => handleTabClick(1)}
      >
        Home Page
      </a>
      <a
        className={`tab ${activeTab === 2 ? 'active' : ''}`}
        onClick={() => handleTabClick(2)}
      >
        Bid for an Item
      </a>
      <a
        className={`tab ${activeTab === 3 ? 'active' : ''}`}
        onClick={() => handleTabClick(3)}
      >
        Sell an Item
      </a>
      <a
        className={`tab ${activeTab === 4 ? 'active' : ''}`}
        onClick={() => handleTabClick(4)}
      >
        About Us
      </a>
    </div>
  );
};

export default Navbar;
