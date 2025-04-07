import bzFlagCorpsOptions from '/bz-flag-corps/ui/options/bz-flag-corps-options.js';

// color palette
const BZ_COLOR = {
    // game colors
    silver: "#4c5366",  // = primary
    bronze: "#e5d2ac",  // = secondary
    primary: "#4c5366",
    secondary: "#e5d2ac",
    accent: "#616266",
    accent1: "#e5e5e5",
    accent2: "#c2c4cc",
    accent3: "#9da0a6",
    accent4: "#85878c",
    accent5: "#616266",
    accent6: "#05070d",
    // alert colors
    black: "#000000",
    danger: "#af1b1c99",  // danger = militaristic 60% opacity
    caution: "#cea92f",  // caution = healthbar-medium
    note: "#ff800033",  // note = orange 20% opacity
    // geographic colors
    hill: "#ff800033",  // Rough terrain = orange 20% opacity
    vegetated: "#aaff0033",  // Vegetated features = green 20% opacity
    wet: "#55aaff66",  // Wet features = teal 60% opacity
    road: "#e5d2accc",  // Roads & Railroads = bronze 80% opacity
    // yield types
    food: "#80b34d",        //  90° 40 50 green
    production: "#a33d29",  //  10° 60 40 red
    gold: "#f6ce55",        //  45° 90 65 yellow
    science: "#6ca6e0",     // 210° 65 65 cyan
    culture: "#5c5cd6",     // 240° 60 60 violet
    happiness: "#f5993d",   //  30° 90 60 orange
    diplomacy: "#afb7cf",   // 225° 25 75 gray
    // independent power types
    militaristic: "#af1b1c",
    scientific: "#4d7c96",
    economic: "#ffd553",
    cultural: "#892bb3",
    // relationship ring colors
    friendly: "#e5d2ac",  // TODO
    hostile: "#af1b1c",
    neutral: "#0000",
    // glow & shadow colors
    glow: "#fff6e5cc",
    shadow: "#00000080",
};
const BZ_SHADOW_SPEC = `0 0.0555555556rem 0.0555555556rem ${BZ_COLOR.black}`;
const BZ_GLOW_SPEC = `0 -0.0555555556rem 0.1666666667rem ${BZ_COLOR.glow}`;
const BZ_OUTLINE_SPEC = `0 0 0.1111111111rem`;

const BZ_HEAD_STYLE = [
// 0. CITY-BANNER -top-9 absolute flex flex-row justify-start items-center flex-nowrap bg-center whitespace-nowrap bg-no-repeat
`
.bz-flags city-banner.city-banner {
    top: -3rem;
    height: 3.6666666667rem;
}
.bz-debug city-banner {
    background-color: #fffa;
}
`,  // 1 .CONTAINER flex flex-col mt-2">
`
.bz-flags city-banner.city-banner .city-banner__container {
    margin: 0rem;
}
.bz-debug .city-banner .city-banner__container {
    background-color: #f0fa;
}
`,  //   2 .STRETCH absolute flex flex-row justify-center align-center w-full h-8 top-1\.5 pointer-events-none
`
.bz-flags city-banner.city-banner .city-banner__stretch {
    top: 0.0555555556rem;
    height: 3.6666666667rem;
}
`,  //     3 .CITY-STATE-BORDER absolute -left-2 -right-2 -top-0 -bottom-0
    //       TODO: .city-banner--allied and .city-banner--warring?
`
.bz-flags city-banner.city-banner .city-banner__city-state-border {
    display: flex;
    border-image-slice: 60 24 2 24 fill;
    border-image-outset: 0.2222222222rem 0.1111111111rem;
    border-image-width: 3rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
}
.bz-flags city-banner.city-banner .city-banner__city-state-border {
    fxs-border-image-tint: ${BZ_COLOR.neutral};
}
.bz-flags .city-banner.city-banner--friendly .city-banner__city-state-border {
    fxs-border-image-tint: ${BZ_COLOR.friendly};
}
.bz-flags .city-banner.city-banner--hostile .city-banner__city-state-border {
    fxs-border-image-tint: ${BZ_COLOR.hostile};
}
`,  //     3 .CITY-STATE-RING absolute -left-1 -right-1 top-1 bottom-0
`
.bz-flags city-banner.city-banner .city-banner__city-state-ring {
    display: flex;
    border-image-source: url("fs://game/city_pill.png");
    border-image-slice: 60 24 2 24 fill;
    border-image-outset: 0.2222222222rem 0.3888888889rem;
    border-image-width: 3.3333333333rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
    fxs-border-image-tint: var(--player-color-secondary);
}
.bz-flags .city-banner.city-banner--town .city-banner__city-state-ring {
    fxs-border-image-tint: transparent;
}
.bz-flags .city-banner.city-banner--village .city-banner__city-state-ring {
    fxs-border-image-tint: var(--player-color-primary);
}
`,  //     3 .STRETCH-BG absolute inset-0 pointer-events-none
`
.bz-flags city-banner.city-banner .city-banner__stretch-bg {
    border-image-source: url("fs://game/town_pill.png");
    border-image-slice: 60 24 2 24 fill;
    border-image-outset: 0rem 0.4444444444rem;
    border-image-width: 3.3333333333rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
    fxs-border-image-tint: var(--player-color-primary);
}
.bz-flags .city-banner.city-banner--citystate .city-banner__stretch-bg {
    fxs-border-image-tint: var(--player-color-primary);
}
.bz-flags .city-banner.city-banner--village .city-banner__stretch-bg {
    fxs-border-image-tint: var(--player-color-secondary);
}
`,  //   2 FXS-HSLOT.NAME-CONTAINER relative flex justify-between
`
.bz-flags city-banner.city-banner .city-banner__name-container {
    line-height: 1.6666666667rem;
    pointer-events: auto;
    margin-top: -0.3333333333rem;
    margin-left: 0.1666666667rem;
    color: var(--player-color-secondary);
}
.bz-flags .city-banner.city-banner--citystate .city-banner__name-container {
    color: var(--player-color-secondary);
}
.bz-flags .city-banner.city-banner--village .city-banner__name-container {
    color: var(--player-color-primary);
}
`,  //     3 .PORTRAIT relative pointer-events-auto flex
    //       4 .PORTRAIT-BG1 absolute inset-0 bg-center bg-cover bg-no-repeat
    //       4 .PORTRAIT-BG2 absolute inset-x-0 top-0 -bottom-2 bg-center bg-cover bg-no-repeat
    //       4 .PORTRAIT-IMG absolute -left-2 -right-2 -top-1 bottom-0 bg-cover bg-center bg-no-repeat pointer-events-none
    // TODO
`
.bz-flags city-banner.city-banner .city-banner__portrait {
    top: -0.1388888889rem;
    left: 0.0555555556rem;
    width: 1.3333333333rem;
    height: 2rem;
}
.bz-flags .city-banner__portrait-bg1 {
    top: 0.3333333333rem;
    width: 1.3333333333rem;
    height: 2rem;
    background-size: cover;
    background-image: url("fs://game/town_portrait-hex.png");
}
.bz-flags .city-banner__portrait-bg2 {
    top: 0.3333333333rem;
    width: 1.3333333333rem;
    height: 2rem;
    background-size: cover;
    background-image: url("fs://game/town_portrait-frame.png");
}
.bz-flags .city-banner__portrait-img {
    top: -0.7777777778rem;
    left: -0.3333333333rem;
    width: 2rem;
    height: 3rem;
    background-size: cover;
}
.bz-debug .city-banner__portrait {
    background-color: #fff8;
}
.bz-debug .city-banner__portrait-bg1 {
    background-color: #ff08;
}
.bz-debug .city-banner__portrait-bg2 {
    background-color: #0ff8;
}
.bz-debug .city-banner__portrait-img {
    background-color: #f0f8;
}
`,  //     3 FXS-VSLOT.NAME-VSLOT pointer-events-auto cursor-pointer max-h-10
    //       4 FXS-HSLOT
    //         5 .CAPITAL-STAR w-8 h-8 bg-cover bg-no-repeat hidden
    // TODO: adjust star
    // TODO: town focus icons
`
.bz-flags city-banner.city-banner .city-banner__capital-star {
    background-image: url("blp:icon-capital.png");
    margin-top: 0.2222222222rem;
    margin-right: -0.3333333333rem;
}
.bz-flags .city-banner.city-banner--village .city-banner__capital-star {
    display: none;
}
`,  //         5 .NAME font-title-base uppercase
`
.bz-flags city-banner.city-banner .city-banner__name.city-banner__icons-below-name,
.bz-flags city-banner.city-banner .city-banner__name {
    position: relative;
    margin: 0.3333333333rem 0 0 0.1666666667rem;
    padding: 0 0.3333333333rem;
    letter-spacing: 0.0555555556rem;
    font-weight: bold;
    text-shadow: ${BZ_SHADOW_SPEC}, ${BZ_GLOW_SPEC};
    pointer-events: auto;
}
.bz-flags .city-banner.city-banner--citystate .city-banner__name,
.bz-flags .city-banner.city-banner--village .city-banner__name {
    text-shadow: none;
}
.bz-debug city-banner.city-banner .city-banner__name {
    background-color: #fff8;
}
`,  //       4 FXS-HSLOT.STATUS-RELIGION
    //         5 .STATUS flex justify-center align-center opacity-100
    //           6 .STATUS-BACKGROUND h-full w-full absolute
    //           6 .STATUS-ICON absolute w-full h-full bg-no-repeat
    //         5 FXS-HSLOT.RELIGION self-center
    //           6 .RELIGION-SYMBOL-BG
    //             7 .RELIGION-SYMBOL bg-contain bg-no-repeat bg-center
    //           6 .RELIGION-SYMBOL-BG religion-bg--right
    //             7 .RELIGION-SYMBOL bg-contain bg-no-repeat bg-center religion-symbol--right
`
.bz-flags city-banner.city-banner .city-banner__status-religion {
    position: absolute;
    top: 1.8333333333rem;
    left: 0.3888888889rem;
}
.bz-debug city-banner.city-banner .city-banner__status-religion {
    background-color: #0808;
}
.bz-flags city-banner.city-banner .city-banner__status {
    position: relative;
    height: 1rem;
    width: 1rem;
    margin: 0;
}
.bz-flags .city-banner.city-banner--city-other .city-banner__status {
    display: flex;
}
.bz-flags city-banner.city-banner .city-banner__status-background,
.bz-flags city-banner.city-banner .city-banner__religion-symbol-bg {
    position: relative;
    width: 1rem;
    height: 1rem;
    margin: 0;
    border: none;
    border-radius: 50%;
    box-shadow: 0 0.0555555556rem 0.1666666667rem 0.0833333333rem ${BZ_COLOR.shadow},
                0 0.0555555556rem 0.5rem 0 ${BZ_COLOR.shadow} inset;
    background-color: ${BZ_COLOR.shadow};
}
.bz-flags city-banner.city-banner .city-banner__status-icon {
    background-size: 125%;
    background-position: center center;
}
.bz-flags city-banner.city-banner .city-banner__religion {
    position: relative;
    width: 1rem;
    height: 1rem;
}
.bz-flags city-banner.city-banner .city-banner__religion-symbol-bg {
    margin: 0 0 0 0.0277777778rem;
}
.bz-flags city-banner.city-banner .religion-bg--right {
    /* display: none;  /* DEBUG */
}
.bz-flags city-banner.city-banner .city-banner__religion-symbol {
    width: 1rem;
    height: 1rem;
    margin: 0;
}

`,  //     3 .POPULATION-CONTAINER items-center justify-center w-6 h-6 -mt-2
    //       4 FXS-RING-METER.RING.POPULATION-RING bg-cover bg-center flex size-9 self-center align-center
    //         5 .POPULATION-NUMBER font-body-xs text-white top-0 w-full text-center pointer-events-auto
    //       4 .TURN flex flex-col justify-end align-center self-center top-0\.5 pointer-events-none relative
    //         5 .TURN-NUMBER font-base-2xs text-white text-center w-full bg-cover bg-center bg-no-repeat
`
.bz-flags city-banner.city-banner div.city-banner__population-container {
    position: relative;
    width: 1.5555555556rem;
    height: 1.5555555556rem;
    top: 0.4166666667rem;
    margin: 0rem 0.1111111111rem 0rem 0.1666666667rem;
    padding: 0rem;
    box-shadow: none;
}
.bz-flags city-banner.city-banner .city-banner__ring {
    position: relative;
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    margin: 0rem;
    top: -0.2222222222rem;
    left: -0.0277777778rem;
    z-index: 2;
}
`,  //     compatibility with F1rstDan's Cool UI:
    //     3 .DAN-TOOLTIP items-center justify-center w-8 h-6 -mt-2 -mr-1 pointer-events-auto dan-tooltip hidden
    //       4 FXS-RING-METER.DAN-TOOLTIP items-center justify-center w-8 h-6 -mt-2 -mr-1 pointer-events-auto dan-tooltip
    //       4 .TURN city-banner__turn flex flex-col justify-end align-center self-center top-0\.5 pointer-events-none relative
    //         5 .TURN-NUMBER -banner__turn-number font-base-2xs text-white text-center w-full bg-cover bg-center bg-no-repeat hidden
`
.bz-flags .city-banner div.dan-tooltip {
    position: relative;
    width: 1.5555555556rem;
    height: 1.5555555556rem;
    top: 0.4166666667rem;
    margin: 0rem 0.1111111111rem 0rem 0.1111111111rem;
    padding: 0rem;
    border-radius: 0.7777777778rem;
    box-shadow: 0 0 0.3333333333rem 0.1111111111rem #0006;
}
`,  //     3 .QUEUE-CONTAINER queue-production queue-none justify-center w-8 h-6 -mt-2 flex-col align-center
    //       4 FXS-RING-METER.RING.PRODUCTION-RING bg-cover bg-center flex size-9 self-center align-center
    //         5 .QUEUE-IMG queue-production size-4 self-center
`
.bz-flags city-banner.city-banner .city-banner__queue-container {
    position: relative;
    width: 1.5555555556rem;
    height: 1.5555555556rem;
    top: 0.4166666667rem;
    margin: 0rem 0.2777777777rem 0rem -0.1111111111rem;
    padding: 0rem;
    box-shadow: none;
}
`,  //       4 .TURN flex flex-col justify-end align-center self-center w-8 mt-0\.5 pointer-events-none
    //         5 .TURN-NUMBER font-base-xs text-white text-center w-full bg-cover bg-center bg-no-repeat
`
.bz-flags city-banner.city-banner .city-banner__turn {
    position: relative;
    margin: 0rem;
    top: -1.2222222222rem;
}
.bz-flags city-banner.city-banner .city-banner__turn-number {
    background-image: url("fs://game/town_turn-bg.png");
    background-size: 100% 100%;
    line-height: 1;
    margin: 0rem;
    padding: 0.8333333333rem 0.1111111111rem 0.1666666667rem;
    min-width: 1.6666666667rem;
    z-index: 1;
}
`,  //     3 .CITY-STATE-CONTAINER justify-center
    //       4 .CITY-STATE-TYPE size-7 self-center align-center justify-center
    //         5 .CITY-STATE-ICON size-8 self-center align-center bg-cover bg-no-repeat
`
.bz-flags .city-banner.city-banner--citystate .city-banner__city-state-container,
.bz-flags .city-banner.city-banner--village .city-banner__city-state-container {
    margin: 0.0555555556rem 0rem 0rem 0.0555555556rem;
}
.bz-flags .city-banner.city-banner--citystate .city-banner__city-state-type,
.bz-flags .city-banner.city-banner--village .city-banner__city-state-type {
    margin-top: 0.3333333333rem;
    margin-right: 0.1111111111rem;
}
`,  // 1 FXS-HSLOT items-center -ml-12 mt-10
`
.bz-flags city-banner > fxs-hslot {
    position: absolute;
    margin: 0rem;
    display: flex;
    justify-content: center;
    transform: translateX(-50%) scale(1);
}
`,  //   2 FXS-VSLOT -mr-3
    //     3 .CONQUERED-ICON relative size-14 -mr-6 bg-cover bg-no-repeat
`
.bz-flags city-banner > fxs-hslot > fxs-vslot {
    position: absolute;
    margin: 0rem;
}
.bz-flags city-banner.city-banner .city-banner__conquered-icon {
    position: absolute;
    margin: 0rem;
    top: -0.5555555556rem;
}
`,  //   2 FXS-VSLOT.UNREST -mr-3
    //     3 .UNREST-ICON relative size-14 bg-cover bg-no-repeat
    //     3 .TIME-CONTAINER -mt-3 flex flex-row
    //       4 .TIME-ICON self-center bg-cover bg-no-repeat size-6 ml-1
    //       4 .TIME-TEXT self-center font-body-xs text-white
`
.bz-flags .city-banner.city-banner .city-banner__unrest {
    position: relative;
    width: 2.6666666667rem;
    height: 2.6666666667rem;
    top: -3.7777777778rem;
    margin: 0rem 0.1666666667rem;
}
.bz-flags .city-banner.city-banner--town .city-banner__unrest-icon {
    position: relative;
    margin: 0rem;
}
.bz-debug .city-banner.city-banner--town .city-banner__unrest {
    background-color: #fffa;
}
`,  //   2 FXS-VSLOT.RAZING
    //     3 .RAZING-ICON relative size-14 bg-cover bg-no-repeat
`
.bz-flags .city-banner.city-banner .city-banner__razing {
    position: relative;
    width: 2.6666666667rem;
    height: 2.6666666667rem;
    top: -3.7777777778rem;
    margin: 0rem 0.1666666667rem;
}
.bz-flags .city-banner.city-banner--town .city-banner__razing-icon {
    position: relative;
    margin: 0rem;
}
.bz-debug .city-banner.city-banner--town .city-banner__razing {
    background-color: #fffa;
}
`,  //     3 .TIME-CONTAINER -mt-3 flex flex-row
    //       4 .TIME-ICON self-center bg-cover bg-no-repeat size-6 ml-1
    //       4 .TIME-TEXT self-center font-body-xs text-white
    // TODO: vertical alignment
`
.bz-flags .city-banner .city-banner__time-container {
    position: relative;
    background-image: none;
    background-color: #0009;
    margin: -0.4444444444rem 0rem 0rem;
    border-radius: 1rem;
    justify-content: center;
    align-items: center;
}
.bz-flags .city-banner .city-banner__time-icon {
    margin: 0rem;
}
.bz-flags .city-banner .city-banner__time-text {
    line-height: 1;
    margin-right: 0.3333333333rem;
}
`,
];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});
// TODO: text & localization
if (bzFlagCorpsOptions.banners) {
    document.body.classList.add("bz-flags");
} else {
    document.body.classList.remove("bz-flags");
}
// TODO: react to setting changes
if (UI.isDebugPlotInfoVisible()) document.body.classList.add("bz-debug");

export class bzCityBanner {
    static c_prototype;
    constructor(component) {
        this.component = component;
        component.bzComponent = this;
        this.hasHead = false;
        this.patchPrototypes(this.component);
        this.patchStyles(this.component);
    }
    patchPrototypes(component) {
        const c_prototype = Object.getPrototypeOf(component);
        if (bzCityBanner.c_prototype == c_prototype) return;
        // patch component methods
        const proto = bzCityBanner.c_prototype = c_prototype;
        const afterCapitalUpdate = this.afterCapitalUpdate;
        const capitalUpdate = proto.capitalUpdate;
        proto.capitalUpdate = function(...args) {
            const c_rv = capitalUpdate.apply(this, args);
            const after_rv = afterCapitalUpdate.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        const afterSetCityInfo = this.afterSetCityInfo;
        const setCityInfo = proto.setCityInfo;
        proto.setCityInfo = function(...args) {
            const c_rv = setCityInfo.apply(this, args);
            const after_rv = afterSetCityInfo.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        const afterRealizeReligion = this.afterRealizeReligion;
        const realizeReligion = proto.realizeReligion;
        proto.realizeReligion = function(...args) {
            const c_rv = realizeReligion.apply(this, args);
            const after_rv = afterRealizeReligion.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        // wrap realizeReligion metho
        // replace component.XXX to fix a bug
        // bzCityBanner.component_XXX = proto.XXX;
        // proto.XXX = function() {
        //     return this.bzComponent.XXX();
        // }
    }
    patchStyles(banner) {
        const { growthQueueTurns, productionQueueTurns } = banner.elements;
        growthQueueTurns.classList.remove("font-base-2xs");
        growthQueueTurns.classList.add("text-xs");
        productionQueueTurns.classList.remove("font-base-xs");
        productionQueueTurns.classList.add("text-xs");
    }
    afterCapitalUpdate() {
        // show interesting icons for all settlements, where possible
        // TODO: tooltip
        // TODO: live updates
        this.hasHead = false;
        const banner = this.component;
        if (!banner.city) return;
        const owner = Players.get(banner.componentID.owner);
        if (!owner || owner.isIndependent) return;
        const { capitalIndicator, } = banner.elements;
        let icon;
        let filter = [];
        const secondary = "var(--player-color-secondary)";
        const tint = `fxs-color-tint(${secondary})`;
        const shadow = `drop-shadow(${BZ_SHADOW_SPEC})`;
        const glow = `drop-shadow(${BZ_GLOW_SPEC})`;
        const outline = `drop-shadow(${BZ_OUTLINE_SPEC} ${secondary})`;
        if (owner.isMinor) {
            // city-state
            this.hasHead = !bzFlagCorpsOptions.noHeads;
            const suz = Players.get(owner.Influence?.getSuzerain() ?? -1);
            const civ = suz && GameInfo.Civilizations.lookup(suz.civilizationType);
            icon = civ && UI.getIconCSS(civ.CivilizationType);
            filter.push(tint);
        } else if (banner.city.isCapital) {
            // capital star
            this.hasHead = !bzFlagCorpsOptions.noHeads;
            icon = "url('blp:icon-capital.png')";
            filter.push(outline);
        } else if (banner.city.isTown) {
            // town focus
            const ptype = banner.city.Growth?.projectType ?? null;
            const focus = ptype && GameInfo.Projects.lookup(ptype);
            icon = UI.getIconCSS(focus?.ProjectType ?? "PROJECT_GROWTH");
            filter.push(shadow, glow);
        } else {
            // city owner
            this.hasHead = !bzFlagCorpsOptions.noHeads;
            const civ = GameInfo.Civilizations.lookup(owner.civilizationType);
            icon = UI.getIconCSS(civ.CivilizationType);
            filter.push(tint);
        }
        capitalIndicator.style.backgroundImage = icon;
        capitalIndicator.style.filter = filter.join(' ');
        capitalIndicator.classList.toggle('hidden', !icon);
        // "no heads" option
        const root = this.component.Root;
        const portrait = root.querySelector(".city-banner__portrait");
        const status = root.querySelector(".city-banner__status-religion");
        if (this.hasHead) {
            portrait.style.display = "flex";
            status.style.left = "-1.1111111111rem";
            // tint leader head frames
            const primary = "var(--player-color-primary)";
            const tint = `fxs-color-tint(${primary})`;
            const portraitBG1 = root.querySelector(".city-banner__portrait-bg1");
            portraitBG1.style.filter = tint;
        } else {
            portrait.style.display = "none";
            status.style.left = "0.3888888889rem";
        }
    }
    afterSetCityInfo(_data) {
        this.afterCapitalUpdate();
    }
    afterRealizeReligion() {
        const {
            urbanReligionSymbol,
            ruralReligionSymbol,
            ruralReligionSymbolBackground,
        } = this.component.elements;
        // hide rural religion if it matches urban religion
        const majority =
            urbanReligionSymbol.style.backgroundImage ==
            ruralReligionSymbol.style.backgroundImage;
        ruralReligionSymbolBackground.classList.toggle('hidden', majority);
    }
    beforeAttach() { }
    afterAttach() { }
    beforeDetach() { }
    afterDetach() { }
    onAttributeChanged(_name, _prev, _next) {
        this.component.buildBanner();
    }
}
Controls.decorate('city-banner', (component) => new bzCityBanner(component));
