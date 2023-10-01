import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import videojs from "video.js";
import "video.js/dist/video-js.css";

const Test = () => {

    const setup_shape = (key) => {

    }
    const get_shape = (country) => {
        //Returns the shape as a "Polygon" for the specific country
        return setup_shape(country);
    }

    return (
        <div>
        </div >
    )
}

export default Test;