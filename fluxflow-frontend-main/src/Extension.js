
import React from 'react';
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { event as currentEvent} from 'd3-selection';
import geoZoom from "d3-geo-zoom";
import {
    findNearestCity,
    drag,
} from './ExtensionHelper';

import { connect } from 'react-redux'
import * as actionTypes from './redux/actions/actionType'

class Extension extends React.Component {

    d3Canvas; canvasWidth; canvasHeight; selectedCity;
    d3Trans = d3.zoomIdentity;
    countriesData; citiesJson; citiesCSV;

    // Color options
    countryOptions = { colorFill: '#A6947D', strokeFill: '#f6f0ed', lineWidth: 0.4 }
    graticuleOptions = { colorFill: "#A58D6F", lineWidth: 0.25 }
    cityOptions = { lineWidth: 0.5, strokeStyle: '#000', colorFill: '#FF4848', selectedColorFill: '#289bde', selectedFontStyle: '18px Garamond', selectedLineWidth: 5 }
    sphereOptions = { lineWidth: 0.35 }
    // Constants
    SPHERE = { type: 'Sphere' };
    padding = 10;
    dataFetches = [
        d3.json('./data/extensionData/ne_50m_admin_0_countries.json'),
        d3.csv('./data/extensionData/location_tweets.csv')
    ];



    async componentDidUpdate() {
        let tweetIds = []
        this.props.mdsArr.forEach((d) => {
            tweetIds = tweetIds.concat(d.childrens)
        })
        tweetIds = [...new Set(tweetIds)]
        let finalData = [{}]
        tweetIds.forEach((tweetId) => {
            let tweetData = this.props.fullTweets[0][tweetId]
            if (tweetData) {
                if (!finalData[0][tweetData['location']]) {
                    finalData[0][tweetData['location']] = {
                        location: tweetData['location'],
                        latitude: tweetData['latitude'],
                        longitude: tweetData['longitude'],
                        tweetCount: 1
                    }
                } else {
                    finalData[0][tweetData['location']]['tweetCount']++
                }
            }
        })
        // console.log("Final data", finalData)

        //
        this.citiesJson2 = { features: [] }
        if (!(Object.keys(finalData[0]).length === 0)) {
            Object.values(finalData[0]).forEach((city) => {
                var temp = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(city.longitude),
                            parseFloat(city.latitude),
                        ]
                    },
                    properties: {
                        name: city.location,
                        pop_max: parseInt(city.tweetCount)
                    }
                }
                this.citiesJson2['features'].push(temp);
            });
        }
        // console.log("CitiesJson2", this.citiesJson2)
        let path = d3.geoPath(this.projection, this.d3Canvas);
        // console.log(this.projection, path, this.countriesData, this.citiesJson2)
        try {
            this.drawGraph(this.projection, path, this.countriesData, this.citiesJson2);
        }
        catch (e) { }

    }

    async componentDidMount() {
        Promise.all(this.dataFetches).then((data) => {

            [this.countriesData, this.citiesCSV] = [data[0], data[1]];
            let initialObj = []

            this.projection = d3.geoOrthographic();

            this.citiesJson = { features: [] }
            initialObj.forEach((city) => {
                var temp = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(city.longitude),
                            parseFloat(city.latitude),
                        ]
                    },
                    properties: {
                        name: city.location,
                        pop_max: parseInt(city.tweetCount)
                    }
                }
                this.citiesJson['features'].push(temp);
            });

            [this.canvasWidth, this.canvasHeight] = [450, 450];

            this.projection
                .scale((Math.min(this.canvasWidth, this.canvasHeight)) / 2 - this.padding)
                .translate([this.canvasWidth / 2, this.canvasHeight / 2]);

            this.d3Canvas = d3
                .select('#world')
                .append('canvas')
                .attr('height', this.canvasHeight)
                .attr('width', this.canvasWidth)
                .node()
                .getContext('2d');

            let path = d3.geoPath(this.projection, this.d3Canvas);
            this.drawGraph(this.projection, path, this.countriesData, this.citiesJson);
        })
            .catch((error) =>
                console.log("Error ::" + error)
            );

    }
    kOptions(kval) {
        return kval < 1 ? 1 : kval
    }

    renderFunc = ({
        projection,
        path,
        cityPath,
        graticule,
        graticulePath,
        countries,
        citiesJson,
    }) => {

        this.d3Trans = (currentEvent && currentEvent.transform) || this.d3Trans;
        cityPath.pointRadius((d) => {
            return (d.properties.pop_max)
        }); // City path
        this.d3Canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight); // Clean
        this.d3Canvas.save(); // Save

        // Sphere boundary
        this.d3Canvas.lineWidth = this.sphereOptions['lineWidth'] / (this.kOptions(this.d3Trans.k));
        this.d3Canvas.beginPath(); path({ type: 'Sphere' }); this.d3Canvas.stroke();

        // Sea color fill
        this.d3Canvas.beginPath(); path(this.SPHERE); (this.d3Canvas.fillStyle = '#18254A'); this.d3Canvas.fill();

        // Draw the countries
        this.d3Canvas.lineWidth = this.countryOptions['lineWidth'] / (this.kOptions(this.d3Trans.k));
        this.d3Canvas.fillStyle = this.countryOptions['colorFill'];
        this.d3Canvas.strokeStyle = this.countryOptions['strokeFill'];
        this.d3Canvas.beginPath(); path(countries); this.d3Canvas.fill(); this.d3Canvas.stroke();

        // Draw the Latitude, Longitude
        this.d3Canvas.lineWidth = this.graticuleOptions['lineWidth'] / (this.kOptions(this.d3Trans.k));
        this.d3Canvas.beginPath(); graticulePath(graticule); (this.d3Canvas.strokeStyle = this.graticuleOptions['colorFill']); this.d3Canvas.stroke();

        let cityNames = []

        // Draw the cities
        citiesJson.features.forEach((city) => {
            this.d3Canvas.beginPath();
            cityPath(city);

            cityNames.push(city.properties.name)

            if (this.selectedCity && this.selectedCity.properties.name == city.properties.name) {
                this.selectedCity.properties.pop_max = city.properties.pop_max
            }

            this.d3Canvas.lineWidth = this.cityOptions['lineWidth'] / (this.kOptions(this.d3Trans.k));
            this.d3Canvas.strokeStyle = this.cityOptions['strokeStyle'];
            this.d3Canvas.stroke();

            this.d3Canvas.fillStyle = this.cityOptions['colorFill'];
            this.d3Canvas.fill();
        });

        if (!(this.selectedCity && cityNames.includes(this.selectedCity.properties.name))) {
            this.selectedCity = null
        }

        // Highlight selected city
        if (this.selectedCity && cityNames.includes(this.selectedCity.properties.name) && this.d3Trans.k === 1) {
            this.d3Canvas.beginPath();
            cityPath(this.selectedCity);

            this.d3Canvas.fillStyle = this.cityOptions['selectedColorFill'];
            this.d3Canvas.fill();

            this.d3Canvas.beginPath();
            this.d3Canvas.font = this.cityOptions['selectedFontStyle'];

            let [labelXY, labelOffset, name] = [projection(this.selectedCity.geometry.coordinates), 10, `${this.selectedCity.properties.name}, Tweet Count: ${this.selectedCity.properties.pop_max}`];

            this.d3Canvas.lineWidth = this.cityOptions['selectedLineWidth'] / (this.kOptions(this.d3Trans.k));
            this.d3Canvas.lineJoin = 'round';
            this.d3Canvas.strokeText(name, labelXY[0] + labelOffset, labelXY[1] - labelOffset);
            this.d3Canvas.globalCompositeOperation = 'source-over';
            this.d3Canvas.fillText(name, labelXY[0] + labelOffset, labelXY[1] - labelOffset);
        }
        // Restore
        this.d3Canvas.restore();
    }

    /* Rotate and center map to the selected city */
    transition = (p, renderArgs) => {
        const {
            projection,
            path,
            cityPath,
            graticule,
            graticulePath,
            countries,
            citiesJson
        } = renderArgs;


        d3.transition()
            .duration(1000)
            .tween('rotate', (e) => {
                var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);

                return (t) => {
                    projection.rotate(r(t));
                    projection.clipAngle(180);
                    projection.clipAngle(90);

                    this.renderFunc({
                        projection,
                        path,
                        cityPath,
                        graticule,
                        graticulePath,
                        countries,
                        citiesJson,
                    });
                };
            })
            .transition();
    };


    drawGraph = async (projection, path, countriesData, citiesJson) => {
        const cityPath = d3.geoPath(projection, this.d3Canvas);
        const graticule = d3.geoGraticule10();
        const graticulePath = d3.geoPath(projection, this.d3Canvas);
        const countries = topojson.feature(countriesData, {
            type: 'GeometryCollection',
            geometries: countriesData.objects['ne_50m_admin_0_countries'].geometries,
        });

        const renderArgs = {
            projection,
            path,
            cityPath,
            graticule,
            graticulePath,
            countries,
            citiesJson,
        };
        let mapClick = (event) => {

            if (this.d3Trans.k !== 1) return;
            var mousePosition = d3.pointer(event);
            var p = projection.invert(mousePosition);
            if (p == undefined || !p[0] || !p[1]) {
                return false;
            }
            const city = findNearestCity(mousePosition, this.canvasWidth, this.canvasHeight, renderArgs);
            if (city) {
                this.selectedCity = city;
                this.transition(this.selectedCity.geometry.coordinates, renderArgs);
            }
        }
        d3.select(this.d3Canvas.canvas)
            .call(
                drag(projection)
                    .on('start.render', mapClick)
                    .on('drag.render', () => this.renderFunc(renderArgs))
                    .on('end.render', () => this.renderFunc(renderArgs))
            )
            .call(() => this.renderFunc(renderArgs));
        console.log()

        let temp = this.renderFunc;
        geoZoom()
            .projection(projection)
            .onMove(() => { return temp(renderArgs) })(this.d3Canvas.canvas)

        // Transitions to plotted region
        if (citiesJson.features.length != 0) {
            this.transition(citiesJson.features[0].geometry.coordinates, renderArgs);
            // console.log("Inside if")
        } else {
            if (this.selectedCity) {
                // Sea color fill
                this.d3Canvas.beginPath(); path(this.SPHERE); (this.d3Canvas.fillStyle = '#000'); this.d3Canvas.fill();

                // Draw the countries
                this.d3Canvas.lineWidth = this.countryOptions['lineWidth'] / (this.kOptions(this.d3Trans.k));
                this.d3Canvas.fillStyle = this.countryOptions['colorFill'];
                this.d3Canvas.strokeStyle = this.countryOptions['strokeFill'];
                this.d3Canvas.beginPath(); path(countries); this.d3Canvas.fill(); this.d3Canvas.stroke();

                // Draw the Latitude, Longitude
                this.d3Canvas.lineWidth = this.graticuleOptions['lineWidth'] / (this.kOptions(this.d3Trans.k));
                this.d3Canvas.beginPath(); graticulePath(graticule); (this.d3Canvas.strokeStyle = this.graticuleOptions['colorFill']); this.d3Canvas.stroke();

                this.selectedCity = null
            }
        }
    };


    render() {
        return (
            <>
                <div className='view_text'>
                    Globe View
                </div>
                <div id="world">

                </div>
            </>

        )
    }
}

function mapStateToProps(state) {
    return {
        finalArr: state.reducer.finalArr,
        mdsArr: state.reducer.mdsArr,
        clusterArr: state.reducer.clusterArr,
        fullTweets: state.reducer.fullTweets
    }
}

function mapDispatchToProps(dispatch) {
    return {
        assign: (data) => {
            dispatch({ type: actionTypes.ASSIGN, data: data })
        },

        mds_assign: (data) => {
            dispatch({ type: actionTypes.MDS_ASSIGN, data: data })
        },
        cluster_assign: (data) => {
            dispatch({ type: actionTypes.CLUSTER_ASSIGN, data: data })
        },

        full_tweets_assign: (data) => {
            dispatch({ type: actionTypes.FULL_TWEETS_ASSIGN, data: data })
        },
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps

)(Extension);
