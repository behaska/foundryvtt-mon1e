import { TEMPLATE_ROOT } from "../constants.mjs";
import { DIAGRAM_FLAG_KEYS, DIAGRAM_NUMBER_KEYS } from "../rules/diagram.mjs";
import { DISORDER_KEYS, SCAR_KEYS } from "../rules/scars.mjs";
import { COMPOSURE_STATE_KEYS, HEALTH_STATE_KEYS, adjustFilled, boxesToDraw } from "../rules/tracks.mjs";

const TRACKS = ["health", "composure", ...SCAR_KEYS];

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/** Character sheet: header plus one tab per sheet page. Only page 1 exists for now. */
export class CharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["mon1e", "character-sheet"],
    tag: "form",
    position: { width: 720, height: 640 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: { adjustTrack: CharacterSheet.#onAdjustTrack, addDisorder: CharacterSheet.#onAddDisorder }
  };

  /**
   * (+)/(-) on a gauge. Reads `data-track` ("health" or "composure") and `data-delta` (+1 or -1).
   * @this {CharacterSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAdjustTrack(event, target) {
    const { track, delta } = target.dataset;
    if (!TRACKS.includes(track)) return;
    const next = adjustFilled(this.document.system[track].filled, Number(delta));
    await this.document.update({ [`system.${track}.filled`]: next });
  }

  /**
   * (+) on a disorder list: appends one blank line. Reads `data-list`.
   * @this {CharacterSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAddDisorder(event, target) {
    const { list } = target.dataset;
    if (!DISORDER_KEYS.includes(list)) return;
    await this.document.update({ [`system.${list}`]: [...this.document.system[list], ""] });
  }

  /**
   * One entry per sheet page. To add page 2: append a tab here, a template part
   * in PARTS, and a label key in lang/en.json.
   * @override
   */
  static TABS = {
    primary: {
      tabs: [{ id: "page1", label: "MON1E.Sheet.Tabs.page1" }],
      initial: "page1"
    }
  };

  /** @override */
  static PARTS = {
    header: { template: `${TEMPLATE_ROOT}/character-header.hbs` },
    tabs: { template: `${TEMPLATE_ROOT}/character-tabs.hbs` },
    page1: { template: `${TEMPLATE_ROOT}/character-page1.hbs`, scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const rows = (list, group) =>
      list.map((row, index) => ({
        index,
        key: row.key,
        value: row.value,
        label: game.i18n.localize(`MON1E.${group}.${row.key}`)
      }));
    context.attributesRows = rows(this.document.system.attributes, "Attributes");
    context.aptitudesRows = rows(this.document.system.aptitudes, "Aptitudes");
    context.skillsRows = rows(this.document.system.skills, "Skills");
    const track = (name, stateKeys) => {
      const filled = this.document.system[name].filled;
      return {
        name,
        boxes: Array.from({ length: boxesToDraw(filled) }, (_, i) => ({ checked: i < filled })),
        states: stateKeys.map((key) => ({
          key,
          label: game.i18n.localize(`MON1E.Tracks.${key}`),
          checked: this.document.system[name][key]
        }))
      };
    };
    context.healthTrack = track("health", HEALTH_STATE_KEYS);
    context.composureTrack = track("composure", COMPOSURE_STATE_KEYS);
    context.diagramNumbers = DIAGRAM_NUMBER_KEYS.map((key) => ({
      key,
      label: game.i18n.localize(`MON1E.Character.${key}`),
      value: this.document.system[key]
    }));
    context.diagramFlags = DIAGRAM_FLAG_KEYS.map((key) => ({
      key,
      label: game.i18n.localize(`MON1E.Flags.${key}`),
      checked: this.document.system.diagramFlags[key]
    }));
    context.scarTracks = SCAR_KEYS.map((key) => ({
      ...track(key, []),
      label: game.i18n.localize(`MON1E.Tracks.${key}`)
    }));
    context.disorders = DISORDER_KEYS.map((key) => ({
      key,
      label: game.i18n.localize(`MON1E.Disorders.${key}`),
      lines: this.document.system[key].map((value, index) => ({ index, number: index + 1, value }))
    }));
    return context;
  }
}
