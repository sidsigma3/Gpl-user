import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: API_URL,
});

export const getMatches = async (tournamentId) => {
  const response = await client.get('/matches', { params: { tournamentId } });
  return response.data;
};

export const getTeams = async (tournamentId) => {
  const response = await client.get('/teams', { params: { tournamentId } });
  return response.data;
};

export const getLeaderboard = async (tournamentId) => {
  const response = await client.get('/leaderboard', { params: { tournamentId } });
  return response.data;
};

export const getMatchDetails = async (id) => {
  const response = await client.get(`/matches/${id}/details`);
  return response.data;
};

const getVoterId = () => {
  let id = localStorage.getItem('gpl_voter_id');
  if (!id) {
    id = 'voter_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('gpl_voter_id', id);
  }
  return id;
};

export const submitVote = async (matchId, playerId, playerName) => {
  const voterId = getVoterId();
  const response = await client.post(`/matches/${matchId}/vote`, { playerId, playerName, voterId });
  return response.data;
};

export const getVoteCounts = async (matchId) => {
  const response = await client.get(`/matches/${matchId}/votes`);
  return response.data;
};

export const getTournaments = async () => {
  const response = await client.get('/tournaments');
  return response.data;
};

export const getMatchInsights = async (id) => {
  const response = await client.get(`/ai/match-insight/${id}`);
  return response.data;
};

export default client;
