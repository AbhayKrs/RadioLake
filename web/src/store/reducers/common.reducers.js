import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    theme: 'light',
    snack: {
        open: false,
        message: '',
        type: ''
    },
    templates: []
}

const commonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        // Give case reducers meaningful past-tense "event"-style names
        switchTheme: (state, action) => {
            state.theme = action.payload;
        },
        setSnackMessage: (state, action) => {
            state.snack = action.payload;
        },
        SET_TEMPLATES: (state, action) => {
            state.templates = [...action.payload];
        }
    }
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { switchTheme, setSnackMessage, SET_TEMPLATES } = commonSlice.actions

// Export the slice reducer as the default export
export default commonSlice.reducer