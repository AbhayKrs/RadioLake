import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import videojs from "video.js";
import "video.js/dist/video-js.css";

const Video = (props) => {
    const videoNode = useRef(null);
    const [player, setPlayer] = useState(null);
    useEffect(() => {
        if (videoNode.current) {
            const _player = videojs(videoNode.current, props);
            setPlayer(_player);
            return () => {
                if (player !== null) {
                    player.dispose();
                }
            };
        }
    }, []);

    return (
        <div data-vjs-player>
            <video ref={videoNode} className="video-js"></video>
        </div>
    );
};

const Test = () => {
    const [play, setPlay] = useState({});
    const [active, setActive] = useState(false);

    useEffect(() => {
        axios.get('https://nl1.api.radio-browser.info/json/stations/byuuid/7e244084-c8fb-11e8-a54a-52543be04c81')
            .then(res => {
                const data = res.data[0];
                setActive(true);
                setPlay({
                    fill: true,
                    fluid: true,
                    autoplay: true,
                    controls: true,
                    preload: 'metadata',
                    sources: [
                        {
                            src: data.url,
                            type: "application/x-mpegURL"
                        }
                    ]
                })
                console.log(res.data[0])
            })
            .catch(err => console.log(err))
    }, [])

    // const play = {
    //     fill: true,
    //     fluid: true,
    //     autoplay: true,
    //     controls: true,
    //     preload: "metadata",
    //     sources: [
    //         {
    //             src: "http://nhkworld.webcdn.stream.ne.jp/www11/radiojapan/all/263949/live_s.m3u8",
    //             type: "application/x-mpegURL"
    //         }
    //     ]
    // };

    return (
        <div>
            {active && <Video {...play} />}
        </div >
    )
}

export default Test;