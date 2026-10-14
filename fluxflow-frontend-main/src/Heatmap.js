import React from 'react';
import { connect } from 'react-redux';

const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

const average = (values) => values.length ? values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length : 0;

class HeatMap extends React.Component {
    getTopicRows() {
        const tweets = this.props.fullTweets[0] || {};
        return this.props.mdsArr.map(topic => {
            const posts = topic.childrens.map(id => tweets[id]).filter(Boolean);
            return {
                name: topic.name,
                posts: posts.length,
                followers: average(posts.map(post => post.followers_count)),
                engagement: average(posts.map(post => Number(post.favorite_count || 0) + Number(post.retweet_count || 0))),
                mentions: average(posts.map(post => post.user_mentions_count)),
                length: average(posts.map(post => post.length)),
                sentiment: average(posts.map(post => post.sentiment_score)),
                anomaly: Number(topic.anamoly || 0)
            };
        });
    }

    renderMeter(value, max, tone = 'green') {
        const width = max > 0 ? Math.max(3, Math.min(100, (value / max) * 100)) : 0;
        return <span className={`metric-meter ${tone}`}><i style={{ width: `${width}%` }} /></span>;
    }

    render() {
        const rows = this.getTopicRows();
        if (!rows.length) {
            return <div className="matrix-empty"><span>↖</span><div><strong>No topics selected</strong><p>Choose one or more points in Topic Space to compare their audience and engagement profile.</p></div></div>;
        }

        const maxima = {
            followers: Math.max(...rows.map(row => row.followers), 1),
            engagement: Math.max(...rows.map(row => row.engagement), 1),
            mentions: Math.max(...rows.map(row => row.mentions), 1),
            length: Math.max(...rows.map(row => row.length), 1)
        };

        return (
            <div className="comparison-table" role="table" aria-label="Topic feature comparison">
                <div className="comparison-head" role="row">
                    <span>Topic</span><span>Posts</span><span>Avg. audience</span><span>Avg. engagement</span><span>Avg. mentions</span><span>Avg. length</span><span>Sentiment</span><span>Anomaly</span>
                </div>
                {rows.map(row => (
                    <div className="comparison-row" role="row" key={row.name}>
                        <strong className="topic-name">#{row.name}</strong>
                        <span className="plain-value">{row.posts}</span>
                        <span className="bar-value">{this.renderMeter(row.followers, maxima.followers)}<b>{compactNumber.format(row.followers)}</b></span>
                        <span className="bar-value">{this.renderMeter(row.engagement, maxima.engagement, 'blue')}<b>{row.engagement.toFixed(1)}</b></span>
                        <span className="bar-value">{this.renderMeter(row.mentions, maxima.mentions, 'violet')}<b>{row.mentions.toFixed(1)}</b></span>
                        <span className="bar-value">{this.renderMeter(row.length, maxima.length, 'amber')}<b>{Math.round(row.length)} chars</b></span>
                        <span className={`score-pill ${row.sentiment >= 0 ? 'positive' : 'negative'}`}>{row.sentiment >= 0 ? '+' : ''}{row.sentiment.toFixed(2)}</span>
                        <span className="plain-value">{row.anomaly.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        mdsArr: state.reducer.mdsArr,
        fullTweets: state.reducer.fullTweets
    };
}

export default connect(mapStateToProps)(HeatMap);
