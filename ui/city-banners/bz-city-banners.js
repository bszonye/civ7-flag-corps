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
// city-banner__container
//  city-banner__stretch
//      city-banner__city-state-border
//      city-banner__city-state-ring
//      city-banner__stretch-bg
//  hslot city-banner__name-container
//      city-banner__portrait
//          city-banner__portrait-bg1
//          city-banner__portrait-bg2
//          city-banner__portrait-img
//      vslot city-banner__name-vslot
//          hslot
//              city-banner__capital-star
//              city-banner__name
//          hslot city-banner__status-religion
//              city-banner__status
//                  city-banner__status-background
//                  city-banner__status-icon
//              hslot city-banner__religion
//                  city-banner__religion-symbol-bg
//                      city-banner__religion-symbol
//                  city-banner__religion-symbol-bg
//                      city-banner__religion-symbol
//      city-banner__population-container
//          ring-meter city-banner__ring
//              city-banner__population-number
//          city-banner__turn
//              city-banner__turn-number
//      city-banner__queue-container
//          ring-meter
//              city-banner__queue-img
//          city-banner__turn
//              city-banner__turn-number
//      city-banner__city-state-container
//          city-banner__city-state-type
//              city-banner__city-state-icon
// hslot
//  vslot
//      city-banner__conquered-icon
//  vslot city-banner__unrest
//      city-banner__unrest-icon
//      city-banner__time-container
//          city-banner__time-icon
//          city-banner__time-text
//  vslot city-banner__razing
//      city-banner__razing-icon
//      city-banner__time-container
//          city-banner__time-icon
//          city-banner__time-text
const BZ_HEAD_STYLE = [
// all settlements
`.bz-city-banners .city-banner.city-banner--citystate .city-banner__stretch {
    top: 0.6666666667rem;
    height: 4rem;
}
.bz-city-banners .city-banner__stretch-bg {
    border-image-source: url("fs://game/town_pill.png");
    fxs-border-image-tint: var(--player-color-primary);
}
.bz-city-banners .city-banner__name-container {
    line-height: 2rem;
    color: var(--player-color-secondary);
    pointer-events: auto;
    margin-left: 0.4444444444rem;
}
.bz-city-banners .city-banner .city-banner__name-container {
    background-color: #0088;
}
.bz-city-banners .city-banner__population-container {
    position: relative;
    background-color: #0808;
}
.bz-city-banners .city-banner__ring {
    position: absolute;
}
.bz-city-banners .city-banner__turn-number {
    position: absolute;
    background-image: url("fs://game/town_turn-bg.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    line-height: 1;
    top: 0.2222222222rem;
    left: 0rem;
    padding-left: 0.1111111111rem;
    padding-right: 0.1111111111rem;
    padding-top: 0.4444444444rem;
    padding-bottom: 0.1111111111rem;
    min-width: 1.6666666667rem;
}`,
// towns
`.bz-city-banners .city-banner.city-banner--town .city-banner__name {
}`,
`.bz-city-banners .city-banner.city-banner--town .city-banner__stretch-bg {
    border-image-source: url("fs://game/town_pill.png");
}`,
// player cities
`.bz-city-banners .city-banner.city-banner--city .city-banner__stretch {
    top: 0.6666666667rem;
    height: 4rem;
}
.bz-city-banners .city-banner.city-banner--city .city-banner__stretch-bg {
    border-image-source: url("fs://game/town_pill.png");
}`,
// rival cities
`.bz-city-banners .city-banner.city-banner--city-other .city-banner__stretch-bg {
    border-image-source: url("fs://game/town_pill.png");
}`,
// city-states and villages
`
.bz-city-banners .city-banner.city-banner--citystate .city-banner__center,
.bz-city-banners .city-banner.city-banner--village .city-banner__center {
    width: 4rem;
    height: 3.6666666667rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__city-state-type,
.bz-city-banners .city-banner.city-banner--village .city-banner__city-state-type {
    display: flex;
    margin-top: 0.3333333333rem;
    margin-right: 0.1111111111rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__stretch {
.bz-city-banners .city-banner.city-banner--village .city-banner__stretch {
    top: 0.3333333333rem;
    height: 3.6666666667rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__stretch-bg,
.bz-city-banners .city-banner.city-banner--village .city-banner__stretch-bg {
    border-image-source: url("fs://game/town_pill.png");
    border-image-outset: 0rem 0.4444444444rem;
    border-image-width: 3.3333333333rem 1.3333333333rem 0.1111111111rem 1.3333333333rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__name-container,
.bz-city-banners .city-banner.city-banner--village .city-banner__name-container {
    margin-top: -0.3333333333rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__name,
.bz-city-banners .city-banner.city-banner--village .city-banner__name {
    margin-top: 0.3888888889rem;
    text-shadow: none;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__city-state-container,
.bz-city-banners .city-banner.city-banner--village .city-banner__city-state-container {
    margin-top: 0.2222222222rem;
    margin-left: 0.2222222222rem;
    margin-right: 0rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__city-state-ring,
.bz-city-banners .city-banner.city-banner--village .city-banner__city-state-ring {
    border-image-source: url("fs://game/city_pill.png");
    border-image-outset: 0.2222222222rem 0.3888888889rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__stretch-bg {
    fxs-border-image-tint: var(--player-color-primary);
}
.bz-city-banners .city-banner.city-banner--village .city-banner__stretch-bg {
    fxs-border-image-tint: var(--player-color-secondary);
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__name-container {
    color: var(--player-color-secondary);
}
.bz-city-banners .city-banner.city-banner--village .city-banner__name-container {
    color: var(--player-color-primary);
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__name {
    margin-right: 0.2222222222rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__ring {
    top: 0.5rem;
    transform: translateX(-50%) scale(1);
    background-color: #8008;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__city-state-ring {
    fxs-border-image-tint: var(--player-color-secondary);
.bz-city-banners .city-banner.city-banner--village .city-banner__city-state-ring {
    fxs-border-image-tint: var(--player-color-primary);
}
/* TODO */
.bz-city-banners .city-banner.city-banner--citystate .city-banner__container {
	margin-top: 1.1111111111rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__portrait {
	top: 0.3333333333rem;
	width: 1.1111111111rem;
	height: 1.7777777778rem;
	display: flex;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__center-bottom-bg {
    /* TODO */
	width: 2.4444444444rem;
	height: 4rem;
	mask-image: url("fs://game/core/ui/themes/default/img/city_banners/mask_citybanner_big-village-center.png");
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__conquered-icon {
	margin-top: 1.3333333333rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__unrest-icon {
	margin-top: 1.3333333333rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__razing-icon {
	margin-top: 1.3333333333rem;
}`,
// relationship rings
`.bz-city-banners .city-banner.city-banner--friendly .city-banner__city-state-border {
    fxs-border-image-tint: ${BZ_COLOR.friendly};
}
.bz-city-banners .city-banner.city-banner--hostile .city-banner__city-state-border {
    border-image-outset: 0.2222222222rem 0.1111111111rem;
    fxs-border-image-tint: ${BZ_COLOR.hostile};
}`,
];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});
document.body.classList.add("bz-city-banners");

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
