import axios from "axios";

const baserUrl = "http://localhost:4000/api/v1/auth";

export const registerService = async (userData) => {
  const response = await axios.post(baserUrl + "/register", userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

export const loginService = async (userData) => {
  const response = await axios.post(baserUrl + "/login", userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};
