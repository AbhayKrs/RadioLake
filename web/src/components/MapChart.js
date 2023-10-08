import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from 'axios';

import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldHigh from "@amcharts/amcharts5-geodata/worldHigh";
import countries2 from "@amcharts/amcharts5-geodata/data/countries2";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import { ReactComponent as StationFinder } from '../assets/icons/station-finder.svg';
import { ReactComponent as StationFound } from '../assets/icons/station-found.svg';

const MapChart = (props) => {
    const mapRef = useRef(null);
    const { audioRef, stations, dataReady, playingStation, setPlayingStation, selectedCountry, setSelectedCountry, playerWaiting, setPlayerWaiting, sidePanelUpdate, setSidePanelUpdate, setPanelListView } = props;
    const [findingStation, setFindingStation] = useState(false);

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

            let selected_countrycode = '';
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

            // Back button to go back to continents view on zoomed
            let backContainer = map.children.push(am5.Container.new(root, {
                x: am5.p100,
                centerX: am5.p100,
                dx: -10,
                paddingTop: 5,
                paddingRight: 10,
                paddingBottom: 5,
                y: 30,
                interactiveChildren: false,
                layout: root.horizontalLayout,
                cursorOverStyle: "pointer",
                background: am5.RoundedRectangle.new(root, {
                    fill: am5.color(0xffffff),
                    fillOpacity: 0
                }),
                visible: false
            }));
            backContainer.children.push(am5.Label.new(root, {
                text: "Back to full view",
                centerY: am5.p50,
                fill: am5.color("#fff")
            }));
            backContainer.children.push(am5.Graphics.new(root, {
                width: 32,
                height: 32,
                centerY: am5.p50,
                fill: am5.color("#fff"),
                svgPath: "M14.178 3.936c0.072 0 0.162 0.036 0.24 0.144 -0.348 -0.498 0.39 -0.282 0.432 -0.756 0.42 -0.312 0.27 -0.516 0.39 -0.528l0.132 -0.108c-0.258 0.096 -0.348 0.114 -0.42 0.114h-0.12c-0.09 0 -0.24 0.018 -0.594 0.126 -0.81 0.06 -1.392 0.936 -1.668 0.96 -0.282 0.15 -0.27 0.18 -0.204 0.18 0.018 0 0.042 -0.006 0.066 -0.006 0.024 0 0.042 -0.006 0.06 -0.006 0.066 0 0.048 0.03 -0.336 0.21 0.09 0.024 -0.672 0.36 -0.678 0.888 -0.024 0.204 0.06 0.342 0.198 0.342 0.12 0 0.27 -0.09 0.432 -0.318 0.54 -0.624 1.68 -0.684 2.172 -1.062 -0.306 -0.024 -0.246 -0.18 -0.102 -0.18zm-2.742 0.21c-0.054 0 0.018 -0.066 0.096 -0.132a4.08 4.08 0 0 1 0.18 -0.132l-0.006 0.006c0.324 -0.126 0.126 -0.156 0.3 -0.24h-0.012c-0.036 0 0.03 -0.048 0.09 -0.102 0.06 -0.048 0.114 -0.102 0.06 -0.102a0.833 0.833 0 0 0 -0.24 0.072c0.042 -0.06 0.204 -0.102 0.432 -0.228a5.235 5.235 0 0 1 -0.618 0.174c-0.024 0 0.114 -0.048 0.528 -0.174 0.018 0 0.036 0.006 0.048 0.006 0.042 0 0.06 -0.012 0.054 -0.024 -0.006 -0.012 -0.03 -0.018 -0.072 -0.018 -0.594 0.048 -1.038 0.42 -0.906 0.468a0.646 0.646 0 0 1 0.168 -0.036c0.078 0 0.042 0.066 -0.114 0.162 0.072 0.168 -1.2 0.6 -1.344 0.756a0.326 0.326 0 0 1 0.144 -0.054c0.096 0 -0.03 0.186 -0.156 0.276 0.078 0.072 0.138 0.096 0.186 0.096 0.126 0 0.18 -0.174 0.288 -0.228 0.024 0.048 0.048 0.072 0.078 0.072 0.102 0 0.228 -0.252 0.33 -0.384 0.03 0.03 0.066 0.054 0.114 0.054 0.096 0 0.24 -0.078 0.468 -0.3l-0.096 0.012zm-1.38 1.104c-0.216 0.132 -0.33 0.186 -0.378 0.186 -0.09 0 0.03 -0.168 0.138 -0.342 0.108 -0.168 0.204 -0.336 0.066 -0.336 -0.066 0 -0.186 0.036 -0.378 0.132 -0.522 0.348 -1.404 1.308 -1.794 1.308h-0.036c0.63 -0.462 0.444 -1.368 1.326 -1.602 0.87 -0.498 1.464 -0.342 2.238 -0.912 -0.228 0.114 -0.564 0.24 -0.642 0.24 -0.048 0 0.024 -0.06 0.336 -0.21 -0.03 0.006 -0.054 0.012 -0.072 0.012 -0.21 0 1.38 -0.57 1.458 -0.582 -0.654 0.09 -1.71 0.636 -1.854 0.636 -0.018 0 -0.018 -0.006 -0.018 -0.018 0.024 -0.018 0.024 -0.03 0 -0.03 -0.078 0 -0.402 0.108 -0.732 0.216 -0.324 0.108 -0.654 0.222 -0.726 0.222 -0.024 0 -0.024 -0.012 0.012 -0.036 -2.832 1.608 -5.196 4.32 -5.934 7.536 0.306 0.702 0.096 2.04 0.6 2.43 0.576 0.486 -0.492 1.896 -0.21 2.766 0.288 1.572 1.53 2.646 1.662 4.254 0.228 1.104 1.062 2.454 1.41 3.156 0.264 0.264 0.99 1.026 1.116 1.026 0.048 0 0.018 -0.114 -0.174 -0.42 -0.12 -0.342 -0.816 -1.236 -0.48 -1.236a0.225 0.225 0 0 1 0.06 0.006c-0.414 -0.42 0.918 -0.306 -0.012 -0.876 -0.108 -0.132 -0.132 -0.174 -0.108 -0.174 0.03 0 0.114 0.048 0.21 0.096a0.839 0.839 0 0 0 0.318 0.096c0.15 0 0.252 -0.102 0.192 -0.474a0.141 0.141 0 0 0 0.066 0.012c0.156 0 0.102 -0.306 0.114 -0.612 0.012 -0.306 0.09 -0.612 0.51 -0.612 0.048 0 0.102 0.006 0.156 0.012 0.972 -0.528 0.126 -1.986 1.242 -2.52 -0.042 -1.212 -1.668 -1.272 -2.28 -1.764a0.555 0.555 0 0 1 -0.294 0.078 0.849 0.849 0 0 1 -0.288 -0.054c-0.084 -0.024 -0.162 -0.054 -0.216 -0.054 -0.012 0 -0.024 0 -0.036 0.006 1.044 -0.276 0.282 -1.728 -0.582 -1.728h-0.06c-0.066 -0.63 -0.39 -0.39 -0.426 -0.912a0.327 0.327 0 0 1 -0.162 0.042c-0.144 0 -0.276 -0.102 -0.39 -0.198 -0.114 -0.102 -0.21 -0.198 -0.294 -0.198 -0.066 0 -0.126 0.066 -0.18 0.258 0.06 -0.294 0.042 -0.39 -0.018 -0.39s-0.168 0.102 -0.288 0.204c-0.114 0.102 -0.246 0.204 -0.348 0.204h-0.03c-0.702 -0.498 0.006 -1.38 -0.366 -2.058 0.24 -0.258 0.336 -0.696 0.228 -0.696 -0.054 0 -0.162 0.108 -0.33 0.402 -0.24 -0.612 0.396 -1.998 0.936 -2.076 0.018 0 0.03 -0.006 0.048 -0.006 0.096 0 0.192 0.048 0.276 0.15 0.048 0.282 -0.072 0.876 -0.024 0.876 0.024 0 0.072 -0.12 0.192 -0.432 0.156 -0.714 1.248 -1.23 1.362 -1.668 0.006 0.006 0.006 0.006 0.012 0.006 0.126 0 0.936 -0.714 1.29 -0.792 0.138 -0.138 0.234 -0.186 0.306 -0.186 0.078 0 0.12 0.06 0.15 0.114 0.03 0.06 0.054 0.114 0.084 0.114 0.024 0 0.054 -0.036 0.108 -0.138 -0.186 -0.366 0.294 -0.714 0.162 -0.714 -0.048 0 -0.192 0.048 -0.486 0.168a0.225 0.225 0 0 1 -0.084 0.03c-0.036 0 0.108 -0.096 0.318 -0.192s0.474 -0.192 0.696 -0.192A0.42 0.42 0 0 1 9 6.888c0.93 -0.222 0.42 -0.528 0.468 -0.528h0.012c0.264 -0.156 0.186 -0.744 0.576 -1.11zM5.898 7.704c-0.012 0 0.042 -0.078 0.222 -0.3 0.372 -0.276 0.672 -0.462 0.33 -0.642 0.15 -0.066 0.294 -0.144 0.432 -0.228 -0.006 0.294 -0.252 1.008 -0.384 1.008 -0.03 0 -0.06 -0.042 -0.072 -0.132 0.078 -0.138 0.084 -0.192 0.054 -0.192 -0.048 0 -0.186 0.12 -0.318 0.246 -0.132 0.114 -0.252 0.24 -0.264 0.24zm0.342 0.162c-0.162 0 -0.132 -0.102 0.366 -0.204 0.216 -0.03 0.048 -0.018 0.306 -0.078a1.215 1.215 0 0 1 -0.672 0.282zm9.33 -0.606c0.072 -0.012 0.126 -0.012 0.168 -0.012 0.174 0 0.096 0.072 -0.006 0.144s-0.228 0.144 -0.156 0.144c0.042 0 0.156 -0.024 0.39 -0.09 1.182 -0.084 -0.462 -1.086 -0.198 -1.422L15.696 6c-0.486 0.618 0.324 0.63 -0.126 1.26zm-0.492 0.024c0.084 0 0.192 -0.096 0.306 -0.366 0.156 -0.186 0.09 -0.21 -0.078 -0.3 -0.462 0.12 -0.42 0.666 -0.228 0.666zm4.14 1.902c-0.018 0 -0.03 0.006 -0.042 0.012a0.603 0.603 0 0 0 0.144 0.024 0.258 0.258 0 0 0 -0.102 -0.036zm8.058 1.494c0.102 0.222 0.156 0.312 0.162 0.312 0.042 0 -0.756 -1.944 -1.086 -2.292 -1.722 -2.832 -4.554 -4.998 -7.782 -5.808h-0.006c-0.084 0 0.012 0.042 0.126 0.084 0.114 0.042 0.252 0.084 0.252 0.084s-0.09 -0.03 -0.366 -0.108a4.527 4.527 0 0 0 -0.936 -0.18c-0.054 0.018 1.314 0.558 2.232 0.84a4.513 4.513 0 0 0 -0.702 -0.18c-0.054 0 0 0.036 0.222 0.132 -0.27 -0.078 -0.384 -0.114 -0.396 -0.114 -0.018 0 0.36 0.126 0.714 0.252 0.36 0.126 0.702 0.252 0.606 0.252 -0.024 0 -0.09 -0.012 -0.192 -0.03 0.306 0.168 0.414 0.234 0.396 0.234 -0.03 0 -0.408 -0.18 -0.798 -0.36 -0.384 -0.18 -0.774 -0.36 -0.828 -0.36 -0.03 0 0.048 0.06 0.312 0.216 0.36 0.156 0.72 0.312 0.618 0.312a2.55 2.55 0 0 1 -0.456 -0.108c0.6 0.306 -0.426 0.186 -0.078 0.6 -0.192 -0.18 -0.27 -0.24 -0.288 -0.24s0.03 0.072 0.078 0.144 0.084 0.144 0.042 0.144h-0.012c0.42 0.456 -0.294 0.048 0.216 0.456 -0.384 -0.174 -1.038 -0.462 -0.744 -0.462 0.072 0 0.21 0.018 0.426 0.066 -0.39 -0.456 -1.494 -0.474 -1.518 -0.528 -0.276 0.018 -0.282 0.228 -0.234 0.612 -0.006 0.606 -0.6 0.618 -0.522 0.966 0 -0.006 0.006 -0.006 0.006 -0.006 0.012 0 0.018 0.12 0.054 0.246 0.042 0.12 0.114 0.246 0.27 0.246a0.602 0.602 0 0 0 0.324 -0.126c0.186 0.336 0.354 0.456 0.486 0.456 0.198 0 0.318 -0.27 0.306 -0.516 -0.216 -0.12 -0.498 -1.116 -0.186 -1.116 0.048 0 0.108 0.024 0.186 0.078 -0.486 1.194 1.92 0.396 0.558 0.942 0.306 0.402 -0.192 0.384 -0.048 0.87a2.795 2.795 0 0 1 -0.72 0.126c-0.336 0 -0.594 -0.144 -0.564 -0.648 -0.42 0.222 0.42 0.972 -0.414 0.972h-0.048c-0.402 0.738 -1.908 0.486 -0.726 1.266 0.066 0.342 -0.15 0.402 -0.426 0.402 -0.072 0 -0.15 -0.006 -0.228 -0.012 -0.078 -0.006 -0.156 -0.006 -0.228 -0.006 -0.312 0 -0.534 0.078 -0.342 0.564 -0.138 0.504 0.186 0.726 0.582 0.726 0.48 0 1.068 -0.312 1.11 -0.828 0.258 -0.39 0.588 -0.552 0.93 -0.552 0.54 0 1.11 0.408 1.482 0.912 0.03 0.048 0.054 0.066 0.066 0.066 0.03 0 0 -0.12 -0.012 -0.24 -0.012 -0.096 -0.012 -0.192 0.024 -0.222 -0.534 -0.15 -0.942 -0.798 -0.762 -0.798 0.06 0 0.186 0.072 0.39 0.264h0.03c0.336 0 0.6 0.264 0.804 0.528 0.21 0.264 0.366 0.528 0.504 0.528 0.054 0 0.108 -0.048 0.156 -0.156a1.001 1.001 0 0 1 -0.114 -0.24c-0.036 -0.126 -0.036 -0.252 0.126 -0.252a0.87 0.87 0 0 1 0.282 0.072c0.408 -0.108 -0.258 -1.17 0.282 -1.17 0.054 0 0.12 0.012 0.204 0.036 -0.006 0.186 0.078 0.252 0.156 0.252 0.156 0 0.312 -0.222 -0.066 -0.288 0.144 -0.138 0.228 -0.192 0.288 -0.192 0.21 0 0.042 0.696 0.768 0.696 0.246 0.582 -2.136 0.042 -1.374 1.158 0.174 0.126 0.39 0.15 0.6 0.15 0.066 0 0.126 0 0.186 -0.006 0.06 0 0.12 -0.006 0.174 -0.006 0.372 0 0.636 0.09 0.474 0.858a1.065 1.065 0 0 1 -0.648 0.192c-0.204 0 -0.408 -0.036 -0.606 -0.072s-0.39 -0.072 -0.564 -0.072c-0.27 0 -0.486 0.09 -0.618 0.402 -0.702 -0.288 -1.626 -0.3 -1.536 -1.17 -1.224 0.174 -2.502 0.084 -3.402 0.834 -0.054 1.098 -1.938 1.452 -1.482 2.7 -0.546 1.152 0.66 2.766 1.89 2.766 0.042 0 0.09 0 0.132 -0.006 0.672 -0.006 1.35 -0.306 1.944 -0.306 0.306 0 0.582 0.078 0.822 0.318 0.054 -0.006 0.102 -0.012 0.144 -0.012 0.918 0 -0.294 1.458 0.804 1.704 0.996 1.032 -0.612 2.094 0.174 3.084 0.084 0.774 0.468 1.422 0.468 2.178 0.102 0.012 0.198 0.018 0.3 0.018 1.266 0 2.058 -1.104 2.802 -1.938 -0.228 -1.248 1.77 -1.494 1.086 -2.892 -0.318 -1.53 1.506 -2.436 1.404 -3.966 0.018 -0.216 -0.042 -0.282 -0.132 -0.282s-0.222 0.066 -0.348 0.126a0.984 0.984 0 0 1 -0.39 0.126c-0.15 0 -0.264 -0.102 -0.276 -0.438 -0.882 -0.822 -1.284 -1.938 -2.106 -2.844 1.068 0.516 1.674 1.68 2.166 2.736a0.468 0.468 0 0 0 0.132 0.018c0.87 0 2.082 -2.082 0.762 -2.586 -0.072 0.198 -0.168 0.27 -0.282 0.27 -0.198 0 -0.426 -0.24 -0.588 -0.474 -0.162 -0.24 -0.246 -0.48 -0.156 -0.48 0.06 0 0.192 0.096 0.42 0.348 0.258 0.162 0.51 0.204 0.774 0.204 0.258 0 0.522 -0.042 0.798 -0.066 0.348 0.138 0.498 0.582 0.606 0.582 0.018 0 0.042 -0.018 0.06 -0.06 0.276 0.66 0.594 1.836 0.882 2.154 -0.15 -1.008 -0.186 -2.076 -0.444 -3.066zm-3.348 -1.386c-0.678 -0.174 -0.9 -1.014 -1.434 -1.5 -0.006 -0.132 0.192 -0.108 0.144 -0.33 0.72 0.222 0.486 0.444 0.42 0.486 0.264 0.438 1.002 0.738 0.87 1.344zM14.61 4.728c-0.654 0.192 -0.744 -0.018 -0.63 0.384 0.048 0.036 0.138 0.048 0.228 0.048 0.318 0.006 0.75 -0.18 0.402 -0.432zm9.606 16.53c0.858 -0.726 0.966 -1.59 1.008 -2.466 -0.384 0.75 -1.524 1.578 -1.008 2.466zm-3.906 -11.7c-0.006 0.006 -0.006 0.006 -0.006 0.012 0.006 0.012 0.012 0.012 0.012 0.012l-0.006 -0.024zM15.36 0C6.876 0 0 6.876 0 15.36s6.876 15.36 15.36 15.36 15.36 -6.876 15.36 -15.36S23.844 0 15.36 0zm0 29.538a14.178 14.178 0 1 1 0 -28.358 14.178 14.178 0 0 1 0 28.358z"
            }));
            backContainer.events.on("click", () => {
                var dataItem = polygonSeries.getDataItemById(selected_countrycode);
                var target = dataItem.get("mapPolygon");
                if (target) {
                    var centroid = target.geoCentroid();
                    map.zoomToGeoPoint({ latitude: centroid.latitude, longitude: centroid.longitude }, -1, true);
                }
                polygonSeries.show();
                backgroundSeries.show();
                countrySeries.hide(100);
                backContainer.hide(100);

                selected_countrycode = '';
                pointSeries.bullets.clear();
                setPanelListView(false);
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

                    if (selected_countrycode.length > 0 && country_bound_stations.length > 0) {
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
                            if (dataItem) {
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
                            backContainer.show();

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

    const playStation = (station) => {
        console.log("station", station);
        axios.get('https://nl1.api.radio-browser.info/json/stations/byuuid/' + station.id)
            .then(res => {
                setPlayerWaiting(true);
                const data = res.data[0];

                const audio_container = document.getElementById("audio_root");

                //Remove existing audio and add new audio to container
                console.log("before", document.getElementById("audio_root"));
                if (audio_container.children.length > 0) {
                    console.log("removed")
                    audio_container.removeChild(audio_container.firstElementChild);
                }
                console.log("after", audio_container.children, audio_container.children.length)

                //Initialize audio player with station url
                var audio = document.createElement("audio");
                audioRef.current = audio;
                audio.src = data.url;
                audio.controls = true;
                audio.volume = 1;
                audio_container.appendChild(audio);
                console.log("AUD::", audio);

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
            <div id="audio_root" className="hidden" />
        </div >
    )
}

export default MapChart;