import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isSignedIn: false,
    id: '',
    info: {
        name: '',
        username: '',
        email: '',
        googleAuthenticated: false
    },
    additional_info: {
        role: '',
        contact: '',
        p_skills: []
    }
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        HANDLE_SIGNIN: (state, action) => {
            const { email, exp, google_authenticated, iat, id, isSignedIn, name, username } = action.payload;
            state.id = id;
            state.info = {
                name,
                username,
                email,
                googleAuthenticated: google_authenticated
            }
            state.isSignedIn = isSignedIn;
        },
        HANDLE_SIGNOUT: (state, action) => {
            state.info = initialState.info;
            state.isSignedIn = false;
        },
        FETCH_ADDITIONAL_USERINFO: (state, action) => {
            const { role, contact, p_skills } = action.payload;
            state.additional_info = { role, contact, p_skills }
        },
        UPDATE_USERDETAILS: (state, action) => {
            const { name, username, email } = action.payload;
            state.info = {
                name,
                username,
                email
            }
        },
        CLEAR_USER_STATE: () => initialState
    }
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { HANDLE_SIGNIN, HANDLE_SIGNOUT, UPDATE_USERDETAILS, CLEAR_USER_STATE } = userSlice.actions

// Export the slice reducer as the default export
export default userSlice.reducer