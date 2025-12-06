import React, { use } from "react";
import Button from "@mui/material/Button";
import { animate } from "motion";
import { useEffect } from "react";
import Canvas from "./canvas.jsx";

export default function Simulation() {
  return (
    <div className="maindiv">
      <h1 className="main">Simulation</h1>
      <Canvas jpPrice={jpPrice} msPrice={msPrice} width={800} height={300} />
    </div>
  );
}
