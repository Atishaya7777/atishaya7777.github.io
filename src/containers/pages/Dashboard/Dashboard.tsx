import { useTest } from "@/hooks/test/useTest";
import React from "react";

interface IDashboard {
  [rest: string]: unknown;
}

const Dashboard: React.FC<IDashboard> = () => {
  const { status, data } = useTest();
  console.log(data);
  return <div>Dashboard</div>;
};

export default Dashboard;
