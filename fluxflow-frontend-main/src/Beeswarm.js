import React from 'react';
import * as d3 from "d3";
import Papa from 'papaparse'
import { connect } from 'react-redux'
import * as actionTypes from './redux/actions/actionType'
import cloneDeep from 'clone-deep'
import './App.css';
/*

date = created at
category = name
thread size = length


*/

class BeeSwarm extends React.Component {

    // constructor(props) {
    //     super(props)
    // }

    width = 930;
    height = 720;
    margin = [200, 60, 50, 100];
    svg;
    tooltip;
    zoom;
    axis;
    topAxis;
    data = [];
    timedata = []
    DELAY_TIME = 3000;
    state = {
        tooltip: ""
    }
    beeSwarmChart = [];

    async componentDidUpdate() {
        document.getElementById("svg-container-1").innerHTML = ""
        let fullTweets = cloneDeep([...this.props.fullTweets])
        // console.log(fullTweets[0])
        fullTweets = fullTweets[0]
        let beeSwarmChart = [];
        for (let i = 0; i < this.props.mdsArr.length; i++) {
            let childrens = this.props.mdsArr[i].childrens;
            // console.log(childrens)
            for (let j = 0; j < childrens.length; j++) {

                let temp_tweets = {
                    "id": childrens[j],
                    "date": new Date(fullTweets[childrens[j]].created_at),//"2009-06-01T13:06:17.000Z",
                    "sentiment": fullTweets[childrens[j]].sentiment_score,// -0.4941451065043396,
                    "category": this.props.mdsArr[i].name,
                    "thread_size": fullTweets[childrens[j]].followers_count,
                    "start_time": this.props.mdsArr[i].start_time,
                    "end_time": this.props.mdsArr[i].end_time
                }
                beeSwarmChart.push(temp_tweets)

                // if (childrens[j] === this.props.mdsArr[i].name) {
                //     mds_data.push(childrens[j])
                // }

            }
            // console.log(this.props.mdsArr[i], mds_data)
        }
        // console.log(beeSwarmChart)
        this.beeSwarmChart = beeSwarmChart;
        this.componentDidMount()
        // let beeSwarmChart = [];
        /*
            {
                "id": 1990953734,
                "date": "2009-06-01T13:06:17.000Z",
                "sentiment": -0.4941451065043396,
                "category": "Category_1",
                "thread_size": 7,
                "index": 0,
                "x": 455.26411979219955,
                "y": 530.6584746438754,
                "vy": 0.10042579721943727,
                "vx": -0.023430574714165892
            }
        */
        // for (let i = 0; i < mds_data.length; i++) {
        //     // console.log(mds_data[i].childrens)
        //     for (let j = 0; j < mds_data[i].childrens.length; j++) {

        //     }
        // }
        // console.log(this.props.fullTweets, this.props.mdsArr)
        // for(let i=0; i<this.pr)

    }
    async componentDidMount() {

        this.data = await new Promise((resolve, reject) => {
            Papa.parse("/data/beeswarm/sampled_data.csv", {
                download: true,
                dynamicTyping: true,
                complete: function (results) {
                    resolve(results.data)
                    // return results
                }
            });
        })
        // this.data = this.data.slice(1, -1);
        this.data = this.beeSwarmChart //this.data.slice(1, -1);

        // console.log(this.data)
        document.getElementById("svg-container-1").innerHTML = ""
        this.svg = d3
            .select("#svg-container-1")
            .append("svg")
            .attr("height", this.height)
            .attr("width", this.width);

        this.tooltip = await d3
            .select("#svg-container-1")
            .append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);
        await this.drawBeeswarmChart(this.beeSwarmChart);
    }

    async drawBeeswarmChart(data) {
        if (data.length === 0) {
            return
        }

        for (let i = 0; i < this.data.length; i++) {
            // console.log(this.data[i].date)
            // this.timedata.push(new Date(this.data[i][1]))
            this.timedata.push(new Date(this.data[i].date))//this.timedata.push(new Date(this.data[i][1]))
            // let temp = {
            //     id: this.data[i][0],
            //     date: new Date(this.data[i][1]),
            //     sentiment: this.data[i][2],
            //     category: this.data[i][3],
            //     // category: this.data[3],
            //     thread_size: this.data[i][4]
            // }
            // console.log(temp)
            // this.data[i] = temp;
            // console.log(this.data[i])
        }

        this.data = this.beeSwarmChart

        let categories = Array.from(new Set(this.data.map((d) => d.category)))

        let maxDate = new Date(Math.max(...this.timedata));
        const minDate = new Date(Math.min(...this.timedata));

        // maxDate = new Date(maxDate); //.setMonth(maxDate.getMonth() + 1)
        let xScale = d3
            .scaleTime()
            .domain([new Date(minDate), new Date(maxDate)])
            .range([this.margin[3], this.width - this.margin[1]]);

        let yScale = d3
            .scaleBand()
            .domain(categories)
            .range([this.height - this.margin[2], this.margin[0]]);

        var color = d3.scaleSequential().domain([-1.0, 1.0]).interpolator(d3.interpolateReds);

        let thread_size = d3.extent(data.map((d) => +d["thread_size"]));
        let size = d3.scaleSqrt().domain(thread_size).range([3, 20]);

        var z = d3.scaleLinear()
            .domain([0, 10])
            .range([1, 10]);

        // let pieBig = d => d3.arc()
        //     .innerRadius(0)
        //     .outerRadius(() => { return z(14) })
        //     .startAngle(0)
        //     .endAngle(360)

        var anomalyColor = d3.scaleLinear()
            .domain([0, 0.5, 0.625, 0.75, 1])
            .range(["darkorchid", "peru", "darkturquoise", "azure", "darksalmon", "grey"]);
        var sentimentColor = d3.scaleLinear()
            .domain([0, 0.05, 0.5, 0.625, 0.75, 1])
            .range(["darkgreen", "orangered", "darkgoldenrod", "slateblue", "dodgerblue", "orange"]);

        let pieSmall = d => d3.arc()
            .innerRadius(0)
            .outerRadius(() => { return z(5) })
            .startAngle(360)
            .endAngle(0)

        let y = this.svg
            .append("g")
            .attr("id", "glyphBee")
            .selectAll(".lines")
        // .data(() => { console.log(this.props.mdsArr.length); return cloneDeep([...this.props.mdsArr]) })
        // .enter()

        y.data(() => {
            return cloneDeep([...this.props.mdsArr])
        })
            .enter()
            .append("circle")

            // .attr("r", 7)
            // .style("fill", "#69b3a2")
            // .attr("stroke", "black")
            // .style("stroke-width", 3)
            // .attr("transform", function (d) {
            //     return `translate(${43},${yScale(d.category)})`
            // })
            // .append("svg:circle")
            // .attr("cx", transform_x)
            // .attr("cy", transform_y)
            .attr("r", d => { return (14 / 1) })
            .style("stroke", "black")
            .style("stroke-width", "1.25px")
            .style("fill", d => { return anomalyColor(d.anamoly) })
            .attr("opacity", 1)
            .attr("transform", function (d) {
                return `translate(${35},${yScale(d.name)})`
            })
        y.data(() => {
            return cloneDeep([...this.props.mdsArr])
        })
            .enter().append("path")
            .attr("clicked", "false")
            // .attr("id", d => { return ("p" + d.name) })
            .attr("d", d => { return pieSmall(d)() })
            .attr("opacity", 1)
            .attr("fill", d => sentimentColor(d.sentiment))
            .attr("transform", function (d) {
                return `translate(${35},${yScale(d.name)})`
            })


        y.select("#glyphBee")

            // .enter()
            // .data([0, 1, 2])
            .data(() => {
                return cloneDeep([...this.props.mdsArr])
            })
            .enter()
            // .append("svg")
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("y2", function (d) {
                d['start_time'] = new Date(d.start_time)
                return Math.sin(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
            })
            .attr("x2", function (d) {
                d['start_time'] = new Date(d.start_time)
                return Math.cos(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)  // .attr("transform", `translate(${transform_x},${transform_y})`);
            .attr("transform", function (d) {
                return `translate(${35},${yScale(d.name)})`
            })

        y.select("#glyphBee")

            // .enter()
            // .data([0, 1, 2])
            .data(() => {
                return cloneDeep([...this.props.mdsArr])
            })
            .enter()

            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("y2", function (d) {

                d["end_time"] = new Date(d.end_time)//new Date("2012-05-24T23:25:43.511Z")

                return Math.sin(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                // }
            })
            .attr("x2", function (d) {

                d["end_time"] = new Date(d.end_time)//new Date("2012-05-24T23:25:43.511Z")
                return Math.cos(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                // }
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("transform", function (d) {
                return `translate(${35},${yScale(d.name)})`
            })


        function degToRad(degrees) {
            return degrees * Math.PI / 180;
        }

        function clockToRad(clock, direction) {
            var unit = 360 / 12;
            var degree = direction > 0 ? unit * clock : unit * clock - 360;
            return degToRad(degree);
        }
        this.svg
            .append("g")

            .attr("class", "line-g")
            .selectAll(".lines")
            .data((d) => {
                return data
            })
            .enter()
            .append("line")
            .attr("class", "lines")
            .attr("x1", 50)
            .attr("y1", (d) => yScale(d.category))
            .attr("x2", 1e100)
            .attr("y2", (d) => yScale(d.category));

        this.svg
            .append("g")
            .attr("class", "circle-g")
            .selectAll(".circ")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "circ")
            .attr("stroke", "black")
            .attr("fill", (d) => color(d.sentiment))
            .attr("r", (d) => size(d["thread_size"]))
            .attr("cx", (d) => { return xScale(d.date) })
            .attr("cy", (d) => yScale(d.category));

        this.topAxis = d3.axisBottom(xScale);

        this.axis = this.svg
            .append("g")
            .attr("transform", "translate(0," + this.margin[0] / 4 + ")")
            .call(this.topAxis);

        let simulation = d3
            .forceSimulation(data)
            .force(
                "x",
                d3
                    .forceX((d) => {
                        return xScale(d.date);
                    })
                    .strength(0.2)
            )
            .force(
                "y",
                d3
                    .forceY((d) => {
                        return yScale(d.category);
                    })
                    .strength(1)
            )
            .force(
                "collide",
                d3.forceCollide((d) => {
                    return size(d["thread_size"]);
                })
            )
            .alphaDecay(0)
            .alpha(0.3)
            .on("tick", tick);

        function tick() {
            d3.selectAll(".circ")
                .attr("cx", (d) => { return d.x })
                .attr("cy", (d) => d.y)
                .attr("transform", "translate(0,0)")
        }

        setTimeout(function () {
            // console.log("start alpha decay");
            simulation.alphaDecay(0.1);
        }, this.DELAY_TIME);

        this.createToolTip();
        this.createZoom(xScale);

    }


    async createToolTip() {
        d3.selectAll(".circ")
            .on("mousemove", function (event, val) {
                const thread_size = val["thread_size"];
                const date = val["date"];
                const displayDate = date.toLocaleString();
                const score = parseFloat(val["sentiment"]).toFixed(2);
                this.tooltip = d3.select("#tooltip");
                this.tooltip
                    .html(
                        `<div className="tooltip_margin" style="margin: 5px">Number of Followers: <strong>${thread_size}</strong></div>` +
                        `<div className="tooltip_margin" style="margin: 5px">Tweet Date: <strong>${displayDate}</strong></div>` +
                        `<div className="tooltip_margin" style="margin: 5px">Sentiment Score: <strong>${score}</strong></div>` +
                        `<div className="tooltip_margin" style="margin: 5px">Tweet ID: <strong>${val.id}</strong></div>`
                    )
                    .style("top", event.pageY - 12 + "px")
                    .style("left", event.pageX + 25 + "px")
                    .style("opacity", 0.9)
                    .style("z-index", 100);
            })
            .on("mouseout", function () {
                document.getElementById("tooltip").innerHTML = "";
                if (this.tooltip !== undefined) {
                    this.tooltip.style("opacity", 0);
                    this.tooltip.style("z-index", -1);
                }
            });
    }


    createZoom(xScale) {
        this.zoom = d3.zoom().scaleExtent([1, 1]).on("zoom", handleZoom);

        function handleZoom(e) {
            const transform = e.transform;
            const xNewScale = transform.rescaleX(xScale);
            transform.y = 0;
            console.log(transform);
            const lines = d3.selectAll(".line-g");
            lines.attr("transform", transform);
            const circles = d3.selectAll(".circle-g");
            circles.attr("transform", transform);
            this.svg.call(this.topAxis.scale(xNewScale));
        }

        d3.select("#svg-container-1 svg").call(this.zoom);
    }



    render() {

        return (
            <>
                <div className='view_text'>
                    Tweet View
                </div>

                <div className="col-sm-12 svg-container-1 d-flex justify-content-center align-items-center" id="svg-container-1">


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
        // dispatching plain actions
        // increment: () => dispatch({ type: 'INCREMENT' }),
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
        // reset: () => dispatch({ type: 'RESET' }),
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps

)(BeeSwarm);
