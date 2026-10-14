import './App.css';
import axios from 'axios';
import React from 'react';
import MDSView from './MDS_view';
import BeeSwarm from './Beeswarm';
import Extension from './Extension';
import HeatMap from './Heatmap';
import Dendogram from './Dendogram';
import { connect } from 'react-redux';
import * as actionTypes from './redux/actions/actionType';

const Panel = ({ id, number, label, title, description, meta, className = '', children }) => (
  <section id={id} className={`data-panel ${className}`}>
    <header className="panel-heading">
      <div className="panel-number">{number}</div>
      <div className="panel-title">
        <span>{label}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {meta && <div className="panel-meta">{meta}</div>}
    </header>
    {children}
  </section>
);

class App extends React.Component {
  state = { loading: true, error: null, timelineReplay: 0 };

  async componentDidMount() {
    try {
      const [topics, clusters, tweets] = await Promise.all([
        axios.get('data/mds/mds_view_data.json'),
        axios.get('data/cluster/cluster_view_data.json'),
        axios.get('data/beeswarm/full_tweets_data.json')
      ]);
      this.props.assign(topics.data);
      this.props.cluster_assign([clusters.data]);
      this.props.full_tweets_assign([tweets.data]);
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false, error: 'The demo data could not be loaded. Refresh the page to try again.' });
    }
  }

  renderSelection() {
    const selected = this.props.mdsArr;
    return (
      <div className={`selection-band ${selected.length ? 'has-selection' : ''}`} aria-live="polite">
        <div className="selection-status">
          <span className="pulse-mark" />
          <strong>{selected.length ? `${selected.length} topic${selected.length > 1 ? 's' : ''} driving the analysis` : 'Nothing selected yet'}</strong>
          <small>{selected.length ? 'Every view below is now filtered to these topics.' : 'Select a point in Topic Space or Cluster Map to update every dependent view.'}</small>
        </div>
        <div className="selection-list">
          {selected.length ? selected.map(topic => <span key={topic.name}>#{topic.name}</span>) : <span className="selection-hint">Hover for detail → click to select</span>}
        </div>
      </div>
    );
  }

  render() {
    const tweetCount = this.props.fullTweets[0] ? Object.keys(this.props.fullTweets[0]).length : 0;
    const selectedCount = this.props.mdsArr.length;

    return (
      <div className="app">
        <a className="skip-link" href="#topic-space">Skip to Topic Space</a>

        <nav className="mast-nav" aria-label="Primary navigation">
          <a className="wordmark" href="#top"><span>FF</span> FluxFlow</a>
          <div className="nav-links">
            <a href="#topic-space">Explore</a>
            <a href="#timeline">Timeline</a>
            <a href="#locations">Locations</a>
            <a href="#features">Compare</a>
          </div>
          <span className="dataset-tag">Demo / Full year</span>
        </nav>

        <header id="top" className="masthead">
          <div className="mast-copy">
            <h1>Linked social<br/><em>conversation analysis.</em></h1>
          </div>
          <div className="mast-note">
            <span className="note-arrow">↙</span>
            <p>Pick a topic once. Watch its structure, posts, locations, and audience profile resolve across the page.</p>
          </div>
          <dl className="dataset-stats">
            <div><dt>{this.props.finalArr.length || '—'}</dt><dd>topics</dd></div>
            <div><dt>{tweetCount || '—'}</dt><dd>posts</dd></div>
            <div><dt>5</dt><dd>linked views</dd></div>
          </dl>
        </header>

        {this.renderSelection()}

        <main>
          {this.state.error && <div className="error-banner" role="alert">{this.state.error}</div>}
          {this.state.loading ? <div className="loading-state">Loading the conversation…</div> : !this.state.error && <>
            <div className="explore-grid">
              <Panel id="topic-space" number="01" label="Control view" title="Topic Space" description="Nearby topics use similar language. Left-to-right shows people-led versus systems-led conversations; bottom-to-top shows practical versus speculative discussion." meta={<div className="legend-row"><span><i className="position-key"/>position = similarity</span><span><i className="dot anomaly"/>outer = anomaly</span><span><i className="dot sentiment"/>center = sentiment</span><span><i className="dot size"/>size = posts</span></div>} className="topic-panel">
                <div className="chart-area topic-area"><MDSView /></div>
                <div className="interaction-note"><b>Linked selection</b><span>Choose a topic here and its hierarchy path opens automatically in Cluster Map.</span></div>
              </Panel>

              <div className={`view-bridge ${selectedCount ? 'is-active' : ''}`} aria-label="Topic Space and Cluster Map share one selection">
                <a href="#topic-space"><b>01</b><span>Semantic position</span></a>
                <div className="view-bridge-status"><strong><span aria-hidden="true">↔</span>{selectedCount ? `${selectedCount} shared topic${selectedCount > 1 ? 's' : ''}` : 'One shared selection'}</strong><small>{selectedCount ? this.props.mdsArr.map(topic => `#${topic.name}`).join(' · ') : 'Select in either view; the other responds.'}</small></div>
                <a href="#cluster-map"><b>A</b><span>Hierarchy path</span></a>
              </div>

              <Panel id="cluster-map" number="A" label="Selection view" title="Cluster Map" description="A hierarchy of related conversations. Hover for details; expand a branch or click a topic to update the linked analysis." meta={<div className="legend-row"><span><i className="direction-key">→</i>broad to specific</span><span><i className="branch-line"/>branch = relationship</span><span><i className="dot anomaly"/>color = anomaly</span></div>} className="cluster-panel">
                <div className="chart-area cluster-area">{this.props.clusterArr.length > 0 && <Dendogram />}</div>
              </Panel>
            </div>

            <Panel id="timeline" number="02" label="Dependent view" title="Conversation Timeline" description="Each bubble is a post. Bursts and quiet periods reveal when each selected conversation gained or lost momentum." meta={<div className="timeline-meta"><div className="legend-row"><span><i className="date-key">↔</i>x = post date</span><span><i className="row-key">≡</i>row = topic</span><span><i className="gradient-key"/>color = sentiment</span><span><i className="dot size"/>size = followers</span></div>{selectedCount > 0 && <button type="button" className="timeline-replay" onClick={() => this.setState(({ timelineReplay }) => ({ timelineReplay: timelineReplay + 1 }))} aria-label="Replay timeline animation" title="Replay timeline animation"><span aria-hidden="true">↻</span><b>Replay</b></button>}</div>} className="timeline-panel">
              <div className={`chart-area timeline-area ${selectedCount ? '' : 'is-empty'}`}>
                {this.props.fullTweets.length > 0 && <BeeSwarm replayKey={this.state.timelineReplay} />}
                {!selectedCount && <div className="empty-overlay"><span>01</span><strong>Select a topic first</strong><p>Go to Topic Space above and click a point. Posts from that topic will appear here on a shared timeline.</p><a href="#topic-space">Choose a topic ↑</a></div>}
              </div>
            </Panel>

            <Panel id="locations" number="03" label="Dependent view" title="Where the conversation happens" description="Locations from posts in the current selection. Rotate the globe or use the ranked place list to understand geographic concentration." meta={<div className="legend-row"><span><i className="position-key"/>position = post location</span><span><i className="dot size"/>size = post count</span></div>} className="location-section">
              <div className="chart-area globe-area"><Extension /></div>
            </Panel>

            <Panel id="features" number="04" label="Comparison view" title="Topic profiles" description="A compact comparison of selected topics. Values are averaged per post so the table stays readable as the selection grows." meta={<div className="legend-row"><span><i className="column-key">▥</i>columns = per-post averages</span></div>} className="feature-section">
              <div className="feature-area"><HeatMap /></div>
            </Panel>
          </>}
        </main>

        <footer><span>FluxFlow</span><p>One selection. Five coordinated views.</p><a href="#top">Back to top ↑</a></footer>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    finalArr: state.reducer.finalArr,
    clusterArr: state.reducer.clusterArr,
    fullTweets: state.reducer.fullTweets,
    mdsArr: state.reducer.mdsArr
  };
}

function mapDispatchToProps(dispatch) {
  return {
    assign: data => dispatch({ type: actionTypes.ASSIGN, data }),
    cluster_assign: data => dispatch({ type: actionTypes.CLUSTER_ASSIGN, data }),
    full_tweets_assign: data => dispatch({ type: actionTypes.FULL_TWEETS_ASSIGN, data })
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
