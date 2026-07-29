import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ShortLinkPage from "./pages/ShortLink";
import CheckoutPage from "./pages/Checkout";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/c/:code" element={<ShortLinkPage />} />
        <Route path="/checkout/:id" element={<CheckoutPage />} />
        <Route path="*" element={<Navigate to="/c/DEMO" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
