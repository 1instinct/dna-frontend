import { useQuery } from "react-query";
import axios from "axios";

const fetchQuestion = async (id: string) => {
  const username = process.env.NEXT_PUBLIC_QUIZ_API_USERNAME || "";
  const password = process.env.NEXT_PUBLIC_QUIZ_API_PASSWORD || "";
  const loginResponse = await axios.post(
    `https://lawsuits.allrise.app/api/v1/login?username=${username}&password=${password}`
  );
  const token = loginResponse.data.access;
  const response = await axios.get(
    `https://lawsuits.allrise.app/api/v1/lawsuits/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const useQuestion = (id: string) => {
  return useQuery(["lawsuit", id], () => fetchQuestion(id), {
    retry: false,
    enabled: !!id
  });
};

export { fetchQuestion, useQuestion };
