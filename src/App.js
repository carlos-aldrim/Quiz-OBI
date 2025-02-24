import React, { useState } from 'react';
import { Home } from './containers/Home/Home';
import { Game } from './containers/Game/Game';
import './App.css';

export const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  return gameStarted ? (
    <Game setGameStarted={setGameStarted} />
  ) : (
    <Home setGameStarted={setGameStarted} />
  );
};