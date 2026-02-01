import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Sidebar from "./Sidebar";
import Users from "./Users";
import Recharge from "./Recharge";
import Withdrawal from "./WithdrawHistory";
import WithdrawRequest from "./withdrawRequest";
import PaymentStatus from "./PaymentStatus";
import Logout from "./Logout";
import ManageProducts from "./ManageProducts";
import Giftcodes from "./Giftcodes";
import Teams from "./Teams";
import QRCodeSubmit from "./QRCodeSubmit";
import LucySpin from "./lucySpin";
import ProductPurchaseList from "./ProductPurchaseList";
import SocialMedia from "./SocialMedia";
import DemoAccounts from "./DemoAccounts";
import CommissionSettings from "./CommissionSettings";
import UPIDashboard from "./UPIDashboard";
import AuthCard from "./AuthCard";
import SubordinateManager from "./SubordinateManager";

function App() {
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("realStateLoggedUser");
    if (user) setLoggedUser(JSON.parse(user));
  }, []);

  if (!loggedUser) {
    return <AuthCard onLoginSuccess={setLoggedUser} />;
  }

  const role = loggedUser.type;

  // 🔥 Allowed routes for subordinate
  const subordinateAllowed = [
    "/payment-status",
    "/QRCodeSubmit",
    "/UPISettings",
    "/recharge",
  ];

  const ProtectedRoute = ({ path, element }) => {
    if (role === "subordinate" && !subordinateAllowed.includes(path)) {
      return <Navigate to="/payment-status" replace />;
    }
    return element;
  };

  return (
    <div className="grid-container">
      <Sidebar />

      <Routes>
        <Route path="/" element={<ProtectedRoute path="/" element={<ProductPurchaseList />} />} />
        <Route path="/users" element={<ProtectedRoute path="/users" element={<Users isDemoUser={false} />} />} />
        <Route path="/CreateDemousers" element={<ProtectedRoute path="/CreateDemousers" element={<DemoAccounts />} />} />
        <Route path="/demousers" element={<ProtectedRoute path="/demousers" element={<Users isDemoUser={true} />} />} />
        <Route path="/commissionSettings" element={<ProtectedRoute path="/commissionSettings" element={<CommissionSettings />} />} />
        <Route path="/UPISettings" element={<ProtectedRoute path="/UPISettings" element={<UPIDashboard />} />} />
        <Route path="/SubordinateManager" element={<ProtectedRoute path="/SubordinateManager" element={<SubordinateManager />} />} />

        <Route path="/recharge" element={<ProtectedRoute path="/recharge" element={<Recharge />} />} />
        <Route path="/withdraw" element={<ProtectedRoute path="/withdraw" element={<Withdrawal />} />} />
        <Route path="/WithdrawRequest" element={<ProtectedRoute path="/WithdrawRequest" element={<WithdrawRequest />} />} />
        <Route path="/edit-product" element={<ProtectedRoute path="/edit-product" element={<ManageProducts />} />} />

        <Route path="/payment-status" element={<ProtectedRoute path="/payment-status" element={<PaymentStatus />} />} />
        <Route path="/QRCodeSubmit" element={<ProtectedRoute path="/QRCodeSubmit" element={<QRCodeSubmit />} />} />

        <Route path="/LucySpin" element={<ProtectedRoute path="/LucySpin" element={<LucySpin />} />} />
        <Route path="/giftcodes" element={<ProtectedRoute path="/giftcodes" element={<Giftcodes />} />} />
        <Route path="/socialMedia" element={<ProtectedRoute path="/socialMedia" element={<SocialMedia />} />} />

        <Route path="/teams/:id" element={<ProtectedRoute path="/teams/:id" element={<Teams />} />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </div>
  );
}

export default App;
