import '/core/ui/options/options.js';  // make sure this loads first
import { CategoryType } from '/core/ui/options/options-helpers.js';
import { Options, OptionType } from '/core/ui/options/model-options.js';
import ModSettings from '/bz-flag-corps/ui/options/mod-options-decorator.js';

const MOD_ID = "bz-flag-corps";

export const bzFlagCorpsOptionsEventName = 'bz-flag-corps-options';
class bzFlagCorpsOptionsEvent extends CustomEvent {
    constructor() {
        super(bzFlagCorpsOptionsEventName, { bubbles: false });
    }
}
const bzFlagCorpsOptions = new class {
    data = {
        banners: true,
        noHeads: false,
        noShadow: false,
    };
    constructor() {
        const modSettings = ModSettings.load(MOD_ID);
        if (modSettings) this.data = modSettings;
    }
    save() {
        ModSettings.save(MOD_ID, this.data);
        // sync optional styling
        if (this.data.banners) {
            document.body.classList.add("bz-flags");
        } else {
            document.body.classList.remove("bz-flags");
        }
        if (this.data.noShadow) {
            document.body.classList.add("bz-flags-no-shadow");
        } else {
            document.body.classList.remove("bz-flags-no-shadow");
        }
        window.dispatchEvent(new bzFlagCorpsOptionsEvent());
    }
    get banners() {
        return this.data.banners ?? true;
    }
    set banners(flag) {
        this.data.banners = !!flag;
        this.save();
    }
    get noHeads() {
        return this.data.noHeads;
    }
    set noHeads(flag) {
        this.data.noHeads = !!flag;
        this.save();
    }
    get noShadow() {
        return this.data.noShadow;
    }
    set noShadow(flag) {
        this.data.noShadow = !!flag;
        this.save();
    }
};
const onInitBanners = (info) => {
    info.currentValue = bzFlagCorpsOptions.banners;
};
const onUpdateBanners = (_info, flag) => {
    bzFlagCorpsOptions.banners = flag;
};
Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        // @ts-ignore
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-city-banners",
        initListener: onInitBanners,
        updateListener: onUpdateBanners,
        label: "LOC_OPTIONS_BZ_CITY_BANNERS",
        description: "LOC_OPTIONS_BZ_CITY_BANNERS_DESCRIPTION",
    });
});
const onInitNoHeads = (info) => {
    info.currentValue = bzFlagCorpsOptions.noHeads;
};
const onUpdateNoHeads = (_info, flag) => {
    bzFlagCorpsOptions.noHeads = flag;
};
Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        // @ts-ignore
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-flags-no-heads",
        initListener: onInitNoHeads,
        updateListener: onUpdateNoHeads,
        label: "LOC_OPTIONS_BZ_FLAGS_NO_HEADS",
        description: "LOC_OPTIONS_BZ_FLAGS_NO_HEADS_DESCRIPTION",
    });
});
const onInitNoShadow = (info) => {
    info.currentValue = bzFlagCorpsOptions.noShadow;
};
const onUpdateNoShadow = (_info, flag) => {
    bzFlagCorpsOptions.noShadow = flag;
};
Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        // @ts-ignore
        group: "bz_mods",
        type: OptionType.Checkbox,
        id: "bz-flags-no-shadow",
        initListener: onInitNoShadow,
        updateListener: onUpdateNoShadow,
        label: "LOC_OPTIONS_BZ_FLAGS_NO_SHADOW",
        description: "LOC_OPTIONS_BZ_FLAGS_NO_SHADOW_DESCRIPTION",
    });
});

export { bzFlagCorpsOptions as default };
