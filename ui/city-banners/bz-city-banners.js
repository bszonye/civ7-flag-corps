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
};
//  city-banner__container
//      city-banner__stretch
//          city-banner__city-state-border
//          city-banner__city-state-ring
//          city-banner__stretch-bg
//      hslot city-banner__name-container
//          city-banner__portrait
//              city-banner__portrait-bg1
//              city-banner__portrait-bg2
//              city-banner__portrait-img
//          vslot city-banner__name-vslot
//              hslot
//                  city-banner__capital-star
//                  city-banner__name
//              hslot city-banner__status-religion
//                  city-banner__status
//                      city-banner__status-background
//                      city-banner__status-icon
//                  hslot city-banner__religion
//                      city-banner__religion-symbol-bg
//                          city-banner__religion-symbol
//                      city-banner__religion-symbol-bg
//                          city-banner__religion-symbol
//          city-banner__population-container
//              ring-meter city-banner__ring
//                  city-banner__population-number
//              city-banner__turn
//                  city-banner__turn-number
//          city-banner__queue-container
//              ring-meter
//                  city-banner__queue-img
//              city-banner__turn
//                  city-banner__turn-number
//          city-banner__city-state-container
//              city-banner__city-state-type
//                  city-banner__city-state-icon
//  hslot
//      vslot
//          city-banner__conquered-icon
//      vslot city-banner__unrest
//          city-banner__unrest-icon
//          city-banner__time-container
//              city-banner__time-icon
//              city-banner__time-text
//      vslot city-banner__razing
//          city-banner__razing-icon
//          city-banner__time-container
//              city-banner__time-icon
//              city-banner__time-text
const BZ_HEAD_STYLE = [
    // 1 CONTAINER flex flex-col mt-2">
`
.bz-flags .city-banner.city-banner--town .city-banner__container,
.bz-flags .city-banner.city-banner--city .city-banner__container,
.bz-flags .city-banner.city-banner--city-other .city-banner__container,
.bz-flags .city-banner.city-banner--citystate .city-banner__container,
.bz-flags .city-banner.city-banner--village .city-banner__container {
    margin-top: 0.4444444444rem;
}
`,  //   2 STRETCH absolute flex flex-row justify-center align-center w-full h-8 top-1\.5 pointer-events-none
`
.bz-flags .city-banner. .city-banner__stretch {
    /* background-color: #8088;  /* DEBUG */
}
.bz-flags .city-banner.city-banner--town .city-banner__stretch,
.bz-flags .city-banner.city-banner--city .city-banner__stretch,
.bz-flags .city-banner.city-banner--city-other .city-banner__stretch,
.bz-flags .city-banner.city-banner--citystate .city-banner__stretch,
.bz-flags .city-banner.city-banner--village .city-banner__stretch {
    top: 0.3333333333rem;
    height: 3.6666666667rem;
}
`,  //     3 CITY-STATE-BORDER absolute -left-2 -right-2 -top-0 -bottom-0
`
.bz-flags .city-banner.city-banner--citystate .city-banner__city-state-border,
.bz-flags .city-banner.city-banner--village .city-banner__city-state-border {
	border-image-slice: 60 24 2 24 fill;
	border-image-outset: 0.2222222222rem 0.1111111111rem;
	border-image-width: 3rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
}
.bz-flags .city-banner.city-banner--friendly .city-banner__city-state-border {
    fxs-border-image-tint: ${BZ_COLOR.friendly};
}
.bz-flags .city-banner.city-banner--hostile .city-banner__city-state-border {
    fxs-border-image-tint: ${BZ_COLOR.hostile};
}
`,  //     3 CITY-STATE-RING absolute -left-1 -right-1 top-1 bottom-0
`
.bz-flags .city-banner.city-banner--city .city-banner__city-state-ring,
.bz-flags .city-banner.city-banner--city-other .city-banner__city-state-ring,
.bz-flags .city-banner.city-banner--citystate .city-banner__city-state-ring,
.bz-flags .city-banner.city-banner--village .city-banner__city-state-ring {
    display: flex;
    border-image-source: url("fs://game/city_pill.png");
    border-image-slice: 60 24 2 24 fill;
    border-image-outset: 0.2222222222rem 0.3888888889rem;
    border-image-width: 3.3333333333rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
}
.bz-flags .city-banner.city-banner--city .city-banner__city-state-ring,
.bz-flags .city-banner.city-banner--city-other .city-banner__city-state-ring,
.bz-flags .city-banner.city-banner--citystate .city-banner__city-state-ring {
    fxs-border-image-tint: var(--player-color-secondary);
.bz-flags .city-banner.city-banner--village .city-banner__city-state-ring {
    fxs-border-image-tint: var(--player-color-primary);
}
`,  //     3 STRETCH-BG absolute inset-0 pointer-events-none
`
.bz-flags .city-banner__stretch-bg,
.bz-flags .city-banner.city-banner--town .city-banner__stretch-bg,
.bz-flags .city-banner.city-banner--city .city-banner__stretch-bg,
.bz-flags .city-banner.city-banner--city-other .city-banner__stretch-bg,
.bz-flags .city-banner.city-banner--citystate .city-banner__stretch-bg,
.bz-flags .city-banner.city-banner--village .city-banner__stretch-bg {
    border-image-source: url("fs://game/town_pill.png");
    border-image-slice: 60 24 2 24 fill;
    border-image-outset: 0rem 0.4444444444rem;
    border-image-width: 3.3333333333rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
}
.bz-flags .city-banner__stretch-bg {
    fxs-border-image-tint: var(--player-color-primary);
}
.bz-flags .city-banner.city-banner--citystate .city-banner__stretch-bg {
    fxs-border-image-tint: var(--player-color-primary);
}
.bz-flags .city-banner.city-banner--village .city-banner__stretch-bg {
    fxs-border-image-tint: var(--player-color-secondary);
}
`,  //   2 HSLOT NAME-CONTAINER relative flex justify-between
`
.bz-flags .city-banner__name-container {
    line-height: 2rem;
    pointer-events: auto;
    margin-left: 0.4444444444rem;
}
.bz-flags .city-banner.city-banner--town .city-banner__name-container {
    margin-top: 0.8888888889rem;
}
.bz-flags .city-banner.city-banner--city .city-banner__name-container,
.bz-flags .city-banner.city-banner--city-other .city-banner__name-container {
    margin-top: 0.3333333333rem;
}
.bz-flags .city-banner.city-banner--citystate .city-banner__name-container,
.bz-flags .city-banner.city-banner--village .city-banner__name-container {
    margin-top: -0.3333333333rem;
}
.bz-flags .city-banner__name-container {
    color: var(--player-color-secondary);
}
.bz-flags .city-banner.city-banner--citystate .city-banner__name-container {
    color: var(--player-color-secondary);
}
.bz-flags .city-banner.city-banner--village .city-banner__name-container {
    color: var(--player-color-primary);
}
`,  //     3 PORTRAIT relative pointer-events-auto flex
    //       4 PORTRAIT-BG1 absolute inset-0 bg-center bg-cover bg-no-repeat
    //       4 PORTRAIT-BG2 absolute inset-x-0 top-0 -bottom-2 bg-center bg-cover bg-no-repeat
    //       4 PORTRAIT-IMG absolute -left-2 -right-2 -top-1 bottom-0 bg-cover bg-center bg-no-repeat pointer-events-none
`
.bz-flags .city-banner.city-banner--citystate .city-banner__portrait {
    /* TODO */
	top: 0.3333333333rem;
	width: 1.1111111111rem;
	height: 1.7777777778rem;
	display: flex;
}
`,  //     3 VSLOT NAME-VSLOT pointer-events-auto cursor-pointer max-h-10
    //       4 HSLOT
    //         5 CAPITAL-STAR w-8 h-8 bg-cover bg-no-repeat hidden
    //         5 NAME font-title-base uppercase
`
.bz-flags .city-banner.city-banner--town .city-banner__name {
    margin-top: -0.2777777778rem;
}
.bz-flags .city-banner.city-banner--citystate .city-banner__name,
.bz-flags .city-banner.city-banner--village .city-banner__name {
    margin-top: 0.3888888889rem;
    text-shadow: none;
}
.bz-flags .city-banner.city-banner--citystate .city-banner__name {
    margin-right: 0.2222222222rem;
}
`,  //       4 HSLOT STATUS-RELIGION
    //         5 STATUS flex justify-center align-center opacity-100
    //           6 STATUS-BACKGROUND h-full w-full absolute
    //           6 STATUS-ICON absolute w-full h-full bg-no-repeat
    //         5 HSLOT RELIGION self-center
    //           6 RELIGION-SYMBOL-BG
    //             7 RELIGION-SYMBOL bg-contain bg-no-repeat bg-center
    //           6 RELIGION-SYMBOL-BG religion-bg--right
    //             7 RELIGION-SYMBOL bg-contain bg-no-repeat bg-center religion-symbol--right
    //     3 POPULATION-CONTAINER items-center justify-center w-6 h-6 -mt-2
`
.bz-flags .city-banner__population-container {
    position: relative;
}
`,  //       4 RING-METER RING POPULATION-RING bg-cover bg-center flex size-9 self-center align-center
`
.bz-flags .city-banner__ring {
    position: relative;
}
.bz-flags .city-banner.city-banner--town .city-banner__ring,
.bz-flags .city-banner.city-banner--city .city-banner__ring,
.bz-flags .city-banner.city-banner--city-other .city-banner__ring {
    position: relative;
    margin-top: 0rem;
    margin-right: 0.1111111111rem;
    top: 0.475rem;
    left: 0rem;
    z-index: 2;
}
.bz-flags .city-banner.city-banner--citystate .city-banner__ring {
    position: relative;
    margin-top: 0rem;
    margin-right: 0.1111111111rem;
    top: 0.8rem;
    left: 0rem;
    z-index: 2;
}
`,  //         5 POPULATION-NUMBER font-body-xs text-white top-0 w-full text-center pointer-events-auto
    //       4 TURN flex flex-col justify-end align-center self-center top-0\.5 pointer-events-none relative
`
.bz-flags .city-banner.city-banner--town .city-banner__turn,
.bz-flags .city-banner.city-banner--city .city-banner__turn,
.bz-flags .city-banner.city-banner--city-other .city-banner__turn,
.bz-flags .city-banner.city-banner--citystate .city-banner__turn {
    position: relative;
    margin: 0rem;
    top: 0.2222222222rem;;
}
`,  //         5 TURN-NUMBER font-base-2xs text-white text-center w-full bg-cover bg-center bg-no-repeat
`
.bz-flags .city-banner__turn-number {
    background-image: url("fs://game/town_turn-bg.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    line-height: 1;
    margin: 0rem;
    padding-left: 0.1111111111rem;
    padding-right: 0.1111111111rem;
    padding-top: 0.8888888889rem;
    padding-bottom: 0.1111111111rem;
    min-width: 1.6666666667rem;
    z-index: 1;
}
`,  //     3 QUEUE-CONTAINER queue-production queue-none justify-center w-8 h-6 -mt-2 flex-col align-center
    //       4 RING-METER RING PRODUCTION-RING bg-cover bg-center flex size-9 self-center align-center
    //         5 QUEUE-IMG queue-production size-4 self-center
    //       4 TURN flex flex-col justify-end align-center self-center w-8 mt-0\.5 pointer-events-none
    //         5 TURN-NUMBER font-base-xs text-white text-center w-full bg-cover bg-center bg-no-repeat
    //     3 CITY-STATE-CONTAINER justify-center
`
.bz-flags .city-banner.city-banner--citystate .city-banner__city-state-container,
.bz-flags .city-banner.city-banner--village .city-banner__city-state-container {
    margin-top: 0.2222222222rem;
    margin-left: 0.2222222222rem;
    margin-right: 0rem;
}
`,  //       4 CITY-STATE-TYPE size-7 self-center align-center justify-center
`
.bz-flags .city-banner.city-banner--citystate .city-banner__city-state-type,
.bz-flags .city-banner.city-banner--village .city-banner__city-state-type {
    display: flex;
    margin-top: 0.3333333333rem;
    margin-right: 0.1111111111rem;
}
`,  //         5 CITY-STATE-ICON size-8 self-center align-center bg-cover bg-no-repeat
    // 1 HSLOT items-center -ml-12 mt-10
    //   2 VSLOT -mr-3
    //     3 CONQUERED-ICON relative size-14 -mr-6 bg-cover bg-no-repeat
`
.bz-flags .city-banner.city-banner--citystate .city-banner__conquered-icon {
	margin-top: 1.3333333333rem;
}
`,  //   2 VSLOT UNREST -mr-3
    //     3 UNREST-ICON relative size-14 bg-cover bg-no-repeat
`
.bz-flags .city-banner.city-banner--citystate .city-banner__unrest-icon {
	margin-top: 1.3333333333rem;
}
`,  //     3 TIME-CONTAINER -mt-3 flex flex-row
    //       4 TIME-ICON self-center bg-cover bg-no-repeat size-6 ml-1
    //       4 TIME-TEXT self-center font-body-xs text-white
    //   2 VSLOT RAZING
    //     3 RAZING-ICON relative size-14 bg-cover bg-no-repeat
`
.bz-flags .city-banner.city-banner--citystate .city-banner__razing-icon {
	margin-top: 1.3333333333rem;
}
`,  //     3 TIME-CONTAINER -mt-3 flex flex-row
    //       4 TIME-ICON self-center bg-cover bg-no-repeat size-6 ml-1
    //       4 TIME-TEXT self-center font-body-xs text-white

];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});
document.body.classList.add("bz-flags");

export class bzCityBanner {
    static component_prototype;
    constructor(component) {
        this.component = component;
        component.bzComponent = this;
        const { growthQueueTurns, productionQueueTurns } = this.component.elements;
        growthQueueTurns.classList.remove("font-base-2xs");
        growthQueueTurns.classList.add("text-xs");
        productionQueueTurns.classList.remove("font-base-xs");
        productionQueueTurns.classList.add("text-xs");
    }
    beforeAttach() { }
    afterAttach() { }
    beforeDetach() { }
    afterDetach() { }
    onAttributeChanged(_name, _prev, _next) { }
}
Controls.decorate('city-banner', (component) => new bzCityBanner(component));
