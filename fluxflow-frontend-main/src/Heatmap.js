import React from 'react';
import * as d3 from "d3";
import { connect } from 'react-redux'
import * as actionTypes from './redux/actions/actionType'


class HeatMap extends React.Component {
    dataFetches; data;
    /*
        statuses
        followers
        friends
    */
    async componentDidUpdate() {
        // Build X scales and axis:
        document.getElementById("heatmap").innerHTML = "";
        let tweetIds = new Set();
        for (const mdsGlyph of this.props.mdsArr) {
            for (const children of mdsGlyph.childrens) {
                tweetIds.add(children);
            }
        }
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
        if (!data.length) return;

        const myGroups = ['Followers', 'Friends', 'Favorites', 'Retweets', 'Status', 'Mentions', 'Length']
        const myVars = Array.from(tweetIds);

        var margin = { top: 80, right: 25, bottom: 30, left: 40 },
            height = 200 - margin.top - margin.bottom;

        var svg = d3.select("#heatmap")
            .append("svg")
            .attr("id", "svgheat")
            .attr("width", (myVars.length * 15) + 40)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleBand()
            .range([0, myVars.length * 15])
            .domain(myVars)
            .padding(0.05);

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
            .interpolator(d3.interpolateYlOrRd)
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

        svg.selectAll()
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d.variable) })
            .attr("y", function (d) { return y(d.group) })
            .attr("id", (d) => { return (d.group + d.variable) })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) { return myColor(d.value) })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", function (event, d) {
                console.log("Inside mouseover", d)
                            tooltip
                                .html("<b>Tweet ID:</b> " + d.variable + `<br><b>${d.group}:</b> ` + d.value)
                                .style("opacity", 1)
                                .style("position", "fixed")
                                .style("left", (event.x) + "px")
                                .style("top", (event.y) - 50 + "px")
                                .style("visibility", "visible")
                                .style("z-index", "100")
                        })
            .on("mousemove", function (event, d) {
                // console.log("Inside mousemove", d)
            })
            .on("mouseout", function (event, d) {
                // Hide the tooltip with a slight delay on mouseleave
                console.log("Inside mouseout", d)
                        tooltip
                            .style("visibility", "hidden")
                            .style("z-index", "-1")
                        document.getElementById("mds_tooltip").innerHTML = ""
                        if (this.tooltip !== undefined) {
                            this.tooltip.style("opacity", 0)
                            this.tooltip.style("z-index", -1);
                        }
            });



    }
    async componentDidMount() {
        this.dataFetches = [
            d3.csv('./data/HeatMap/heatmap_source.csv')
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
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps

)(HeatMap);
