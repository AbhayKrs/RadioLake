import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { country_cords } from '../utils/country-bounding-data';

import MainLoader from '../components/MainLoader';
import MapChart from "../components/MapChart";
import SidePanel from '../components/SidePanel';

import { BsInfoCircle } from "react-icons/bs";

const Home = () => {
    const audioRef = useRef();
    const [msg1_active, setMsg1Active] = useState(true);
    const [msg2_active, setMsg2Active] = useState(false);

    const [stations, setStations] = useState([]);
    const [viewedStations, setViewedStations] = useState();
    const [dataReady, setDataReady] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');

    const [playingStation, setPlayingStation] = useState({
        active: false,
        data: {}
    });
    const [playerPause, setPlayerPause] = useState(false);
    const [playerWaiting, setPlayerWaiting] = useState(false);
    const [sidePanelUpdate, setSidePanelUpdate] = useState(false);
    const [panelListView, setPanelListView] = useState(false);

    useEffect(() => {
        fetchStations();
    }, []);

    useEffect(() => {
        if (selectedCountry.length > 0) {
            setMsg1Active(false);
            const filteredList = stations.filter(item => item.countrycode === selectedCountry);
            setViewedStations(filteredList);
            setTimeout(() => {
                setMsg2Active(true);
                setPanelListView(true);
            }, 2000)
        } else {
            setMsg1Active(true);
            setMsg2Active(false);
        }
    }, [selectedCountry])

    const fetchStations = () => {
        axios({
            url: "https://de1.api.radio-browser.info/json/stations",
            method: "POST",
            data: {
                order: "votes",
                hidebroken: true,
                reverse: true
            }
        })
            .then(async res => {
                const data_urlfiltered = res.data.filter(itx => { return !itx.url.includes('m3u8') && !itx.url.includes('m3u') });
                const filtered_data = data_urlfiltered.filter(itx => { return itx.countrycode.length > 0 && itx.countrycode !== "UM" });
                const reduced_stationlist = filtered_data.map(item => {
                    return {
                        id: item.stationuuid,
                        name: item.name,
                        country: item.country,
                        countrycode: item.countrycode,
                        geo_lat: item.geo_lat,
                        geo_long: item.geo_long
                    }
                });

                let reduced_data = [];
                const formatted_data = reduced_stationlist.reduce((acc, obj) => {
                    const { country, ...rest } = obj;
                    if (acc[country] !== undefined) {
                        reduced_data = [...acc[country], rest]
                    } else {
                        reduced_data = [rest];
                    }
                    return { ...acc, [country]: reduced_data };
                }, {});
                Object.keys(formatted_data).forEach(key => {
                    formatted_data[key] = formatted_data[key].slice(0, 500);
                })
                console.log("formatted", formatted_data);

                let result = [];
                Object.keys(formatted_data).forEach((key) => {
                    const mapped_cords = country_cords.find(itx => itx.name === formatted_data[key][0].countrycode);
                    if (mapped_cords !== undefined) {
                        formatted_data[key].map((st, idx) => {
                            st.geo_lat = mapped_cords["list"][idx][1];
                            st.geo_long = mapped_cords["list"][idx][0];
                            result.push(st);
                        });
                    }
                })
                console.log("result", result);

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
            {msg1_active && <div className='absolute top-3 left-0 z-20 flex flex-row gap-2 items-center'>\
                <BsInfoCircle className="h-5 w-5 text-gray-200" />
                <p className='font-caviar text-lg text-gray-200'>Click on a country to view the stations and start playing.</p>
            </div>}
            {msg2_active && <div className='absolute top-3 left-0 z-20 flex flex-row gap-2 items-center'>
                <BsInfoCircle className="h-5 w-5 text-gray-200" />
                <p className='font-caviar text-lg text-gray-200'>Drag towards a station or use the panel to browse through stations.</p>
            </div>}
            {panelListView && <SidePanel audioRef={audioRef} stations={stations} playingStation={playingStation} setPlayingStation={setPlayingStation} playerWaiting={playerWaiting} playerPause={playerPause} setPlayerPause={setPlayerPause} viewedStations={viewedStations} setViewedStations={setViewedStations} selectedCountry={selectedCountry} sidePanelUpdate={sidePanelUpdate} setSidePanelUpdate={setSidePanelUpdate} panelListView={panelListView} />}
            <MapChart audioRef={audioRef} stations={stations} dataReady={dataReady} playingStation={playingStation} setPlayingStation={setPlayingStation} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} playerWaiting={playerWaiting} setPlayerWaiting={setPlayerWaiting} playerPause={playerPause} setPlayerPause={setPlayerPause} sidePanelUpdate={sidePanelUpdate} setSidePanelUpdate={setSidePanelUpdate} setPanelListView={setPanelListView} />
        </div >
    )
}

export default Home;