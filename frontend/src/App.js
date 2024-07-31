import React from "react";
import { Route, Routes} from "react-router-dom";
import Home from "./components/home.js";
import Register from "./components/register.js";
import Login from "./components/login.js";
import AccountSummary from "./components/account_summary.js";
import AccountBalance from "./components/account_balance.js";
import AdminHome from "./components/adminHome.js";
import ChangeRoles from "./components/changeRoles.js";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/accountSummary" element={<AccountSummary />} />
        <Route path="/accountBalance" element={<AccountBalance />} />
        <Route path="/adminHome" element={<AdminHome />} />
        <Route path="/changeRoles" element={<ChangeRoles />} />
      </Routes>
    </div>
  );
}

export default App;

