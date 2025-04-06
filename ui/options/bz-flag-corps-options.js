import '/core/ui/options/options.js';  // make sure this loads first
import { CategoryType } from '/core/ui/options/options-helpers.js';
import { Options, OptionType } from '/core/ui/options/model-options.js';
import ModSettings from '/bz-flag-corps/ui/options/mod-options-decorator.js';

const MOD_ID = "bz-flag-corps";

const bzFlagCorpsOptions = new class {
    data = {
        banners: true,
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
    }
    get banners() {
        return this.data.banners ?? true;
    }
    set banners(flag) {
        this.data.banners = !!flag;
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
