import { diagnosticMessage } from "./constants.mjs";

Hooks.once("init", () => {
  console.log(diagnosticMessage());
});
