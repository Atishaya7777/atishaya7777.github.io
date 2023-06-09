import React, { ReactElement } from "react";

type TPublicRouteProps = {
  component: () => ReactElement | null;
  [prop: string]: unknown;
};

const PublicRoute = ({ component: Component, ...rest }: TPublicRouteProps) => {
  /* You can put in your own custom logic */
  // if (tokenService.getAccessToken()) {
  //   return <Navigate to={routePaths.dashboard} replace />;
  // }

  return <Component {...rest} />;
};

export default PublicRoute;
