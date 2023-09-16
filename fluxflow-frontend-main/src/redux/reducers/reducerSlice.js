import * as actionTypes from "../actions/actionType";



// [
//     d3.json('./data/datum/new/mds_view_data.json'),
//     // d3.json('./data/datum/full_tweets_data.json'),
//     // d3.json('./data/datum/cluster_view_data.json')
// ];

const initialState = {
    finalArr: [],
    clusterArr: [],
    mdsArr: [],
    fullTweets: []
}


// async function Fetches() {
//     return await fetch('data/datum/new/mds_view_data.json')
// }
// let dataFetches = new Promise(async (resolve, reject) => {
//     // setTimeout(() => {
//     //     resolve("foo");
//     // }, 300);
//     let temp = await fetch('data/datum/new/mds_view_data.json');
//     resolve(temp)
// }).then();
// dataFetches = dataFetches.then()
// console.log(dataFetches)


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.DECREMENT:
            // console.log('changed: ', state.finalArr.slice(1, -1))
            return {
                ...state,
                //write code to update state
                finalArr: state.finalArr.slice(1, -1)
            }
        case actionTypes.ASSIGN:
            // console.log("Update Final Array: ", action.data)
            // console.log('changed: ', state.finalArr.slice(1, -1))
            let newArr = [...action.data]
            return {
                ...state,
                //write code to update state
                finalArr: newArr
            }
        case actionTypes.CLUSTER_ASSIGN:
            // console.log("Cluster action data", action.data)
            // console.log('changed: ', state.finalArr.slice(1, -1))
            return {
                ...state,
                //write code to update state
                clusterArr: [...action.data]//state.mdsArr.push(action.data)
            }
        case actionTypes.MDS_ASSIGN:
            // console.log("MDS action data", action.data)
            // console.log('changed: ', state.finalArr.slice(1, -1))
            return {
                ...state,
                //write code to update state
                mdsArr: [...action.data]//state.mdsArr.push(action.data)
            }
        case actionTypes.FULL_TWEETS_ASSIGN:
            // console.log("MDS action data", action.data)
            // console.log('changed: ', state.finalArr.slice(1, -1))
            return {
                ...state,
                //write code to update state
                fullTweets: [...action.data]//state.mdsArr.push(action.data)
            }
        default:
            // console.log('default state retured')
            return state
    }
}

export default reducer