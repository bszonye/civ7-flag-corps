import '/core/ui/options/screen-options.js';  // make sure this loads first
import { C as CategoryType, O as Options, a as OptionType } from '/core/ui/options/editors/index.chunk.js';
// set up mod options tab
import ModOptions from '/bz-flag-corps/ui/options/mod-options.js';

export const bzFlagCorpsOptionsEventName = 'bz-flag-corps-options';
class bzFlagCorpsOptionsEvent extends CustomEvent {
    constructor() {
        super(bzFlagCorpsOptionsEventName, { bubbles: false });
    }
}
const bzFlagCorpsOptions = new class {
    modID = "bz-flag-corps";
    defaults = {
        banners: Number(true),
        noHeads: Number(false),
        noShadow: Number(false),
    };
    data = {};
    load(optionID) {
        const value = ModOptions.load(this.modID, optionID);
        if (value == null) {
            const value = this.defaults[optionID];
            console.warn(`LOAD ${this.modID}.${optionID}=${value} (default)`);
            return value;
        }
        return value;
    }
    save(optionID) {
        const value = Number(this.data[optionID]);
        ModOptions.save(this.modID, optionID, value);
        window.dispatchEvent(new bzFlagCorpsOptionsEvent());
    }
    get banners() {
        this.data.banners ??= Boolean(this.load("banners"));
        return this.data.banners;
    }
    set banners(flag) {
        this.data.banners = Boolean(flag);
        this.save("banners");
        document.body.classList.toggle("bz-flags", this.data.banners);
    }
    get noHeads() {
        this.data.noHeads ??= Boolean(this.load("noHeads"));
        return this.data.noHeads;
    }
    set noHeads(flag) {
        this.data.noHeads = Boolean(flag);
        this.save("noHeads");
    }
    get noShadow() {
        this.data.noShadow ??= Boolean(this.load("noShadow"));
        return this.data.noShadow;
    }
    set noShadow(flag) {
        this.data.noShadow = Boolean(flag);
        this.save("noShadow");
        document.body.classList.toggle("bz-flags-no-shadow", this.data.noShadow);
    }
};

Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-city-banners",
        initListener: (info) => info.currentValue = bzFlagCorpsOptions.banners,
        updateListener: (_info, value) => bzFlagCorpsOptions.banners = value,
        label: "LOC_OPTIONS_BZ_CITY_BANNERS",
        description: "LOC_OPTIONS_BZ_CITY_BANNERS_DESCRIPTION",
    });
    Options.addOption({
        category: CategoryType.Mods,
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-flags-no-heads",
        initListener: (info) => info.currentValue = bzFlagCorpsOptions.noHeads,
        updateListener: (_info, value) => bzFlagCorpsOptions.noHeads = value,
        label: "LOC_OPTIONS_BZ_FLAGS_NO_HEADS",
        description: "LOC_OPTIONS_BZ_FLAGS_NO_HEADS_DESCRIPTION",
    });
    Options.addOption({
        category: CategoryType.Mods,
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-flags-no-shadow",
        initListener: (info) => info.currentValue = bzFlagCorpsOptions.noShadow,
        updateListener: (_info, value) => bzFlagCorpsOptions.noShadow = value,
        label: "LOC_OPTIONS_BZ_FLAGS_NO_SHADOW",
        description: "LOC_OPTIONS_BZ_FLAGS_NO_SHADOW_DESCRIPTION",
    });
});

export { bzFlagCorpsOptions as default };
