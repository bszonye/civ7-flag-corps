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
    // independent player colors
    citystate: "#e5e5e5",
    village: "#161623",
    friendly: "#e5d2ac",
    hostile: "#af1b1c",
};
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
    margin-left: 0.4444444444rem;
    line-height: 2rem;
    color: var(--player-color-secondary);
    pointer-events: auto;
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
// city-states
`.bz-city-banners .city-banner.city-banner--citystate .city-banner__name-container {
    color: ${BZ_COLOR.village};
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__name {
    margin-top: 0.3888888889rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__city-state-container {
    margin-top: -0.0277777778rem;
    margin-left: 0.2222222222rem;
    margin-right: 0.0277777778rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__stretch-bg {
    border-image-source: url("fs://game/town_pill.png");
    fxs-border-image-tint: ${BZ_COLOR.citystate};
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__city-state-ring {
    border-image-source: url("fs://game/city_pill.png");
    fxs-border-image-tint: ${BZ_COLOR.village};
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__city-state-border {
}`,
// villages
`.bz-city-banners .city-banner.city-banner--village .city-banner__name-container {
    color: ${BZ_COLOR.citystate};
}
.bz-city-banners .city-banner.city-banner--village .city-banner__name {
    margin-top: 0.3888888889rem;
    text-shadow: none;
}
.bz-city-banners .city-banner.city-banner--village .city-banner__city-state-container {
    margin-top: 0.2222222222rem;
}
.bz-city-banners .city-banner.city-banner--village .city-banner__stretch-bg {
    fxs-border-image-tint: ${BZ_COLOR.village};
}
.bz-city-banners .city-banner.city-banner--village .city-banner__city-state-ring {
    border-image-source: url("fs://game/city_pill.png");
    fxs-border-image-tint: ${BZ_COLOR.citystate};
}`,
// city-states and villages
`
.bz-city-banners .city-banner.city-banner--citystate .city-banner__stretch-bg,
.bz-city-banners .city-banner.city-banner--village .city-banner__stretch-bg {
    border-image-outset: 0rem 0.4444444444rem;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__city-state-ring,
.bz-city-banners .city-banner.city-banner--village .city-banner__city-state-ring {
    border-image-outset: 0.2222222222rem 0.3888888889rem;
}
.bz-city-banners .city-banner__city-state-border {
    border-image-source: url("fs://game/hostile_pill.png");
}
.bz-city-banners .city-banner.city-banner--friendly .city-banner__city-state-border {
    fxs-border-image-tint: ${BZ_COLOR.friendly};
}`,
`.bz-city-banners .city-banner.city-banner--hostile .city-banner__city-state-border {
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
