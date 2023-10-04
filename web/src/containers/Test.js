import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { random_country_cords } from "../utils/country-bounding-data";

const Test = () => {
    const countries = [
        // {
        //     "name": "United States of America",
        //     "count": 5755
        // },
    ]

    const fetchCords = () => {
        axios({
            url: "http://de1.api.radio-browser.info/json/stations/topvote",
            method: "POST",
            data: {
                order: "name",
                hidebroken: true,
                // limit: 500
            }
        })
            .then(async res => {
                console.log("res", res.data);
                console.log("count", res.data.length);
            })
            .catch(error => {
                console.error("Error fetching station data:", error);
            });
    }


    return (
        <div>
            <button onClick={() => fetchCords(0)}>Click</button>
        </div >
    )
}

export default Test;