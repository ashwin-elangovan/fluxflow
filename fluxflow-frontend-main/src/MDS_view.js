import React from 'react';
import * as d3 from "d3";
import myData from './mds_mock.json';
import Papa from 'papaparse'
import { connect } from 'react-redux'
import * as actionTypes from './redux/actions/actionType'
import cloneDeep from 'clone-deep'

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
            start_time:
            end_time:
        },
        "2": {},
        "anomaly1" // keep id as combo as key and add topicid at end
    }

*/


class MDS_view extends React.Component {
    data = []

    topic_id_glyph = {};
    topic_keyword_glyph = {}

    async dataPreProcess(topics, tweets) {
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

    async componentDidUpdate() {
        // console.log("updated", this.props.finalArr)
    }

    async componentDidMount() {
        document.getElementById("my_svg").innerHTML = ""
        let dataFetches = [
            d3.json('./data/datum/new/mds_view_data.json')
        ];

        let mds_data = (await Promise.all(dataFetches).then())[0]
        // Parse local CSV file
        let o = await new Promise((resolve, reject) => {
            Papa.parse("/data/final_topic.csv", {
                download: true,
                dynamicTyping: true,
                complete: function (results) {
                    resolve(results.data)
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

        var anomalyColor = d3.scaleLinear()
            .domain([0, 0.5, 0.625, 0.75, 1])
            .range(["darkorchid", "peru", "darkturquoise", "azure", "darksalmon", "grey"]);

        var sentimentColor = d3.scaleLinear()
            .domain([0, 0.05, 0.5, 0.625, 0.75, 1])
            .range(["darkgreen", "orangered", "darkgoldenrod", "slateblue", "dodgerblue", "orange"]);

        var margin = { top: 10, right: 20, bottom: 30, left: 20 },
            height = 400 - margin.top - margin.bottom;

        var svg = d3.select("#my_svg")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "455px")
            .append("g")
            .attr("transform",
                "translate(" + (margin.left) + "," + (margin.top + 25) + ")");

        let x_arr = [], y_arr = [], data = []
        for (let i = 0; i < o.length; i++) {
            x_arr.push(parseFloat(parseFloat(o[i][12]).toFixed(2)))
            y_arr.push(parseFloat(parseFloat(o[i][13]).toFixed(2)))

            let temp = {
                x: parseFloat(parseFloat(o[i][12]).toFixed(2)),
                y: parseFloat(parseFloat(o[i][13]).toFixed(2)),
                r: await this.normalization(this.getRandomInt(1000), 900, 1000), //this.getRandomInt(1000)
                anamoly: o[i][6],
                sentiment: tweets_flux[i][10],
                id: 'a' + o[i][1]
            }
            data.push(temp)
        }

        data = []
        for (let i = 0; i < mds_data.length; i++) {
            if (!data.find(x => x.name === mds_data[i]["name"])) {
                mds_data[i]["name"] = mds_data[i]["name"].replace(/[^a-z0-9-]/g, "")
                data.push(mds_data[i]);
            }
        }

        var x = d3.scaleLinear()
            .domain([-1.6, 0.5])
            .range([0, 250])

        svg.append("g")
            .attr("transform", "translate(15," + height + ")")
            .call(d3.axisBottom(x)
                .tickValues([-1.6, -1, -0.5, 0, 0.5]));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([-1.5, 2])
            .range([height, 0]);

        svg.append("g")
            .attr("transform", "translate(15," + 0 + ")")
            .call(d3.axisLeft(y))
            ;

        // Add a scale for bubble size
        var z = d3.scaleLinear()
            .domain([0, 10])
            .range([1, 10]);

        let json_data = this.state.data;
        // let outerRadius = await this.normalization(json_data.user_volume, 1000, 500) * 100;
        // let inner_circle_radius = outerRadius / 10;

        this.data = data;
        await this.props.assign(data)
        let pieBig = d => d3.arc()
            .innerRadius(0)
            .outerRadius(() => { return z(14) })
            .startAngle(d.pie.startAngle)
            .endAngle(d.pie.endAngle)

        let pieSmall = d => d3.arc()
            .innerRadius(0)
            .outerRadius(() => { return z(5) })
            .startAngle(d.pie.startAngle)
            .endAngle(d.pie.endAngle)

        const g = svg.selectAll(".pie")
            .data(() => {
                let temp = cloneDeep([...this.props.finalArr])
                return temp
            })
            .join("g")
            .attr("class", "pie")
            .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`)

        const pg = g.selectAll("g")
            .enter()
            .data(d => {
                d['values'] = [Math.random(2)]
                return d3.pie()(d.values).map(p => ({
                    pie: p, r: d.user_volume, anamoly: d.anamoly, sentiment: d.sentiment, name: d.name, start_time: new Date(d.start_time),
                    end_time: new Date(d.end_time)
                }))
            })

            .join("g")
            .attr("id", d => ('g' + d.name))

        var tooltip = d3.select("#mds_tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("z-index", "-1")

        pg.on("mousemove", function (d, e) {
            var matrix = this.getScreenCTM()
                .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));


            tooltip.html((y, data) => {
                return `<div style="margin: 5px">Anomaly ratio: <strong> ${e.anamoly.toFixed(2)} </strong></div>
                        <div style="margin: 5px">Sentiment Score: <strong> ${e.sentiment.toFixed(2)} </strong></div>
                        <div style="margin: 5px">Start time: <strong> ${e.start_time.getHours()}H:${e.start_time.getMinutes()}M:${e.start_time.getSeconds()}S </strong></div>
                        <div style="margin: 5px">End time: <strong> ${e.end_time.getHours()}H:${e.end_time.getMinutes()}M:${e.end_time.getSeconds()}S </strong></div>`;
            })
                .style("visibility", "visible")
                .style("z-index", "100")
                .style("left", (window.pageXOffset + matrix.e + 15) + "px")
                .style("top", (window.pageYOffset + matrix.f - 30) + "px");
        })
            .on('mouseout', function (d, e) {
                tooltip
                    .style("visibility", "hidden")
                    .style("z-index", "-1")
                document.getElementById("mds_tooltip").innerHTML = ""
                if (this.tooltip !== undefined) {
                    this.tooltip.style("opacity", 0)
                    this.tooltip.style("z-index", -1);
                }
            });


        const slice = pg
            .append("path")
            .attr("clicked", "false")
            .attr("id", d => { return ("p" + d.name) })
            .attr("d", d => { return pieSmall(d)() })
            .attr("opacity", 1)
            .style("stroke", "black")
            .style("stroke-width", "1.25px")
            .attr("fill", d => {
                return anomalyColor(d.anamoly)
            })
            .attr("transform", "translate(15," + 0 + ")")

        pg.on('click', async (e, t) => {
            let click = document.getElementById("p" + t.name)
            let clickState = click.getAttribute("clicked")

            if (clickState === "false") {
                let temp = cloneDeep([...this.props.mdsArr]);
                let mds_data
                for (let j = 0; j < this.props.finalArr.length; j++) {
                    if (this.props.finalArr[j].name === t.name) {
                        mds_data = this.props.finalArr[j]
                    }

                }
                temp.push(mds_data);
                await this.props.mds_assign(temp)

                d3.select("#" + "p" + t.name).attr("d", null)
                d3.select("#" + "p" + t.name).attr("d", d => { return pieBig(d)() })
                pg
                    .style("opacity", "1")

                d3.select("#g" + t.name)
                    .append("svg:circle")
                    .attr("r", d => { return (14 / 3) })
                    .style("fill", d => { return sentimentColor(d.sentiment) })
                    .attr("transform", "translate(15," + 0 + ")")

                var lines = d3.select("#g" + t.name)
                    .append("line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("y2", function (d) {
                        return Math.sin(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
                    })
                    .attr("x2", function (d) {
                        return Math.cos(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
                    })
                    .attr("stroke", "black")
                    .attr("transform", "translate(15," + 0 + ")")
                    .attr("stroke-width", 1)

                document.querySelector('#' + "p" + t.name).setAttribute("clicked", "true")
            }
            else {
                let parent = document.getElementById('g' + t.name)
                let temp = cloneDeep([...this.props.mdsArr]);
                let mds_data = []

                for (let j = 0; j < this.props.mdsArr.length; j++) {
                    if (this.props.mdsArr[j].name !== t.name) {
                        mds_data.push(this.props.mdsArr[j])
                    }
                }

                temp = mds_data;
                await this.props.mds_assign(temp)

                for (let i = 0; i < parent.childNodes.length; i++) {

                    if (parent.childNodes[i].tagName !== "path") {
                        parent.removeChild(parent.childNodes[i]);
                    }
                }
                parent.childNodes.forEach(c => {

                    if (c.tagName !== "path") {
                        parent.removeChild(c);
                    }
                })
                d3.select("#" + "p" + t.name).attr("d", null)
                d3.select("#" + "p" + t.name).attr("d", d => { return pieSmall(d)() })

                document.getElementById("p" + t.name).setAttribute("clicked", "false")

            }
        })

        function degToRad(degrees) {
            return degrees * Math.PI / 180;
        }

        function clockToRad(clock, direction) {
            var unit = 360 / 12;
            var degree = direction > 0 ? unit * clock : unit * clock - 360;
            return degToRad(degree);
        }
    }

    render() {

        return (
            <div>
                <div className='view_text'>
                    MDS View
                </div>
                <div className='ct1'>
                    <div className='svg-container'>
                        <svg id="my_svg" width={"100%"} height={"455px"}>
                            {/* SVG content */}
                        </svg>
                    </div>
                    <div id="mds_tooltip">
                        {/* Tooltip content */}
                    </div>
                </div>
            </div>

        )
    }
}

function mapStateToProps(state) {
    return {
        finalArr: state.reducer.finalArr,
        mdsArr: state.reducer.mdsArr
    }
}

function mapDispatchToProps(dispatch) {
    return {
        assign: (data) => {
            dispatch({ type: actionTypes.ASSIGN, data: data })
        },

        mds_assign: (data) => {
            dispatch({ type: actionTypes.MDS_ASSIGN, data: data })
        }
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MDS_view);
