import axios from "axios";

const BASE_URL = "http://localhost:8000";

export default class ApiService {
  static async getStockPrice(stock: string, index: number, divisions: number) {
    const response = await axios.get(
      `${BASE_URL}/stocks/${stock}/${index}/${divisions}`
    );
    return response.data.price;
  }

  static async saveScore(user: string, score: number) {
    const response = await axios.get(
      `${BASE_URL}/scores/save/${user}/${score}`
    );
    return response.data;
  }

  static async getScore(user: string) {
    const response = await axios.get(`${BASE_URL}/scores/get/${user}`);
    return response.data.score;
  }
}
