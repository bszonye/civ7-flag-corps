import bzFlagCorpsOptions from '/bz-flag-corps/ui/options/bz-flag-corps-options.js';
import bzCityTooltip from '/bz-flag-corps/ui/tooltips/bz-city-tooltip.js';
import { C as CityBannerManager } from '/base-standard/ui/city-banners/city-banner-manager.chunk.js';

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
    food: "#80b34d",        //  90°  40 50 green
    production: "#a33d29",  //  10°  60 40 red
    gold: "#f6ce55",        //  45°  90 65 yellow
    science: "#6ca6e0",     // 210°  65 65 cyan
    culture: "#5c5cd6",     // 240°  60 60 violet
    happiness: "#f5993d",   //  30°  90 60 orange
    diplomacy: "#afb7cf",   // 225°  25 75 gray
    // yields adjusted to L70+ for text contrast
    foodText: "#80b34d",        // unchanged  L71
    productionText: "#e87b64",  // #a33d29 => L70
    goldText: "#f6ce55",        // unchanged  L86
    scienceText: "#79b3ee",     // #6ca6e0 => L75
    cultureText: "#8d92f9",     // #5c5cd6 => L70
    happinessText: "#f5993d",   // unchanged  L76
    diplomacyText: "#afb7cf",   // unchanged  L78
    // independent power types
    militaristic: "#af1b1c",
    scientific: "#4d7c96",
    economic: "#ffd553",
    cultural: "#892bb3",
    // relationship ring colors
    friendly: "#e5d2ac",
    hostile: "#af1b1c",
    neutral: "#afb7cf",     // 225°  25 75 gray
    // highlight & shadow colors
    light: "#fff6e5cc",     //  40° 100 95 pale bronze
    shadow: "#00000080",
    progress: "#e0b96c",    //  40°  65 65 deep bronze
};
const BZ_SHADOW_SHAPE = "0.0277777778rem 0.0555555556rem 0.0555555556rem";
const BZ_SHADOW_SPEC = `${BZ_SHADOW_SHAPE} ${BZ_COLOR.black}`;
const BZ_LIGHT_SHAPE = "-0.0277777778rem -0.0555555556rem 0.0555555556rem";
const BZ_LIGHT_SPEC = `${BZ_LIGHT_SHAPE} ${BZ_COLOR.light}`;

const BZ_HEAD_STYLE = [
// diplo-ribbon: improve banner and yield colors
`
.bz-flags .diplo-ribbon__front-banner {
    fxs-border-image-tint: var(--player-color-primary);
}
.bz-flags .diplo-ribbon__front-banner-shadow {
    fxs-border-image-tint: #0008;
}
.text-yield-food {
    color: ${BZ_COLOR.foodText};
}
.text-yield-production {
    color: ${BZ_COLOR.productionText};
}
.text-yield-gold {
    color: ${BZ_COLOR.goldText};
}
.text-yield-science {
    color: ${BZ_COLOR.scienceText};
}
.text-yield-culture {
    color: ${BZ_COLOR.cultureText};
}
.text-yield-happiness {
    color: ${BZ_COLOR.happinessText};
}
.text-yield-diplomacy {
    color: ${BZ_COLOR.diplomacyText};
}
`,
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
`
.bz-flags city-banner.city-banner .city-banner__city-state-border {
    display: flex;
    border-image-slice: 60 24 2 24 fill;
    border-image-outset: 0.2222222222rem 0.1111111111rem;
    border-image-width: 3rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
}
.bz-flags city-banner.city-banner .city-banner__city-state-border {
    fxs-border-image-tint: transparent;
}
.bz-flags .city-banner.city-banner--citystate .city-banner__city-state-border {
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
    border-image-source: url("blp:city_pill.png");
    border-image-slice: 60 24 2 24 fill;
    border-image-outset: 0.2222222222rem 0.3888888889rem;
    border-image-width: 3.3333333333rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
    fxs-border-image-tint: var(--player-color-secondary);
}
.bz-flags .city-banner.city-banner--town .city-banner__city-state-ring {
    fxs-border-image-tint: transparent;
}
.bz-flags .city-banner.city-banner--village .city-banner__city-state-ring {
    fxs-border-image-tint: white;
}
`,  //     3 .STRETCH-BG absolute inset-0 pointer-events-none
`
.bz-flags city-banner.city-banner .city-banner__stretch-bg {
    border-image-source: url("blp:town_pill.png");
    border-image-slice: 60 24 2 24 fill;
    border-image-outset: 0rem 0.4444444444rem;
    border-image-width: 3.3333333333rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
    fxs-border-image-tint: var(--player-color-primary);
}
.bz-flags .city-banner.city-banner--citystate .city-banner__stretch-bg {
    fxs-border-image-tint: var(--player-color-primary);
}
.bz-flags .city-banner.city-banner--village .city-banner__stretch-bg {
    fxs-border-image-tint: black;
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
    color: white;
}
`,  //     3 .PORTRAIT relative pointer-events-auto flex
    //       4 .PORTRAIT-BG1 absolute inset-0 bg-center bg-cover bg-no-repeat
    //       4 .PORTRAIT-BG2 absolute inset-x-0 top-0 -bottom-2 bg-center bg-cover bg-no-repeat
    //       4 .PORTRAIT-IMG absolute -left-2 -right-2 -top-1 bottom-0 bg-cover bg-center bg-no-repeat pointer-events-none
`
.bz-flags city-banner.city-banner .city-banner__portrait {
    margin: -0.2777777778rem;
    margin-right: 0;
    top: -0.1111111111rem;
    left: 0.1666666667rem;
    width: 1.7777777778rem;
    height: 2.5rem;
}
.bz-flags .city-banner__portrait-bg1 {
    top: 0.3333333333rem;
    width: 1.7777777778rem;
    height: 2.5rem;
    background-size: cover;
    background-image: url("blp:town_portrait-hex.png");
}
.bz-flags .city-banner__portrait-bg2 {
    top: 0.3333333333rem;
    width: 1.7777777778rem;
    height: 2.5rem;
    background-size: cover;
    background-image: url("blp:town_portrait-frame.png");
}
.bz-flags .city-banner__portrait-img {
    top: 0.0555555556rem;
    left: 0rem;
    width: 1.7777777778rem;  /* 64x90 */
    height: 2.5rem;
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
`
.city-banner.city-banner--citystate .city-banner__capital-star {
    margin-top: -0.0555555556rem;
}
.bz-flags city-banner.city-banner .city-banner__capital-star {
    background-image: url("blp:icon-capital.png");
    margin: 0.2222222222rem -0.3333333333rem 0 0;
}
.bz-flags .city-banner.city-banner--village .city-banner__capital-star {
    display: none;
}
`,  //         5 .NAME font-title-base uppercase
`
.bz-flags city-banner.city-banner .city-banner__name.city-banner__icons-below-name,
.bz-flags city-banner.city-banner .city-banner__name {
    position: relative;
    margin-top: 0.3333333333rem;
    padding: 0 0.3333333333rem;
    letter-spacing: 0.0555555556rem;
    font-weight: bold;
    text-shadow: ${BZ_SHADOW_SPEC}, ${BZ_LIGHT_SPEC};
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
    //          5 .TRADE-NETWORK flex justify-center align-center opacity-100 pointer-events-auto
    //            6 .TRADE-NETWORK-BACKGROUND h-full w-full absolute
    //            6 .TRADE-NETWORK-ICON absolute w-full h-full bg-no-repeat
`
.bz-flags city-banner.city-banner .city-banner__status-religion {
    position: absolute;
    top: 1.8333333333rem;
    left: 0.8888888889rem;
    transform: translateX(-50%) scale(1);
}
.bz-debug city-banner.city-banner .city-banner__status-religion {
    background-color: #fff8;
}
.bz-flags city-banner.city-banner .city-banner__status {
    position: relative;
    height: 1rem;
    width: 1rem;
    margin: 0 0.0555555556rem;
}
.bz-flags city-banner.city-banner .city-banner__status.hidden {
    display: none;
}
.bz-flags city-banner.city-banner .city-banner__status-background,
.bz-flags city-banner.city-banner .city-banner__religion-symbol-bg,
.bz-flags city-banner.city-banner .city-banner__trade-network-background {
    position: relative;
    margin: 0;
    border: none;
    filter: drop-shadow(0 0.0555555556rem 0.1111111111rem black);
}
.bz-flags city-banner.city-banner .city-banner__status-icon {
    background-size: 125%;
    background-position: center center;
}
.bz-flags city-banner.city-banner .city-banner__religion {
    position: relative;
    height: 1rem;
}
.bz-debug city-banner.city-banner .city-banner__religion {
    background-color: #f0f8;
}
.bz-flags city-banner.city-banner .city-banner__religion-symbol-bg {
    margin: 0 0.0555555556rem;
}
.bz-flags city-banner.city-banner .city-banner__religion-symbol {
    width: 1rem;
    height: 1rem;
    margin: 0;
}
.bz-flags .city-banner__trade-network {
    margin: 0 0.0555555556rem;
    height: 1rem;
    width: 1rem;
    position: relative;
}
.bz-flags .city-banner__trade-network-background {
    border-radius: 50%;
    background-color: #0008;
}
.bz-flags .city-banner__trade-network .city-banner__trade-network--hidden {
    opacity: 1;
}
`,  //     3 .POPULATION-CONTAINER items-center justify-center w-6 h-6 -mt-2
    //       4 FXS-RING-METER.RING.POPULATION-RING bg-cover bg-center flex size-9 self-center align-center
    //         5 .POPULATION-NUMBER font-body-xs text-white top-0 w-full text-center pointer-events-auto
    //       4 .TURN flex flex-col justify-end align-center self-center top-0\.5 pointer-events-none relative
    //         5 .TURN-NUMBER font-base-2xs text-white text-center w-full bg-cover bg-center bg-no-repeat
    //     3 .DAN-TOOLTIP items-center justify-center w-8 h-6 -mt-2 -mr-1 pointer-events-auto dan-tooltip hidden
    //       4 FXS-RING-METER.DAN-TOOLTIP items-center justify-center w-8 h-6 -mt-2 -mr-1 pointer-events-auto dan-tooltip
    //       4 .TURN city-banner__turn flex flex-col justify-end align-center self-center top-0\.5 pointer-events-none relative
    //         5 .TURN-NUMBER -banner__turn-number font-base-2xs text-white text-center w-full bg-cover bg-center bg-no-repeat hidden
    //     3 .QUEUE-CONTAINER queue-production queue-none justify-center w-8 h-6 -mt-2 flex-col align-center
    //       4 FXS-RING-METER.RING.PRODUCTION-RING bg-cover bg-center flex size-9 self-center align-center
    //         5 .QUEUE-IMG queue-production size-4 self-center
`
.bz-flags city-banner.city-banner .city-banner__population-container,
.bz-flags city-banner.city-banner .dan-tooltip,
.bz-flags city-banner.city-banner .city-banner__queue-container {
    position: relative;
    align-items: center;
    justify-content: center;
    top: 0.1666666667rem;
    left: 0;
    width: 1.5555555556rem;
    height: 1.5555555556rem;
    margin-top: 0;
    margin-right: 0.1111111111rem;
    padding: 0;
    box-shadow: none;
}
.bz-flags .city-banner.city-banner--city-other .city-banner__queue-container {
    /* TODO: why is this 1.1111111111rem too high? */
    top: 1.2777777778rem;
}
.bz-flags .city-banner .dan-tooltip {
    filter: drop-shadow(0 0.0555555556rem 0.1111111111rem #0006);
}
.bz-flags city-banner.city-banner .city-banner__ring {
    background-image: url("hud_sub_circle_bk");
    line-height: 2rem;
    margin: 0.001px 0 0 0;
    z-index: 1;
}
.bz-flags city-banner.city-banner .city-banner__population-ring,
.bz-flags city-banner.city-banner .city-banner__production-ring {
    background-position: -0.0277777778rem 0.0277777778rem;
}
.bz-flags .city-banner__population-ring .fxs-ring-meter__ring-right,
.bz-flags .city-banner__population-ring .fxs-ring-meter__ring-left {
    filter: brightness(1.667) fxs-color-tint(${BZ_COLOR.food});
}
.bz-flags .city-banner__production-ring .fxs-ring-meter__ring-right,
.bz-flags .city-banner__production-ring .fxs-ring-meter__ring-left {
    filter: brightness(1.889) fxs-color-tint(${BZ_COLOR.production});
}
.bz-flags .city-banner.city-banner--city-other .queue-production {
    display: flex;
}
.bz-flags .city-banner.city-banner--city-other .queue-production.queue-none {
    display: none;
}
`,  //       4 .TURN flex flex-col justify-end align-center self-center w-8 mt-0\.5 pointer-events-none
    //         5 .TURN-NUMBER font-base-xs text-white text-center w-full bg-cover bg-center bg-no-repeat
`
.bz-flags city-banner.city-banner .city-banner__turn {
    position: relative;
    margin: 0;
    top: -1rem;
}
.bz-flags city-banner.city-banner .city-banner__turn-number {
    background-image: url("blp:town_turn-bg.png");
    background-size: 100% 100%;
    line-height: 1;
    margin: 0;
    padding: 0.8333333333rem 0.1111111111rem 0.1666666667rem;
    min-width: 1.6666666667rem;
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
    top: -2.72222222222rem;
    height: 2.6666666667rem;
    display: flex;
    justify-content: center;
    transform: translateX(-50%) scale(1);
}
`,  //   2 FXS-VSLOT -mr-3 flex-auto
    //     3 .CONQUERED-ICON relative size-14 -mr-6 bg-cover bg-no-repeat
`
.bz-flags city-banner > fxs-hslot > fxs-vslot {
    position: absolute;
    margin: 0rem;
}
.bz-flags city-banner.city-banner .city-banner__conquered-icon {
    position: absolute;
    margin: 0rem;
    top: 2.6666666667rem;
}
`,  //   2 FXS-VSLOT.UNREST -mr-3
    //     3 .UNREST-ICON relative size-14 bg-cover bg-no-repeat
    //     3 .TIME-CONTAINER -mt-3 flex flex-row
    //       4 .TIME-ICON self-center bg-cover bg-no-repeat size-6 ml-1
    //       4 .TIME-TEXT self-center font-body-xs text-white
`
.bz-flags city-banner.city-banner .city-banner__unrest {
    position: relative;
    width: 2.6666666667rem;
    height: 2.6666666667rem;
    margin: 0rem 0.1666666667rem;
}
.bz-flags city-banner.city-banner .city-banner__unrest-icon {
    position: relative;
    margin: 0rem;
    top: -0.2222222222rem;
    left: -0.1111111111rem;
}
`,  //   2 FXS-VSLOT.RAZING
    //     3 .RAZING-ICON relative size-14 bg-cover bg-no-repeat
`
.bz-flags city-banner.city-banner .city-banner__razing {
    position: relative;
    width: 2.6666666667rem;
    height: 2.6666666667rem;
    margin: 0rem 0.1666666667rem;
}
.bz-flags city-banner.city-banner .city-banner__razing-icon {
    position: relative;
    margin: 0rem;
    top: -0.2222222222rem;
    left: -0.1111111111rem;
}
`,  //     3 .TIME-CONTAINER -mt-3 pr-2 flex flex-row
    //       4 .TIME-ICON self-center bg-cover bg-no-repeat size-6 ml-1
    //       4 .TIME-TEXT self-center font-body-xs text-white
`
.bz-flags .city-banner .city-banner__time-container {
    border-image-source: none;
    border-image-slice: 0;
    border-image-width: 0;
    padding: 0;
    position: relative;
    background-color: #000a;
    margin: -0.6666666667rem 0.1111111111rem 0rem;
    height: 1.1111111111rem;
    border-radius: 0.4444444444rem / 50%;
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
document.body.classList.toggle("bz-flags", bzFlagCorpsOptions.banners);
// use the Map Trix debug hotkey instead
// if (UI.isDebugPlotInfoVisible()) document.body.classList.add("bz-debug");

const rgbRE = /^rgb\((\d+) *[ ,] *(\d+) *[ ,] *(\d+)(?: *[ ,] *(\d+))?\)$/i;
function rgbFromString(color) {
    const match = rgbRE.exec(color);
    if (!match) {
        console.error("rgbFromString: ${color} is not rgb(R,G,B)");
        return { r: 0, g: 0, b: 0 };
    }
    const [r, g, b] = match.slice(1, 4).map(n => parseInt(n ?? 1));
    return { r, g, b };
}
function rgbToString(srgb) {
    return `rgb(${srgb.r}, ${srgb.g}, ${srgb.b})`;
}

function darkenColor(rgb, darkness) {
    const srgb = rgbFromString(rgb);
    const min = Math.min(srgb.r, srgb.g, srgb.b);
    const max = Math.max(srgb.r, srgb.g, srgb.b);
    const dc = Math.round(max * darkness);
    const maxt = max - dc;
    const mint = Math.max(min - dc, 0);
    if (maxt == mint) {
        return rgbToString({ r: mint, g: mint, b: mint });
    }
    const scale = (maxt - mint) / (max - min);
    srgb.r = Math.round((srgb.r - min) * scale) + mint;
    srgb.g = Math.round((srgb.g - min) * scale) + mint;
    srgb.b = Math.round((srgb.b - min) * scale) + mint;
    return rgbToString(srgb);
}
function lightenColor(rgb, lightness) {
    const srgb = rgbFromString(rgb);
    const min = Math.min(srgb.r, srgb.g, srgb.b);
    const max = Math.max(srgb.r, srgb.g, srgb.b);
    const dc = Math.round((255 - min) * lightness);
    const mint = min + dc;
    const maxt = Math.min(max + dc, 255);
    if (maxt == mint) {
        return rgbToString({ r: mint, g: mint, b: mint });
    }
    const scale = (maxt - mint) / (max - min);
    srgb.r = Math.round((srgb.r - min) * scale) + mint;
    srgb.g = Math.round((srgb.g - min) * scale) + mint;
    srgb.b = Math.round((srgb.b - min) * scale) + mint;
    return rgbToString(srgb);
}

export class bzCityBanner {
    static c_prototype;
    constructor(component) {
        this.component = component;
        component.bzComponent = this;
        this.Root = this.component.Root;
        this.elements = this.component.elements;
        this.componentID = null;
        this.location = null;
        this.city = null;
        this.owner = null;
        this.suzerain = null;
        this.leader = null;
        this.player = null;  // local observer
        this.isAlly = false;  // is leader allied?
        this.isEnemy = false;  // is leader at war?
        this.isVassal = false;  // is owner a vassal state?
        this.hasHead = false;
        this.patchPrototypes(this.component);
        this.patchStyles(this.component);
    }
    patchPrototypes(component) {
        const c_prototype = Object.getPrototypeOf(component);
        if (bzCityBanner.c_prototype == c_prototype) return;
        // patch component methods
        const proto = bzCityBanner.c_prototype = c_prototype;
        // beforeBuildBanner
        const beforeBuildBanner = this.beforeBuildBanner;
        const buildBanner = proto.buildBanner;
        proto.buildBanner = function(...args) {
            const before_rv = beforeBuildBanner.apply(this.bzComponent, args);
            const c_rv = buildBanner.apply(this, args);
            return c_rv ?? before_rv;
        }
        // afterAffinityUpdate
        const afterAffinityUpdate = this.afterAffinityUpdate;
        const affinityUpdate = proto.affinityUpdate;
        proto.affinityUpdate = function(...args) {
            const c_rv = affinityUpdate.apply(this, args);
            const after_rv = afterAffinityUpdate.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        // afterCapitalUpdate
        const afterCapitalUpdate = this.afterCapitalUpdate;
        const capitalUpdate = proto.capitalUpdate;
        proto.capitalUpdate = function(...args) {
            const c_rv = capitalUpdate.apply(this, args);
            const after_rv = afterCapitalUpdate.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        // afterSetCityInfo
        const afterSetCityInfo = this.afterSetCityInfo;
        const setCityInfo = proto.setCityInfo;
        proto.setCityInfo = function(...args) {
            const c_rv = setCityInfo.apply(this, args);
            const after_rv = afterSetCityInfo.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        // afterSetFood
        const afterSetFood = this.afterSetFood;
        const setFood = proto.setFood;
        proto.setFood = function(...args) {
            const c_rv = setFood.apply(this, args);
            const after_rv = afterSetFood.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        // afterSetProduction
        const afterSetProduction = this.afterSetProduction;
        const setProduction = proto.setProduction;
        proto.setProduction = function(...args) {
            const c_rv = setProduction.apply(this, args);
            const after_rv = afterSetProduction.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        // afterRealizeBuilds
        const afterRealizeBuilds = this.afterRealizeBuilds;
        const realizeBuilds = proto.realizeBuilds;
        proto.realizeBuilds = function(...args) {
            const c_rv = realizeBuilds.apply(this, args);
            const after_rv = afterRealizeBuilds.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        // afterRealizeHappiness
        const afterRealizeHappiness = this.afterRealizeHappiness;
        const realizeHappiness = proto.realizeHappiness;
        proto.realizeHappiness = function(...args) {
            const c_rv = realizeHappiness.apply(this, args);
            const after_rv = afterRealizeHappiness.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        // afterRealizePlayerColors
        const afterRealizePlayerColors = this.afterRealizePlayerColors;
        const realizePlayerColors = proto.realizePlayerColors;
        proto.realizePlayerColors = function(...args) {
            const c_rv = realizePlayerColors.apply(this, args);
            const after_rv = afterRealizePlayerColors.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
        // afterRealizeTradeNetwork
        const afterRealizeTradeNetwork = this.afterRealizeTradeNetwork;
        const realizeTradeNetwork = proto.realizeTradeNetwork;
        proto.realizeTradeNetwork = function(...args) {
            const c_rv = realizeTradeNetwork.apply(this, args);
            const after_rv = afterRealizeTradeNetwork.apply(this.bzComponent, args);
            return after_rv ?? c_rv;
        }
    }
    patchStyles(banner) {
        const { growthQueueTurns, productionQueueTurns } = banner.elements;
        growthQueueTurns.classList.remove("font-base-2xs");
        growthQueueTurns.classList.add("text-xs");
        productionQueueTurns.classList.remove("font-base-xs");
        productionQueueTurns.classList.add("text-xs");
    }
    beforeBuildBanner() {
        this.componentID = this.component.componentID;
        this.location = this.component.location;
        this.city = this.component.city;
        this.owner = Players.get(this.componentID.owner);
        this.player = Players.get(GameContext.localObserverID);
        this.component.realizePlayerColors();
    }
    realizeIcon() {
        // expand the capital-star to show ownership & town focus
        this.hasHead = false;
        if (!this.city) return;
        if (!this.owner || this.owner.isIndependent) return;
        const { capitalIndicator, } = this.elements;
        let icon = null;
        const filter = [];
        const tint = `fxs-color-tint(${this.color2})`;
        const shadow = `drop-shadow(${BZ_SHADOW_SHAPE} ${this.color1dark})`;
        const light = `drop-shadow(${BZ_LIGHT_SHAPE} ${this.color1light})`;
        if (this.owner.isMinor) {
            // city-state
            this.hasHead = !bzFlagCorpsOptions.noHeads;
            const suz = Players.get(this.owner.Influence?.getSuzerain() ?? -1);
            const civ = suz && GameInfo.Civilizations.lookup(suz.civilizationType);
            icon = civ && UI.getIconCSS(civ.CivilizationType);
            filter.push(tint, shadow, light);
        } else if (this.city.isCapital) {
            // capital star
            this.hasHead = !bzFlagCorpsOptions.noHeads;
            icon = "url('blp:icon-capital.png')";
            filter.push(shadow, light);
        } else if (!this.city.isTown) {
            // city owner
            this.hasHead = !bzFlagCorpsOptions.noHeads;
            const civ = GameInfo.Civilizations.lookup(this.owner.civilizationType);
            icon = UI.getIconCSS(civ.CivilizationType);
            filter.push(tint, shadow, light);
        } else if (bzFlagCorpsOptions.banners) {
            // town focus
            const isGrowing = this.city.Growth?.growthType == GrowthTypes.EXPAND;
            const ptype = this.city.Growth?.projectType ?? null;
            const focus = ptype && GameInfo.Projects.lookup(ptype);
            if (isGrowing) icon = UI.getIconCSS("PROJECT_GROWTH");
            if (focus) icon ??= UI.getIconCSS(focus.ProjectType);
            // show locked focus with brown leaf icon
            if (focus && isGrowing) filter.push("sepia(1) brightness(1.2) saturate(2)");
            filter.push(shadow, light);
        }
        capitalIndicator.style.backgroundImage = icon;
        capitalIndicator.style.filter = filter.join(' ');
        capitalIndicator.classList.toggle('hidden', !icon);
        // "no heads" option
        const portrait = this.Root.querySelector(".city-banner__portrait");
        if (this.hasHead) {
            // show head and color its background
            portrait.style.display = "flex";
            const primary = "var(--player-color-primary)";
            const tint = `fxs-color-tint(${primary})`;
            const portraitBG1 = this.Root.querySelector(".city-banner__portrait-bg1");
            portraitBG1.style.filter = tint;
        } else {
            portrait.style.display = "none";
        }
    }
    afterAffinityUpdate() {
        bzCityTooltip.queueUpdate(this);
        this.realizePortrait();  // sets relationship info too
        if (!this.owner?.isMajor && bzFlagCorpsOptions.banners) {
            const isNeutral = !this.isVassal && !this.isEnemy;
            this.Root.classList.toggle("city-banner--friendly", this.isVassal);
            this.Root.classList.toggle("city-banner--hostile", this.isEnemy);
            this.Root.classList.toggle("city-banner--neutral", isNeutral);
        }
    }
    afterCapitalUpdate() {
        bzCityTooltip.queueUpdate(this);
        // update capital star
        this.realizeIcon();
    }
    afterSetCityInfo(_data) {
        bzCityTooltip.queueUpdate(this);
        this.realizeIcon();
        if (this.owner && !this.owner.isIndependent) {
            // improved text lighting
            const { cityName, } = this.elements;
            const shadowSpec = `${BZ_SHADOW_SHAPE} ${this.color1dark}`;
            const lightSpec = `${BZ_LIGHT_SHAPE} ${this.color1light}`;
            cityName.style.textShadow = `${shadowSpec}, ${lightSpec}`;
        }
        this.Root.bzComponent = this;
        this.Root.setAttribute('data-tooltip-style', 'bz-city-tooltip');
        const { container, portrait, } = this.elements;
        container.removeAttribute('data-tooltip-content');
        portrait.removeAttribute('data-tooltip-content');
        // set affinity rings for captured settlements
        if (this.city && this.owner.isIndependent) this.component.affinityUpdate();
    }
    afterSetFood(_turnsLeft, _current, _nextTarget) {
        bzCityTooltip.queueUpdate(this);
        // hide default tooltip
        const { growthQueueContainer, } = this.elements;
        growthQueueContainer.removeAttribute('data-tooltip-content');
        // add subtarget class
        growthQueueContainer.classList.add("bz-city-growth");
    }
    afterSetProduction(_data) {
        bzCityTooltip.queueUpdate(this);
        // hide default tooltip
        const { productionQueue, } = this.elements;
        productionQueue.removeAttribute('data-tooltip-content');
        // in single-player mode, hide other players' queues
        if (this.isRival()) productionQueue.style.display = 'none';
        // add subtarget class
        productionQueue.classList.add("bz-city-queue");
    }
    isRival() {
        // does this banner belong to a rival?
        // used to hide private info like production queues
        if (!this.player || !this.owner) return false;
        if (UI.isDebugPlotInfoVisible()) return false;
        // check the actual player ID, not the observer
        const playerID = GameContext.localPlayerID;
        return playerID != -1 && playerID != this.owner.id;
    }
    setRelationshipInfo() {
        if (this.owner?.Influence?.hasSuzerain) {
            this.suzerain = Players.get(this.owner.Influence.getSuzerain());
        }
        this.leader = this.suzerain ?? this.owner;
        if (!this.player) return;  // autoplaying
        this.isAlly = this.leader?.Diplomacy?.hasAllied(this.player.id) ?? false;
        this.isEnemy = this.leader?.Diplomacy?.isAtWarWith(this.player.id) ?? false;
        this.isVassal = this.suzerain?.id == this.player.id;
    }
    realizePortrait() {
        this.setRelationshipInfo();
        if (!this.owner || !this.city) return;
        if (this.owner.isIndependent) {
            // settlements captured by independents:
            // replace the default leader head with flames
            const portrait = 'url("blp:icon_razed.png")';
            this.elements.portraitIcon.style.backgroundImage = portrait;
            return;
        }
        // get angry!
        const leaderType = GameInfo.Leaders.lookup(this.leader.leaderType);
        if (!leaderType) return;
        let context = "DEFAULT";
        let transform = "";
        if (this.leader.id == this.player?.id) {
            // show local status: unhappiness, unrest, razing, plague
            const happiness = this.city.Yields?.getYield(YieldTypes.YIELD_HAPPINESS);
            if (happiness < 0) context = "LEADER_ANGRY";
            // TODO: other negative statuses
        } else {
            transform = "scale(-1, 1)";  // face left
            // show relationship: allied, neutral, at war
            if (this.isAlly) context = "LEADER_HAPPY";
            if (this.isEnemy) context = "LEADER_ANGRY";
        }
        const portrait = UI.getIconCSS(leaderType.LeaderType, context);
        if (!portrait) return;
        this.elements.portraitIcon.style.transform = transform;
        this.elements.portraitIcon.style.backgroundImage = portrait;
    }
    afterRealizeBuilds() {
        // update town focus
        this.realizeIcon();
    }
    afterRealizeHappiness() {
        bzCityTooltip.queueUpdate(this);
        // shift icons above damage bar
        if (this.owner) {
            const districts = Players.Districts.get(this.owner.id);
            const cur = districts?.getDistrictHealth(this.location);
            const max = districts?.getDistrictMaxHealth(this.location);
            const unrest = this.Root.querySelector(".city-banner__unrest");
            const razing = this.Root.querySelector(".city-banner__razing");
            const shift = (cur && cur != max) ? "-0.8333333333rem" : "0";
            unrest.style.top = razing.style.top = shift;
        }
        // hide unrest when razing
        const showUnrest = this.city?.Happiness?.hasUnrest && !this.city.isBeingRazed;
        this.Root.classList.toggle("city-banner--unrest", showUnrest);
        this.realizePortrait();
    }
    afterRealizePlayerColors() {
        this.color1 = this.Root.style.getPropertyValue('--player-color-primary');
        this.color2 = this.Root.style.getPropertyValue('--player-color-secondary');
        this.color1dark = darkenColor(this.color1, 2/3);
        this.color2dark = darkenColor(this.color2, 2/3);
        this.color1light = lightenColor(this.color1, 1/2);
        this.color2light = lightenColor(this.color2, 1/2);
    }
    afterRealizeTradeNetwork() {
        const disconnected = this.city?.Trade && !this.city.Trade.isInTradeNetwork();
        const hidden = !disconnected || this.isRival();
        this.elements.tradeNetworkContainer.classList.toggle("hidden", hidden);
    }
    beforeAttach() { }
    afterAttach() { }
    beforeDetach() { }
    afterDetach() { }
    onAttributeChanged(_name, _prev, _next) { }
}
function refreshAllBanners() {
    const banners = CityBannerManager.instance?.banners;
    if (!banners) {
        console.warn(`bz-city-banners: no banners to refresh`);
        return;
    }
    banners.forEach((banner, _key) => banner.queueNameUpdate());
}
window.addEventListener('bz-flag-corps-options', refreshAllBanners);
Controls.decorate('city-banner', (component) => new bzCityBanner(component));
