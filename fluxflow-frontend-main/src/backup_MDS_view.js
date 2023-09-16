import axios from "axios";
import React from 'react';
import * as d3 from "d3";
import myData from './mds_mock.json';
import Papa from 'papaparse'

let csr = Papa.parse(".data/final_topic.csv")
let csr_tweets = Papa.parse(".data/final_topic_all.csv")
// let csr = Papa.parse(".data/final_topic.csv")
// let csr = Papa.parse(".data/final_topic.csv")



//! [x] group tweets based on topic_id - 5 glyph
//! [x] group tweets based on topic_id and topic_keyword - multiple glyph
//! [] find the start and end time for topic_id for each glyph
//! [] find avg of values for glyphs
//! [] 
/*
    required glyph json
    { 
        "1": {
            anomaly_score: 0.1,
            starting_time:
            ending_time:
        },
        "2": {},
        "anomaly1" // keep id as combo as key and add topicid at end
    }

*/

class MDS_view extends React.Component {

    topic_id_glyph = {};
    topic_keyword_glyph = {}

    async dataPreProcess(topics, tweets) {
        // this.topic_id_glyph = {}

        for (let i = 0; i < topics.length; i++) {
            if (this.topic_id_glyph.hasOwnProperty(topics[i][4])) {
                this.topic_id_glyph[topics[i][4]].push(topics[i])

            }
            else {
                this.topic_id_glyph[topics[i][4]] = [topics[i]]

            }

            if (this.topic_keyword_glyph.hasOwnProperty(topics[i][5])) {

                this.topic_keyword_glyph[topics[i][5]].push(topics[i])
            }
            else {
                this.topic_keyword_glyph[topics[i][5]] = [topics[i]]
            }
        }

    }


    state = {
        data: myData,
        height: 250,
        width: 400
    }
    async normalization(val, max, min) { return (val - min) / ((max - min)); }
    getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    async componentDidMount() {
        // console.log(csr_tweets)
        // Parse local CSV file
        let o = await new Promise((resolve, reject) => {
            Papa.parse("/data/final_topic.csv", {
                download: true,
                dynamicTyping: true,
                complete: function (results) {
                    resolve(results.data)
                    // return results
                }
            });
        })

        let tweets_flux = await new Promise((resolve, reject) => {
            Papa.parse("/data/fluxflow_tweets_new (1).csv", {
                download: true,
                header: false,
                dynamicTyping: true,
                complete: function (results) {
                    resolve(results.data)
                }
            });
        })


        o = o.slice(1, -1);
        tweets_flux.splice(60, 1);
        tweets_flux = tweets_flux.slice(1, 102);

        this.dataPreProcess(o, tweets_flux)

        var anomalyColor = d3.scaleOrdinal()
            .domain([0, 1])
            .range(["darkorchid", "blue", "green", "yellow", "darksalmon", "grey"]);

        var sentimentColor = d3.scaleOrdinal()
            .domain([-1, 1])
            .range(["darkgreen", "pink", "brown", "slateblue",
                "beige", "orange"]);
        /*
, "darkgreen", "pink", "brown", "slateblue",
            "beige", "orange", "bisque", "burlywood", "cadetblue", "chocolate", "aquamarine", "chartreuse", "deepskyblue", "cornflowerblue",
            "cyan", "darkgoldenrod", "darkseagreen", "deeppink"
        */

        var margin = { top: 10, right: 20, bottom: 30, left: 50 },
            width = 500 - margin.left - margin.right,
            height = 420 - margin.top - margin.bottom;

        var svg = d3.select("#my_svg")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");



        // console.log(o[1][12], o[1][13])
        let x_arr = [], y_arr = [], data = []
        for (let i = 0; i < o.length; i++) {
            x_arr.push(parseFloat(parseFloat(o[i][12]).toFixed(2)))
            y_arr.push(parseFloat(parseFloat(o[i][13]).toFixed(2)))

            let temp = {
                x: parseFloat(parseFloat(o[i][12]).toFixed(2)),
                y: parseFloat(parseFloat(o[i][13]).toFixed(2)),
                r: await this.normalization(this.getRandomInt(1000), 900, 1000), //this.getRandomInt(1000)
                anomalyScore: o[i][6],
                sentimentScore: tweets_flux[i][10]
            }
            // let scores = 
            data.push(temp)
            // console.log(temp)
        }

        var x_min = Math.min.apply(null, x_arr),
            x_max = Math.max.apply(null, x_arr),
            y_min = Math.min.apply(null, y_arr),
            y_max = Math.max.apply(null, y_arr);


        var x = d3.scaleLinear()
            .domain([x_min, x_max])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([y_min, y_max])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        // Add a scale for bubble size
        var z = d3.scaleLinear()
            .domain([0, 10])
            .range([1, 10]);

        let json_data = this.state.data;
        let outerRadius = await this.normalization(json_data.user_volume, 1000, 500) * 100;
        let inner_circle_radius = outerRadius / 10;

        // svg.append('g')
        //     .selectAll("dot")
        //     .data(data)
        //     .enter()
        //     .append("circle")
        //     .attr("cx", function (d) { return x(d.x); })
        //     .attr("cy", function (d) { return y(d.y); })
        //     .attr("r", function (d) { return z(50); })
        //     .style("fill", "#69b3a2")
        //     .style("opacity", "0.7")
        //     .attr("stroke", "black")


        let pie = d => d3.arc()
            .innerRadius(0)
            .outerRadius(() => { return z(d.r) })
            .startAngle(d.pie.startAngle)
            .endAngle(d.pie.endAngle)

        const g = svg.selectAll(".pie")
            .data(data)
            .join("g")
            .attr("class", "pie")
            .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`)
        // .call(g => g.append("text")
        //     .attr("dy", "1em")
        //     .attr("text-anchor", "middle")
        //     .attr("transform", d => `translate(0,${z(d.r)})`)
        // );
        let temp = []
        const pg = g.selectAll("g")
            .enter()
            .data(d => {
                // console.log(d.sentimentScore)
                d['values'] = [Math.random(2)]
                // d['p'] = d.x;
                // d['total'] = this.getRandomInt(2);
                // d['anomalyScore'] = d.anomalyScore
                // d['r'] = d.r
                // console.log(d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))[0])
                // temp.push(d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))[0])
                // console.log(d3.pie()(d.values).map(p => ({ pie: p, total: d.total })))
                // console.log(d.r)
                return d3.pie()(d.values).map(p => ({ pie: p, r: d.r, anomalyScore: d.anomalyScore, sentimentScore: d.sentimentScore }))
            })

            .join("g")


        //await this.normalization(3, 1000, 500) * 100
        // console.log(temp.length, temp[1])

        const slice = pg
            // .data()
            // .data(d => {
            //     // console.log(d)
            //     d['values'] = [Math.random(2)]
            //     d['p'] = d.x;
            //     d['total'] = this.getRandomInt(2);
            //     d['ir'] = d.r / 10

            //     // console.log(d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))[0])
            //     // temp.push(d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))[0])
            //     // console.log(d3.pie()(d.values).map(p => ({ pie: p, total: d.total })))
            //     return d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))
            // })
            // .enter()
            .append("path")
            .attr("d", d => { return pie(d)() })
            .attr("opacity", 1)
            .attr("fill", d => anomalyColor(d.anomalyScore))
            .on('click', function (e, t) {
                console.log(e, t)
            })

        pg
            .style("opacity", "0.5")
            .append("svg:circle")
            // .attr("cx", transform_x)
            // .attr("cy", transform_y)
            .attr("r", d => { return (d.r / 3) })
            .style("fill", d => sentimentColor(d.sentimentScore))
            .attr("opacity", 1)

        // for (let i = 0; i < temp.length; i++) {
        //     // console.log(Math.abs(await this.normalization(temp[i].r, 1000, 500) * 100))
        //     temp[i].r = Math.abs(await this.normalization(temp[i].r, 1, 100));
        //     // pg.append("path")
        //     //     .data([temp[i]])
        //     //     .attr("d", d => { console.log(d); return pie(d)() })
        //     //     .attr("opacity", 1)
        //     //     .attr("fill", 'red')
        //     //     .style("opacity", "0.5")
        //     // console.log(temp[i])
        // }
        // d3.select("body").select("div")
        //     .data([1, 2, 3])
        //     .enter()
        //     .append("div")
        //     .attr("d", d => { })

        // .attr("fill", (d, i) => color(territories[i]));

        var tickLength = 10;
        var circleDegree = 360;
        // var clockGroup = d3.select("svg")


        function degToRad(degrees) {
            return degrees * Math.PI / 180;
        }

        // it'll give you xy-coord by degree from 12(or 0) o'clock 
        function getCoordFromCircle(deg, cx, cy, r) {
            var rad = degToRad(deg);
            var x = cx + r * Math.cos(rad);
            var y = cy + r * Math.sin(rad);
            return [x, y];
        }

        function splitDegrees(num) {
            var angle = circleDegree / num;
            var degrees = [];

            for (var ang = 0; ang < circleDegree; ang += angle) {
                degrees.push(ang);
            }

            return degrees;
        }

        // pg.append('g')
        //     .attr('class', 'ticks')
        //     .selectAll('path')
        //     .data(splitDegrees(12))
        //     .enter()
        //     .append('path')
        //     .attr('d', function (d) {
        //         console.log(d)
        //         var coord = {
        //             outer: getCoordFromCircle(d, 0, 0, 10),
        //             inner: getCoordFromCircle(d, 0, 0, 100 - tickLength)
        //         };
        //         return 'M' + coord.outer[0] + ' ' + coord.outer[1] + 'L' + coord.inner[0] + ' ' + coord.inner[1] + 'Z';
        //     });

        function clockToRad(clock, direction) {
            var unit = 360 / 12;
            var degree = direction > 0 ? unit * clock : unit * clock - 360;

            return degToRad(degree);
        }

        var lines = pg//.selectAll(null)
            // .data(pie([json_data]))
            // .enter()
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("y2", function (d) {
                // console.log(d)
                d['starting_time'] = new Date("2012-05-24T18:25:43.511Z")
                // console.log(d.data.starting_time.getTime())
                // console.log(d.data.starting_time)
                // console.log(getTimeFromDate1(new Date(d.data.starting_time)))
                return Math.sin(clockToRad((d.starting_time.getHours() - 3), -1)) * (d.r)
            })
            .attr("x2", function (d) {
                d['starting_time'] = new Date("2012-05-24T18:25:43.511Z")
                return Math.cos(clockToRad((d.starting_time.getHours() - 3), -1)) * (d.r)
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
        // .attr("transform", `translate(${transform_x},${transform_y})`);

        var lines = pg//.selectAll(null)
            //.data(pie([json_data]))
            //.enter()
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("y2", function (d) {
                d["ending_time"] = new Date("2012-05-24T23:25:43.511Z")
                return Math.sin(clockToRad((d.ending_time.getHours() - 3), -1)) * (d.r)
            })
            .attr("x2", function (d) {
                d["ending_time"] = new Date("2012-05-24T23:25:43.511Z")
                return Math.cos(clockToRad((d.ending_time.getHours() - 3), -1)) * (d.r)
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
        // .attr("transform", `translate(${transform_x},${transform_y})`);
    }



    render() {

        return (
            <div>
                <svg id="my_svg" width={"500px"} height={"750px"}>

                </svg>

            </div>
        )
    }
}

export default MDS_view;