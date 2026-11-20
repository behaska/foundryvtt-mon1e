import { TEMPLATE_ROOT } from "../constants.mjs";

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
    form: { submitOnChange: true, closeOnSubmit: false }
  };

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
    return context;
  }
}
