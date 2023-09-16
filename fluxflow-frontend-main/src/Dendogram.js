import React from 'react';
import * as d3 from "d3";
// import Papa from 'papaparse'
// import myData from '/data/HeatMap/changed.csv';
import axios from "axios";
import treeData from './second'

class Dendogram extends React.Component {

    dataFetches; data;
    constructor(props) {
        super(props)

    }



    async componentDidMount() {
        // console.log(myData)
        // let data1 = (await axios.get("/data/Dendogram/second.js").then()).data
        console.log(treeData)
        // this.dataFetches = [
        //     d3.csv('./data/HeatMap/changed.csv')
        // ];

        // Promise.all(this.dataFetches).then((data) => {
        // })
        var margin = { top: 250, right: 90, bottom: 30, left: 90 },
            width = 190 - margin.left - margin.right,
            height = 600;

        var svg = d3
            .select("#dendogram")
            .append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + 0 + "," + margin.top + ")");

        var arc = d3.arc().outerRadius(10).innerRadius(0);
        var pie = d3
            .pie()
            .value(function (d) {
                return d.data.value;
            })
            .sort(null);

        var color = d3.scaleOrdinal(d3.schemeCategory10);

        const categories = [];
        const setCategory = (d) => {
            if (d.name && d.children) {
                categories.push(d.name);
            }

            if (d.children) {
                d.children.forEach((d) => {
                    setCategory(d);
                });
            } else {
                categories.push(d.name);
            }
        };


        color.domain(categories);

        setCategory(treeData);

        var i = 0,
            duration = 750,
            root;

        // declares a tree layout and assigns the size
        var treemap = d3.tree().size([height, width]);

        // Assigns parent, children, height, depth
        root = d3.hierarchy(treeData, function (d) {
            return d.children;
        });

        root.x0 = height / 2;
        root.y0 = 0;

        // Collapse after the second level
        // root.children.forEach(collapse);
        console.log(root)
        update(root);
        // Collapse the node and all it's children
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function update(source) {

            // Assigns the x and y position for the nodes
            var treeData = treemap(root);

            // Compute the new tree layout.
            var nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 180;
            });

            // ****************** Nodes section ***************************

            function drawPie(d) {
                if (d.children) {
                    d3.select(this)
                        .selectAll("path")
                        .data(pie(d.children))
                        .enter()
                        .append("path")
                        .attr("d", arc)
                        .attr("fill", function (d, i) {
                            return color(d.data.data.name);
                        });
                }
            }

            // Update the nodes...
            var node = svg.selectAll("g.node").data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

            // Enter any new modes at the parent's previous position.
            var nodeEnter = node
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on("click", click);

            // Add Circle for the nodes
            nodeEnter
                .append("circle")
                .attr("class", "node")
                .attr("r", 1e-6)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                })
                .attr("display", (d) => (d.children ? "none" : "block"));

            // Add labels for the nodes
            nodeEnter
                .append("text")
                .attr("dy", ".35em")
                .attr("x", function (d) {
                    return d.children || d._children ? -40 : 20;
                })
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    return "";
                });

            nodeEnter.each(drawPie);

            // UPDATE
            var nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate
                .transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Update the node attributes and style
            nodeUpdate
                .select("circle.node")
                .attr("r", 10)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });
            // .attr("cursor", "pointer");

            // Remove any exiting nodes
            var nodeExit = node
                .exit()
                .transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select("circle").attr("r", 1e-6);

            // On exit reduce the opacity of text labels
            nodeExit.select("text").style("fill-opacity", 1e-6);

            // ****************** links section ***************************

            // Update the links...
            var link = svg.selectAll("path.link").data(links, function (d) {
                return d.id;
            });

            // Enter any new links at the parent's previous position.
            var linkEnter = link
                .enter()
                .insert("path", "g")
                .attr("class", "link")
                .attr("d", function (d) {
                    var o = { x: source.x0, y: source.y0 };
                    return diagonal(o, o);
                })
                .style("fill", "none")
                .attr("stroke", (d, i) => {
                    return color(d.data.name);
                });

            // UPDATE
            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate
                .transition()
                .duration(duration)
                .attr("d", function (d) {
                    return diagonal(d, d.parent);
                });

            // Remove any exiting links
            var linkExit = link
                .exit()
                .transition()
                .duration(duration)
                .attr("d", function (d) {
                    var o = { x: source.x, y: source.y };
                    return diagonal(o, o);
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {
                let path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`;

                return path;
            }

            // Toggle children on click.
            function click(event, d) {
                // if (d.children) {
                //   d._children = d.children;
                //   d.children = null;
                // } else {
                //   d.children = d._children;
                //   d._children = null;
                // }
                update(d);
            }
        }

    }

    render() {
        return (
            <div id='dendogram'>

            </div>
        )
    }
}

export default Dendogram;
