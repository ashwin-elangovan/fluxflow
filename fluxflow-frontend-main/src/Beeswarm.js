import React from 'react';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import { COLORS, sentimentColor } from './visualizationConfig';

class ConversationTimeline extends React.Component {
    containerRef = React.createRef();
    tooltipRef = React.createRef();

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.mdsArr !== this.props.mdsArr || prevProps.fullTweets !== this.props.fullTweets) this.drawChart();
        else if (prevProps.replayKey !== this.props.replayKey) this.animatePosts();
    }

    componentWillUnmount() {
        d3.select(this.containerRef.current).selectAll('*').remove();
    }

    buildPosts() {
        const tweets = this.props.fullTweets[0] || {};
        return this.props.mdsArr.flatMap(topic => topic.childrens
            .map(id => tweets[id])
            .filter(Boolean)
            .map(post => ({
                ...post,
                id: post.tweet_id,
                topic: topic.name,
                date: new Date(post.created_at),
                sentiment: Number(post.sentiment_score || 0),
                followers: Number(post.followers_count || 0)
            })));
    }

    showTooltip = (event, post) => {
        const content = String(post.content || '').slice(0, 180);
        const pointerX = Number.isFinite(event.clientX) ? event.clientX : window.innerWidth / 2;
        const pointerY = Number.isFinite(event.clientY) ? event.clientY : window.innerHeight / 2;
        d3.select(this.tooltipRef.current)
            .html(`<div class="tooltip-title">#${post.topic}</div><div class="post-preview">${content}${post.content?.length > 180 ? '…' : ''}</div><div class="tooltip-grid"><span>Time</span><strong>${post.date.toLocaleString()}</strong><span>Sentiment</span><strong>${post.sentiment.toFixed(2)}</strong><span>Followers</span><strong>${post.followers.toLocaleString()}</strong></div>`)
            .style('visibility', 'visible')
            .style('left', `${Math.min(pointerX + 18, window.innerWidth - 330)}px`)
            .style('top', `${Math.min(pointerY + 18, window.innerHeight - 260)}px`);
    };

    hideTooltip = () => d3.select(this.tooltipRef.current).style('visibility', 'hidden');

    animatePosts = () => {
        if (!this.containerRef.current) return;
        const circles = d3.select(this.containerRef.current).selectAll('.timeline-post');
        if (circles.empty()) return;
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        circles.interrupt()
            .attr('opacity', reduceMotion ? 1 : 0)
            .attr('r', reduceMotion ? function () { return Number(this.dataset.finalRadius); } : 0);
        if (reduceMotion) return;
        circles.transition()
            .delay((post, index) => Math.min(900, index * 8))
            .duration(420)
            .ease(d3.easeBackOut.overshoot(1.15))
            .attr('opacity', 1)
            .attr('r', function () { return Number(this.dataset.finalRadius); });
    };

    drawChart = () => {
        if (!this.containerRef.current) return;
        const posts = this.buildPosts();
        const container = d3.select(this.containerRef.current);
        container.selectAll('*').remove();
        if (!posts.length) return;

        const topics = this.props.mdsArr.map(topic => topic.name);
        const width = 1200;
        const rowHeight = 140;
        const height = Math.max(330, 115 + topics.length * rowHeight);
        const longestVisibleLabel = Math.max(...topics.map(topic => Math.min(String(topic).length, 26)));
        const labelAwareLeftMargin = Math.ceil(longestVisibleLabel * 6.2 + 46);
        const margin = { top: 75, right: 45, bottom: 42, left: Math.max(150, Math.min(205, labelAwareLeftMargin)) };
        const x = d3.scaleTime().domain(d3.extent(posts, post => post.date)).nice().range([margin.left, width - margin.right]);
        const timeSpan = x.domain()[1] - x.domain()[0];
        const tickFormat = timeSpan > 1000 * 60 * 60 * 24 * 30 ? d3.timeFormat('%b %d') : d3.timeFormat('%I:%M %p');
        const y = d3.scaleBand().domain(topics).range([margin.top, height - margin.bottom]).padding(.34);
        const followerExtent = d3.extent(posts, post => post.followers);
        const radius = d3.scaleSqrt().domain(followerExtent).range([3.5, 18]).clamp(true);

        const svg = container.append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('role', 'img')
            .attr('aria-label', 'Selected posts plotted over time by topic');

        svg.append('g').selectAll('rect')
            .data(topics)
            .join('rect')
            .attr('class', 'timeline-row-band')
            .attr('x', margin.left)
            .attr('y', topic => y(topic))
            .attr('width', width - margin.left - margin.right)
            .attr('height', y.bandwidth());

        svg.append('g')
            .attr('class', 'timeline-grid')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(8).tickSize(-(height - margin.top - margin.bottom)).tickFormat(''));
        svg.append('g')
            .attr('class', 'timeline-axis')
            .attr('transform', `translate(0,${margin.top - 22})`)
            .call(d3.axisTop(x).ticks(8).tickFormat(tickFormat));
        svg.append('text')
            .attr('class', 'axis-caption axis-title')
            .attr('x', (margin.left + width - margin.right) / 2)
            .attr('y', 18)
            .attr('text-anchor', 'middle')
            .text('POST DATE · 2022');
        svg.append('text')
            .attr('class', 'axis-caption axis-title')
            .attr('transform', `translate(22,${(margin.top + height - margin.bottom) / 2}) rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text('SELECTED TOPICS');

        const label = svg.append('g').selectAll('g')
            .data(this.props.mdsArr)
            .join('g')
            .attr('transform', topic => `translate(${margin.left - 18},${y(topic.name) + y.bandwidth() / 2})`);
        label.append('circle').attr('r', 7).attr('fill', topic => sentimentColor(Number(topic.sentiment || 0))).attr('stroke', COLORS.ink);
        label.append('text').attr('x', -14).attr('text-anchor', 'end').attr('dy', '.32em').attr('class', 'timeline-topic-label')
            .text(topic => `#${topic.name.length > 26 ? `${topic.name.slice(0, 24)}…` : topic.name}`)
            .append('title').text(topic => `#${topic.name}`);

        const nodes = posts.map(post => ({ ...post, x: x(post.date), y: y(post.topic) + y.bandwidth() / 2 }));
        topics.forEach(topic => {
            const rowNodes = nodes.filter(post => post.topic === topic);
            const centerY = y(topic) + y.bandwidth() / 2;
            const simulation = d3.forceSimulation(rowNodes)
                .force('x', d3.forceX(post => x(post.date)).strength(.72))
                .force('y', d3.forceY(centerY).strength(.9))
                .force('collide', d3.forceCollide(post => radius(post.followers) + 1.25).iterations(2))
                .stop();
            for (let i = 0; i < 180; i += 1) simulation.tick();
            rowNodes.forEach(post => {
                const postRadius = radius(post.followers);
                post.x = Math.max(margin.left + postRadius, Math.min(width - margin.right - postRadius, post.x));
                post.y = Math.max(y(topic) + postRadius, Math.min(y(topic) + y.bandwidth() - postRadius, post.y));
            });

            svg.append('g').attr('class', 'timeline-posts')
                .selectAll('circle')
                .data(rowNodes)
                .join('circle')
                .attr('class', 'timeline-post')
                .attr('cx', post => post.x)
                .attr('cy', post => post.y)
                .attr('r', post => radius(post.followers))
                .attr('data-final-radius', post => radius(post.followers))
                .attr('fill', post => sentimentColor(post.sentiment))
                .attr('stroke', COLORS.ink)
                .attr('stroke-width', .8)
                .attr('tabindex', 0)
                .on('mousemove', this.showTooltip)
                .on('focus', this.showTooltip)
                .on('mouseleave blur', this.hideTooltip);
        });
        this.animatePosts();
    };

    render() {
        return (
            <div className="timeline-root">
                <div ref={this.containerRef} id="svg-container-1" />
                <div ref={this.tooltipRef} className="tooltip-container" aria-live="polite" />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    mdsArr: state.reducer.mdsArr,
    fullTweets: state.reducer.fullTweets
});

export default connect(mapStateToProps)(ConversationTimeline);
