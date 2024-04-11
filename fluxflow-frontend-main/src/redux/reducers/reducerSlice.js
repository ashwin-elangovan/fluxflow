import * as actionTypes from "../actions/actionType";

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
                finalArr: state.finalArr.slice(1, -1)
            }
        case actionTypes.ASSIGN:
            let newArr = [...action.data]
            return {
                ...state,
                finalArr: newArr
            }
        case actionTypes.CLUSTER_ASSIGN:
            return {
                ...state,
                clusterArr: [...action.data]
            }
        case actionTypes.MDS_ASSIGN:
            return {
                ...state,
                mdsArr: [...action.data]
            }
        case actionTypes.FULL_TWEETS_ASSIGN:
            return {
                ...state,
                fullTweets: [...action.data]
            }
        default:
            // console.log('default state retured')
            return state
    }
}

export default reducer
