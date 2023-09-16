// import axios from "axios";
import React from 'react';
import * as d3 from "d3";
import myData from './mds_mock.json';
import Papa from 'papaparse'
// import { useSelector, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
// import { decrement } from './redux/reducers/reducerSlice'
import * as actionTypes from './redux/actions/actionType'
import cloneDeep from 'clone-deep'


// let csr = Papa.parse(".data/final_topic.csv")
// let csr_tweets = Papa.parse(".data/final_topic_all.csv")
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
            start_time:
            end_time:
        },
        "2": {},
        "anomaly1" // keep id as combo as key and add topicid at end
    }

*/


class MDS_view extends React.Component {

    // constructor(props) {
    //     super(props)

    // }


    data = []


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

    async componentDidUpdate() {
        // console.log("updated", this.props.finalArr)
        // this.componentDidMount()
        // this.data = [...this.props.finalArr]
        // this.setState({ data: this.props.finalArr })sdf
        // this.forceUpdate()
    }

    async componentDidMount() {
        document.getElementById("my_svg").innerHTML = ""
        let dataFetches = [
            d3.json('./data/datum/new/mds_view_data.json'),
            // d3.json('./data/datum/full_tweets_data.json'),
            // d3.json('./data/datum/cluster_view_data.json')
        ];

        let mds_data = (await Promise.all(dataFetches).then())[0]// [...this.props.finalArr];//(await Promise.all(dataFetches).then())[0]
        // const count = useSelector((state) => state.reducer.finalArr)
        // const dispatch = useDispatch()


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

        // var anomalyColor = d3.scaleLinear()
        //     .domain([0, 0.5, 0.625, 0.75, 1])
        //     .range(["darkorchid", "peru", "darkturquoise", "azure", "darksalmon", "grey"]);

        var sentimentColor = d3.scaleLinear()
            .domain([0, 0.05, 0.5, 0.625, 0.75, 1])
            .range(["darkgreen", "orangered", "darkgoldenrod", "slateblue", "dodgerblue", "orange"]);
        /*
, "darkgreen", "pink", "brown", "slateblue",
            "beige", "orange", "bisque", "burlywood", "cadetblue", "chocolate", "aquamarine", "chartreuse", "deepskyblue", "cornflowerblue",
            "cyan", "darkgoldenrod", "darkseagreen", "deeppink"
        */
        // console.log(this.myRef)

        var margin = { top: 10, right: 20, bottom: 30, left: 20 },
            // width = 310 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var svg = d3.select("#my_svg")
            .append("svg")
            .attr("width", "100%")// width + margin.left + margin.right)
            // .attr("height", "auto")//height + margin.top + margin.bottom)
            .attr("height", "455px")
            .append("g")
            .attr("transform",
                "translate(" + (margin.left) + "," + (margin.top + 25) + ")");



        // console.log(o[1][12], o[1][13])
        let x_arr = [], y_arr = [], data = []
        for (let i = 0; i < o.length; i++) {
            x_arr.push(parseFloat(parseFloat(o[i][12]).toFixed(2)))
            y_arr.push(parseFloat(parseFloat(o[i][13]).toFixed(2)))
            // console.log(o[i][1])
            let temp = {
                x: parseFloat(parseFloat(o[i][12]).toFixed(2)),
                y: parseFloat(parseFloat(o[i][13]).toFixed(2)),
                r: await this.normalization(this.getRandomInt(1000), 900, 1000), //this.getRandomInt(1000)
                anamoly: o[i][6],
                sentiment: tweets_flux[i][10],
                id: 'a' + o[i][1]

            }
            // let scores =
            data.push(temp)
            // console.log(temp)
        }

        data = []
        // data = mds_data;
        // mds_data = []
        // console.log(data, mds_data)
        for (let i = 0; i < mds_data.length; i++) {

            if (!data.find(x => x.name === mds_data[i]["name"])) {
                mds_data[i]["name"] = mds_data[i]["name"].replace(/[^a-z0-9-]/g, "")
                data.push(mds_data[i]);
            }
        }
        // var x_min = Math.min.apply(null, x_arr),
        //     x_max = Math.max.apply(null, x_arr),
        //     y_min = Math.min.apply(null, y_arr),
        //     y_max = Math.max.apply(null, y_arr);


        var x = d3.scaleLinear()
            .domain([-1.6, 0.5])
            .range([0, 250])
        // .ticks(0.5);

        svg.append("g")
            .attr("transform", "translate(15," + height + ")")
            //.ticks(5)//.tickFormat()
            .call(d3.axisBottom(x)
                .tickValues([-1.6, -1, -0.5, 0, 0.5]));

        // svg.append("text")
        //     .attr("class", "x label")
        //     .attr("text-anchor", "end")
        //     .attr("x", 220)
        //     .attr("y", height + 35)

        //     // .attr("transform", "translate(0," + height + ")")
        //     .text("Principal component 1");


        // Add Y axis
        var y = d3.scaleLinear()
            .domain([-1.5, 2])
            .range([height, 0]);

        svg.append("g")
            .attr("transform", "translate(15," + 0 + ")")
            .call(d3.axisLeft(y))
            ;

        // svg.append("text")
        //     .attr("class", "y label")
        //     .attr("text-anchor", "end")
        //     .attr("y", 6)
        //     .attr("dy", "-1.3em")
        //     // .style("font-size", "17px")
        //     .attr("transform", " translate(0," + ((height - 175) / 2) + ") rotate(-90)")
        //     .text("Principal component 2");

        // Add a scale for bubble size
        var z = d3.scaleLinear()
            .domain([0, 10])
            .range([1, 10]);

        // let json_data = this.state.data;
        // let outerRadius = await this.normalization(json_data.user_volume, 1000, 500) * 100;
        // let inner_circle_radius = outerRadius / 10;

        this.data = data;

        // if (data.length) {sdfdfasdasdfasddfsdfsdfasdsdfasdasdasdasd asdasdasd    asdasd
        // { (() => this.props.assign(data))() }asd asdasdasdaasdsd sdasdfasd
        // try {
        await this.props.assign(data)
        // await this.props.assign(data)
        // }
        // catch (e) {

        // }

        // }

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


        // let pie = d => d3.arc()
        //     .innerRadius(0)
        //     .outerRadius(() => { return z(d.user_volume) })
        //     .startAngle(d.pie.startAngle)
        //     .endAngle(d.pie.endAngle)

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
                return temp//this.data//cloneDeep([...this.props.finalArr])
            })
            .join("g")
            .attr("class", "pie")
            .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`)
        // .call(g => g.append("text")
        //     .attr("dy", "1em")
        //     .attr("text-anchor", "middle")
        //     .attr("transform", d => `translate(0, ${ z(d.r)})`)
        // );
        const pg = g.selectAll("g")
            .enter()
            .data(d => {
                // console.log(d.sentiment)
                d['values'] = [Math.random(2)]
                // d['p'] = d.x;
                // d['total'] = this.getRandomInt(2);
                // d['anamoly'] = d.anamoly
                // d['r'] = d.r
                // console.log(d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))[0])
                // temp.push(d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))[0])
                // console.log(d3.pie()(d.values).map(p => ({ pie: p, total: d.total })))
                // console.log(d.r)
                return d3.pie()(d.values).map(p => ({
                    pie: p, r: d.user_volume, anamoly: d.anamoly, sentiment: d.sentiment, name: d.name, start_time: new Date(d.start_time),
                    end_time: new Date(d.end_time)
                }))
            })

            .join("g")
            .attr("id", d => ('g' + d.name))



        //await this.normalization(3, 1000, 500) * 100
        // console.log(temp.length, temp[1])
        // create a tooltip
        var tooltip = d3.select("#mds_tooltip")
            // .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("z-index", "-1")
        // .text("I'm a circle!")

        pg.on("mousemove", function (d, e) {
            var matrix = this.getScreenCTM()
                .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));


            tooltip.html((y, data) => {
                // console.log(e, y, data, this.d);
                return `<div style="margin: 5px">Anomaly ratio: <strong> ${e.anamoly.toFixed(2)} </strong></div>
                        <div style="margin: 5px">Sentiment Score: <strong> ${e.sentiment.toFixed(2)} </strong></div>
                        <div style="margin: 5px">Start time: <strong> ${e.start_time.getHours()}H:${e.start_time.getMinutes()}M:${e.start_time.getSeconds()}S </strong></div>
                        <div style="margin: 5px">End time: <strong> ${e.end_time.getHours()}H:${e.end_time.getMinutes()}M:${e.end_time.getSeconds()}S </strong></div>`;
            })
                .style("visibility", "visible")
                .style("z-index", "100")
                .style("left", (window.pageXOffset + matrix.e + 15) + "px")
                .style("top", (window.pageYOffset + matrix.f - 30) + "px");
            // .text((d) => { console.log(d, e); return e.sentiment });
        })
            .on('mouseout', function (d, e) {
                tooltip//.html(d)
                    .style("visibility", "hidden")
                    .style("z-index", "-1")
                document.getElementById("mds_tooltip").innerHTML = ""
                if (this.tooltip !== undefined) {
                    this.tooltip.style("opacity", 0)
                    this.tooltip.style("z-index", -1);
                }
                // .style("left", (window.pageXOffset + matrix.e + 15) + "px")
                // .style("top", (window.pageYOffset + matrix.f - 30) + "px")
                // .text((d) => { console.log(d, e); return e.sentiment });
            });


        // const slice = pg
        //     // .data()
        //     // .data(d => {
        //     //     // console.log(d)
        //     //     d['values'] = [Math.random(2)]
        //     //     d['p'] = d.x;
        //     //     d['total'] = this.getRandomInt(2);
        //     //     d['ir'] = d.r / 10

        //     //     // console.log(d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))[0])
        //     //     // temp.push(d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))[0])
        //     //     // console.log(d3.pie()(d.values).map(p => ({ pie: p, total: d.total })))
        //     //     return d3.pie()(d.values).map(p => ({ pie: p, r: d.r }))
        //     // })
        //     // .enter()
        //     .append("path")
        //     .attr("clicked", "false")
        //     .attr("id", d => { return ("p" + d.name) })
        //     .attr("d", d => { return pieSmall(d)() })
        //     .attr("opacity", 1)
        //     .style("stroke", "black")
        //     .style("stroke-width", "1.25px")
        //     .attr("fill", d => {
        //         return anomalyColor(d.anamoly)
        //     })
        //     .attr("transform", "translate(15," + 0 + ")")





        pg.on('click', async (e, t) => {

            // let temp = pg.selectAll("#g" + t.name)
            // temp
            //     .attr("fill", "red")
            //     .style("opacity", "0.5")
            // if (document.getElementById("p" + t.name).getAttribute("clicked")) { }


            let click = document.getElementById("p" + t.name)//document.getElementById('clicked');
            // var select = document.querySelector('#' + "p" + t.name)
            // console.log(select.getAttribute("clicked"))

            let clickState = click.getAttribute("clicked")
            // console.log(clickState, document.getElementById("p" + t.name).getAttribute("clicked"), document.getElementById("p" + t.name))
            if (clickState === "false") {
                // document.getElementById("p" + t.name).setAttribute("clicked", "true")


                let temp = cloneDeep([...this.props.mdsArr]);
                // console.log(t)
                let mds_data
                for (let j = 0; j < this.props.finalArr.length; j++) {

                    if (this.props.finalArr[j].name === t.name) {
                        mds_data = this.props.finalArr[j]
                    }

                }
                // console.log(mds_data)
                temp.push(mds_data);
                await this.props.mds_assign(temp)


                d3.select("#" + "p" + t.name).attr("d", null)
                d3.select("#" + "p" + t.name).attr("d", d => { return pieBig(d)() })

                pg//.select("#" + t.name)
                    .style("opacity", "1")

                d3.select("#g" + t.name)
                    .append("svg:circle")
                    // .attr("cx", transform_x)
                    // .attr("cy", transform_y)
                    .attr("r", d => { return (14 / 3) })
                    .style("fill", d => { return sentimentColor(d.sentiment) })
                    .attr("transform", "translate(15," + 0 + ")")
                // .attr("opacity", 1)
                // .style("stroke", "black")

                // var lines = d3.select("#g" + t.name)
                //     .append("line")
                //     .attr("x1", 0)
                //     .attr("y1", 0)
                //     .attr("y2", function (d) {
                //         // d['start_time'] = new Date("2012-05-24T18:25:43.511Z")
                //         return Math.sin(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
                //     })
                //     .attr("x2", function (d) {
                //         // d['start_time'] = new Date("2012-05-24T18:25:43.511Z")
                //         return Math.cos(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
                //     })
                //     .attr("stroke", "black")
                //     .attr("transform", "translate(15," + 0 + ")")
                //     .attr("stroke-width", 1)  // .attr("transform", `translate(${ transform_x }, ${ transform_y })`);

                // lines = d3.select("#g" + t.name)//.selectAll(null)
                //     //.data(pie([json_data]))
                //     //.enter()
                //     .append("line")
                //     .attr("x1", 0)
                //     .attr("y1", 0)
                //     .attr("y2", function (d) {
                //         // console.log(d)
                //         // d["end_time"] = new Date("2012-05-24T23:25:43.511Z")
                //         // console.log(d.end_time.getHours(), d.start_time.getHours())
                //         return Math.sin(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                //     })
                //     .attr("x2", function (d) {
                //         // d["end_time"] = new Date("2012-05-24T23:25:43.511Z")
                //         return Math.cos(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                //     })
                //     .attr("stroke", "black")
                //     .attr("transform", "translate(15," + 0 + ")")
                //     .attr("stroke-width", 1)

                // click.setAttribute("clicked", "true")
                // select.setAttribute("clicked", "true")
                document.querySelector('#' + "p" + t.name).setAttribute("clicked", "true")

                // console.log(click.getAttribute("clicked"), document.getElementById("p" + t.name).getAttribute("clicked"))
                // .attr("transform", `translate(${ transform_x }, ${ transform_y })`);
            }
            else {

                let parent = document.getElementById('g' + t.name)//.innerHTML = ""


                let temp = cloneDeep([...this.props.mdsArr]);

                let mds_data = []

                for (let j = 0; j < this.props.mdsArr.length; j++) {
                    if (this.props.mdsArr[j].name !== t.name) {
                        mds_data.push(this.props.mdsArr[j])
                    }
                }

                // let temp = cloneDeep([...this.props.mdsArr]);
                // temp.push(t);
                // let temp2 = []
                // for (let i = 0; i < temp.length; i++) {
                //     if (temp[i].name != t.name) {
                //         temp2.push(temp[i])
                //     }
                // }
                // console.log(mds_data)
                temp = mds_data;
                // console.log(temp)
                await this.props.mds_assign(temp)


                // await this.props.mds_assign(temp2)

                for (let i = 0; i < parent.childNodes.length; i++) {

                    if (parent.childNodes[i].tagName !== "path") {
                        parent.removeChild(parent.childNodes[i]);
                    }
                }
                parent.childNodes.forEach(c => {

                    if (c.tagName !== "path") {
                        // console.log(c.tagName)
                        parent.removeChild(c);
                    }
                })
                d3.select("#" + "p" + t.name).attr("d", null)
                d3.select("#" + "p" + t.name).attr("d", d => { return pieSmall(d)() })

                document.getElementById("p" + t.name).setAttribute("clicked", "false")

            }
        })



        // pg
        //     .style("opacity", "0.5")
        //     .append("svg:circle")
        //     // .attr("cx", transform_x)
        //     // .attr("cy", transform_y)
        //     .attr("r", d => { return (d.r / 3) })
        //     .style("fill", d => sentimentColor(d.sentiment))
        //     .attr("opacity", 1)


        // var tickLength = 10;
        // var circleDegree = 360;


        // function degToRad(degrees) {
        //     return degrees * Math.PI / 180;
        // }

        // function getCoordFromCircle(deg, cx, cy, r) {
        //     var rad = degToRad(deg);
        //     var x = cx + r * Math.cos(rad);
        //     var y = cy + r * Math.sin(rad);
        //     return [x, y];
        // }

        // function splitDegrees(num) {
        //     var angle = circleDegree / num;
        //     var degrees = [];

        //     for (var ang = 0; ang < circleDegree; ang += angle) {
        //         degrees.push(ang);
        //     }

        //     return degrees;
        // }

        // function clockToRad(clock, direction) {
        //     var unit = 360 / 12;
        //     var degree = direction > 0 ? unit * clock : unit * clock - 360;
        //     return degToRad(degree);
        // }
    }

    render() {

        return (
            <div>
                <div className='view_text'>
                    MDS Views
                </div>
                <div className='ct1'>
                    <div className='svg-container'>
                        <svg id="my_svg" width={"100%"} height={"455px"}>
                            {/* Your SVG content goes here */}
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
        // dispatching plain actions
        // increment: () => dispatch({ type: 'INCREMENT' }),
        assign: (data) => {
            dispatch({ type: actionTypes.ASSIGN, data: data })
        },

        mds_assign: (data) => {
            dispatch({ type: actionTypes.MDS_ASSIGN, data: data })
        },

        // reset: () => dispatch({ type: 'RESET' }),
    }
};


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MDS_view);
