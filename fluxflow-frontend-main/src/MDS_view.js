import React from 'react';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import * as actionTypes from './redux/actions/actionType';
import { anomalyColor, COLORS, sentimentColor, toggleTopic, topicTooltip } from './visualizationConfig';

class TopicSpace extends React.Component {
    svgRef = React.createRef();
    tooltipRef = React.createRef();

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.finalArr !== this.props.finalArr) this.drawChart();
        if (prevProps.mdsArr !== this.props.mdsArr) this.updateSelection();
    }

    isSelected = name => this.props.mdsArr.some(topic => topic.name === name);

    toggleTopic = (event, topic) => {
        this.props.mds_assign(toggleTopic(this.props.mdsArr, topic));
        event.stopPropagation();
    };

    showTooltip = (event, topic) => {
        const start = new Date(topic.start_time);
        const end = new Date(topic.end_time);
        const dateLabel = date => date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        d3.select(this.tooltipRef.current)
            .html(`${topicTooltip(topic, this.isSelected(topic.name))}<div class="tooltip-time"><span>Active dates</span>${dateLabel(start)} – ${dateLabel(end)}</div>`)
            .style('visibility', 'visible')
            .style('left', `${Math.min(event.clientX + 18, window.innerWidth - 310)}px`)
            .style('top', `${Math.min(event.clientY + 18, window.innerHeight - 240)}px`);
    };

    hideTooltip = () => d3.select(this.tooltipRef.current).style('visibility', 'hidden');

    updateSelection = () => {
        const selected = new Set(this.props.mdsArr.map(topic => topic.name));
        const nodes = d3.select(this.svgRef.current).selectAll('.topic-node');
        nodes.classed('is-selected', topic => selected.has(topic.name));
        nodes.select('.topic-ring')
            .attr('r', topic => this.radiusScale(topic.user_volume) + (selected.has(topic.name) ? 7 : 3))
            .attr('stroke-width', topic => selected.has(topic.name) ? 3 : 1);
        nodes.select('.topic-label').style('display', topic => selected.has(topic.name) ? null : 'none');
    };

    drawChart = () => {
        const data = this.props.finalArr;
        if (!data.length || !this.svgRef.current) return;

        const width = 680;
        const height = 430;
        const margin = { top: 25, right: 35, bottom: 46, left: 55 };
        const xExtent = d3.extent(data, topic => Number(topic.x));
        const yExtent = d3.extent(data, topic => Number(topic.y));
        const volumeExtent = d3.extent(data, topic => Number(topic.user_volume || 1));
        const x = d3.scaleLinear().domain(xExtent).nice().range([margin.left, width - margin.right]);
        const y = d3.scaleLinear().domain(yExtent).nice().range([height - margin.bottom, margin.top]);
        this.radiusScale = d3.scaleSqrt().domain(volumeExtent).range([5, 14]).clamp(true);

        const svg = d3.select(this.svgRef.current)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
        svg.selectAll('*').remove();

        const xGrid = d3.axisBottom(x).ticks(6).tickSize(-(height - margin.top - margin.bottom)).tickFormat('');
        const yGrid = d3.axisLeft(y).ticks(6).tickSize(-(width - margin.left - margin.right)).tickFormat('');
        svg.append('g').attr('class', 'chart-grid').attr('transform', `translate(0,${height - margin.bottom})`).call(xGrid);
        svg.append('g').attr('class', 'chart-grid').attr('transform', `translate(${margin.left},0)`).call(yGrid);
        svg.append('g').attr('class', 'chart-axis').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(6));
        svg.append('g').attr('class', 'chart-axis').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(6));

        svg.append('text')
            .attr('class', 'axis-caption axis-title')
            .attr('x', (margin.left + width - margin.right) / 2)
            .attr('y', height - 9)
            .attr('text-anchor', 'middle')
            .text('PEOPLE-LED  ←  CONVERSATION FOCUS  →  SYSTEMS-LED');
        svg.append('text')
            .attr('class', 'axis-caption axis-title')
            .attr('transform', `translate(14,${(margin.top + height - margin.bottom) / 2}) rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text('PRACTICAL  ←  DISCUSSION MODE  →  SPECULATIVE');

        const nodes = svg.append('g')
            .selectAll('g')
            .data(data, topic => topic.name)
            .join('g')
            .attr('class', 'topic-node')
            .attr('transform', topic => `translate(${x(topic.x)},${y(topic.y)})`)
            .attr('role', 'button')
            .attr('tabindex', 0)
            .attr('aria-label', topic => `Select topic ${topic.name}`)
            .on('mousemove', this.showTooltip)
            .on('mouseleave', this.hideTooltip)
            .on('click', this.toggleTopic)
            .on('keydown', (event, topic) => {
                if (event.key === 'Enter' || event.key === ' ') this.toggleTopic(event, topic);
            });

        nodes.append('circle')
            .attr('class', 'topic-ring')
            .attr('r', topic => this.radiusScale(topic.user_volume) + 3)
            .attr('fill', COLORS.paper)
            .attr('stroke', COLORS.ink);
        nodes.append('circle')
            .attr('class', 'topic-core')
            .attr('r', topic => this.radiusScale(topic.user_volume))
            .attr('fill', topic => anomalyColor(Number(topic.anamoly || 0)))
            .attr('stroke', COLORS.ink)
            .attr('stroke-width', 1.25);
        nodes.append('circle')
            .attr('class', 'sentiment-core')
            .attr('r', topic => Math.max(2.5, this.radiusScale(topic.user_volume) * .32))
            .attr('fill', topic => sentimentColor(Number(topic.sentiment || 0)));
        nodes.append('text')
            .attr('class', 'topic-label')
            .attr('x', topic => this.radiusScale(topic.user_volume) + 8)
            .attr('dy', '.32em')
            .text(topic => `#${topic.name}`)
            .style('display', 'none');

        this.updateSelection();
    };

    render() {
        return (
            <div className="topic-space-root">
                <svg ref={this.svgRef} id="my_svg" role="img" aria-label="Topics positioned by similarity. Hover for details and click to select." />
                <div ref={this.tooltipRef} className="tooltip-container" aria-live="polite" />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    finalArr: state.reducer.finalArr,
    mdsArr: state.reducer.mdsArr
});

const mapDispatchToProps = dispatch => ({
    mds_assign: data => dispatch({ type: actionTypes.MDS_ASSIGN, data })
});

export default connect(mapStateToProps, mapDispatchToProps)(TopicSpace);
