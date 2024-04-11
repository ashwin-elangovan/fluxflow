// // import axios from "axios";
// import React from 'react';
// import * as d3 from "d3";
// import myData from './mds_mock.json';

// class Circle extends React.Component {

//     state = {
//         data: myData[0],
//         height: 250,
//         width: 400
//     }

//     async normalization(val, max, min) { return (val - min) / ((max - min)); }

//     async drawPie() {
//         let json_data = this.state.data;

//         const diffTime = Math.abs(new Date(json_data.starting_time) - new Date(json_data.ending_time));
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         // console.log(diffDays)

//         var data = [json_data.anomaly_score, json_data.sentiment_score, json_data.user_volume - 100, new Date(json_data.starting_time), new Date(json_data.ending_time), diffDays]
//         let data_inner_circle = [json_data.sentiment_score];
//         // var data = [1.1, 2.2, 4.46, 2.12, 1.36, 5.002445, 4.1242]
//         let outerRadius = await this.normalization(json_data.user_volume, 1000, 500) * 10;
//         let inner_circle_radius = outerRadius / 10;//((await this.normalization(json_data.user_volume, 1000, 500) * 10)); //((await this.normalization(json_data.user_volume, 1000, 10) * 10));
//         let transform_x = 150;
//         let transform_y = 120;
//         // console.log(data)

//         var svg = d3.select("svg");

//         let g = svg.select("#circleG")
//             // .append("g")
//             // .attr("id", "circleG")
//             .attr("transform", `translate(${transform_x},${transform_y})`);

//         var pie = d3.pie();


//         // console.log(data)

//         var radius = outerRadius;
//         var tickLength = 10;
//         var circleDegree = 360;
//         var clockGroup = d3.select("svg")

//         // clockGroup.append('g')
//         //     .attr('class', 'ticks')
//         //     .selectAll('path')
//         //     .data(splitDegrees(12))
//         //     .enter()
//         //     .append('path')
//         //     .attr('d', function (d) {
//         //         var coord = {
//         //             outer: getCoordFromCircle(d, 0, 0, radius),
//         //             inner: getCoordFromCircle(d, 0, 0, radius - tickLength)
//         //         };
//         //         return 'M' + coord.outer[0] + ' ' + coord.outer[1] + 'L' + coord.inner[0] + ' ' + coord.inner[1] + 'Z';
//         //     });

//         function degToRad(degrees) {
//             return degrees * Math.PI / 180;
//         }

//         // it'll give you xy-coord by degree from 12(or 0) o'clock
//         function getCoordFromCircle(deg, cx, cy, r) {
//             var rad = degToRad(deg);
//             var x = cx + r * Math.cos(rad);
//             var y = cy + r * Math.sin(rad);
//             return [x, y];
//         }

//         function splitDegrees(num) {
//             var angle = circleDegree / num;
//             var degrees = [];

//             for (var ang = 0; ang < circleDegree; ang += angle) {
//                 degrees.push(ang);
//             }

//             return degrees;
//         }
//         json_data.starting_time = new Date(json_data.starting_time)
//         json_data.ending_time = new Date(json_data.ending_time)

//         var fromClock = json_data.ending_time.getHours();
//         var toClock = json_data.starting_time.getHours(); //ending_time

//         var fromClock1 = 24 - json_data.ending_time.getHours();
//         var toClock1 = 24 - json_data.starting_time.getHours();


//         var arc = d3.arc()
//             .innerRadius(0)
//             .outerRadius(outerRadius)
//             .startAngle(clockToRad(fromClock, -1))
//             .endAngle(clockToRad(toClock, 1));

//         clockGroup.append('path')
//             .attr('d', arc)
//             .style('fill', 'orange')
//             .attr("transform", `translate(${transform_x},${transform_y})`);

//         var arc1 = d3.arc()
//             .innerRadius(0)
//             .outerRadius(outerRadius)
//             .startAngle(clockToRad(fromClock1, -1))
//             .endAngle(clockToRad(toClock1, 1));

//         clockGroup.append('path')
//             .attr('d', arc1)
//             .style('fill', 'orange')
//             .style('opacity', '0.5')
//             .attr("transform", `translate(${transform_x},${transform_y})`);

//         function clockToRad(clock, direction) {
//             var unit = 360 / 12;
//             var degree = direction > 0 ? unit * clock : unit * clock - 360;

//             return degToRad(degree);
//         }
//         const getTimeFromDate1 = timestamp => new Date(timestamp * 1000).getTime();


//         //  ! [x] lines for starting and ending times
//         var lines = svg.selectAll(null)
//             .data(pie([json_data]))
//             .enter()
//             .append("line")
//             .attr("x1", 0)
//             .attr("y1", 0)
//             .attr("y2", function (d) {
//                 // console.log(d.data.starting_time.getTime())
//                 // console.log(d.data.starting_time)
//                 // console.log(getTimeFromDate1(new Date(d.data.starting_time)))
//                 return Math.sin(clockToRad((json_data.starting_time.getHours() - 3), -1)) * (outerRadius)
//             })
//             .attr("x2", function (d) {
//                 return Math.cos(clockToRad((json_data.starting_time.getHours() - 3), -1)) * (outerRadius)
//             })
//             .attr("stroke", "black")
//             .attr("stroke-width", 1)
//             .attr("transform", `translate(${transform_x},${transform_y})`);


//         var lines = svg.selectAll(null)
//             .data(pie([json_data]))
//             .enter()
//             .append("line")
//             .attr("x1", 0)
//             .attr("y1", 0)
//             .attr("y2", function (d) {

//                 return Math.sin(clockToRad((json_data.ending_time.getHours() - 3), -1)) * (outerRadius)
//             })
//             .attr("x2", function (d) {
//                 return Math.cos(clockToRad((json_data.ending_time.getHours() - 3), -1)) * (outerRadius)
//             })
//             .attr("stroke", "black")
//             .attr("stroke-width", 1)
//             .attr("transform", `translate(${transform_x},${transform_y})`);

//         svg.append("svg:circle")
//             .attr("cx", transform_x)
//             .attr("cy", transform_y)
//             .attr("r", inner_circle_radius)
//             .style("fill", "black")
//     }

//     componentDidMount() {
//         this.drawPie()
//     }

//     render() {


//         return (
//             <div>
//                 {

//                 }
//                 <svg id={"circleD"} height={this.state.height} width={this.state.width}>
//                     <g id={"circleG"} >

//                     </g>
//                     {/* <path d="M150 0 L75 200 L225 200 Z" /> */}
//                 </svg>
//                 {/* {this.drawPie()} */}
//                 {/* {JSON.stringify(this.state.data)} */}

//             </div>
//         )
//     }
// }

// export default Circle;
