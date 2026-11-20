import { diagnosticMessage } from "./constants.mjs";
import { registerModels, registerSheets } from "./foundry/register.mjs";

Hooks.once("init", () => {
  console.log(diagnosticMessage(game.system.version));
  registerModels();
  registerSheets();
});
