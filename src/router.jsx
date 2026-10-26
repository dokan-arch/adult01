
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./Home/Home";
import Madicaltest from "./MadikelTest/Madicaltest";
import Headers from "./Navbar/Header"
import styles from "./Router.module.css";
import VideoDetails from "./Page/VideoDetails";

export default function Router() {
  return (
    <BrowserRouter>
      <div className={styles.router}>
        <Headers/> 
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/video/:slug" element={<VideoDetails />} />

          {/* Unknown URL redirects to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
