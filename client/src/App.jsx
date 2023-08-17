import { EmpiricaClassic } from "@empirica/core/player/classic";
import { EmpiricaContext } from "@empirica/core/player/classic/react";
import { EmpiricaMenu, EmpiricaParticipant } from "@empirica/core/player/react";
import React from "react";
import { Game } from "./Game";
import { ExitSurvey } from "./intro-exit/ExitSurvey";
import { Introduction } from "./intro-exit/Introduction";
import { useGame } from "@empirica/core/player/classic/react";
import { Lobby } from "./intro-exit/Lobby";

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const playerKey = urlParams.get("participantKey") || "";

  const { protocol, host } = window.location;
  const url = `${protocol}//${host}/query`;

  function introSteps({ game, player }) {
    return [Introduction];
  }

  function exitSteps({ game, player }) {
    return [ExitSurvey];
  }

  const gamechecker = () => {
    const game = useGame();
    if (game) {
      console.log(game.get("status"));
      return <p>{game.get("status") || "undefined"}</p>;
    }
    return <p>undefined</p>;
  };

  return (
    <EmpiricaParticipant url={url} ns={playerKey} modeFunc={EmpiricaClassic}>
      <div className="h-screen relative">
        <EmpiricaMenu position="bottom-left" />
        <div className="h-full overflow-auto">
          <EmpiricaContext
            introSteps={introSteps}
            exitSteps={exitSteps}
            disableNoGames
            // unmanagedGame
            lobby={Lobby}
          >
            {gamechecker()}
            <Game />
          </EmpiricaContext>
        </div>
      </div>
    </EmpiricaParticipant>
  );
}
