import { CHARACTER_TYPE, SYSTEM_ID } from "../constants.mjs";
import { CharacterData } from "../models/character.mjs";
import { CharacterSheet } from "../sheets/character-sheet.mjs";

/** Register Actor data models. Call from the `init` hook. */
export function registerModels() {
  CONFIG.Actor.dataModels[CHARACTER_TYPE] = CharacterData;
}

/** Register sheets. Call from the `init` hook. */
export function registerSheets() {
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, SYSTEM_ID, CharacterSheet, {
    types: [CHARACTER_TYPE],
    makeDefault: true,
    label: "MON1E.Sheet.Character"
  });
}
