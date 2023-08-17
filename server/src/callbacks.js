import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import { getCurrentBatch } from "./utils";

export const Empirica = new ClassicListenersCollector();

// ---------- Batch Callbacks ------------ //Batch callbacks are run when the admin clicks Gamestart

// onBatchStart
Empirica.on("batch", "status", (ctx, { batch, status }) => {
  if (status !== "running") return;
  if (batch.get("initialized")) return; // Ensure the game does not initilize during every refresh

  const { config } = batch.get("config");
  // console.log("config", config);
  config?.treatments?.forEach((entry) => {
    // console.log("treatment", entry.treatment);
    // console.log("count", entry.count);
    for (let i = 0; i < entry.count; i++) {
      // console.log(entry.treatment)
      const kvArray = Object.entries(entry.treatment).map(([k, v], i) => {
        //Manually selecting the treatment to add to the game
        const checkKey = k === "factors" ? "treatment" : k;
        return { key: k, value: v };
      });
      console.log("kvArray", kvArray);
      batch.addGame(kvArray); //Initilize game with treatment parameters
      console.log("Creating game with treatment", entry.treatment);
    }
  });

  batch.set("initialized");
});

// ----------- Game Callbacks ------------

Empirica.onGameStart(({ game }) => {
  const round = game.addRound({
    name: "Round 1 - Jelly Beans",
    task: "jellybeans",
  });
  round.addStage({ name: "Answer", duration: 300 });
  round.addStage({ name: "Result", duration: 120 });

  const round2 = game.addRound({
    name: "Round 2 - Minesweeper",
    task: "minesweeper",
  });
  round2.addStage({ name: "Play", duration: 300 });
});

Empirica.onRoundStart(({ round }) => {});

Empirica.onStageStart(({ stage }) => {});

Empirica.onStageEnded(({ stage }) => {
  calculateJellyBeansScore(stage);
});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});

// Note: this is not the actual number of beans in the pile, it's a guess...
const jellyBeansCount = 634;

function calculateJellyBeansScore(stage) {
  if (
    stage.get("name") !== "Answer" ||
    stage.round.get("task") !== "jellybeans"
  ) {
    return;
  }

  for (const player of stage.currentGame.players) {
    let roundScore = 0;

    const playerGuess = player.round.get("guess");

    if (playerGuess) {
      const deviation = Math.abs(playerGuess - jellyBeansCount);
      const score = Math.round((1 - deviation / jellyBeansCount) * 10);
      roundScore = Math.max(0, score);
    }

    player.round.set("score", roundScore);

    const totalScore = player.get("score") || 0;
    player.set("score", totalScore + roundScore);
  }
}

// ------------ player callbacks ------------ //Player callbacks are run when the Player submits their id
Empirica.on("player", (ctx, { player }) => {
  console.log(`player ${player.id} ready to assign`);
  const batch = getCurrentBatch(ctx);
  const slots = batch.games.map((game) => {
    // console.log(game);
    console.log("treatment", game.get("factors"));
  });
});

Empirica.on("player", "introDone", (ctx, { player, introDone }) => {
  if (!introDone) return;

  // console.log("player.currentGame", player.currentGame);
  console.log(`there are ${player.currentGame.players.length} players`);

  // const batches = ctx.scopesByKind("batch");
  // const batch = batches?.get(player.get("batchId"));

  // console.log("batch", batch);

  // if (player.currentGame.players.length >= 1) {
  //   // player.currentGame.set("status", "running");
  //   player.currentGame.start();
  //   player.currentGame.set("hasStarted", false);
  // }
});
