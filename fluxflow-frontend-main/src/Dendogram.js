import React from 'react';
import * as d3 from "d3";
import { connect } from 'react-redux'
import * as actionTypes from './redux/actions/actionType'
import cloneDeep from 'clone-deep'

class Dendogram extends React.Component {

    dataFetches; data;
    constructor(props) {
        super(props)
        this.state = {
            items: props.items
        }

    }

    async componentDidUpdate(items) {
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

            d3.selectAll("#z" + this.props.finalArr[i].name).attr("d", null)
            d3.selectAll("#z" + this.props.finalArr[i].name).attr("d", d => { return pieSmall(d)() })
        }

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
            let clickState;

            try {
                clickState = document.getElementById('p' + temp[i].name).getAttribute("clicked")
            }

            catch (e) {
                continue
            }

            if (clickState === "false") {
                d3.selectAll("#z" + temp[i].name).attr("d", null)
                d3.selectAll("#z" + temp[i].name).attr("d", d => { return pieBig(d)() })

                d3.selectAll("#h" + temp[i].name)
                    .append("svg:circle")
                    .attr("r", d => { return (14 / 3) })
                    .style("fill", d => { return sentimentColor(d.data.glyph.sentiment) })
                    .attr("opacity", 1)

                d3.selectAll("#h" + temp[i].name)
                    .append("line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("y2", function (d) {
                        if (d.data) {
                            d["end_time"] = new Date(d.data.glyph.end_time)
                            return Math.sin(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                        }
                    })
                    .attr("x2", function (d) {
                        if (d.data) {
                            d["end_time"] = new Date(d.data.glyph.end_time)
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
        var width = 350
        var height = 727
        var svg = d3.select("#dendogramNew")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr("transform", "translate(20,0)");  // bit of margin on the left = 40

        let dataFetches = [
            d3.json('./data/cluster/cluster_view_data.json')

        ];
        Promise.all(dataFetches).then((data) => {
            this.props.cluster_assign([data])

            // Create the cluster layout
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
            pd
                .attr("d", d => {
                    d['values'] = [Math.random(2)]
                    let t = d3.pie()(d.values).map(p => ({ p }))
                    return pieSmall(t)()
                })
                .attr("fill", d => {
                    return anomalyColor(d.data.glyph.anamoly)
                })
                .style("stroke", "black")
                .style("stroke-width", "1.25px")
                .on('click', function (e, t) {
                    let clickState = document.getElementById('z' + t.data.name).getAttribute("clicked")
                    if (clickState === "false") {
                        d3.selectAll("#z" + t.data.name).attr("d", null)
                        d3.selectAll("#z" + t.data.name).attr("d", d => {
                            return pieBig(d)()
                        })
                        d3.selectAll("#h" + t.data.name)
                            .append("svg:circle")
                            .attr("r", d => { return (14 / 3) })
                            .style("fill", d => { console.log(d.data); return sentimentColor(d.data.glyph.sentiment) })
                        document.getElementById('z' + t.data.name).setAttribute("clicked", "true")

                        d3.selectAll("#z" + t.data.name)
                            .append("svg:circle")
                            .attr("r", d => { return (14 / 1) })
                            .style("fill", d => { return sentimentColor(d.data.glyph.sentiment) })
                            .attr("opacity", 1)

                        d3.selectAll("#h" + t.data.name)
                            .append("line")
                            .attr("x1", 0)
                            .attr("y1", 0)
                            .attr("y2", function (d) {
                                if (d.data) {
                                    d["end_time"] = new Date(d.data.glyph.end_time)
                                    return Math.sin(clockToRad((d.end_time.getHours() - 3), -1)) * (13.5)
                                }
                            })
                            .attr("x2", function (d) {
                                if (d.data) {
                                    d["end_time"] = new Date(d.data.glyph.end_time)
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
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("z-index", "-1")

            pd.on("mousemove", function (d, e) {
                var matrix = this.getScreenCTM()
                    .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));


                tooltip.html((y, data) => {
                    return `<div>Keywords clustered: </div>
                            <div> <strong> ${e.data.glyph.keywords.toString()} </strong> </div>
                       `})
                    .style("visibility", "visible")
                    .style("z-index", "100")
                    .style("left", (window.pageXOffset + matrix.e + 15) + "px")
                    .style("top", (window.pageYOffset + matrix.f - 30) + "px")
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
            <div id="dendo_tooltip" className='tooltip-container'>

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
        assign: (data) => {
            dispatch({ type: actionTypes.ASSIGN, data: data })
        },
        mds_assign: (data) => {
            dispatch({ type: actionTypes.MDS_ASSIGN, data: data })
        },
        cluster_assign: (data) => {
            dispatch({ type: actionTypes.CLUSTER_ASSIGN, data: data })
        },
    }
};


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dendogram);
