import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import MainScreen from "./screen/MainScreen.jsx";
import OnboardScreen from "./screen/OnboardScreen.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterScreen from "./screen/RegisterScreen.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/app" element={<MainScreen />} />
        <Route path="/onboard" element={<OnboardScreen />} />
        <Route path="/register-screen" element={<RegisterScreen />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
