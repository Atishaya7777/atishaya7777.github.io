import { ProtectedRoute, PublicRoute } from "components";
import { Outlet, useRoutes } from "react-router-dom";
import { routePaths } from "@/global/routePaths";
import { Dashboard, Login } from "containers/pages";

const AllRoutes = () => {
  return useRoutes([
    // NOTE: Public routes
    {
      path: routePaths.auth.login,
      element: <PublicRoute component={Login} />,
    },
    // NOTE: Private routes
    {
      path: routePaths.dashboard,
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [
        {
          path: routePaths.dashboard,
          element: <ProtectedRoute component={Dashboard} />,
        },
      ],
    },
    // NOTE: Error pages.
    { path: "*", element: <div>Replace me with your custom errror page</div> },
  ]);
};

export default AllRoutes;
