import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTournaments } from '../api/client';

const SeasonContext = createContext();

export const SeasonProvider = ({ children }) => {
  const [tournaments, setTournaments] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await getTournaments();
        if (response.success) {
          const data = response.data;
          setTournaments(data);
          
          // Check localStorage for saved preference
          const savedId = localStorage.getItem('gpl_active_season');
          const savedSeason = data.find(s => s.id === savedId);
          
          // Default to the active season or the most recent one
          const defaultSeason = savedSeason || data.find(s => s.is_active) || data[0];
          setActiveSeason(defaultSeason);
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const changeSeason = (season) => {
    setActiveSeason(season);
    localStorage.setItem('gpl_active_season', season.id);
  };

  return (
    <SeasonContext.Provider value={{ tournaments, activeSeason, changeSeason, loading }}>
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
};
