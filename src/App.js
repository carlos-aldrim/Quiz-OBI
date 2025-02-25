import React, { useState } from "react";
import { Home } from "./containers/Home/Home";
import { Game } from "./containers/Game/Game";
import { FullGameReport } from "./containers/FullGameReport/FullGameReport";
import "./App.css";

export const App = () => {
  const [currentScreen, setCurrentScreen] = useState("home");

  return (
    <div>
      {currentScreen === "home" && <Home setCurrentScreen={setCurrentScreen} />}
      {currentScreen === "game" && <Game setCurrentScreen={setCurrentScreen} />}
      {currentScreen === "fullReport" && <FullGameReport setCurrentScreen={setCurrentScreen} />}
    </div>
  );
};
