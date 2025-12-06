import React, { useState, useEffect } from "react";
import "./leaderboard.css";
import Button from "@mui/material/Button";

type ScoreData = {
  scores: [string, string][];
};

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<ScoreData | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const response = await fetch("http://127.0.0.1:8000/scores/top");
      const data: ScoreData = await response.json();
      setLeaderboardData(data);
    }

    fetchLeaderboard().catch(console.error);
  }, []);

  return (
    <div className="maindiv">
      <div>
      <h1 className="main">Leaderboard</h1>
      </div>
    <div>
      <div className="leaderboard">
        {leaderboardData && leaderboardData.scores.map(([name, score], index) => (
          <div key={index} className="leaderboard-entry">
            <span className="rank">{index + 1}.</span>
            <span className="name">{name}</span>
            <span className="score">{score}</span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}