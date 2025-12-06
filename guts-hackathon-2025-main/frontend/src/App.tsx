import "./App.css";
import Game from "./game.tsx";
import Leaderboard from "./leaderboard.tsx";
import Report from "./report.tsx";
import Menu from "./menu.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Simulation from "./components/simulation.tsx";
import React from "react";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/game" element={<Game />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/report" element={<Report />} />
            <Route path="/simulation" element={<Simulation />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
