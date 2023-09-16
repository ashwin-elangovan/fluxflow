import React from 'react';
import * as d3 from "d3";
// import Papa from 'papaparse'
// import myData from '/data/HeatMap/changed.csv';
import axios from "axios";
import treeData from './second'

class DendoNew extends React.Component {

    dataFetches; data;
    constructor(props) {
        super(props)

    }

    async componentDidMount() {


        console.log("hello")

        // set the dimensions and margins of the graph
        var width = 350
        var height = 727
        // append the svg object to the body of the page
        var svg = d3.select("#dendogramNew")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(40,0)");  // bit of margin on the left = 40
        let dataFetches = [
            d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_dendrogram.json'),
            // d3.csv('./data/extensionData/location_tweets.csv')
        ];
        Promise.all(dataFetches).then((data) => {
            var width = 350
            var height = 710
            var z = d3.scaleLinear()
                .domain([0, 10])
                .range([1, 10]);

            let arc = d3.arc()
                .innerRadius(0)
                .outerRadius(z(8))

            // .outerRadius(() => { return z(10) })
            // .startAngle(d.pie.startAngle)
            // .endAngle(d.pie.endAngle)
            // var arc = d3.arc().outerRadius(10).innerRadius(0);
            var pie = d3
                .pie()
                .value(function (d) {
                    return d.data.value;
                })
                .sort(null);

            var color = d3.scaleOrdinal(d3.schemeCategory10);
            var treemap = d3.tree().size([height, width]);
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

            var i = 0,
                duration = 750,
                root;

            function update(source) {
                // root['x'] = 0
                // Assigns the x and y position for the nodes
                console.log(root)
                var treeData = treemap(root);


                // Compute the new tree layout.
                var nodes = treeData.descendants(),
                    links = treeData.descendants().slice(1);

                // Normalize for fixed-depth.
                nodes.forEach(function (d) {
                    d.y = d.depth * 45;
                });

                // ****************** Nodes section ***************************



                let pieSmall = d => d3.arc()
                    // .innerRadius(0)
                    // .outerRadius(() => { return z(3) })
                    .startAngle(d.pie.startAngle)
                    .endAngle(d.pie.endAngle)


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

                // // Add Circle for the nodes
                nodeEnter
                    .append("circle")
                    .attr("class", "node")
                    // .attr("r", 1e-6)
                    // .style("fill", function (d) {
                    //     return d._children ? "lightsteelblue" : "#fff";
                    // })
                    .attr("display", (d) => (d.children ? "none" : "block"));
                console.log(nodeEnter)
                // nodeEnter.append('circle').attr("d", d => { console.log(d); return pie(d) })

                nodeEnter.each(drawPie);

                // UPDATE
                var nodeUpdate = nodeEnter.merge(node);

                // Transition to the proper position for the node
                nodeUpdate
                    .transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        // console.log(d)
                        return "translate(" + (d.y) + "," + (d.x) + ")";
                    });

                // Update the node attributes and style
                nodeUpdate
                    .select("circle.node")
                    .attr("r", 10)
                    .style("fill", function (d) {
                        return d._children || true ? "lightsteelblue" : "#fff";
                    });
                // .attr("cursor", "pointer");


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


            data = treeData

            // Create the cluster layout:
            var cluster = d3.cluster()
                .size([height, width - 100]);  // 100 is the margin I will have on the right side

            // Give the data to this cluster layout:
            var root = d3.hierarchy(treeData, function (d) {
                return d.children;
            });

            root.x0 = height / 2;
            root.y0 = 0;
            // root.x = 50;
            update(root);
            console.log(root.x, root)
            cluster(root);

            // Add the links between nodes:
            svg.selectAll('path')
                .data(root.descendants().slice(1))
                .enter()
                .append('path')
                .attr("d", function (d) {
                    return "M" + d.y + "," + d.x
                        + "C" + (d.parent.y) + "," + d.x
                        + " " + (d.parent.y + 40) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
                        + " " + d.parent.y + "," + d.parent.x;
                })
                .style("fill", 'none')
                .attr("stroke", 'blue')


            // Add a circle for each node.
            svg.selectAll("g")
                .data(root.descendants())
                .enter()
                .append("g")
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")"
                })
                .append("circle")
                .attr("r", 7)
                .style("fill", "#69b3a2")
                .attr("stroke", "black")
                .style("stroke-width", 2)
        })
    }

    render() {
        return (
            <div id='dendogramNew'>

            </div>
        )
    }

}

export default DendoNew;
