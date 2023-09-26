import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    userDrafts: [],
    editor: {}
}

const draftSlice = createSlice({
    name: 'draft',
    initialState,
    reducers: {
        // Give case reducers meaningful past-tense "event"-style names
        SET_USER_DRAFTS: (state, action) => {
            state.userDrafts = [...action.payload]
        },
        SET_EDITOR_DATA: (state, action) => {
            state.editor = { ...action.payload }
        }
    }
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { SET_USER_DRAFTS, SET_EDITOR_DATA } = draftSlice.actions

// Export the slice reducer as the default export
export default draftSlice.reducer