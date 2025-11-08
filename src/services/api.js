import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export async function connectDB(config) {
  return axios.post(`${BASE_URL}/connect`, config);
}

export async function getTables() {
  return axios.get(`${BASE_URL}/tables`);
}

export async function getTableData(table) {
  return axios.post(`${BASE_URL}/table`, { table });
}

export async function runQuery(body) {
  return axios.post(`${BASE_URL}/query`, body);
}

export async function runSQL(query) {
  return axios.post(`${BASE_URL}/run-sql`, { query });
}

export default  {
  connectDB,
  getTables,
  getTableData,
  runQuery,
  runSQL,
};
