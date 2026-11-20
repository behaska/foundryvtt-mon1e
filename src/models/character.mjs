import { APTITUDE_KEYS, ATTRIBUTE_KEYS, BRAWL_KEYS, ENCOUNTER_KEYS, SKILL_KEYS, defaultStatRows } from "../rules/base-stats.mjs";
import { defaultClassLevelRows } from "../rules/identity.mjs";
import { COMPOSURE_STATE_KEYS, HEALTH_STATE_KEYS } from "../rules/tracks.mjs";

const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

/** Raw whole number, no bounds (none confirmed; see docs/RULES.md section B). Empty is 0. */
const integerField = () => new NumberField({ required: true, nullable: false, integer: true, initial: 0 });

/** Free text. Empty is blank. */
const textField = () => new StringField({ required: true, blank: true, initial: "" });

/** A list of `{ key, value }` rows, seeded with the printed base entries. */
const statRowsField = (keys) =>
  new ArrayField(
    new SchemaField({
      key: new StringField({ required: true, blank: false }),
      value: integerField()
    }),
    { initial: () => defaultStatRows(keys) }
  );

/** A fixed group of named integer fields, one per key. */
const integerGroupField = (keys) =>
  new SchemaField(Object.fromEntries(keys.map((key) => [key, integerField()])));

/** Independent on/off flag, default off. */
const flagField = () => new BooleanField({ required: true, initial: false });

/** A gauge: count of checked boxes (default 0) plus independent state flags. */
const trackField = (stateKeys) =>
  new SchemaField({
    filled: integerField(),
    ...Object.fromEntries(stateKeys.map((key) => [key, flagField()]))
  });

/**
 * Data model of a `character` Actor. Page 1 identity fields, base attributes, aptitudes, skills, brawls, encounters, health and composure, raw values.
 * The character name is the Actor `name`, not stored here.
 */
export class CharacterData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["MON1E.Character"];

  /** @override */
  static defineSchema() {
    return {
      species: textField(),
      ancestry: textField(),
      moonSignature: textField(),
      kaon: integerField(),
      zaon: integerField(),
      zaonScars: integerField(),
      archetype: textField(),
      might: integerField(),
      classLevels: new ArrayField(
        new SchemaField({
          class: textField(),
          subClass: textField(),
          level: integerField()
        }),
        { initial: () => defaultClassLevelRows() }
      ),
      attributes: statRowsField(ATTRIBUTE_KEYS),
      aptitudes: statRowsField(APTITUDE_KEYS),
      skills: statRowsField(SKILL_KEYS),
      brawls: integerGroupField(BRAWL_KEYS),
      encounters: integerGroupField(ENCOUNTER_KEYS),
      health: trackField(HEALTH_STATE_KEYS),
      composure: trackField(COMPOSURE_STATE_KEYS)
    };
  }
}
