// TODO: tooltips (mostly from Map Trix)
// - original owner
// - religion
// - connected settlements
// - city-state info
// - suzerain?
// - population growth
// - build queue (all civs during autoplay)
// - localization
import TooltipManager from '/core/ui/tooltips/tooltip-manager.js';
import { InterfaceMode } from '/core/ui/interface-modes/interface-modes.js';

// additional CSS definitions
const BZ_HEAD_STYLE = [
`
.bz-city-tooltip .img-tooltip-border {
    border-radius: 0.6666666667rem;
    border-image-source: none;
    border: 0.1111111111rem solid #8C7E62;
    filter: drop-shadow(0 1rem 1rem #000c);
}
.bz-city-tooltip .img-tooltip-bg {
    background-image: linear-gradient(to bottom, rgba(35, 37, 43, 0.90) 0%, rgba(18, 21, 31, 0.90) 100%);
}
.tooltip.bz-city-tooltip .tooltip__content {
    padding-top: 0.5555555556rem;
    padding-bottom: 0.5555555556rem;
    padding-left: 0.8333333333rem;
    padding-right: 0.8333333333rem;
}
`,  // full-width banners: enemies and warnings
`
.bz-city-tooltip .bz-banner {
    text-align: center;
    margin-left: -0.8333333333rem;
    margin-right: -0.8333333333rem;
}
`,
// centers blocks of rules text with max-w-60 equivalent
// IMPORTANT: Locale.stylize wraps text in an extra <p> element when it
// contains icons, which interferes with text-align and max-width.  the
// result also changes with single-line vs multi-line text.  these rules
// apply the properties in the correct order & scope to work with all
// combinations (with/without icons, single/multiple lines).
`
.bz-tooltip .bz-rules-list {
    text-align: center;
}
.bz-tooltip .bz-rules-item,
.bz-tooltip .bz-rules-item p {
    width: 100%;
}
`,
];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});

// horizontal list separator
const BZ_DOT_DIVIDER = Locale.compose("LOC_PLOT_DIVIDER_DOT");

// custom & adapted icons
const BZ_ICON_SIZE = 12;
const BZ_ICON_DISCOVERY = "url('blp:tech_cartography')";
const BZ_ICON_TOTAL_RURAL = "CITY_RURAL";  // total yield (rural)
const BZ_ICON_TOTAL_URBAN = "CITY_URBAN";  // total yield (urban)
const BZ_ICON_VILLAGE_TYPES = {  // by city-state type and age
    "CULTURAL": [
        "IMPROVEMENT_MEGALITH",
        "IMPROVEMENT_STONE_HEAD",
        "IMPROVEMENT_OPEN_AIR_MUSEUM",
    ],
    "ECONOMIC": [
        "IMPROVEMENT_SOUQ",
        "IMPROVEMENT_TRADING_FACTORY",
        "IMPROVEMENT_ENTREPOT",
    ],
    "MILITARISTIC": [
        "IMPROVEMENT_HILLFORT",
        "IMPROVEMENT_KASBAH",
        "IMPROVEMENT_SHORE_BATTERY",
    ],
    "SCIENTIFIC": [
        "IMPROVEMENT_ZIGGURAT",
        "IMPROVEMENT_MONASTERY",
        "IMPROVEMENT_INSTITUTE",
    ],
};

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
};
const BZ_ALERT = {
    primary: { "background-color": BZ_COLOR.primary },
    secondary: { "background-color": BZ_COLOR.secondary, "color": BZ_COLOR.black },
    black: { "background-color": BZ_COLOR.black },
    danger: { "background-color": BZ_COLOR.danger },
    enemy: { "background-color": BZ_COLOR.danger },
    conqueror: { "background-color": BZ_COLOR.danger, "color": BZ_COLOR.caution },
    caution: { "background-color": BZ_COLOR.caution, "color": BZ_COLOR.black },
    note: { "background-color": BZ_COLOR.note },
    DEBUG: { "background-color": "#80808080" },
}
const BZ_STYLE = {
    road: { "background-color": BZ_COLOR.road, "color": BZ_COLOR.black },
    volcano: BZ_ALERT.caution,
    // obstacle types
    TERRAIN_HILL: { "background-color": BZ_COLOR.hill },
    TERRAIN_OCEAN: {},  // don't need to highlight this
    FEATURE_CLASS_VEGETATED: { "background-color": BZ_COLOR.vegetated },
    FEATURE_CLASS_WET: { "background-color": BZ_COLOR.wet },
    RIVER_MINOR: { "background-color": BZ_COLOR.wet },
    RIVER_NAVIGABLE: { "background-color": BZ_COLOR.wet },
}
// accent colors for icon types
const BZ_TYPE_COLOR = {
    undefined: BZ_COLOR.bronze,  // default
    "CULTURAL": BZ_COLOR.cultural,  // purple
    "ECONOMIC": BZ_COLOR.economic,  // yellow
    "MILITARISTIC": BZ_COLOR.militaristic,  // red
    "SCIENTIFIC": BZ_COLOR.scientific,  // blue
    "YIELD_CULTURE": BZ_COLOR.culture,  // violet
    "YIELD_DIPLOMACY": BZ_COLOR.diplomacy,  // teal
    "YIELD_FOOD": BZ_COLOR.food,  // green
    "YIELD_GOLD": BZ_COLOR.gold,  // yellow
    "YIELD_HAPPINESS": BZ_COLOR.happiness,  // orange
    "YIELD_PRODUCTION": BZ_COLOR.production,  // brown
    "YIELD_SCIENCE": BZ_COLOR.science,  // blue
}
const bzNameSort = (a, b) => {
    const aname = Locale.compose(a).toUpperCase();
    const bname = Locale.compose(b).toUpperCase();
    return aname.localeCompare(bname);
}

function dotJoin(list, dot=BZ_DOT_DIVIDER) {
    // join text with dots after removing empty elements
    return list.filter(e => e).join("&nbsp;" + dot + " ");
}
function dotJoinLocale(list, dot=BZ_DOT_DIVIDER) {
    return dotJoin(list.map(s => s && Locale.compose(s)), dot);
}
function gatherBuildingsTagged(tag) {
    return new Set(GameInfo.TypeTags.filter(e => e.Tag == tag).map(e => e.Type));
}
// get the set of obstacles that end movement for a movement class
const BZ_OBSTACLES = {};  // cache
function gatherMovementObstacles(mclass) {
    if (!mclass) {
        // get the movement class for the selected unit
        const unitID = UI.Player.getHeadSelectedUnit();
        const unit = unitID && Units.get(unitID);
        const unitType = unit && GameInfo.Units.lookup(unit.type);
        mclass = unitType?.UnitMovementClass ?? "UNIT_MOVEMENT_CLASS_FOOT";
    }
    if (mclass in BZ_OBSTACLES) return BZ_OBSTACLES[mclass];
    const obstacles = new Set();
    for (const o of GameInfo.UnitMovementClassObstacles) {
        if (!o.EndsTurn || o.UnitMovementClass != mclass) continue;
        if (o.FeatureType) obstacles.add(o.FeatureType);
        if (o.RiverType) obstacles.add(o.RiverType);
        if (o.TerrainType) obstacles.add(o.TerrainType);
    }
    // set the cache and return it
    return BZ_OBSTACLES[mclass] = obstacles;
}
function getConnections(city) {
    const ids = city?.getConnectedCities();
    if (!ids) return null;
    let settlements = [];
    for (const id of ids) {
        const conn = Cities.get(id);
        // ignore stale connections
        if (conn) settlements.push(conn);
    }
    settlements.sort((a, b) => bzNameSort(a.name, b.name));
    let cities = [];
    let towns = [];
    let focused = [];
    let growing = [];
    for (const conn of settlements) {
        if (conn.isTown) {
            towns.push(conn);
            if (conn.Growth?.growthType == GrowthTypes.EXPAND) {
                growing.push(conn);
            } else {
                focused.push(conn);
            }
        } else {
            cities.push(conn);
        }
    }
    if (settlements.length == 0) return null;
    return { settlements, cities, towns, focused, growing, };
}
function getConstructibles(loc, cclass) {
    const list = MapConstructibles.getHiddenFilteredConstructibles(loc.x, loc.y);
    const items = list.map(id => Constructibles.getByComponentID(id));
    const constructibles = [];
    for (const item of items) {
        const info = GameInfo.Constructibles.lookup(item.type);
        if (cclass && info.ConstructibleClass != cclass) continue;
        constructibles.push({ item, info });
    }
    return constructibles;
}
function getFigureWidth(size, digits=1) {
    const nwidth = 0.6 * getFontSizeScalePx(size);
    return Math.round(nwidth * digits);
}
function getFontSizeBasePx(size) {
    return GlobalScaling.getFontSizePx(size);
}
function getFontSizeRem(size) {
    const fpx = getFontSizeBasePx(size);
    return GlobalScaling.pixelsToRem(fpx);
}
function getFontSizeScalePx(size) {
    return getFontSizeRem(size) * GlobalScaling.currentScalePx;
}
function getReligionInfo(id) {
    // find a matching player religion, to get custom names
    let religion = GameInfo.Religions.lookup(id);
    const icon = `[icon:${religion.ReligionType}]`;
    let name = religion.Name;
    // find custom religion name, if any
    for (const founder of Players.getEverAlive()) {
        if (founder.Religion?.getReligionType() != id) continue;
        name = founder.Religion.getReligionName();
        break;
    }
    return { name, icon };
}
function getReligions(city) {
    const religion = city?.Religion;
    if (!religion) return null;
    const list = [];
    if (religion.majorityReligion != -1) {
        const info = getReligionInfo(religion.majorityReligion);
        list.push(Locale.compose("LOC_BZ_RELIGION_MAJORITY", info.icon, info.name));
    }
    if (religion.urbanReligion != religion.majorityReligion) {
        const info = getReligionInfo(religion.urbanReligion);
        list.push(Locale.compose("LOC_BZ_RELIGION_URBAN", info.icon, info.name));
    }
    if (religion.ruralReligion != religion.majorityReligion) {
        const info = getReligionInfo(religion.ruralReligion);
        list.push(Locale.compose("LOC_BZ_RELIGION_RURAL", info.icon, info.name));
    }
    return list.length ? list : null;
}
function getSpecialists(loc, city) {
    if (!city || city.isTown) return null;  // no specialists in towns
    const maximum = city.Workers?.getCityWorkerCap();
    if (!maximum) return null;
    const plotIndex = GameplayMap.getIndexFromLocation(loc);
    const plot = city.Workers.GetAllPlacementInfo().find(p => p.PlotIndex == plotIndex);
    const workers = plot?.NumWorkers ?? -1;
    if (workers < 0) return null;
    return { workers, maximum };
}
function getTownFocus(city) {
    const ptype = city.Growth?.projectType ?? null;
    const info = ptype && GameInfo.Projects.lookup(ptype);
    const isGrowing = !info || city.Growth?.growthType == GrowthTypes.EXPAND;
    const growth = "LOC_UI_FOOD_CHOOSER_FOCUS_GROWTH";
    const name = info?.Name ?? growth;
    const note = isGrowing && name != growth ? growth : null;
    const icon = isGrowing ? "PROJECT_GROWTH" : info.ProjectType;
    return { isGrowing, name, note, icon, info, };
}
function getVillageIcon(owner, age) {
    // get the minor civ type
    let ctype = "MILITARISTIC";  // default
    GameInfo.Independents.forEach(i => {
        if (owner.civilizationAdjective == i.CityStateName) ctype = i.CityStateType;
    });
    // select an icon
    const icons = BZ_ICON_VILLAGE_TYPES[ctype ?? "MILITARISTIC"];
    const index = age?.ChronologyIndex ?? 0;
    const icon = icons.at(index) ?? icons.at(-1);
    return icon;
}
const BZ_PRELOADED_ICONS = {};
function preloadIcon(icon, context) {
    if (!icon) return;
    const url = icon.startsWith("url(")  ? icon : UI.getIcon(icon, context);
    const name = url.replace(/url|[(\042\047)]/g, '');  // \042\047 = quotation marks
    if (!name || name in BZ_PRELOADED_ICONS) return;
    BZ_PRELOADED_ICONS[name] = true;
    Controls.preloadImage(name, 'plot-tooltip');
}
function setStyle(element, style) {
    if (!element || !style) return;
    for (const [property, value] of Object.entries(style)) {
        element.style.setProperty(property, value);
    }
}
function setBannerStyle(element, style=BZ_ALERT.danger, ...classes) {
    element.classList.add("bz-banner", ...classes);
    setStyle(element, style);
}
class bzCityTooltip {
    constructor() {
        // tooltip target
        this.updateQueued = false;
        this.target = null;
        this.location = null;
        this.city = null;
        // coordinates
        this.plotIndex = null;
        // document root
        this.tooltip = document.createElement('fxs-tooltip');
        this.tooltip.classList.value = "bz-tooltip bz-city-tooltip max-w-96";
        this.container = document.createElement('div');
        this.tooltip.appendChild(this.container);
        // point-of-view info
        this.observerID = GameContext.localObserverID;
        this.observer = Players.get(this.observerID);
        this.playerID = GameContext.localPlayerID;
        this.player = Players.get(this.playerID);
        // selection-dependent info
        this.obstacles = gatherMovementObstacles("UNIT_MOVEMENT_CLASS_FOOT");
        // world
        this.age = null;
        this.terrain = null;
        this.biome = null;
        this.feature = null;
        this.river = null;
        this.resource = null;
        this.isDistantLands = null;
        // ownership
        this.owner = null;
        this.originalOwner = null;
        this.district = null;
        // settlement stats
        this.townFocus = null;
        this.isFreshWater = null;
        this.religions = null;
        this.connections = null;
        // constructibles
        this.constructibles = [];
        this.buildings = [];  // omits walls
        this.specialists = null;  // { workers, maximum }
        this.improvement = null;
        this.wonder = null;
        this.freeConstructible = null;  // standard improvement type
        // yields
        this.yields = [];
        this.totalYields = 0;
        // unit
        this.unit = null;
        // owner & unit relationships
        this.ownerRelationship = null;
        this.unitRelationship = null;
        // lookup tables
        this.agelessBuildings = gatherBuildingsTagged("AGELESS");
        this.extraBuildings = gatherBuildingsTagged("IGNORE_DISTRICT_PLACEMENT_CAP");
        this.largeBuildings = gatherBuildingsTagged("FULL_TILE");
        Loading.runWhenFinished(() => {
            for (const y of GameInfo.Yields) {
                // Controls.preloadImage(url, 'plot-tooltip');
                preloadIcon(`${y.YieldType}`, "YIELD");
            }
            for (const y of [BZ_ICON_TOTAL_RURAL, BZ_ICON_TOTAL_URBAN]) {
                preloadIcon(y, "YIELD");
            }
            // stop flicker in Sukritact's city banner tooltip
            Controls.preloadImage("hud_sub_circle_bk", "city-banner");
        });
    }
    static get instance() { return bzCityTooltip._instance; }
    static queueUpdate(target) {
        if (bzCityTooltip._instance?.target != target) return;
        bzCityTooltip._instance.updateQueued = true;
    }
    getHTML() { return this.tooltip; }
    isUpdateNeeded(target) {
        // ignore elements with their own tooltips, if set
        const growth = target?.closest('.city-banner__population-container');
        if (growth?.getAttribute('data-tooltip-content')) target = null;
        const queue = target?.closest('.city-banner__queue-container');
        if (queue?.getAttribute('data-tooltip-content')) target = null;
        // get target component, if possible
        const banner = target?.closest('city-banner');
        target = banner?.bzComponent ?? null;
        if (target == this.target && !this.updateQueued) return false;
        // set target, location, and city
        this.target = target;
        this.location = this.target?.location ?? null;
        this.city = this.target?.city ?? null;
        this.updateQueued = false;
        return true;
    }
    isBlank() {
        return (!this.target);
    }
    reset() {
        this.plotIndex = null;
        // document root
        this.container.innerHTML = '';
        // point-of-view info
        this.observerID = GameContext.localObserverID;
        this.observer = Players.get(this.observerID);
        this.playerID = GameContext.localPlayerID;
        this.player = Players.get(this.playerID);
        // selection-dependent info
        this.obstacles = gatherMovementObstacles("UNIT_MOVEMENT_CLASS_FOOT");
        // world
        this.age = null;
        this.terrain = null;
        this.biome = null;
        this.feature = null;
        this.river = null;
        this.resource = null;
        this.isDistantLands = null;
        // ownership
        this.owner = null;
        this.originalOwner = null;
        this.district = null;
        // settlement stats
        this.settlementType = null;
        this.townFocus = null;
        this.isFreshWater = null;
        this.religions = null;
        this.connections = null;
        // constructibles
        this.constructibles = [];
        this.buildings = [];
        this.specialists = null;  // { workers, maximum }
        this.improvement = null;
        this.wonder = null;
        this.freeConstructible = null;  // standard improvement type
        // yields
        this.yields = [];
        this.totalYields = 0;
        // unit
        this.unit = null;
        // owner & unit relationships
        this.ownerRelationship = null;
        this.unitRelationship = null;
    }
    update() {
        if (!this.target) return;
        this.plotIndex = GameplayMap.getIndexFromLocation(this.location);
        this.model();
        this.render();
        UI.setPlotLocation(this.location.x, this.location.y, this.plotIndex);
        this.setWarningCursor(this.location);
    }
    model() {
        // update point-of-view info
        this.observerID = GameContext.localObserverID;
        this.observer = Players.get(this.observerID);
        this.modelSettlement();
        this.modelYields();
    }
    render() {
        this.renderSettlement();
        this.renderConnections();
        this.renderGrowth();
        this.renderQueue();
        this.renderYields();
    }
    // data modeling methods
    modelSettlement() {
        // owner, civ, city, district
        const loc = this.location;
        this.age = GameInfo.Ages.lookup(Game.age);
        const ownerID = GameplayMap.getOwner(loc.x, loc.y);
        this.owner = Players.get(ownerID);
        this.ownerRelationship = this.getCivRelationship(this.owner);
        const districtID = MapCities.getDistrict(loc.x, loc.y);
        this.district = districtID ? Districts.get(districtID) : null;
        // settlement type
        if (this.owner.isIndependent) {
            // village or encampment
            const imp = getConstructibles(loc, "IMPROVEMENT").at(0);
            this.settlementType = imp?.info.Name ?? null;
        } else if (this.owner.isMinor) {
            this.settlementType = "LOC_BZ_SETTLEMENT_CITY_STATE";
        } else if (this.city.isTown) {
            const focus = getTownFocus(this.city);
            this.townFocus = focus;
            this.settlementType = this.townFocus.name;
        } else if (this.city.isCapital) {
            this.settlementType = "LOC_CAPITAL_SELECT_PROMOTION_CAPITAL";
        } else {
            this.settlementType = "LOC_CAPITAL_SELECT_PROMOTION_CITY";
        }
        // report fresh water supply
        this.isFreshWater = GameplayMap.isFreshWater(loc.x, loc.y);
        // settlement-specific stats (no villages)
        if (!this.city) return;
        // original owner
        if (this.city.originalOwner != this.city.owner) {
            this.originalOwner = Players.get(this.city.originalOwner);
        }
        // get religions (majority, urban, rural)
        if (this.age.AgeType == "AGE_EXPLORATION") {
            // but only during Exploration, when conversion is possible
            // (plus custom names stop working in the Modern Age)
            this.religions = getReligions(this.city);
        }
        // get connected settlements
        this.connections = getConnections(this.city);
    }
    modelConstructibles() {
        const loc = this.location;
        this.constructibles = [];
        const constructibles = MapConstructibles.getHiddenFilteredConstructibles(loc.x, loc.y);
        for (const constructible of constructibles) {
            const item = Constructibles.getByComponentID(constructible);
            if (!item) continue;
            if (item.location.x != loc.x || item.location.y != loc.y) {
                console.warn(`bz-city-tooltip: constructible location mismatch`);
                console.warn(`bz-city-tooltip: ${JSON.stringify(item)}`);
                continue;
            }
            const info = GameInfo.Constructibles.lookup(item.type);
            if (!info) continue;
            const isBuilding = info.ConstructibleClass == "BUILDING";
            const isWonder = info.ConstructibleClass == "WONDER";
            const isImprovement = info.ConstructibleClass == "IMPROVEMENT";
            if (!(isWonder || isBuilding || isImprovement)) {
                continue;
            }
            const notes = [];

            const isComplete = item.complete;
            const isDamaged = item.damaged;
            const isExtra = this.extraBuildings.has(info.ConstructibleType);
            const isLarge = this.largeBuildings.has(info.ConstructibleType);
            const isAgeless = this.agelessBuildings.has(info.ConstructibleType);
            const currentAge = this.age.ChronologyIndex;
            const age = isAgeless ? currentAge - 0.5 :
                GameInfo.Ages.lookup(info.Age ?? "")?.ChronologyIndex ?? 0;
            const isOverbuildable = isBuilding && Math.ceil(age) != currentAge;
            const uniqueTrait =
                isBuilding ?
                GameInfo.Buildings.lookup(info.ConstructibleType).TraitType :
                isImprovement ?
                GameInfo.Improvements.lookup(info.ConstructibleType).TraitType :
                null;
            const isCurrent = isComplete && !isDamaged && !isOverbuildable && !isExtra;

            if (isDamaged) notes.push("LOC_PLOT_TOOLTIP_DAMAGED");
            if (!isComplete) notes.push("LOC_PLOT_TOOLTIP_IN_PROGRESS");
            if (uniqueTrait) {
                notes.push("LOC_STATE_BZ_UNIQUE");
            } else if (isAgeless && !isWonder) {
                notes.push("LOC_UI_PRODUCTION_AGELESS");
            } else if (isOverbuildable) {
                notes.push("LOC_PLOT_TOOLTIP_OVERBUILDABLE");
                const ageName = GameInfo.Ages.lookup(info.Age).Name;
                if (ageName) notes.push(Locale.compose(ageName));
            }
            const row = {
                info, age, isCurrent, isExtra, isLarge, isDamaged, notes, uniqueTrait
            };
            this.constructibles.push(row);
            if (isBuilding && !isExtra) this.buildings.push(row);
            if (isImprovement) this.improvement = row;
            if (isWonder) this.wonder = row;
        };
        const n = this.constructibles.length;
        if (n > 1) {
            // sort buildings by age, walls last
            const ageSort = (a, b) =>
                (b.isExtra ? -1 : b.age) - (a.isExtra ? -1 : a.age);
            this.constructibles.sort(ageSort);
            this.buildings.sort(ageSort);
            if (this.wonder || this.improvement) {  // should only be one
                console.warn(`bz-city-tooltip: expected 1 constructible, not ${n}`);
            }
        }
        this.specialists = getSpecialists(this.location, this.city);
        if (this.improvement) {
            // set up icons and special district names for improvements
            const info = this.improvement.info;
            if (this.improvement?.info.Discovery) {
                // discoveries don't have an icon, but here's a nice map
                this.improvement.icon = BZ_ICON_DISCOVERY;
                this.improvement.districtName = "LOC_DISTRICT_BZ_DISCOVERY";
            } else if (info.Age == null && info.Population == 0) {
                // villages and encampments get icons based on their unique
                // improvements, appropriate for the age and minor civ type
                this.improvement.icon = getVillageIcon(this.owner, this.age);
                this.improvement.districtName = "LOC_DISTRICT_BZ_INDEPENDENT";
            } else {
                this.improvement.icon = info.ConstructibleType;
            }
        }
        // get the free constructible (standard tile improvement)
        if (this.improvement?.districtName) return;  // skip discoveries and villages
        if (this.district && !this.improvement) return;  // rural tiles only
        const fcID = Districts.getFreeConstructible(loc, this.observerID);
        const info = GameInfo.Constructibles.lookup(fcID);
        if (!info) return;  // mountains, open ocean
        const name = info.Name;
        if (name == this.improvement?.info?.Name) return;  // redundant
        const format =
            this.improvement ? "LOC_BZ_IMPROVEMENT_FOR_WAREHOUSE" :
            this.resource ?  "LOC_BZ_IMPROVEMENT_FOR_RESOURCE" :
            "LOC_BZ_IMPROVEMENT_FOR_TILE";
        const icon = `[icon:${info.ConstructibleType}]`;
        const text = Locale.compose(format, icon, name);
        this.freeConstructible = { info, name, format, icon, text };
    }
    modelYields() {
        this.yields = [];
        this.totalYields = 0;
        const cityYields = this.city?.Yields?.getYields();
        if (!cityYields) return;
        // one column per yield type
        cityYields.forEach((y, i) => {
            const info = GameInfo.Yields[i];
            const value = y.value;
            if (info && value) {
                const column = { name: info.Name, type: info.YieldType, value };
                this.yields.push(column);
                this.totalYields += y.value;
            }
        });
    }
    renderFlexDivider(center, lines, ...style) {
        const layout = document.createElement("div");
        layout.classList.value = "flex-auto flex justify-between items-center -mx-6";
        if (style.length) layout.classList.add(...style);
        this.container.appendChild(layout);
        // left frame
        const lineLeft = document.createElement("div");
        lineLeft.classList.value = "flex-auto h-0\\.5 min-w-6 ml-1\\.5";
        if (lines) lineLeft.style.setProperty("background-image", `linear-gradient(to left, ${BZ_COLOR.bronze}, ${BZ_COLOR.bronze}00)`);
        layout.appendChild(lineLeft);
        // content
        layout.appendChild(center);
        // right frame
        const lineRight = document.createElement("div");
        lineRight.classList.value = "flex-auto h-0\\.5 min-w-6 mr-1\\.5";
        if (lines) lineRight.style.setProperty("background-image", `linear-gradient(to right, ${BZ_COLOR.bronze}, ${BZ_COLOR.bronze}00)`);
        layout.appendChild(lineRight);
    }
    renderTitleDivider(text=BZ_DOT_DIVIDER) {
        const layout = document.createElement("div");
        layout.classList.value = "text-secondary font-title-sm uppercase mx-3 max-w-80";
        layout.setAttribute("data-l10n-id", text);
        this.renderFlexDivider(layout, false, "mt-1\\.5");
    }
    renderTitleHeading(title) {
        if (!title) return;
        const ttTitle = document.createElement("div");
        ttTitle.classList.value = "text-secondary font-title-sm uppercase leading-snug text-center";
        const ttText = document.createElement("div");
        ttText.setAttribute('data-l10n-id', title);
        ttTitle.appendChild(ttText);
        this.container.appendChild(ttTitle);
    }
    obstacleStyle(obstacleType, ...fallbackStyles) {
        if (!this.obstacles.has(obstacleType)) return null;
        const style = [obstacleType, ...fallbackStyles].find(s => s in BZ_STYLE);
        if (style) return BZ_STYLE[style];
        return BZ_ALERT.caution;
    }
    renderSettlement() {
        if (!this.owner) return;
        // render headings and notes
        this.renderTitleHeading(this.settlementType);
        const notes = [];
        if (this.townFocus?.note) notes.push(this.townFocus.note);
        if (!this.isFreshWater) notes.push("LOC_BZ_PLOTKEY_NO_FRESHWATER");
        if (notes.length) {
            // note: extra div layer here to align bz-debug levels
            const tt = document.createElement("div");
            tt.classList.value = "text-xs leading-snug text-center mb-1";
            const ttSubhead = document.createElement("div");
            const ttNote = document.createElement("div");
            ttNote.classList.value = "text-2xs leading-none mb-0\\.5";
            ttNote.setAttribute('data-l10n-id', dotJoinLocale(notes));
            ttSubhead.appendChild(ttNote);
            tt.appendChild(ttSubhead);
            this.container.appendChild(tt);
        }
        // owner info
        this.renderOwnerInfo();
    }
    renderOwnerInfo() {
        if (!this.owner || !Players.isAlive(this.owner.id)) return;
        const layout = document.createElement("div");
        layout.classList.value = "text-xs leading-snug text-center";
        const ownerName = this.getOwnerName(this.owner);
        const relType = Locale.compose(this.ownerRelationship.type ?? "");
        const civName = this.getCivName(this.owner, true);
        // highlight enemy players
        if (this.ownerRelationship?.isEnemy) {
            setBannerStyle(layout, BZ_ALERT.enemy, "py-1");
        }
        // show name & relationship
        const ttPlayer = document.createElement("div");
        ttPlayer.innerHTML = dotJoin([ownerName, relType]);
        layout.appendChild(ttPlayer);
        // show full civ name
        const ttCiv = document.createElement("div");
        ttCiv.setAttribute('data-l10n-id', civName);
        layout.appendChild(ttCiv);
        // show original owner
        if (this.originalOwner) {
            const ttCiv = document.createElement("div");
            const adjective = this.originalOwner.civilizationAdjective;
            const text = Locale.compose("LOC_BZ_WAS_PREVIOUSLY", adjective);
            ttCiv.setAttribute('data-l10n-id', text);
            layout.appendChild(ttCiv);
        }
        this.container.appendChild(layout);
        // show city-state bonus
        if (this.owner.isMinor) {
            const bonusType = Game.CityStates.getBonusType(this.owner.id);
            const bonus = GameInfo.CityStateBonuses.find(b => b.$hash == bonusType);
            if (bonus) {
                const title = "font-title uppercase text-xs leading-snug";
                this.renderRules([bonus.Name], "w-full mt-1", title);
                this.renderRules([bonus.Description], "w-60");
            }
        }
    }
    getOwnerName(owner) {
        if (!owner) return "";
        const name = owner.isMinor || owner.isIndependent ?
            Locale.compose("LOC_BZ_PEOPLE_NAME", owner.name) :
            Locale.compose(owner.name);
        return name;
    }
    getCivName(owner, fullName=false) {
        if (!owner) return "";
        const civName = fullName || owner.isMinor || owner.isIndependent ?
            owner.civilizationFullName :  // "Venice"
            owner.civilizationName;  // "Spain"
        const name = owner.isIndependent && fullName ?
            // add "Village" to the full name of independents
            Locale.compose("LOC_CIVILIZATION_INDEPENDENT_SINGULAR", civName) :
            Locale.compose(civName);
        return name;
    }
    getCivRelationship(owner) {
        if (!owner || !Players.isAlive(owner.id)) return null;
        if (owner.id == this.observerID) {
            return { type: "LOC_PLOT_TOOLTIP_YOU", isEnemy: false };
        }
        if (!owner.Diplomacy) return null;
        // is the other player a city-state or village?
        if (owner.isMinor || owner.isIndependent) {
            const isVassal = owner.Influence?.hasSuzerain &&
                owner.Influence.getSuzerain() == this.observerID;
            const isEnemy = owner.Diplomacy?.isAtWarWith(this.observerID);
            const type =
                isVassal ? "LOC_BZ_RELATIONSHIP_TRIBUTARY" :
                 isEnemy ? "LOC_INDEPENDENT_RELATIONSHIP_HOSTILE" :
                "LOC_INDEPENDENT_RELATIONSHIP_FRIENDLY";
            return { type, isEnemy };
        }
        // is the other player at war?
        if (owner.Diplomacy.isAtWarWith(this.observerID)) {
            return { type: "LOC_PLAYER_RELATIONSHIP_AT_WAR", isEnemy: true };
        }
        // not an enemy
        if (owner.Diplomacy.hasAllied(this.observerID)) {
            return { type: "LOC_PLAYER_RELATIONSHIP_ALLIANCE", isEnemy: false };
        }
        const type = owner.Diplomacy.getRelationshipLevelName(this.observerID);
        return { type, isEnemy: false };
    }
    renderConnections() {
        if (!this.connections) return;
        const height = getFontSizeRem('xs') * 1.5;  // looser than leading
        this.renderTitleDivider("LOC_BZ_SETTLEMENT_CONNECTIONS");
        const tt = document.createElement("div");
        tt.classList.value = "flex justify-center text-xs leading-tight";
        const rows = [];
        const connections = [
            ...this.connections.cities,
            ...this.connections.growing,
            ...this.connections.focused,
        ];
        for (const conn of connections) {
            const row = document.createElement("div");
            row.classList.value = "relative flex justify-start";
            row.style.minHeight = `${height}rem`;
            const focus = getTownFocus(conn);
            // TODO: better city icon
            const icon = document.createElement("div");
            icon.classList.value = "relative bg-no-repeat";
            icon.style.width = `${height}rem`;
            const isize = conn.isTown ? height : 2/3*height;
            const itop = (height - isize) / 2 - 1/9;
            icon.style.backgroundSize = `${isize}rem ${isize}rem`;
            icon.style.backgroundPosition = "center top";
            icon.style.top = `${itop}rem`;
            icon.style.backgroundImage =
                UI.getIconCSS(conn.isTown ? focus.icon : "YIELD_CITIES");
            row.appendChild(icon);
            const name = document.createElement("div");
            name.classList.value = "max-w-36 mx-1 text-left";
            name.setAttribute('data-l10n-id', conn.name);
            row.appendChild(name);
            rows.push(row);
        }
        const columns = [];
        const half = rows.length < 4 ? rows.length : Math.ceil(rows.length / 2);
        columns.push(rows.slice(0, half));
        if (half < rows.length) columns.push(rows.slice(half));
        for (const column of columns) {
            const col = document.createElement("div");
            col.classList.value = "flex-col justify-start mx-1";
            for (const row of column) col.appendChild(row);
            tt.appendChild(col);
        }
        this.container.appendChild(tt);
    }
    renderGrowth() {
        this.renderTitleDivider("LOC_UI_CITY_STATUS_POPULATION_TITLE");
        const _rural = "LOC_UI_CITY_STATUS_RURAL_POPULATION";
        const _urban = "LOC_UI_CITY_STATUS_URBAN_POPULATION";
        const _special = "LOC_UI_SPECIALISTS_SUBTITLE";
        // TODO
    }
    renderQueue() {
        // TODO: only allowed for local player + autoplay
        this.renderTitleDivider("LOC_UI_PRODUCTION_TITLE");
        // TODO
    }
    // lay out paragraphs of rules text
    renderRules(text, listStyle=null, itemStyle=null) {
        // text with icons is squirrelly, only format it at top level!
        const ttText = document.createElement("div");
        ttText.classList.value = listStyle ?? "w-full";
        ttText.classList.add("bz-rules-list");
        for (const item of text) {
            const ttItem = document.createElement("div");
            ttItem.classList.value = itemStyle ?? "text-xs leading-snug";
            ttItem.classList.add("bz-rules-item");
            ttItem.setAttribute("data-l10n-id", item);
            ttText.appendChild(ttItem);
        }
        this.container.appendChild(ttText);
    }
    renderYields() {
        if (!this.totalYields) return;  // no yields to show
        // set column width based on number of digits (at least three)
        const numWidth = (n) => n.toFixed(0).length;
        const digits = Math.max(3, ...this.yields.map(y => numWidth(y.value)));
        const tt = document.createElement('div');
        tt.classList.value = "flex flex-wrap justify-center w-full mt-2";
        // one column per yield type
        for (const column of this.yields) {
            tt.appendChild(this.yieldColumn(column, digits));
        }
        this.container.appendChild(tt);
    }
    yieldColumn(col, digits) {
        const tt = document.createElement("div");
        tt.classList.value = "flex-col justify-start";
        const ariaLabel = `${Locale.toNumber(col.value)} ${Locale.compose(col.name)}`;
        tt.ariaLabel = ariaLabel;
        const yieldIconCSS = UI.getIconCSS(col.type, "YIELD");
        const yieldIcon = document.createElement("div");
        yieldIcon.classList.value = "size-6 bg-contain bg-no-repeat self-center";
        yieldIcon.style.filter = "drop-shadow(0 0.0555555556rem 0.0555555556rem black)";
        yieldIcon.style.backgroundImage = yieldIconCSS;
        tt.appendChild(yieldIcon);
        const yieldValue = document.createElement("div");
        yieldValue.classList.value =
            "w-auto text-center font-body-xs font-bold leading-6 mx-1";
        yieldValue.style.width = `${getFigureWidth('xs', digits)}px`;
        yieldValue.textContent = col.value.toFixed(0);
        tt.appendChild(yieldValue);
        return tt;
    }
    setWarningCursor() {
        // highlight enemy territory & units with a red cursor
        if (UI.isCursorLocked()) return;
        // don't block cursor changes from interface-mode-acquire-tile
        if (InterfaceMode.getCurrent() == "INTERFACEMODE_ACQUIRE_TILE") return;
        const isEnemy =
            this.unitRelationship?.isEnemy ??  // first check occupying unit
            this.ownerRelationship?.isEnemy ??  // then hex ownership
            false;
        if (isEnemy) {
            UI.setCursorByType(UIHTMLCursorTypes.Enemy);
        } else {
            UI.setCursorByType(UIHTMLCursorTypes.Default);
        }
    }
    renderIcon(layout, info) {
        if (!info) return
        // calculate icon sizes
        const size = info.size ?? BZ_ICON_SIZE;
        const undersize = info.undersize ?? size;
        const oversize = info.oversize ?? size;
        const baseSize = Math.max(size, undersize, oversize);
        const minsize = info.minsize ?? 0;
        // get ring colors and thickness
        // (ring & glow collapse by default)
        const colors = info.colors;
        const collapse = (test, d) => (test || info.collapse === false ? d : 0);
        const borderWidth = collapse(colors?.length, size/16);
        const blurRadius = collapse(info.glow, 10/3*borderWidth);
        const spreadRadius = collapse(info.glow, 4/3*borderWidth);
        // calculate overall sizes
        const ringsize = info.ringsize ?? baseSize;
        const frameSize = ringsize + 2*borderWidth;
        const glowSize = frameSize + blurRadius + 2*spreadRadius;
        const groundSize = Math.max(baseSize, glowSize, minsize);
        const rem = (d) => `${2/9*d}rem`;
        const setDimensions = (e, inside, shift) => {
            const offset = (groundSize - inside) / 2;
            const dx = shift?.x ?? 0;
            const dy = shift?.y ?? 0;
            e.style.setProperty("width", rem(inside));
            e.style.setProperty("height", rem(inside));
            e.style.setProperty("left", rem(offset + dx));
            e.style.setProperty("top", rem(offset + dy));
        };
        const setIcon = (icon, size, shift, z) => {
            if (!icon) return;
            const e = document.createElement("div");
            e.classList.value = "absolute bg-contain bg-center";
            e.style.setProperty("z-index", z);
            setDimensions(e, size, shift);
            if (!icon.startsWith("url(")) icon = UI.getIconCSS(icon);
            preloadIcon(icon);
            e.style.backgroundImage = icon;
            ttIcon.appendChild(e);
        };
        // background
        const ttIcon = document.createElement("div");
        ttIcon.classList.value = "relative bg-contain bg-center";
        if (info.style) ttIcon.classList.add(...info.style);
        setDimensions(ttIcon, groundSize);
        // display the icons
        setIcon(info.icon, size, info.shift, 3);
        setIcon(info.underlay, undersize, info.undershift, 2);
        setIcon(info.overlay, oversize, info.overshit, 4);
        // ring the icon with one or two colors
        if (colors) {
            // split multiple colors between ring and glow
            const slotColor = colors && (colors.at(0) ?? BZ_TYPE_COLOR[undefined]);
            const glowColor = colors && (colors.at(-1) ?? BZ_TYPE_COLOR[undefined]);
            // get ring shape
            const isSquare = info.isSquare;
            const isTurned = info.isTurned;
            const borderRadius = isSquare ? rem(borderWidth) : "100%";
            const turnSize = (isTurned ?  ringsize / Math.sqrt(2) : ringsize);
            // create ring
            const e = document.createElement("div");
            e.classList.value = "absolute border-0";
            e.style.setProperty("border-radius", borderRadius);
            e.style.setProperty("z-index", "1");
            if (isTurned) e.style.setProperty("transform", "rotate(-45deg)");
            setDimensions(e, turnSize + 2*borderWidth);
            e.style.setProperty("border-width", rem(borderWidth));
            e.style.setProperty("border-color", slotColor);
            // optionally also glow
            if (info.glow) e.style.setProperty("box-shadow",
                `0rem 0rem ${rem(blurRadius)} ${rem(spreadRadius)} ${glowColor}`);
            ttIcon.appendChild(e);
        }
        layout.appendChild(ttIcon);
    }
}

bzCityTooltip._instance = new bzCityTooltip();
TooltipManager.registerType('bz-city-tooltip', bzCityTooltip.instance);
export { bzCityTooltip as default };
