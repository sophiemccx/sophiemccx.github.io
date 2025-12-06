// report.tsx
import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
} from "recharts";
import type { GameInfo } from "./GameInfo";

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 16 }}>
      <div className="line-header">
        <div className="heading left">{title}</div>
      </div>
      <div
        style={{
          width: "50rem",
          height: "10rem",
          minHeight: 420,
          maxHeight: 720,
          background: "#1a1f25",
          border: "1px solid #333",
          borderRadius: 12,
        }}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </section>
  );
}

export default function Report() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const gameInfo = state as GameInfo | undefined;

  useEffect(() => {
    if (!gameInfo) navigate("/", { replace: true });
  }, [gameInfo, navigate]);

  const priceSeries = useMemo(() => {
    const j = gameInfo?.jpmPriceHistory ?? [];
    const m = gameInfo?.msPriceHistory ?? [];
    const by: Record<string, { name: string; jpm?: number; ms?: number }> = {};
    j.forEach((d: any) => {
      by[d.name] = { ...(by[d.name] || { name: d.name }), jpm: d.jpm };
    });
    m.forEach((d: any) => {
      by[d.name] = { ...(by[d.name] || { name: d.name }), ms: d.ms };
    });
    return Object.values(by).sort((a, b) => Number(a.name) - Number(b.name));
  }, [gameInfo]);

  const portfolioSeries = useMemo(() => {
    type Row = {
      time: number;
      p1: number | null;
      p2: number | null;
      p1Profit: number | null;
      p2Profit: number | null;
    };
    const a = gameInfo?.player1History ?? [];
    const b = gameInfo?.player2History ?? [];
    const len = Math.max(a.length, b.length);
    const rows: Row[] = [];
    for (let i = 0; i < len; i++) {
      rows.push({
        time: a[i]?.time ?? b[i]?.time ?? i,
        p1: a[i]?.value ?? null,
        p2: b[i]?.value ?? null,
        p1Profit: a[i]?.profit ?? null,
        p2Profit: b[i]?.profit ?? null,
      });
    }
    return rows;
  }, [gameInfo]);

  if (!gameInfo)
    return (
      <div className="game-board">
        <div className="main">No report data</div>
      </div>
    );

  const p1Final = Number(gameInfo.player1Balance ?? 0);
  const p2Final = Number(gameInfo.player2Balance ?? 0);
  const winner =
    p1Final > p2Final ? "Player 1" : p2Final > p1Final ? "Player 2" : "Draw";

  const headerBox: React.CSSProperties = {
    background: "#12161b",
    border: "1px solid #2a2f35",
    borderRadius: 12,
    padding: 16,
  };

  const header: React.CSSProperties = {
    background: "#12161b",
    borderRadius: 12,
    padding: 16,
  };

  const heading1: React.CSSProperties = {
    fontSize: "25px",
    color: p1Final.toFixed(2) > p2Final.toFixed(2) ? "#68c55aff" : "#c56e5aff",
  };

  const heading2: React.CSSProperties = {
    fontSize: "25px",
    color: p1Final.toFixed(2) < p2Final.toFixed(2) ? "#68c55aff" : "#c56e5aff",
  };

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
    marginTop: 16,
  };

  return (
    <div className="game-board">
      <div style={grid}>
        <div style={header}>
          <div className="main">Game Report</div>
          <div className="heading">Winner: {winner}</div>
        </div>

        <div style={headerBox}>
          <div style={heading1} className="heading">
            Player 1
          </div>
          {/* <div className="heading">Bank: {gameInfo.player1Bank}</div> */}
          <div style={heading1} className="heading">
            Balance: ${p1Final.toFixed(2)}
          </div>
        </div>

        <div style={headerBox}>
          <div style={heading2} className="heading">
            Player 2
          </div>
          {/* <div className="heading">Bank: {gameInfo.player2Bank}</div> */}
          <div style={heading2} className="heading">
            Balance: ${p2Final.toFixed(2)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          alignItems: "start",
          marginTop: 16,
        }}
      >
        <ChartCard title="J.P. Morgan vs Morgan Stanley — Price">
          <LineChart
            data={priceSeries}
            margin={{ top: 24, right: 36, left: 72, bottom: 64 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f35" />
            <XAxis dataKey="name" tick={{ fill: "#dddddd" }}>
              <Label
                value="Time"
                position="insideBottom"
                dy={40}
                className="heading"
              />
            </XAxis>
            <YAxis tick={{ fill: "#dddddd" }}>
              <Label
                value="Price (USD)"
                angle={-90}
                position="insideLeft"
                dx={-24}
                className="heading"
              />
            </YAxis>
            <Tooltip
              contentStyle={{
                background: "#11171c",
                border: "1px solid #333",
                color: "#ddd",
              }}
            />
            <Legend wrapperStyle={{ color: "#dddddd" }} />
            <Line
              type="monotone"
              dataKey="jpm"
              name="J.P. Morgan"
              isAnimationActive={false}
              dot={false}
              stroke="#82ca9d"
            />
            <Line
              type="monotone"
              dataKey="ms"
              name="Morgan Stanley"
              isAnimationActive={false}
              dot={false}
              stroke="#6599bb"
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="Portfolio Value Over Time">
          <LineChart
            data={portfolioSeries}
            margin={{ top: 24, right: 36, left: 72, bottom: 64 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f35" />
            <XAxis dataKey="time" tick={{ fill: "#dddddd" }}>
              <Label
                value="Time from start (seconds)"
                position="insideBottom"
                dy={40}
                className="heading"
              />
            </XAxis>
            <YAxis tick={{ fill: "#dddddd" }}>
              <Label
                value="Value (USD)"
                angle={-90}
                position="insideLeft"
                dx={-24}
                className="heading"
              />
            </YAxis>
            <Tooltip
              contentStyle={{
                background: "#11171c",
                border: "1px solid #333",
                color: "#ddd",
              }}
            />
            <Legend wrapperStyle={{ color: "#dddddd" }} />
            <Line
              type="monotone"
              dataKey="p1"
              name="Player 1"
              stroke="#cf8452ff"
              isAnimationActive={false}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="p2"
              name="Player 2"
              stroke="#cfc752ff"
              isAnimationActive={false}
              dot={false}
            />
          </LineChart>
        </ChartCard>
      </div>

      {/* Profit */}
      <ChartCard title="Profit Over Time">
        <LineChart
          data={portfolioSeries}
          margin={{ top: 24, right: 36, left: 72, bottom: 64 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f35" />
          <XAxis dataKey="time" tick={{ fill: "#dddddd" }}>
            <Label
              value="Time from start (seconds)"
              position="insideBottom"
              dy={40}
              className="heading"
            />
          </XAxis>
          <YAxis tick={{ fill: "#dddddd" }}>
            <Label
              value="Profit (USD)"
              angle={-90}
              position="insideLeft"
              dx={-24}
              className="heading"
            />
          </YAxis>
          <Tooltip
            contentStyle={{
              background: "#11171c",
              border: "1px solid #333",
              color: "#ddd",
            }}
          />
          <Legend wrapperStyle={{ color: "#dddddd" }} />
          <Line
            type="monotone"
            dataKey="p1Profit"
            name="Player 1 Profit"
            stroke="#cf8452ff"
            isAnimationActive={false}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="p2Profit"
            name="Player 2 Profit"
            stroke="#cfc752ff"
            isAnimationActive={false}
            dot={false}
          />
        </LineChart>
      </ChartCard>

      <div className="bottom-strip" style={{ marginTop: 16 }}>
        <div />
        <div className="right-controls">
          <Button
            variant="outlined"
            className="backtobutton"
            onClick={() => navigate("/", { replace: true })}
            style={{ borderColor: "#333" }}
          >
            Back to game
          </Button>
        </div>
      </div>
    </div>
  );
}
