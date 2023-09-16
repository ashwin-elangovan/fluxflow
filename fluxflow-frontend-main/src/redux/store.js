import { configureStore } from '@reduxjs/toolkit'
import reducerSlice from './reducers/reducerSlice'

export default configureStore({
    reducer: {
        reducer: reducerSlice
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})