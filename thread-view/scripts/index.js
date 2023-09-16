const width = 1520;
const height = 720;
const margin = [200, 60, 50, 100];

var svg;
var tooltip;
var zoom;
var axis;
var topAxis;
var data = [];
var timedata = []

const DELAY_TIME = 3000;

document.addEventListener("DOMContentLoaded", function () {
  svg = d3
    .select("#svg-container-1")
    .append("svg")
    .attr("height", height)
    .attr("width", width);

  tooltip = d3
    .select("#svg-container-1")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  d3.csv("data/sampled_data.csv").then((x) => {
    x.forEach((record) => {
      record["date"] = new Date(record["date"])
      timedata.push(record["date"])
      data.push(record)
    })
    // console.log(data)
    drawBeeswarmChart(data);
  });

});


function drawBeeswarmChart(data) {

  let categories = Array.from(new Set(data.map((d) => d.category)))
  console.log(categories);

  const maxDate = new Date(Math.max(...timedata));
  const minDate = new Date(Math.min(...timedata));

  let xScale = d3
  .scaleTime()
  .domain([minDate, maxDate])
  .range([margin[3], width - margin[1]]);

  let yScale = d3
    .scaleBand()
    .domain(categories)
    .range([height - margin[2], margin[0]]);

  var color = d3.scaleSequential().domain([-1.0, 1.0]).interpolator(d3.interpolateReds);

  let thread_size = d3.extent(data.map((d) => +d["thread_size"]));
  let size = d3.scaleSqrt().domain(thread_size).range([3, 20]);

  svg
    .append("g")
    .attr("class", "line-g")
    .selectAll(".lines")
    .data(data)
    .enter()
    .append("line")
    .attr("class", "lines")
    .attr("x1", -1e100)
    .attr("y1", (d) => yScale(d.category))
    .attr("x2", 1e100)
    .attr("y2", (d) => yScale(d.category));

  svg
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
    .attr("cx", (d) => xScale(d.date))
    .attr("cy", (d) => yScale(d.category));

  topAxis = d3.axisBottom(xScale);

  axis = svg
    .append("g")
    .attr("transform", "translate(0," + margin[0] / 4 + ")")
    .call(topAxis);

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
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  }

  setTimeout(function () {
    console.log("start alpha decay");
    simulation.alphaDecay(0.1);
  }, DELAY_TIME);

  createToolTip();
  createZoom(xScale);

}

function createToolTip() {
  d3.selectAll(".circ")
    .on("mousemove", function (event, val) {
      const thread_size = val["thread_size"];
      const date = val["date"];
      const displayDate = date.toLocaleString()
      const score = parseFloat(val["sentiment"]).toFixed(2);
      tooltip
        .html(
          `Thread Size: <strong> ${thread_size} </strong>
               <br> 
           Date: <strong> ${displayDate} </strong>
              <br>
           Sentiment Score: <strong> ${score} </strong>
              `
        )
        .style("top", event.pageY - 12 + "px")
        .style("left", event.pageX + 25 + "px")
        .style("opacity", 0.9);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });
}

function createZoom(xScale) {
  zoom = d3.zoom().scaleExtent([1, 1]).on("zoom", handleZoom);

  function handleZoom(e) {
    const transform = e.transform;
    const xNewScale = transform.rescaleX(xScale);
    transform.y = 0;
    console.log(transform);
    const lines = d3.selectAll(".line-g");
    lines.attr("transform", transform);
    const circles = d3.selectAll(".circle-g");
    circles.attr("transform", transform);
    axis.call(topAxis.scale(xNewScale));
  }

  d3.select("#svg-container-1 svg").call(zoom);
}

function colorLegend(colorScale) {
  var legendSequential = d3.legendColor()
    .shapeWidth(30)
    .cells(5)
    .orient("horizontal")
    .scale(sequentialScale)

  svg.append("g").attr("class", "legend").call(legendSequential)
}
