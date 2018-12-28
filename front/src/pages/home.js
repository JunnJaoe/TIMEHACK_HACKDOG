import React from "react";
import "../component/css/home.css";
import Navigation from '../component/navigation';

const Home = () => {
    return(
        <div className="Home">
            <Navigation/>
            <div className="lander">
                <h1>Home</h1>
            </div>
      </div>
    )
}

export default Home;