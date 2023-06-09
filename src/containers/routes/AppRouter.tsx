import "assets/scss/app.scss";

import { Suspense } from "react";

import { Loader } from "components";
import { BrowserRouter as Router } from "react-router-dom";

import AllRoutes from "./AllRoutes";

const AppRouter = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Router>
        <AllRoutes />
      </Router>
    </Suspense>
  );
};

export default AppRouter;
