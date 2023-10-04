import { useState, useEffect } from 'react';
import axios from 'axios';

import SiteLogo from '../assets/images/logo192.png';

/*Imports*/
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import { ReactComponent as StationFinder } from '../assets/icons/station-finder.svg';
import { ReactComponent as StationFound } from '../assets/icons/station-found.svg';
import { ReactComponent as StationAudioWaiting } from '../assets/icons/station-audio-waiting.svg';

import MainLoader from '../components/MainLoader';
import Video from '../components/Video';

import { country_codes, country_cords, random_country_cords } from '../utils/country-bounding-data';

import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { IoStop } from 'react-icons/io5';


const Home = () => {
    const [findingStation, setFindingStation] = useState(false);
    const [stations, setStations] = useState([]);
    const [mapReady, setMapReady] = useState(false);

    const [volume, setVolume] = useState(1);
    const [playerWaiting, setPlayerWaiting] = useState(false);

    const [playingStation, setPlayingStation] = useState({
        active: false,
        data: {}
    });

    useEffect(() => {
        axios({
            url: "https://de1.api.radio-browser.info/json/stations",
            method: "POST",
            data: {
                order: "votes",
                hidebroken: true,
                limit: 20000
            }
        })
            .then(async res => {
                const data_urlfiltered = res.data.filter(itx => { return !itx.url.includes('m3u8') && !itx.url.includes('m3u') });
                const filtered_data = data_urlfiltered.filter(itx => itx.country !== "" || itx.countrycode !== "UM");
                // const my_data = filtered_data.map((itx, idx) => idx < 50);
                const reduced_stationlist = filtered_data.map(item => {
                    return {
                        country: item.country,
                        countrycode: item.countrycode,
                        geo_lat: item.geo_lat,
                        geo_long: item.geo_long,
                        // homepage: item.homepage,
                        // language: item.language,
                        // languagecodes: item.languagecodes,
                        // name: item.name,
                        // serveruuid: item.serveruuid,
                        stationuuid: item.stationuuid,
                        // url: item.url
                    }
                });
                console.log('station count', reduced_stationlist.length)

                let data = [];
                const formatted_data = filtered_data.reduce((acc, obj) => {
                    const { country, ...rest } = obj;
                    if (acc[country] !== undefined) {
                        data = [...acc[country], rest]
                    } else {
                        data = [rest];
                    }
                    return { ...acc, [country]: data };
                }, {});
                optimizeData(formatted_data);
            })
            .catch(error => {
                console.error("Error fetching station data:", error);
            });
    }, []);

    const optimizeData = (data) => {
        console.log("DATA:::", data);
        console.log('COUNTRY count::', Object.keys(data).length);
        let result = [];

        // Object.keys(data).forEach((key, index) => {
        //     const exact_country = countryCodes.find(itx => itx.code === data[key][0].countrycode)
        //     if (exact_country === undefined) {
        //         // console.log('key', key, data[key][0]);
        //     } else {
        //         result.push({
        //             name: exact_country["name"],
        //             count: data[key].length + 50
        //         });
        //     }
        // });
        // console.log("FINAL Data:::", result);

        Object.keys(data).forEach((key, index) => {
            const mapped_cords = country_cords.find(itx => itx.name === data[key][0].countrycode);
            if (mapped_cords !== undefined) {
                data[key].map((st, idx) => {
                    st.geo_lat = mapped_cords["list"][idx][1];
                    st.geo_long = mapped_cords["list"][idx][0];
                    result.push(st);
                });
            }
        })
        console.log("test", result);
        setStations(result);

        // Object.keys(data).forEach(async (key, index) => {
        //     const stationsCount = data[key].length;
        //     const exact_country = countryCodes.find(itx => itx.code === data[key][0].countrycode)
        //     if (exact_country !== undefined) {
        //         promises.push(
        //             await axios({
        //                 url: `http://localhost:5000/api/v1/${exact_country.name}/${stationsCount}`,
        //                 method: 'GET'
        //             }).then(res => {
        //                 const ree = data[key].map((itx, idx) => {
        //                     itx.geo_lat = res.data[idx][1];
        //                     itx.geo_long = res.data[idx][0];
        //                     result.push(itx);
        //                     return itx;
        //                 })
        //                 console.log("test", ree);
        //             })
        //         )
        //     }
        // });

        // Promise.all(promises).then(() => { setStations(result); console.log("Result:::", result) });
    }

    const updateGeoCords = async (stations, coords) => {
        var updatedData;

        updatedData = stations.map((itx, idx) => {
            itx.geo_lat = coords[idx][1];
            itx.geo_long = coords[idx][0];
            return itx;
        });
        return updatedData;
    }

    let timeout;
    useEffect(() => {
        if (stations.length > 0) {
            const root = am5.Root.new("chartdiv");
            start(root);
            return () => root.dispose();
        }
    }, [stations])

    const exportChart = (root) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            root.events.off("frameended", exportChart);
            mapIsReady();
            console.log("Chart ready!");
        }, 100)
    }

    const mapIsReady = () => {
        setTimeout(() => {
            setMapReady(true);
        }, 2000)
    }

    //Create audio player container
    var audio_root = document.createElement("div");
    audio_root.setAttribute("id", "station_audio_root");

    // Manipulating with mouse code
    var isDown = false;
    var isMoving = false;
    var bulletClicked = false;

    const start = (root) => {
        // Set themes
        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        // Create map
        var map = root.container.children.push(am5map.MapChart.new(root, {
            panX: "rotateX",
            panY: "rotateY",
            projection: am5map.geoOrthographic()
        }));

        root.events.on("frameended", () => exportChart(root));
        map.virtualization = true;
        map.chartContainer.get("background").events.on("click", () => map.goHome());
        map.useWebWorkers = true;

        // Add zoom control
        var zoomControl = map.set("zoomControl", am5map.ZoomControl.new(root, {}));
        var homeButton = zoomControl.children.moveValue(am5.Button.new(root, {
            fill: am5.color('#172554'),
            paddingTop: 10,
            paddingBottom: 10,
            icon: am5.Graphics.new(root, {
                svgPath: "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8",
                fill: am5.color(0xffffff)
            })
        }), 0);
        homeButton.events.on("click", () => map.goHome());
        zoomControl.children.each((button) => {
            button.get("icon").setAll({
                fill: am5.color('#000'),
                stroke: am5.color('#000')
            });
            button.get("background").setAll({
                fill: am5.color('#fcd34d'),
                stroke: 0
            });
            button.get("background").states.create("hover", {}).setAll({
                fill: am5.color('#fff')
            });
            button.get("background").states.create("down", {}).setAll({
                fill: am5.color('#fff')
            });
        });

        // Series for Background Fill
        let backgroundSeries = map.series.push(am5map.MapPolygonSeries.new(root, {}));
        backgroundSeries.mapPolygons.template.setAll({
            fill: am5.color("#172554"),
            strokeOpacity: 0
        });
        backgroundSeries.data.push({
            geometry: am5map.getGeoRectangle(90, 180, -90, -180)
        });

        // Main polygon series for countries
        let polygonSeries = map.series.push(am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_worldLow
        }));
        polygonSeries.mapPolygons.template.setAll({
            fill: am5.color("#059669"),
            // strokeWidth: 0.5,
            stroke: root.interfaceColors.get("background"),
            // tooltipText: "{name}",
            toggleKey: "active",
            interactive: true
        });
        polygonSeries.calculateVisualCenter = true;

        // Create polygon series for projected circles
        let circleSeries = map.series.push(am5map.MapPolygonSeries.new(root, {}));
        circleSeries.mapPolygons.template.setAll({
            templateField: "polygonTemplate",
            tooltipText: "{name}:{value}"
        });

        // Create point series
        var pointSeries = map.series.push(am5map.MapPointSeries.new(root, {
            latitudeField: "geo_lat",
            longitudeField: "geo_long"
        }));
        pointSeries.bullets.push(function (event) {
            var circle = am5.Circle.new(root, {
                radius: 2,
                fill: am5.color("#e11d48"),
                tooltipText: "{name}",
                strokeWidth: 0.25,
                stroke: am5.color("#262626")
            });
            circle.interactionsEnabled = true;
            circle.events.on("click", function (ev) {
                console.log('Bullet clicked');
                bulletClicked = true;
                const point_target = ev.target.dataItem.dataContext;
                const latitude = point_target.geo_lat;
                const longitude = point_target.geo_long;
                console.log('tst', latitude, longitude)
                map.zoomToGeoPoint({ latitude, longitude }, 10, true);
                playStation(point_target);
                // circle.fill = am5.color("#fff");
            });
            return am5.Bullet.new(root, { sprite: circle });
        });


        map.events.on("pointerdown", function () {
            isDown = true;
        })
        map.events.on("globalpointermove", function (e) {
            // if pointer is down
            isMoving = false;
            if (isDown) {
                // get tooltip data item
                isMoving = true;
                setFindingStation(isDown);
            }
        })
        map.events.on("globalpointerup", function (ev) {
            if (bulletClicked === false) {
                isDown = false;
                isMoving = false;
                bulletClicked = false;
                setFindingStation(isDown);

                const val = document.getElementById("station-finder");
                const finder_bounds = val.getBoundingClientRect();
                const landed_cords = map.invert({ x: finder_bounds.x, y: finder_bounds.y });
                console.log('Location cords::', landed_cords);

                var closest = stations[0];
                var shortestDistance = findShortestDist(landed_cords, stations[0]);
                for (var i = 0; i < stations.length; i++) {
                    var d = findShortestDist(landed_cords, stations[i]);
                    if (d < shortestDistance) {
                        closest = stations[i];
                        shortestDistance = d;
                    }
                }
                console.log('test', closest);
                map.zoomToGeoPoint({ latitude: closest.geo_lat, longitude: closest.geo_long }, map._downZoomLevel + 0.000000001, true);
                playStation(closest);
            }
        });

        pointSeries.data.setAll(stations);

        // Make stuff animate on load
        map.appear(1000, 100);
    }

    const findShortestDist = (pt1, pt2) => {
        var diffX = pt1.latitude - pt2.geo_lat;
        var diffY = pt1.longitude - pt2.geo_long;
        return (diffX * diffX + diffY * diffY);
    }

    const playStation = (station) => {
        axios.get('https://nl1.api.radio-browser.info/json/stations/byuuid/' + station.stationuuid)
            .then(res => {
                setPlayerWaiting(true);
                const data = res.data[0];

                //Remove existing audio and add new audio to container
                if (audio_root.children.length > 0) {
                    audio_root.removeChild(audio_root.firstElementChild);
                }

                //Initialize audio player with station url
                var audio = document.createElement("audio");
                audio.src = data.url;
                audio.controls = true;
                audio.volume = 1;

                audio_root.appendChild(audio);
                audio.play().then(res => {
                    console.log("Audio res::", res);
                }).catch(err => {
                    console.log("Audio err::", err);
                });

                console.log("tst", audio_root)

                setPlayingStation({ active: true, data });

                audio.addEventListener('playing', () => {
                    console.log('Station is playing');
                    setPlayerWaiting(false);
                })
                audio.addEventListener('waiting', () => {
                    console.log('Station is waiting');
                });
                console.log("Station Player Data:: ", res.data[0])
            })
            .catch(err => console.log(err))
    }

    return (
        <div className='relative'>
            {!mapReady && <MainLoader />}
            <div id="chartdiv" className='w-full h-screen bg-neutral-800'></div>
            {playingStation.active ?
                <div className='absolute z-50 bottom-1 left-1 bg-amber-300 p-2 rounded-md'>
                    <p className='font-caviar font-bold text-gray-800 text-lg'>{playingStation.data.name}</p>
                    <div className='flex flex-row items-center gap-2'>
                        <MdSkipPrevious className='w-7 h-7 text-gray-800 cursor-pointer' />
                        {playerWaiting ?
                            <StationAudioWaiting fill="#000" stroke="#e11d48" className='w-8 h-8 text-gray-800 cursor-pointer' />
                            :
                            <IoStop className='w-6 h-6 text-gray-800 cursor-pointer' />
                        }
                        <MdSkipNext className='w-7 h-7 text-gray-800 cursor-pointer' />

                        {/* <input
                            type="range"
                            value={audio.volume * 100}
                            onChange={(event) => {
                                console.log('test', event.currentTarget.value / 100)
                                setVolume(event.currentTarget.value);
                                audio.volume = event.currentTarget.value / 100;
                            }}
                        /> */}

                    </div>
                </div>
                :
                <div className='absolute z-30 bottom-0 left-0 bg-neutral-800 p-2'>
                    <img src={SiteLogo} className='h-14 w-14' />
                </div>
            }
            {mapReady && <>
                {findingStation ?
                    <StationFinder id="station-finder" height={36} width={36} stroke="#fafafa" className="absolute z-20 inset-0 m-auto pointer-events-none select-none" />
                    :
                    <StationFound id="station-finder" stroke="#fafafa" className="absolute z-20 inset-0 m-auto pointer-events-none select-none" />
                }
            </>
            }
        </div >
    )
}

export default Home;