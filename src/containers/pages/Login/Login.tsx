import React from "react";

interface ILogin {
  [rest: string]: unknown;
}

const Login: React.FC<ILogin> = () => {
  return <div>Login</div>;
};

export default Login;
