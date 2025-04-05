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
`.bz-city-banners .city-banner.city-banner--citystate .city-banner__stretch-bg {
    border-image-source: url("fs://game/town_pill.png");
    fxs-border-image-tint: #e5e5e5;
}
.bz-city-banners .city-banner.city-banner--citystate .city-banner__city-state-ring {
    border-image-source: url("fs://game/city_pill.png");
    fxs-border-image-tint: white;
}`,
// villages
`.bz-city-banners .city-banner.city-banner--village .city-banner__stretch-bg {
    fxs-border-image-tint: #161623;
}
.bz-city-banners .city-banner.city-banner--village .city-banner__city-state-ring {
    border-image-source: url("fs://game/city_pill.png");
    fxs-border-image-tint: white;
}`,
// city-states and villages
`.bz-city-banners .city-banner__city-state-border {
    border-image-source: url("fs://game/hostile_pill.png");
}
.bz-city-banners .city-banner.city-banner--friendly .city-banner__city-state-border {
    fxs-border-image-tint: #e5d2ac;  /* TODO */
}`,
`.bz-city-banners .city-banner.city-banner--hostile .city-banner__city-state-border {
    fxs-border-image-tint: #a00000;
}`,
];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});
document.body.classList.add("bz-city-banners");
