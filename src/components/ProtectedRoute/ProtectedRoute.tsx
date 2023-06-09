import React, { ReactElement } from "react";

type TProtectedRouteProps = {
  component: () => ReactElement | null;
  [prop: string]: unknown;
};

const ProtectedRoute = ({
  component: Component,
  ...rest
}: TProtectedRouteProps) => {
  /* You can put in your own custom logic */
  // if (tokenService.getTokenExpiryDate() && tokenService.getAccessToken()) {
  // if (
  //   new Date().getTime() >=
  //   new Date(tokenService.getTokenExpiryDate()).getTime()
  // ) {
  //   clearUserDetails();
  //   tokenService.clearToken();
  //   toaster.warning({
  //     description: "User has timed out, please log in again!",
  //   });
  //   return <Navigate to={routePaths.auth.signIn} replace />;
  // }
  // }

  // if (tokenService.getAccessToken()) {
  //   return <Component {...rest} />;
  // }

  // return <Navigate to={routePaths.auth.login} replace />;

  return <Component {...rest} />;
};

export default ProtectedRoute;
