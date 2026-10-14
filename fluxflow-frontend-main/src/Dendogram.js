import React from 'react';
import { connect } from 'react-redux';
import * as actionTypes from './redux/actions/actionType';
import { anomalyColor, COLORS, sentimentColor, toggleTopic } from './visualizationConfig';

const WIDTH = 1200;
const HEIGHT = 620;
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };

class ClusterMap extends React.Component {
    state = { activeBranch: null };

    componentDidUpdate(prevProps) {
        if (prevProps.mdsArr !== this.props.mdsArr) {
            const before = new Set(prevProps.mdsArr.map(topic => topic.name));
            const added = this.props.mdsArr.find(topic => !before.has(topic.name));
            const branch = added && this.categories().find(category => (category.children || []).some(topic => topic.name === added.name));
            if (branch && branch.name !== this.state.activeBranch) this.setState({ activeBranch: branch.name });
        }
    }

    categories = () => this.props.clusterArr[0]?.children || [];
    topicFor = node => this.props.finalArr.find(topic => topic.name === node.name) || node.glyph;
    isSelected = name => this.props.mdsArr.some(topic => topic.name === name);
    selectTopic = topic => this.props.mds_assign(toggleTopic(this.props.mdsArr, topic));

    categoryStats = category => {
        const topics = (category.children || []).map(this.topicFor).filter(Boolean);
        return {
            topics,
            posts: topics.reduce((sum, topic) => sum + Number(topic.user_volume || 0), 0),
            selected: topics.filter(topic => this.isSelected(topic.name)).length
        };
    };

    overviewPositions(categories) {
        return categories.map((category, index) => {
            const angle = -Math.PI / 2 + (index / categories.length) * Math.PI * 2;
            return { category, x: CENTER.x + Math.cos(angle) * 400, y: CENTER.y + Math.sin(angle) * 220 };
        });
    }

    topicPositions(topics) {
        const split = Math.ceil(topics.length / 2);
        return topics.map((topic, index) => {
            const left = index < split;
            const sideIndex = left ? index : index - split;
            const sideCount = left ? split : topics.length - split;
            const y = sideCount === 1 ? CENTER.y : 76 + sideIndex * ((HEIGHT - 152) / (sideCount - 1));
            return { topic, side: left ? 'left' : 'right', x: left ? 250 : 950, y };
        });
    }

    renderOverview(categories) {
        const positions = this.overviewPositions(categories);
        return <svg className="cluster-constellation" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="tree" aria-label="Eight conversation clusters arranged around all topics">
            <g className="cluster-constellation-links">{positions.map(({ category, x, y }) => <path key={category.name} d={`M${CENTER.x},${CENTER.y} Q${(CENTER.x + x) / 2},${y} ${x},${y}`} />)}</g>
            <g className="cluster-hub"><circle cx={CENTER.x} cy={CENTER.y} r="34"/><text x={CENTER.x} y={CENTER.y - 2}>ALL</text><text className="cluster-hub-sub" x={CENTER.x} y={CENTER.y + 13}>150 TOPICS</text></g>
            {positions.map(({ category, x, y }) => {
                const stats = this.categoryStats(category);
                return <g key={category.name} className={`cluster-category-node ${stats.selected ? 'has-selection' : ''}`} transform={`translate(${x},${y})`} role="button" tabIndex="0" aria-label={`Open ${category.name} cluster, ${stats.topics.length} topics`} onClick={() => this.setState({ activeBranch: category.name })} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') this.setState({ activeBranch: category.name }); }}>
                    <circle className="node-halo" r="27"/><circle className="node-core" r="21" fill={anomalyColor(Number(category.glyph?.anamoly || 0))}/><text className="cluster-category-name" y="43">{category.name}</text><text className="cluster-category-count" y="56">{stats.topics.length} topics · {stats.posts.toLocaleString()} posts</text>{!!stats.selected && <text className="cluster-selected-count" y="-34">{stats.selected} SELECTED</text>}
                </g>;
            })}
        </svg>;
    }

    renderBranch(category) {
        const stats = this.categoryStats(category);
        const positions = this.topicPositions(stats.topics);
        const radius = topic => 7 + Math.sqrt(Number(topic.user_volume || 1) / 90) * 6;
        return <div className="cluster-focused-map">
            <div className="cluster-focus-summary"><button type="button" onClick={() => this.setState({ activeBranch: null })}>← Overview</button><span><b>{category.name}</b>{stats.topics.length} topics · {stats.posts.toLocaleString()} posts</span><em>{stats.selected} selected</em></div>
            <svg className="cluster-constellation" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="tree" aria-label={`${category.name} cluster with ${stats.topics.length} topics`}>
                <g className="cluster-constellation-links">{positions.map(({ topic, x, y }) => <path key={topic.name} d={`M${CENTER.x},${CENTER.y} C${(CENTER.x + x) / 2},${CENTER.y} ${(CENTER.x + x) / 2},${y} ${x},${y}`} stroke={anomalyColor(Number(topic.anamoly || 0))}/>)}</g>
                <g className="cluster-active-hub"><circle cx={CENTER.x} cy={CENTER.y} r="42" fill={COLORS.ink}/><text x={CENTER.x} y={CENTER.y - 3}>#{category.name}</text><text className="cluster-hub-sub" x={CENTER.x} y={CENTER.y + 14}>CLUSTER</text></g>
                {positions.map(({ topic, side, x, y }) => {
                    const selected = this.isSelected(topic.name);
                    const r = radius(topic);
                    const labelX = side === 'left' ? -(r + 9) : r + 9;
                    return <g key={topic.name} className={`cluster-topic-node ${selected ? 'is-selected' : ''}`} transform={`translate(${x},${y})`} role="button" tabIndex="0" aria-label={`${selected ? 'Remove' : 'Select'} topic ${topic.name}`} onClick={() => this.selectTopic(topic)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.selectTopic(topic); } }}>
                        <circle className="node-halo" r={r + 5}/><circle className="node-core" r={r} fill={anomalyColor(Number(topic.anamoly || 0))}/><circle className="sentiment-core" r={Math.max(2.5, r * .34)} fill={sentimentColor(Number(topic.sentiment || 0))}/><text className="cluster-topic-name" x={labelX} textAnchor={side === 'left' ? 'end' : 'start'} dy=".32em">#{topic.name}</text><title>{`${topic.user_volume} posts · sentiment ${Number(topic.sentiment || 0).toFixed(2)} · anomaly ${Number(topic.anamoly || 0).toFixed(2)}`}</title>
                    </g>;
                })}
            </svg>
        </div>;
    }

    render() {
        const categories = this.categories();
        const active = categories.find(category => category.name === this.state.activeBranch);
        return <div className="cluster-map-root">
            <div className="cluster-toolbar">
                <div className="cluster-toolbar-copy"><b>8</b><span>Open one cluster at a time. Select a topic to update Topic Space and every linked view.</span></div>
                <div className="cluster-filters" role="group" aria-label="Filter cluster map by category"><button type="button" className={!active ? 'is-active' : ''} onClick={() => this.setState({ activeBranch: null })}>Overview</button>{categories.map(category => <button type="button" key={category.name} className={active?.name === category.name ? 'is-active' : ''} onClick={() => this.setState({ activeBranch: category.name })}>{category.name}<small>{this.categoryStats(category).selected || category.children?.length || 0}</small></button>)}</div>
            </div>
            {active ? this.renderBranch(active) : this.renderOverview(categories)}
        </div>;
    }
}

const mapStateToProps = state => ({ finalArr: state.reducer.finalArr, mdsArr: state.reducer.mdsArr, clusterArr: state.reducer.clusterArr });
const mapDispatchToProps = dispatch => ({ mds_assign: data => dispatch({ type: actionTypes.MDS_ASSIGN, data }) });
export default connect(mapStateToProps, mapDispatchToProps)(ClusterMap);
