export interface GameInfo {
  jpmPriceHistory: any[];
  msPriceHistory: any[];
  finalTime: number;
  player1Bank: string;
  player2Bank: string;
  player1Balance?: number;
  player2Balance?: number;
  player1History?: Array<{time: number, value: number, profit: number}>;
  player2History?: Array<{time: number, value: number, profit: number}>;
}