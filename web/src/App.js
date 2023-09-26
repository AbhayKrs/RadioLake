import { useEffect } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import jwt_decode from 'jwt-decode';
import store from './store';

import Header from "./containers/Header";
import Footer from "./containers/Footer";
import Home from "./containers/Home";
import Test from "./containers/Test";

// import Templates from "./containers/Templates";
// import Editor from "./containers/Editor";
// import Signin from "./containers/Signin";
// import Signup from "./containers/Signup";
// import Dashboard from "./containers/Dashboard";
// import Profile from "./containers/Profile";
// import Settings from "./containers/Settings";
// import Snackbar from "./components/Snackbar";

import { SET_TEMPLATES, setSnackMessage } from "./store/reducers/common.reducers";
import { HANDLE_SIGNIN } from "./store/reducers/user.reducers";
import { fetch_templates } from "./utils/api";

const Layout = (props) => {
  const dispatch = useDispatch();
  const common = useSelector(state => state.common);

  // useEffect(() => {
  //   let token = null;
  //   if (localStorage.jwtToken) {
  //     token = localStorage.jwtToken;
  //     const loginData = jwt_decode(token);
  //     const payload = {
  //       ...loginData,
  //       isSignedIn: true
  //     }
  //     dispatch(HANDLE_SIGNIN(payload));
  //   } else if (sessionStorage.jwtToken) {
  //     token = sessionStorage.jwtToken;
  //     const loginData = jwt_decode(token);
  //     const payload = {
  //       ...loginData,
  //       isSignedIn: true
  //     }
  //     dispatch(HANDLE_SIGNIN(payload));
  //   }
  //   fetch_templates().then(res => {
  //     dispatch(SET_TEMPLATES(res));
  //   })
  // }, [])

  return (
    <main className={common.theme}>
      {/* <Header /> */}
      <div className="containerBox flex flex-col bg-slate-200 dark:bg-neutral-800">
        {/* <Snackbar data={common.snack} setMessage={setSnackMessage} /> */}
        <Outlet />
        <Footer />
      </div>
    </main>
  )
};

const App = () => {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <Home />
        },
        {
          path: '/test',
          element: <Test />,
        },
        // {
        //   path: '/dashboard',
        //   element: <Dashboard />
        // },
        // {
        //   path: '/editor',
        //   element: <Editor />
        // },
        // {
        //   path: '/signin',
        //   element: <Signin />
        // },
        // {
        //   path: '/signup',
        //   element: <Signup />
        // },
        // {
        //   path: '/profile',
        //   element: <Profile />
        // },
        // {
        //   path: '/settings',
        //   element: <Settings />
        // },
        // {
        //   path: '/google_success',
        //   element: <Google header="Success" />
        // },
        // {
        //   path: '/google_failed',
        //   element: <Google header="Failed" />
        // }
      ]
    }
  ])

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;