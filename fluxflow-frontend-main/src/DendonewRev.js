import React from 'react';
import * as d3 from "d3";
// import Papa from 'papaparse'
// import myData from '/data/HeatMap/changed.csv';
import axios from "axios";
import treeData from './second'
import Circle from './circle';
import { action, connect } from 'react-redux'
// import { decrement } from './redux/reducers/reducerSlice'
import * as actionTypes from './redux/actions/actionType'
import cloneDeep from 'clone-deep'


class DendoNewRev extends React.Component {

    dataFetches; data;
    constructor(props) {
        super(props)
        this.state = {
            items: props.items
        }

    }
    data = []

    async componentDidUpdate(items) {
        // this.setState({ items })
        // document.getElementById("dendogramNew").innerHTML = ""
        // await this.componentDidMount();
        var z = d3.scaleLinear()
            .domain([0, 10])
            .range([1, 10]);
        let pieSmall = d => d3.arc()
            .innerRadius(0)
            .outerRadius(() => { return z(7) })
            .startAngle(0)
            .endAngle(360)
        for (let i = 0; i < this.props.finalArr.length; i++) {

            let test1 = this.props.mdsArr.some(el => el.name === this.props.finalArr[i].name);
            if (test1) continue
            // console.log("after continue")
            let parent = document.getElementById("h" + this.props.finalArr[i].name)
            let test = document.querySelectorAll(`[id=${"h" + this.props.finalArr[i].name}]`);
            for (let j = 0; j < test.length; j++) {
                parent = test[j]

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
            }

            // console.log(this.props.finalArr[i].name)
            d3.selectAll("#z" + this.props.finalArr[i].name).attr("d", null)
            d3.selectAll("#z" + this.props.finalArr[i].name).attr("d", d => { return pieSmall(d)() })
        }

        // d3.selectAll("#z" + t.data.name).attr("d", null)
        // d3.selectAll("#z" + t.data.name).attr("d", d => { return pieSmall(d)() })



        let pieBig = d => d3.arc()
            .innerRadius(0)
            .outerRadius(() => { return z(14) })
            .startAngle(0)
            .endAngle(360)

        var sentimentColor = d3.scaleLinear()
            .domain([0, 0.05, 0.5, 0.625, 0.75, 1])
            .range(["darkgreen", "orangered", "darkgoldenrod", "slateblue", "dodgerblue", "orange"]);
        let temp = cloneDeep([...this.props.mdsArr])
        for (let i = 0; i < temp.length; i++) {
            // console.log(temp[i])
            let clickState;
            try {
                clickState = document.getElementById('p' + temp[i].name).getAttribute("clicked")
            }
            catch (e) {
                continue
            }
            // console.log(clickState)
            if (clickState == "false") {
                d3.selectAll("#z" + temp[i].name).attr("d", null)
                d3.selectAll("#z" + temp[i].name).attr("d", d => { return pieBig(d)() })
                // document.getElementById('z' + temp[i].name).setAttribute("clicked", "true")

                d3.selectAll("#h" + temp[i].name)
                    .append("svg:circle")
                    // .attr("cx", transform_x)
                    // .attr("cy", transform_y)
                    .attr("r", d => { return (14 / 3) })
                    .style("fill", d => { return sentimentColor(d.data.glyph.sentiment) })
                    .attr("opacity", 1)

                var lines = d3.selectAll("#h" + temp[i].name)
                    .append("line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("y2", function (d) {
                        if (d.data) {
                            d['start_time'] = new Date(d.data.glyph.start_time)//new Date("2012-05-24T18:25:43.511Z")
                            return Math.sin(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
                        }
                    })
                    .attr("x2", function (d) {
                        if (d.data) {
                            d['start_time'] = new Date(d.data.glyph.start_time)//new Date("2012-05-24T18:25:43.511Z")
                            return Math.cos(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
                        }
                    })
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)  // .attr("transform", `translate(${transform_x},${transform_y})`);

                d3.selectAll("#h" + temp[i].name)//.selectAll(null)
                    .append("line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("y2", function (d) {
                        if (d.data) {
                            d["end_time"] = new Date(d.data.glyph.end_time)//new Date("2012-05-24T23:25:43.511Z")
                            // console.log(d.end_time.getHours(), d.start_time.getHours())
                            return Math.sin(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                        }
                    })
                    .attr("x2", function (d) {
                        if (d.data) {
                            d["end_time"] = new Date(d.data.glyph.end_time)//new Date("2012-05-24T23:25:43.511Z")
                            return Math.cos(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                        }
                    })
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
            }
        };

        function degToRad(degrees) {
            return degrees * Math.PI / 180;
        }

        function clockToRad(clock, direction) {
            var unit = 360 / 12;
            var degree = direction > 0 ? unit * clock : unit * clock - 360;
            return degToRad(degree);
        }
    }


    async componentDidMount(items) {

        // document.getElementById("dendogramNew").innerHTML = ""
        // this.props.cluster_assign([])
        // set the dimensions and margins of the graph
        // var dataFetches = [
        //     d3.json('./data/datum/mds_view_data.json'),
        //     // d3.json('./data/datum/full_tweets_data.json'),
        //     // d3.json('./data/datum/cluster_view_data.json')
        // ];
        var width = 350
        var height = 727
        // append the svg object to the body of the page
        var svg = d3.select("#dendogramNew")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr("transform", "translate(20,0)");  // bit of margin on the left = 40

        let dataFetches = [
            // d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_dendrogram.json'),
            // d3.json('./data/datum/mds_view_data.json'),
            // d3.json('./data/datum/full_tweets_data.json'),
            d3.json('./data/datum/new/cluster_view_data.json')
            // d3.csv('./data/extensionData/location_tweets.csv')

        ];
        Promise.all(dataFetches).then((data) => {
            // console.log(data[1].children)
            data = data[0]
            let mds_data = data
            let data1 = []
            // console.log(data, mds_data)
            // for (let i = 0; i < mds_data.length; i++) {

            //     if (!data1.find(x => x.name === mds_data[i]["name"])) {
            //         mds_data[i]["name"] = mds_data[i]["name"].replace(/[^a-z0-9-]/g, "")
            //         data1.push(mds_data[i]);
            //     }
            // }
            data = data
            this.props.cluster_assign([data])

            // Create the cluster layout:
            var cluster = d3.cluster()
                .size([height, width - 100]);

            // Give the data to this cluster layout:
            var root = d3.hierarchy(this.props.clusterArr[0], function (d) {
                return d.children;
            });

            cluster(root);
            var anomalyColor = d3.scaleLinear()
                .domain([0, 0.5, 0.625, 0.75, 1])
                .range(["darkorchid", "peru", "darkturquoise", "azure", "darksalmon", "grey"]);
            var sentimentColor = d3.scaleLinear()
                .domain([0, 0.05, 0.5, 0.625, 0.75, 1])
                .range(["darkgreen", "orangered", "darkgoldenrod", "slateblue", "dodgerblue", "orange"]);

            // Add the links between nodes:
            svg.selectAll('path')
                .data(root.descendants().slice(1))
                .enter()
                .append('path')
                .attr("d", function (d) {
                    return "M" + d.y + "," + d.x
                        + "C" + (d.parent.y + 20) + "," + d.x
                        + " " + (d.parent.y + 30) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
                        + " " + d.parent.y + "," + d.parent.x;
                })
                .style("fill", 'none')
                .attr("stroke", (d) => {
                    return anomalyColor(1 - d.data.glyph.anamoly)
                })
                // .style("stroke", "black")
                .style("stroke-width", "1.5px")
            var z = d3.scaleLinear()
                .domain([0, 10])
                .range([1, 10]);

            let pieBig = d => d3.arc()
                .innerRadius(0)
                .outerRadius(() => { return z(14) })
                .startAngle(0)
                .endAngle(360)

            let pieSmall = d => d3.arc()
                .innerRadius(0)
                .outerRadius(() => { return z(7) })
                .startAngle(0)
                .endAngle(360)

            // Add a circle for each node.
            const pd = svg.selectAll('g')
                .data(() => { return root.descendants() })
                .enter()
                .append('g')
                .attr('id', (d) => { return ("h" + d.data.name) })

                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")"
                })
                .append("path")
                .attr('id', (d) => { return 'z' + d.data.name })
                .attr("clicked", "false")
            // .attr("id", d => { return ("p" + d.id) })
            pd
                .attr("d", d => {
                    // return (d) => {
                    d['values'] = [Math.random(2)]
                    let t = d3.pie()(d.values).map(p => ({ p }))
                    // d['[oe']
                    return pieSmall(t)()
                    // }
                })
                // .join("h")
                .attr("fill", d => {
                    // console.log(d.data.glyph.anamoly, anomalyColor(d.data.glyph.anamoly));
                    return anomalyColor(d.data.glyph.anamoly)
                })
                .style("stroke", "black")
                .style("stroke-width", "1.25px")
                .on('click', function (e, t) {
                    let clickState = document.getElementById('z' + t.data.name).getAttribute("clicked")
                    if (clickState == "false") {
                        d3.selectAll("#z" + t.data.name).attr("d", null)
                        d3.selectAll("#z" + t.data.name).attr("d", d => {
                            return pieBig(d)()
                        })
                        d3.selectAll("#h" + t.data.name)
                            .append("svg:circle")
                            // .attr("cx", transform_x)
                            // .attr("cy", transform_y)
                            .attr("r", d => { return (14 / 3) })
                            .style("fill", d => { console.log(d.data); return sentimentColor(d.data.glyph.sentiment) })
                        // .attr("transform", "translate(15," + 0 + ")")
                        document.getElementById('z' + t.data.name).setAttribute("clicked", "true")

                        d3.selectAll("#z" + t.data.name)
                            .append("svg:circle")
                            // .attr("cx", transform_x)
                            // .attr("cy", transform_y)
                            .attr("r", d => { return (14 / 1) })
                            .style("fill", d => { return sentimentColor(d.data.glyph.sentiment) })
                            .attr("opacity", 1)

                        var lines = d3.selectAll("#h" + t.data.name)
                            .append("line")
                            .attr("x1", 0)
                            .attr("y1", 0)
                            .attr("y2", function (d) {
                                if (d.data) {
                                    d['start_time'] = new Date(d.data.glyph.start_time)//new Date("2012-05-24T18:25:43.511Z")
                                    return Math.sin(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
                                }
                            })
                            .attr("x2", function (d) {
                                if (d.data) {
                                    d['start_time'] = new Date(d.data.glyph.start_time)//new Date("2012-05-24T18:25:43.511Z")
                                    return Math.cos(clockToRad((d.start_time.getHours() - 3), -1)) * (13.5)
                                }
                            })
                            .attr("stroke", "black")
                            .attr("stroke-width", 1)  // .attr("transform", `translate(${transform_x},${transform_y})`);

                        d3.selectAll("#h" + t.data.name)//.selectAll(null)
                            .append("line")
                            .attr("x1", 0)
                            .attr("y1", 0)
                            .attr("y2", function (d) {
                                if (d.data) {
                                    d["end_time"] = new Date(d.data.glyph.end_time)//new Date("2012-05-24T23:25:43.511Z")
                                    // console.log(d.end_time.getHours(), d.start_time.getHours())
                                    return Math.sin(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                                }
                            })
                            .attr("x2", function (d) {
                                if (d.data) {
                                    d["end_time"] = new Date(d.data.glyph.end_time)//new Date("2012-05-24T23:25:43.511Z")
                                    return Math.cos(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                                }
                            })
                            .attr("stroke", "black")
                            .attr("stroke-width", 1)
                    }
                    else {
                        let parent = document.getElementById("h" + t.data.name)
                        let test = document.querySelectorAll(`[id=${"h" + t.data.name}]`);
                        for (let j = 0; j < test.length; j++) {
                            parent = test[j]

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
                        }
                        d3.selectAll("#z" + t.data.name).attr("d", null)
                        d3.selectAll("#z" + t.data.name).attr("d", d => { return pieSmall(d)() })
                        document.getElementById('z' + t.data.name).setAttribute("clicked", "false")
                    }
                })
            var tooltip = d3.select("#dendo_tooltip")
                // .append("div")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("z-index", "-1")

            pd.on("mousemove", function (d, e) {
                var matrix = this.getScreenCTM()
                    .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));


                tooltip.html((y, data) => {
                    // console.log(e, y, data, this.d);
                    return `Keywords: <strong> ${e.data.glyph.keywords.toString()} </strong>
                        <br>

                       `})
                    .style("visibility", "visible")
                    .style("z-index", "100")
                    .style("left", (window.pageXOffset + matrix.e + 15) + "px")
                    .style("top", (window.pageYOffset + matrix.f - 30) + "px")
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


            // let temp = cloneDeep([...this.props.mdsArr])
            // .append("circle")
            // .attr("r", 7)
            // .style("fill", "#69b3a2")
            // .attr("stroke", "black")
            // .style("stroke-width", 2)

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
            <div id='dendogramNew'>
            <div id="dendo_tooltip">

            </div>
                <div id="dendo_text" className='view_text'>
                Cluster View
            </div>
        </div>
        )
    }

}


function mapStateToProps(state) {
    return {
        finalArr: state.reducer.finalArr,
        mdsArr: state.reducer.mdsArr,
        clusterArr: state.reducer.clusterArr,
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
        // reset: () => dispatch({ type: 'RESET' }),
    }
};


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DendoNewRev);
