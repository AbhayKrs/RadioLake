import { useEffect, useState } from 'react';
import axios from 'axios';

import MainLoader from '../components/MainLoader';
import MapChart from "../components/MapChart";
import { country_cords } from '../utils/country-bounding-data';
import SidePanel from '../components/SidePanel';

const Home = () => {

    const [stations, setStations] = useState([]);
    const [viewedStations, setViewedStations] = useState();
    const [dataReady, setDataReady] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');

    const [playingStation, setPlayingStation] = useState({
        active: false,
        data: {}
    });
    const [playerWaiting, setPlayerWaiting] = useState(false);

    useEffect(() => {
        fetchStations();
    }, []);

    useEffect(() => {
        if (selectedCountry.length > 0) {
            const filteredList = stations.filter(item => item.countrycode === selectedCountry);
            setViewedStations(filteredList);
        }
    }, [selectedCountry])

    const fetchStations = () => {
        axios({
            url: "https://de1.api.radio-browser.info/json/stations",
            method: "POST",
            data: {
                order: "votes",
                hidebroken: true,
                // limit: 500
            }
        })
            .then(async res => {
                const data_urlfiltered = res.data.filter(itx => { return !itx.url.includes('m3u8') && !itx.url.includes('m3u') });
                const filtered_data = data_urlfiltered.filter(itx => itx.country !== "" || itx.countrycode !== "UM");
                const reduced_stationlist = filtered_data.map(item => {
                    return {
                        id: item.stationuuid,
                        name: item.name,
                        country: item.country,
                        countrycode: item.countrycode,
                        geo_lat: item.geo_lat,
                        geo_long: item.geo_long,
                    }
                });

                let data = [];
                const formatted_data = reduced_stationlist.reduce((acc, obj) => {
                    const { country, ...rest } = obj;
                    if (acc[country] !== undefined) {
                        data = [...acc[country], rest]
                    } else {
                        data = [rest];
                    }
                    return { ...acc, [country]: data };
                }, {});

                let result = [];

                Object.keys(formatted_data).forEach((key, index) => {
                    const mapped_cords = country_cords.find(itx => itx.name === formatted_data[key][0].countrycode);
                    if (mapped_cords !== undefined) {
                        formatted_data[key].map((st, idx) => {
                            st.geo_lat = mapped_cords["list"][idx][1];
                            st.geo_long = mapped_cords["list"][idx][0];
                            result.push(st);
                        });
                    }
                })
                console.log("test", result);
                setStations(result);
                setDataReady(true);
            })
            .catch(error => {
                console.error("Error fetching station data:", error);
            });
    }

    return (
        <div className='relative'>
            {!dataReady && <MainLoader />}
            {playingStation.active && <SidePanel playingStation={playingStation} playerWaiting={playerWaiting} viewedStations={viewedStations} />}
            <MapChart stations={stations} dataReady={dataReady} playingStation={playingStation} setPlayingStation={setPlayingStation} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} playerWaiting={playerWaiting} setPlayerWaiting={setPlayerWaiting} />
        </div >
    )
}

export default Home;