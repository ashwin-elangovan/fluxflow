import axios from "axios";
import React from 'react';
import * as d3 from "https://cdn.skypack.dev/d3@7";
import myData from './mds_mock.json';
import Papa from 'papaparse'
import { action, connect } from 'react-redux'
import * as actionTypes from './redux/actions/actionType'
import cloneDeep from 'clone-deep'


class HeatMap extends React.Component {

    dataFetches; data;
    constructor(props) {
        super(props)

    }

    /*
        statuses
        followers
        friends
    */
    /*
    this.props.finalArr

    this.props.mdsArr = [{}, {}]
    */
    async componentDidUpdate() {
        // Build X scales and axis:
        document.getElementById("heatmap").innerHTML = "";
        // console.log(this.props)
        let tweetIds = new Set();
        for (const mdsGlyph of this.props.mdsArr) {
            // console.log(mdsGlyph.childrens);
            for (const children of mdsGlyph.childrens) {
                tweetIds.add(children);
            }
        }
        // console.log(tweetIds);
        var data = [];
        for (const tweetId of tweetIds) {
            var storedTweetInfo = this.props.fullTweets[0][tweetId];
            data.push({ 'group': 'Followers', variable: tweetId, value: storedTweetInfo.followers_count });
            data.push({ 'group': 'Friends', variable: tweetId, value: storedTweetInfo.friends_count });
            data.push({ 'group': 'Favorites', variable: tweetId, value: storedTweetInfo.favorite_count });
            data.push({ 'group': 'Retweets', variable: tweetId, value: storedTweetInfo.retweet_count });
            data.push({ 'group': 'Status', variable: tweetId, value: storedTweetInfo.status_count });
            data.push({ 'group': 'Mentions', variable: tweetId, value: storedTweetInfo.user_mentions_count });
            data.push({ 'group': 'Length', variable: tweetId, value: storedTweetInfo.length });
        }
        // console.log(data);
        if (!data.length) return;

        const myGroups = ['Followers', 'Friends', 'Favorites', 'Retweets', 'Status', 'Mentions', 'Length']
        //   console.log(myGroups)
        const myVars = Array.from(tweetIds);
        //   console.log(myVars)

        var margin = { top: 80, right: 25, bottom: 30, left: 40 },
            width = 300 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        var svg = d3.select("#heatmap")
            .append("svg")
            .attr("id", "svgheat")
            .attr("width", (myVars.length * 15) + 40)//width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleBand()
            .range([0, myVars.length * 15])
            .domain(myVars)
            .padding(0.05);
        // svg.append("g")
        //     .style("font-size", 3)
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom(x).tickSize(0))
        //     .select(".domain").remove()

        // Build Y scales and axis:
        var y = d3.scaleBand()
            .range([height, 0])
            .domain(myGroups)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 9)
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove()

        // Build color scale
        var myColor = d3.scaleSequential()
            .range([0, 1])
            .interpolator(d3.interpolateYlGnBu)
            .domain([1, 100])

        // create a tooltip
        var tooltip = d3.select("#heatmap")
            .append("div")
            .style("opacity", 0)
            .attr("class", "f_tooltip")
            .style("border", "solid")
            .style("background-color", "white")
            .style("border-radius", "5px")
            .style("padding", "10px")
        // .style("padding", "0px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = (d) => {

            tooltip
                .style("opacity", 1)
            d3.select("#" + d.group + d.variable)
                .style("stroke", "black")
                .style("opacity", 1)

        }
        var mousemove = (event, d) => {
            tooltip
                .html("<b>Tweet ID:</b> " + d.variable + `<br><b>${d.group}:</b> ` + d.value)
                .style("opacity", 1)
                .style("position", "fixed")
                .style("left", (event.x) + "px")
                .style("top", (event.y) - 50 + "px")
                .style("visibility", "visible")

        }
        var mouseleave = (event, d) => {
            tooltip
                .style("opacity", 0)
                .style("visibility", "hidden")
            d3.select("#" + d.group + d.variable)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }



        // add the squares
        svg.selectAll()
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d.variable) })
            .attr("y", function (d) { return y(d.group) })
            .attr("id", (d) => { return (d.group + d.variable) })
            .attr("rx", 4)
            .attr("ry", 1)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) { return myColor(d.value) })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            // .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseleave)
        // .on("mouse")

    }
    async componentDidMount() {
        this.dataFetches = [
            d3.csv('./data/HeatMap/changed.csv')
        ];
    }

    render() {
        return (
            <div>
                <div className='view_text'>
                    Feature View
                </div>
                <div id="heatmap" style={{ overflowX: "auto" }} maxwidth={"500px"} height={"400px"}>

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

)(HeatMap);
