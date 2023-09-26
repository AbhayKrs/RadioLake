import { useState, useEffect, useRef } from 'react';

/* Imports */
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import axios from 'axios';

import { ReactComponent as StationFinder } from '../assets/icons/station-finder.svg';
import { ReactComponent as StationFound } from '../assets/icons/station-found.svg';

const Home = () => {
    const [stations, setStations] = useState([]);

    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);

    useEffect(() => {
        axios({
            url: "https://de1.api.radio-browser.info/json/stations/search",
            method: "POST",
            data: {
                order: "name",
                bitrateMin: 0,
                bitrateMax: "",
                hidebroken: true,
                name: "japan"
            }
        }).then(res => {
            const station_data = res.data;
            var new_data = [];
            station_data.map(item => {
                if (item.geo_lat !== null || item.geo_long !== null) {
                    new_data.push({
                        long: item.geo_long,
                        lat: item.geo_lat,
                        stationuuid: item.stationuuid,
                        url: item.url,
                        name: item.name
                    })
                }
            })
            console.log('Search', new_data);
            setStations(new_data);
        });
    }, [])

    useEffect(() => {
        if (stations.length > 0) {
            const root = am5.Root.new("chartdiv");
            start(root);
            return () => root.dispose();
        }
    }, [stations])

    const start = (root) => {
        // Set themes
        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        // Create chart
        var chart = root.container.children.push(am5map.MapChart.new(root, {
            panX: "rotateX",
            panY: "rotateY",
            projection: am5map.geoOrthographic()
        }));

        // Series for background fill
        let backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
        backgroundSeries.mapPolygons.template.setAll({
            fill: am5.color("#172554"),
            strokeOpacity: 0
        });

        backgroundSeries.data.push({
            geometry: am5map.getGeoRectangle(90, 180, -90, -180)
        });

        // Main polygon series for countries
        let polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_worldLow
        }));
        polygonSeries.mapPolygons.template.setAll({
            fill: am5.color("#059669"),
            strokeWidth: 0.5,
            stroke: root.interfaceColors.get("background"),
            // tooltipText: "{name}",
            toggleKey: "active",
            interactive: true
        });

        // Create polygon series for projected circles
        let circleSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
        circleSeries.mapPolygons.template.setAll({
            templateField: "polygonTemplate",
            tooltipText: "{name}:{value}"
        });

        // Create point series
        var pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {
            latitudeField: "lat",
            longitudeField: "long"
        }));

        // Add event listeners to track latitude and longitude
        chart.events.on('panning', (event) => {
            console.log('event', event);
            const zoomGeoPoint = chart.zoomGeoPoint;
            setLatitude(zoomGeoPoint.latitude.toFixed(2));
            setLongitude(zoomGeoPoint.longitude.toFixed(2));
        });

        pointSeries.bullets.push(function () {
            var circle = am5.Circle.new(root, {
                radius: 2,
                fill: am5.color("#e11d48"),
                tooltipText: "{name}"
            });

            circle.events.on("click", function (ev) {
                console.log(ev.target.dataItem.dataContext)
            });

            return am5.Bullet.new(root, {
                sprite: circle
            });
        });

        pointSeries.data.setAll(stations);

        // Make stuff animate on load
        chart.appear(1000, 100);
    }

    return (
        <div className='relative'>
            <p>Latitude: {latitude}</p>
            <p>Longitude: {longitude}</p>
            <div id="chartdiv" className='w-full h-screen bg-neutral-800'></div>
            {/* <StationFinder stroke="#fcd34d" className="absolute z-50 inset-0 m-auto" />
            <StationFound stroke="#fcd34d" className="absolute z-50 top-0 m-auto" /> */}
        </div>
    )
}

export default Home;