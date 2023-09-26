import { configureStore } from "@reduxjs/toolkit";
import userReducers from "./reducers/user.reducers";
import commonReducers from "./reducers/common.reducers";
import draftReducers from "./reducers/draft.reducers";

const store = configureStore({
    reducer: {
        user: userReducers,
        common: commonReducers,
        draft: draftReducers
    },
});

export default store;