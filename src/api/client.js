import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: API_URL,
});

export const getMatches = async () => {
  const response = await client.get('/matches');
  return response.data;
};

export const getTeams = async () => {
  const response = await client.get('/teams');
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await client.get('/leaderboard');
  return response.data;
};

export const getMatchDetails = async (id) => {
  const response = await client.get(`/matches/${id}/details`);
  return response.data;
};

export default client;
