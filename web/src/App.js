import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import Home from "./containers/Home";

const Layout = (props) => {
  return (
    <main>
      <div className="containerBox flex flex-col bg-slate-200 dark:bg-neutral-800">
        <Outlet />
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
        }
      ]
    }
  ])

  return (
    <RouterProvider router={router} />
  );
}

export default App;