import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from 'axios';

import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldHigh from "@amcharts/amcharts5-geodata/worldHigh";
import countries2 from "@amcharts/amcharts5-geodata/data/countries2";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import { ReactComponent as MapHome } from "../assets/icons/map-home.svg";
import { ReactComponent as StationFinder } from '../assets/icons/station-finder.svg';
import { ReactComponent as StationFound } from '../assets/icons/station-found.svg';
import { MdAdd } from 'react-icons/md';
import { HiOutlineMinus } from 'react-icons/hi';

const MapChart = (props) => {
    const mapRef = useRef(null);
    const { audioRef, stations, dataReady, playingStation, setPlayingStation, selectedCountry, setSelectedCountry, setPlayerWaiting, playerPause, sidePanelUpdate, setSidePanelUpdate, setPanelListView } = props;
    const [findingStation, setFindingStation] = useState(false);

    let selected_countrycode = '';

    useLayoutEffect(() => {
        if (dataReady) {
            const root = am5.Root.new("chartdiv");
            root.setThemes([am5themes_Animated.new(root)]);
            let map = root.container.children.push(am5map.MapChart.new(root, {
                panX: "rotateX",
                panY: "rotateY",
                projection: am5map.geoOrthographic()
            }));

            // Enable panning and zooming
            map.seriesContainer.draggable = true;
            map.seriesContainer.resizable = true;

            map.virtualization = true;
            map.useWebWorkers = true;

            let startPanning = false;
            let isPanning = false;
            let country_bound_stations = [];

            // Series for Map background fill
            let backgroundSeries = map.series.push(am5map.MapPolygonSeries.new(root, {}));
            backgroundSeries.mapPolygons.template.setAll({
                fill: am5.color("#172554"),
                strokeOpacity: 0
            });
            backgroundSeries.data.push({
                geometry: am5map.getGeoRectangle(90, 180, -90, -180)
            });

            // Add country polygons on map
            let polygonSeries = map.series.push(am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geodata_worldHigh
            }));
            polygonSeries.mapPolygons.template.setAll({
                fill: am5.color("#059669"),
                stroke: root.interfaceColors.get("background"),
                tooltipText: "{name}",
                toggleKey: "active",
                interactive: true
            });
            polygonSeries.mapPolygons.template.states.create("hover", {
                fill: am5.color("#047857")
            });
            polygonSeries.mapPolygons.template.on("active", (active, target) => {
                handleSelectCountry(target.dataItem.get("id"));
            });

            // Series for Country specific polygon
            let countrySeries = map.series.push(am5map.MapPolygonSeries.new(root, {
                visible: false
            }));
            countrySeries.mapPolygons.template.setAll({
                // tooltipText: "{name}",
                interactive: true,
                fill: am5.color(0xaaaaaa)
            });

            //Point series to mark stations on map
            var pointSeries = map.series.push(am5map.MapPointSeries.new(root, {
                latitudeField: "geo_lat",
                longitudeField: "geo_long"
            }));

            //Station close proximity play logic
            map.events.on("pointerdown", (ev) => {
                startPanning = true;
                isPanning = false;
                country_bound_stations = [];
            })
            map.events.on("globalpointermove", (ev) => {
                if (startPanning && selected_countrycode.length > 0) {
                    findingStation === false && setFindingStation(true);
                    isPanning = true;
                    country_bound_stations = stations.filter(itx => itx.countrycode === selected_countrycode);
                }
            })
            map.events.on("globalpointerup", (ev) => {
                if (isPanning) {
                    startPanning = false;
                    isPanning = false;
                    setFindingStation(false);
                    if (selected_countrycode.length > 0 && country_bound_stations.length > 0 && pointSeries.bulletsContainer.children.length > 0) {
                        const val = document.getElementById("station-finder");
                        const finder_bounds = val.getBoundingClientRect();

                        const landed_cords = map.invert({ x: finder_bounds.x, y: finder_bounds.y });
                        console.log('Location cords::', country_bound_stations);

                        var closest = country_bound_stations[0];
                        console.log('Closest::', landed_cords, closest);

                        if (closest !== undefined) {
                            var shortestDistance = findShortestDist(landed_cords, country_bound_stations[0]);
                            for (var i = 0; i < country_bound_stations.length; i++) {
                                var d = findShortestDist(landed_cords, country_bound_stations[i]);
                                if (d < shortestDistance) {
                                    closest = country_bound_stations[i];
                                    shortestDistance = d;
                                }
                            }
                            map.zoomToGeoPoint({ latitude: closest.geo_lat, longitude: closest.geo_long }, map._downZoomLevel + 0.000000001, true);

                            pointSeries.bulletsContainer.children.each((bullet) => { bullet.set("fill", am5.color("#e11d48")) });

                            var dataItem = pointSeries.getDataItemById(closest.id);
                            if (dataItem && dataItem.bullets) {
                                var sprite = dataItem.bullets[0].get("sprite");
                                sprite.set("fill", am5.color("#fcd34d"));
                                playStation(closest);
                            }
                        }
                    }
                } else {
                    startPanning = false;
                    setFindingStation(false);
                }
            });

            // ########################################
            // ############## FUNCTIONS ###############
            // ########################################
            const handleSelectCountry = (id) => {
                var dataItem = polygonSeries.getDataItemById(id);
                var target = dataItem.get("mapPolygon");

                selected_countrycode = id;
                setSelectedCountry(id);

                const selectedCountryMap = countries2[id].maps.find(itx => { return itx.toLowerCase().includes('high') });

                if (target) {
                    var centroid = target.geoCentroid();
                    if (centroid) {
                        map.animate({ key: "rotationX", to: -centroid.longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
                        map.animate({ key: "rotationY", to: -centroid.latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
                    }

                    setTimeout(() => {
                        // let zoomAnimation = polygonSeries.zoomToDataItem(dataItem);
                        const mapLoad = new Promise((resolve, reject) => {
                            resolve(am5.net.load("https://cdn.amcharts.com/lib/5/geodata/json/" + selectedCountryMap + ".json", map));
                        });

                        mapLoad.then((results) => {
                            let geodata = am5.JSONParser.parse(results.response);
                            countrySeries.setAll({
                                geoJSON: geodata,
                                fill: am5.color("#059669")
                            });

                            map.zoomToGeoPoint({ latitude: centroid.latitude, longitude: centroid.longitude }, 2.5, true);
                            backgroundSeries.hide(100);
                            polygonSeries.hide(100);
                            countrySeries.show();

                            var countryData = stations.filter(itx => itx.countrycode === id);
                            if (countryData.length > 500) {
                                countryData = countryData.slice(0, 500);
                            }
                            pushBulletPoints(root, map, pointSeries, countryData);
                        });
                    }, 2000)
                }
            }

            const pushBulletPoints = (root, map, pointSeries, data) => {
                // Create point series
                pointSeries.bullets.push((event) => {
                    var circle = am5.Circle.new(root, {
                        radius: 3,
                        fill: am5.color("#e11d48"),
                        tooltipText: "{name}",
                    });
                    circle.interactionsEnabled = true;
                    circle.events.on("click", (ev) => {
                        console.log('Bullet clicked', ev);
                        const point_target = ev.target.dataItem.dataContext;
                        const latitude = point_target.geo_lat;
                        const longitude = point_target.geo_long;
                        map.zoomToGeoPoint({ latitude, longitude }, 10, true);
                        playStation(point_target);
                    });
                    return am5.Bullet.new(root, { sprite: circle });
                });
                pointSeries.data.setAll(data);
                pointSeries.id = "bullets"
            }

            const findShortestDist = (pt1, pt2) => {
                var diffX = Math.abs(pt1.latitude) - Math.abs(pt2.geo_lat);
                var diffY = Math.abs(pt1.longitude) - Math.abs(pt2.geo_long);
                return (diffX * diffX + diffY * diffY);
            }


            // Make stuff animate on load
            map.appear(1000, 100);
            mapRef.current = map;

            return () => root.dispose();
        }
    }, [dataReady]);

    useEffect(() => {
        if (mapRef.current && sidePanelUpdate) {
            setSidePanelUpdate(false);
            mapRef.current.zoomToGeoPoint({ latitude: playingStation.data.geo_lat, longitude: playingStation.data.geo_long }, 8, true);
            mapRef.current.series.getIndex(3).bulletsContainer.children.each((bullet) => { bullet.set("fill", am5.color("#e11d48")) });
            var dataItem = mapRef.current.series.getIndex(3).getDataItemById(playingStation.data.id);
            if (dataItem) {
                var sprite = dataItem.bullets[0].get("sprite");
                sprite.set("fill", am5.color("#fcd34d"));
            }
            playStation(playingStation.data);
        }
    }, [playingStation, sidePanelUpdate]);

    useEffect(() => {
        if (playerPause) {
            const audio_container = document.getElementById("audio_root");
            audio_container.children[0].pause();
        } else {
            const audio_container = document.getElementById("audio_root");
            if (audio_container.children && audio_container.children[0]) {
                audio_container.children[0].play();
            }
        }
    }, [playerPause])

    const playStation = (station) => {
        console.log("station", station);
        axios.get('https://nl1.api.radio-browser.info/json/stations/byuuid/' + station.id)
            .then(res => {
                setPlayerWaiting(true);
                const data = res.data[0];

                //Remove existing audio and add new audio to container
                const audio_container = document.getElementById("audio_root");
                if (audio_container.children.length > 0) {
                    audio_container.removeChild(audio_container.firstElementChild);
                }

                //Initialize audio player with station url
                var audio = document.createElement("audio");
                audioRef.current = audio;
                audio.src = data.url;
                audio.controls = true;
                audio.volume = 1;
                audio_container.appendChild(audio);

                audio.play().then(res => {
                    console.log("Audio res::", res);
                }).catch(err => {
                    console.log("Audio err::", err);
                });

                setPlayingStation({ active: true, data });
                audio.addEventListener('playing', () => {
                    console.log('Station is playing');
                    setPlayerWaiting(false);
                })
                audio.addEventListener('waiting', () => {
                    console.log('Station is waiting');
                });
            })
            .catch(err => console.log(err))
    }

    const mapToHome = () => {
        if (mapRef.current) {
            var dataItem = mapRef.current.series.getIndex(1).getDataItemById(selectedCountry);
            var target = dataItem.get("mapPolygon");
            if (target) {
                var centroid = target.geoCentroid();
                mapRef.current.zoomToGeoPoint({ latitude: centroid.latitude, longitude: centroid.longitude }, -1, true);
            }
            mapRef.current.series.getIndex(1).show();
            mapRef.current.series.getIndex(0).show();
            mapRef.current.series.getIndex(2).hide(100);

            selected_countrycode = '';
            setSelectedCountry('');
            mapRef.current.series.getIndex(3).bulletsContainer.children.clear();
            mapRef.current.series.getIndex(3).bullets.clear();
        }
    }

    return (
        <div>
            <div id="chartdiv" className='w-full h-screen bg-neutral-800' />
            {dataReady && <>
                {findingStation ?
                    <StationFinder id="station-finder" height={36} width={36} stroke="#fafafa" className="absolute z-20 inset-0 m-auto pointer-events-none select-none" />
                    :
                    <StationFound id="station-finder" stroke="#fafafa" className="absolute z-20 inset-0 m-auto pointer-events-none select-none" />
                }
            </>}
            <div className="flex flex-col items-center absolute z-20 right-2 bottom-2 rounded-md">
                {selectedCountry.length > 0 && <MapHome id="map_home" onClick={() => mapToHome()} className="h-10 w-10 mb-2 cursor-pointer" />}
                <button onClick={() => mapRef.current.zoomIn()} className="p-2 bg-neutral-700 text-gray-200 hover:bg-amber-300 hover:text-gray-800 rounded-t-md"><MdAdd className="h-6 w-6" /></button>
                <button onClick={() => mapRef.current.zoomOut()} className="p-2 bg-neutral-700 text-gray-200 hover:bg-amber-300 hover:text-gray-800 rounded-b-md"><HiOutlineMinus className="h-6 w-6" /></button>
            </div>
            <div id="audio_root" className="hidden" />
        </div >
    )
}

export default MapChart;