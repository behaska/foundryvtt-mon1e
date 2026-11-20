import { defaultClassLevelRows } from "../rules/identity.mjs";

const { ArrayField, NumberField, SchemaField, StringField } = foundry.data.fields;

/** Raw whole number, no bounds (none confirmed; see docs/RULES.md section B). Empty is 0. */
const integerField = () => new NumberField({ required: true, nullable: false, integer: true, initial: 0 });

/** Free text. Empty is blank. */
const textField = () => new StringField({ required: true, blank: true, initial: "" });

/**
 * Data model of a `character` Actor. Page 1 identity fields only, raw values.
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
      )
    };
  }
}
