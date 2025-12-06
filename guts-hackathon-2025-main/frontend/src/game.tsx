import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Card from '@mui/material/Card';
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
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ApiService from "./service/apiService.tsx";
import { useNavigate } from "react-router-dom";
import { GameInfo } from "./GameInfo.ts";
import Canvas from "./components/canvas.jsx";
import PaidIcon from '@mui/icons-material/Paid';
import TollIcon from '@mui/icons-material/Toll';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import TimelineIcon from '@mui/icons-material/Timeline';

class Player {
  name: string;
  bank: string;
  jpShare: number;
  morganStanleyShare: number;
  availableCash: number;

  constructor(name: string, bank: string, jpShare: number, morganStanleyShare: number, availableCash: number) {
    this.name = name;
    this.bank = bank;
    this.jpShare = jpShare;
    this.morganStanleyShare = morganStanleyShare;
    this.availableCash = availableCash;
  }

  switchBank() {
    this.bank = this.bank === "J.P. Morgan" ? "Morgan Stanley" : "J.P. Morgan";
  }

  buyStock(ticker: string, quantity: number, price: number) {
    const totalCost = quantity * price;
    console.log(`${this.name} attempting to buy ${quantity} shares of ${ticker} at $${price} each. Total cost: $${totalCost}. Available cash: $${this.availableCash}`);
    if (this.availableCash >= totalCost) {
      console.log(`${this.name} has sufficient funds. Proceeding with purchase.`);
      this.availableCash -= totalCost;
      if (ticker === "J.P. Morgan") this.jpShare += quantity;
      else if (ticker === "Morgan Stanley") this.morganStanleyShare += quantity;
    }
    else {
      console.log(`${this.name} has insufficient funds to complete the purchase.`);
    }
  }

  sellStock(ticker: string, quantity: number, price: number) {
    console.log(`${this.name} attempting to sell ${quantity} shares of ${ticker} at $${price} each.`);
    if (ticker === "J.P. Morgan" && this.jpShare >= quantity) {
      console.log(`${this.name} has sufficient shares. Proceeding with sale.`);
      this.jpShare -= quantity;
      this.availableCash += quantity * price;
    } else if (ticker === "Morgan Stanley" && this.morganStanleyShare >= quantity) {
      console.log(`${this.name} has sufficient shares. Proceeding with sale.`);
      this.morganStanleyShare -= quantity;
      this.availableCash += quantity * price;
    }
    else{
      console.log(`${this.name} has insufficient shares to complete the sale.`);
    }
    console.log(`${this.name} now has $${this.availableCash} in cash.`);
  }
}

export default function Game() {
  const jpmorgan = "J.P. Morgan";
  const morganstanley = "Morgan Stanley"
  const [leftBank, setLeftBank] = useState(jpmorgan);
  const [rightBank, setRightBank] = useState(morganstanley);

  const [p1History, setP1History] = useState<Array<{time: number, value: number, profit: number}>>([]);
  const [p2History, setP2History] = useState<Array<{time: number, value: number, profit: number}>>([]);

  const navigate = useNavigate();
  const initData = [
    {
      name: "0",
      jpm: 133.4999,
    },
  ];

  const initDataMs = [
    {
      name: "0",
      ms: 54.55,
    },
  ];

  const initDataa = [
    {
      name: "0",
      ms: 54.55,
      jpm: 133.4999,
    },
  ];

  const [jpPrice, setJpPrice] = useState(0);
  const [msPrice, setMsPrice] = useState(0);


  const p1Ref = React.useRef(new Player("Player 1", jpmorgan, 0, 0, 1000));
  const p2Ref = React.useRef(new Player("Player 2", morganstanley, 0, 0, 1000));
  const qty = 1;

  const priceFor = (bank: string) => (bank === jpmorgan ? jpPrice : msPrice);
  const buyFor = (side: "left" | "right") => {
    const bank = side === "left" ? leftBank : rightBank;
    const ref = side === "left" ? p1Ref : p2Ref;
    ref.current.buyStock(bank, qty, priceFor(bank));
  };
  const sellFor = (side: "left" | "right") => {
    const bank = side === "left" ? leftBank : rightBank;
    const ref = side === "left" ? p1Ref : p2Ref;
    ref.current.sellStock(bank, qty, priceFor(bank));
  };
  const switchFor = (side: "left" | "right") => {
    const ref = side === "left" ? p1Ref : p2Ref;
    ref.current.switchBank();
    if (side === "left") setLeftBank(ref.current.bank);
    else setRightBank(ref.current.bank);
  };

  // function to call after game ends
  const gameEnd = () => {
    console.log("Game ended. Preparing report...");
    const gameInfo: GameInfo = {
      jpmPriceHistory: dataa.map(d => ({ name: d.name, jpm: d.jpm })),
      msPriceHistory: dataa.map(d => ({ name: d.name, ms: d.ms })),
      finalTime: testNum,
      player1Bank: leftBank,
      player2Bank: rightBank,
      player1Balance: p1Ref.current.availableCash + (p1Ref.current.jpShare * jpPrice) + (p1Ref.current.morganStanleyShare * msPrice),
      player2Balance: p2Ref.current.availableCash + (p2Ref.current.jpShare * jpPrice) + (p2Ref.current.morganStanleyShare * msPrice),
      player1History: p1History,
      player2History: p2History
    };
    navigate('/report', {state: gameInfo});
  }

  const [data, setData] = useState(initData);
  const [msData, setMsData] = useState(initDataMs);
  const [dataa, setDataa] = useState(initDataa)
  const [testNum, setTestNum] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setTestNum((prev) => {
        const next = prev + 1;
        if (next > 100) {
          clearInterval(id);
          return prev;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (testNum <= 100) {
  //       const newPrice = await ApiService.getStockPrice("jpm", testNum, 100);
  //       console.log("J.P. Morgan Test for testNum: ", testNum, " : ", newPrice);

  //       setData((prev) => [
  //         ...prev,
  //         { name: testNum.toString(), jpm: newPrice }
  //       ]);

  //       setJpPrice(newPrice);
  //     }
  //   };

  //   fetchData();
  // }, [testNum]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (testNum <= 100) {
  //       const newPrice = await ApiService.getStockPrice("ms", testNum, 100);
  //       console.log("MS Test for testNum: ", testNum, " : ", newPrice);

  //       setMsData((prev) => [
  //         ...prev,
  //         { name: testNum.toString(), ms: newPrice },
  //       ]);

  //       setMsPrice(newPrice);

  //     }
  //   };

  //   fetchData();
  // }, [testNum]);


  useEffect(() => {
    const fetchData = async () => {
      if (testNum <= 100) {
        const newMSPrice = await ApiService.getStockPrice("ms", testNum, 100);
        const newJPMPrice = await ApiService.getStockPrice("jpm", testNum, 100);
  
        setDataa((prev) => [
          ...prev,
          { name: testNum.toString(), ms: newMSPrice, jpm: newJPMPrice },
        ]);
  
        setMsPrice(newMSPrice);
        setJpPrice(newJPMPrice);
  
        // Track portfolio values over time
        const p1Value = p1Ref.current.availableCash + 
                        (p1Ref.current.jpShare * newJPMPrice) + 
                        (p1Ref.current.morganStanleyShare * newMSPrice);
        const p2Value = p2Ref.current.availableCash + 
                        (p2Ref.current.jpShare * newJPMPrice) + 
                        (p2Ref.current.morganStanleyShare * newMSPrice);
  
        setP1History((prev) => [...prev, { 
          time: testNum, 
          value: p1Value,
          profit: p1Value - 1000 
        }]);
        
        setP2History((prev) => [...prev, { 
          time: testNum, 
          value: p2Value,
          profit: p2Value - 1000 
        }]);
      }
    };
  
    fetchData();
  }, [testNum]);
  
  // game end
  useEffect(() => {
    if (testNum >= 100) {
      console.log("Game over at tick:", testNum);
      gameEnd();
    }
  }, [testNum]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const k = event.key;
      if (k.toLowerCase() === "w") buyFor("left");
      else if (k.toLowerCase() === "s") sellFor("left");
      else if (k.toLowerCase() === "a" || k.toLowerCase() == "d") switchFor("left");
      else if (k === "ArrowUp") buyFor("right");
      else if (k === "ArrowDown") sellFor("right");
      else if (k === "ArrowRight" || k === "ArrowLeft") switchFor("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [leftBank, rightBank, jpPrice, msPrice]);

  return (
    <div className="game-board">
      <div className="board-header">
        <div className="heading left">PLAYER 1</div>
        <div className="heading right">PLAYER 2</div>
      </div>
      
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        gap: "20px",
      }}>
      <div style={{ flex: "0 0 150px" }}>

      <Card variant="outlined" sx={{ p: 2 }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <PaidIcon sx={{ fontSize: 40, color: "#4caf50" }} />
    <div>
      <div className="heading left balance" style={{ fontWeight: 600 }}>
        Total Balance
      </div>
      <div className="balancevalue" style={{ fontSize: "1.25rem" }}>
        ${(p1Ref.current.availableCash + (p1Ref.current.jpShare * jpPrice) + (p1Ref.current.morganStanleyShare * msPrice)).toFixed(2)}
      </div>
    </div>
  </div>
</Card>

<Card variant="outlined" sx={{ p: 2 }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <TollIcon sx={{ fontSize: 40, color: "#4caf50" }} />
    <div>
      <div className="heading left balance" style={{ fontWeight: 600 }}>
        Available Cash
      </div>
      <div className="balancevalue" style={{ fontSize: "1.25rem" }}>
      ${p1Ref.current.availableCash.toFixed(2)}
      </div>
    </div>
  </div>
</Card>


<Card variant="outlined" sx={{ p: 2 }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <AutoGraphIcon sx={{ fontSize: 40, color: "#4caf50" }} />
    <div>
      <div className="heading left balance" style={{ fontWeight: 600 }}>
      J.P. Morgan Shares
      </div>
      <div className="balancevalue" style={{ fontSize: "1.25rem" }}>
      {p1Ref.current.jpShare}
      </div>
    </div>
  </div>
</Card>

<Card variant="outlined" sx={{ p: 2 }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <TimelineIcon sx={{ fontSize: 40, color: "#4caf50" }} />
    <div>
      <div className="heading left balance" style={{ fontWeight: 600 }}>
      Morgan Stanley Shares
      </div>
      <div className="balancevalue" style={{ fontSize: "1.25rem" }}>
      {p1Ref.current.morganStanleyShare}
      </div>
    </div>
  </div>
</Card>
      </div>

      <div style={{ 
        flex: "1", 
        display: "flex", 
        justifyContent: "center",
        padding: "10px",
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
        border: "2px solid #333",
      }}>
        <Canvas jpPrice={jpPrice} msPrice={msPrice} width={800} height={140} />
      </div>

      <div style={{ flex: "0 0 150px", textAlign: "right", paddingTop: "2rem"}}>
      <Card className="card" variant="outlined">

      <div style={{ flex: "0 0 150px" }}>

<Card variant="outlined" sx={{ p: 2 }}>
<div
style={{
display: "flex",
alignItems: "center",
gap: "12px",
}}
>
<PaidIcon sx={{ fontSize: 40, color: "#4caf50" }} />
<div>
<div className="heading left balance" style={{ fontWeight: 600 }}>
  Total Balance
</div>
<div className="balancevalue" style={{ fontSize: "1.25rem" }}>
  ${(p2Ref.current.availableCash + (p1Ref.current.jpShare * jpPrice) + (p1Ref.current.morganStanleyShare * msPrice)).toFixed(2)}
</div>
</div>
</div>
</Card>

<Card variant="outlined" sx={{ p: 2 }}>
<div
style={{
display: "flex",
alignItems: "center",
gap: "12px",
}}
>
<TollIcon sx={{ fontSize: 40, color: "#4caf50" }} />
<div>
<div className="heading left balance" style={{ fontWeight: 600 }}>
  Available Cash
</div>
<div className="balancevalue" style={{ fontSize: "1.25rem" }}>
${p2Ref.current.availableCash.toFixed(2)}
</div>
</div>
</div>
</Card>


<Card variant="outlined" sx={{ p: 2 }}>
<div
style={{
display: "flex",
alignItems: "center",
gap: "12px",
}}
>
<AutoGraphIcon sx={{ fontSize: 40, color: "#4caf50" }} />
<div>
<div className="heading left balance" style={{ fontWeight: 600 }}>
J.P. Morgan Shares
</div>
<div className="balancevalue" style={{ fontSize: "1.25rem" }}>
{p2Ref.current.jpShare}
</div>
</div>
</div>
</Card>

<Card variant="outlined" sx={{ p: 2 }}>
<div
style={{
display: "flex",
alignItems: "center",
gap: "12px",
}}
>
<TimelineIcon sx={{ fontSize: 40, color: "#4caf50" }} />
<div>
<div className="heading left balance" style={{ fontWeight: 600 }}>
Morgan Stanley Shares
</div>
<div className="balancevalue" style={{ fontSize: "1.25rem" }}>
{p2Ref.current.morganStanleyShare}
</div>
</div>
</div>
</Card>
</div>
        </Card>
      </div>


      

<div
  style={{
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "max(16px, calc(env(safe-area-inset-bottom) + 16px))",
    zIndex: 950,
    padding: 12,
    width: "min(680px, 65vw)",
  }}
>
  <h3 className="heading" style={{ textAlign: "center", margin: 8 }}>
    Current Stock Price of J.P. Morgan vs Morgan Stanley
  </h3>

  <div style={{ width: "100%", height: 320 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={dataa.slice(-40)}
        margin={{ top: 12, right: 18, left: 42, bottom: 28 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name">
          <Label offset={0} position="insideBottom" dy={22} className="heading" />
        </XAxis>
        <YAxis>
          <Label
            value="Stock Price (USD)"
            angle={-90}
            position="insideLeft"
            dx={-24}
            style={{ textAnchor: "middle" }}
            className="heading"
          />
        </YAxis>
        <Tooltip />
        <Legend verticalAlign="top" height={24} />
        <Line
          type="monotone"
          dataKey="jpm"
          name="J.P. Morgan"
          isAnimationActive={false}
          stroke="#82ca9d"
          dot={{ r: 2.5 }}
        />
        <Line
          type="monotone"
          dataKey="ms"
          name="Morgan Stanley"
          isAnimationActive={false}
          stroke="#6599bbff"
          dot={{ r: 2.5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>



        {/* <div>
          <h3 className="heading" style={{ marginLeft: "5rem", textAlign: "center", placeItems: "center", display: "grid"}}>Morgan Stanley Stock Price Over Time</h3>
          <LineChart
            width={700}
            height={400}
            data={msData}
            margin={{
              top: 20,
              right: 30,
              left: 60,
              bottom: 80,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name">
              <Label value="Time" offset={0} position="insideBottom" dy={40} className="heading"/>
            </XAxis>

            <YAxis>
              <Label
                value="Stock Price (USD)"
                angle={-90}
                position="insideLeft"
                dx={-20}
                style={{ textAnchor: "middle" }}
                className="heading"
              />
            </YAxis>
            <Tooltip />
            <Legend/>
            <Line
              type="monotone"
              dataKey="ms"
              isAnimationActive={false}
              stroke="#6599bbff"
            />
          </LineChart> */}
        {/* </div> */}

        
      </div>

      <div className="bottom-strip">
        <div className="controls left-controls">
          <div className="bank-label">{leftBank}</div>

          <div className="control-row">
            <Button variant="outlined" className="control-btn" onClick={() => buyFor("left")}>
              <div className="heading">Buy (W)</div>
            </Button>
            <Button variant="outlined" className="control-btn" onClick={() => sellFor("left")}>
              <div className="heading">Sell (S)</div>
            </Button>
          </div>

          <Button className="button" onClick={() => switchFor("left")}>Switch Bank (A / D)</Button>
        </div>

        <div className="controls right-controls">
          <div className="bank-label">{rightBank}</div>

          <div className="control-row">
            <Button variant="outlined" className="control-btn" onClick={() => buyFor("right")}>
              <div className="heading">Buy
              <ArrowUpwardIcon fontSize="xs" /></div>
            </Button>
            <Button variant="outlined" className="control-btn" onClick={() => sellFor("right")}>
              <div className="heading">Sell
              <ArrowDownwardIcon fontSize="xs"/></div>
            </Button>
          </div>

          <Button className="button" onClick={() => switchFor("right")}>
            Switch Bank (<ArrowBackIcon fontSize="xs"/> / <ArrowForwardIcon fontSize="xs"/>)
          </Button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      ></div>
    </div>
  );
}
