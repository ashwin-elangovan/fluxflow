import './App.css';
import axios from "axios";
import React from 'react';
import MDS_view from './MDS_view';
import BeeSwarm from './Beeswarm';
import Extension from './Extension';
import HeatMap from './Heatmap';
import Dendogram from './Dendogram';
import { connect } from 'react-redux'
import * as actionTypes from './redux/actions/actionType'

class App extends React.Component {

  state = {
    posts: []
  }

  constructor(props) {
    super(props);
    this.myRef = React.createRef(null);
  }
  async componentWillMount() {
    let MDS_data = await axios
      .get('data/mds/mds_view_data.json')
      .then()
      .catch(error => console.log(error));


    let cluster_data = await axios
      .get('data/cluster/cluster_view_data.json')
      .then()
      .catch(error => console.log(error));

    let bee_swarm_data = await axios
      .get('data/beeswarm/full_tweets_data.json')
      .then()
      .catch(error => console.log(error));

    await this.props.assign(MDS_data.data)
    await this.props.cluster_assign([cluster_data.data])
    await this.props.full_tweets_assign([bee_swarm_data.data])
  }
  async componentDidMount() {
    // let cors = {
    //   origin: "*",
    //   methods: ["GET", "POST"]
    // }
  }

  render() {
    return (
      < div >
        <div align="center">
          <h1>
            FluxFlow D3 visualization
          </h1>
          <p>(This demo contains a preloaded subset of the actual data. To get started click on the data points in the MDS view)</p>
        </div>

        <div className='container'>
          <div className='row'>
            <div className='child1'>
              {this.props.clusterArr.length && <Dendogram />}
            </div>
            <div className='child2'>
              {this.props.fullTweets.length && <BeeSwarm />}
            </div>
          </div>
        </div>

        <div className='container1'>
          <div className='row'>
            <div className='child3'>
              {this.props.finalArr.length && <MDS_view />}
            </div>
            <div className='child4' align="center">
              <Extension />
            </div>
          </div>
          <div className='row'>
            <div className='child5'>
              <HeatMap />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    finalArr: state.reducer.finalArr,
    clusterArr: state.reducer.clusterArr,
    fullTweets: state.reducer.fullTweets
  }
}

function mapDispatchToProps(dispatch) {
  return {
    assign: (data) => {
      dispatch({ type: actionTypes.ASSIGN, data: data })
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
)(App);
