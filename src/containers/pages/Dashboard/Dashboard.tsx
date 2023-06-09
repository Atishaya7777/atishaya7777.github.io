import React from "react";

interface IDashboard {
  [rest: string]: unknown;
}

const Dashboard: React.FC<IDashboard> = () => {
  return <div>Dashboard</div>;
};

export default Dashboard;
