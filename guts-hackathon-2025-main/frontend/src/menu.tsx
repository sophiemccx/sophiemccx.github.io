import React from "react";
import Button from "@mui/material/Button";
import memeCrypto from "./memeCrypto.gif";

export const customButtonStyle = {
  width: 200,
  height: 80,
  backgroundColor: "#28575bff",
  "&:hover": {
    backgroundColor: "#15afc0a7",
  },
  fontSize: "20px !important",
};

// export const customButtonLayout = {
//   display: "flex",
//   justify-content: "space-around"
// }

export default function Game() {
  const buttonStyle: React.CSSProperties = {
    // size: "50px",
  };

  return (
    <>
      <div className="maindiv">
        <h1 className="main">Stock Battle</h1>
        <div
          className="mainbuttons"
          style={{ display: "flex", alignContent: "center" }}
        >
          <div style={{ paddingRight: 50 }}>
            <Button
              sx={customButtonStyle}
              variant="contained"
              className="button"
              href="/game"
            >
              Start Game
            </Button>
          </div>
          <div>
            <Button
              sx={customButtonStyle}
              className="button"
              variant="text"
              href="/leaderboard"
            >
              Leaderboard
            </Button>
          </div>
        </div>
        <div style={{ paddingTop: "100px" }}>
          <img src={memeCrypto} alt="loading..." />
        </div>
      </div>
    </>
  );
}
