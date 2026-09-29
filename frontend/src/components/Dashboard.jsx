import React from "react";
import AppLayout from "./layout/AppLayout";

const Dashboard = ({ children, activeMenu }) => {
  return <AppLayout pageTitle={activeMenu}>{children}</AppLayout>;
};

export default Dashboard;