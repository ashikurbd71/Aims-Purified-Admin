import { createSlice }  from "@reduxjs/toolkit"


const initialState = {
    count: 0,
}

const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        //Action declare
        increment: (state) =>{
            state.count = state.count + 1
        },
        //Action declare
        decrement: (state) =>{
            state.count = state.count - 1
        },
        //Action declare and reducer receive 2 parameter state and actions
        incrementByValue: (state, actions) =>{
            //Value received by payload
            state.count = state.count + actions.payload
        }
    }
})

export const {increment, decrement, incrementByValue} = counterSlice.actions
export default counterSlice.reducer