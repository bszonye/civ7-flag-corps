// TODO: tooltips (mostly from Map Trix)
// - owner & civ
// - original owner
// - town focus
// - fresh water
// - religion
// - connected settlements
// - city-state info
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
const BZ_ICON_EMPTY_SLOT = "BUILDING_OPEN";
const BZ_ICON_FRAME = "url('hud_sub_circle_bk')";
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
const BZ_ICON_TYPES = {
    "IMPROVEMENT_MEGALITH": ["CULTURAL"],
    "IMPROVEMENT_STONE_HEAD": ["CULTURAL"],
    "IMPROVEMENT_OPEN_AIR_MUSEUM": ["CULTURAL"],
    "IMPROVEMENT_SOUQ": ["ECONOMIC"],
    "IMPROVEMENT_TRADING_FACTORY": ["ECONOMIC"],
    "IMPROVEMENT_ENTREPOT": ["ECONOMIC"],
    "IMPROVEMENT_HILLFORT": ["MILITARISTIC"],
    "IMPROVEMENT_KASBAH": ["MILITARISTIC"],
    "IMPROVEMENT_SHORE_BATTERY": ["MILITARISTIC"],
    "IMPROVEMENT_ZIGGURAT": ["SCIENTIFIC"],
    "IMPROVEMENT_MONASTERY": ["SCIENTIFIC"],
    "IMPROVEMENT_INSTITUTE": ["SCIENTIFIC"],
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
const BZ_TYPE_SORT = {
    [BZ_COLOR.bronze]: 0,  // neutral
    [BZ_COLOR.food]: 1,  // green
    [BZ_COLOR.production]: 2,  // brown
    [BZ_COLOR.militaristic]: 3,  // red (city-state)
    [BZ_COLOR.gold]: 4,  // yellow
    [BZ_COLOR.economic]: 5,  // yellow (city-state)
    [BZ_COLOR.science]: 6,  // blue
    [BZ_COLOR.scientific]: 7,  // blue (city-state)
    [BZ_COLOR.culture]: 8,  // violet
    [BZ_COLOR.cultural]: 9,  // purple (city-state)
    [BZ_COLOR.happiness]: 10,  // orange
    [BZ_COLOR.diplomacy]: 11,  // teal
    undefined: 12,
}
const bzTypeSort = (a, b) => {
    const asort = BZ_TYPE_SORT[a?.substring(0, 7)] ?? BZ_TYPE_SORT[undefined];
    const bsort = BZ_TYPE_SORT[b?.substring(0, 7)] ?? BZ_TYPE_SORT[undefined];
    return asort - bsort;
}
const bzNameSort = (a, b) => {
    const aname = Locale.compose(a).toUpperCase();
    const bname = Locale.compose(b).toUpperCase();
    return aname.localeCompare(bname);
}

function baseYields(info) {
    if (!info) return null;
    const yieldTypes = GameInfo.Constructible_YieldChanges
        .filter(yc => yc.ConstructibleType == info.ConstructibleType)
        .map(yc => yc.YieldType);
    const yieldSet = new Set(yieldTypes);
    return [...yieldSet];
}
function bonusYields(info) {
    if (!info) return null;
    const findYieldChange = (at) => GameInfo.Adjacency_YieldChanges
        .find(yc => yc.ID == at.YieldChangeId);
    const yieldTypes = GameInfo.Constructible_Adjacencies
        .filter(at => at.ConstructibleType == info.ConstructibleType)
        .filter(at => !at.RequiresActivation)
        .map(at => findYieldChange(at).YieldType);
    const yieldSet = new Set(yieldTypes);
    return [...yieldSet];
}
function constructibleColors(info) {
    if (!info) return null;
    const colorize = (list) => list.map(type => BZ_TYPE_COLOR[type]);
    if (info.ConstructibleClass == "IMPROVEMENT") {
        const types = BZ_ICON_TYPES[info.ConstructibleType];
        return types && colorize(types).sort(bzTypeSort);
    }
    const base = colorize(baseYields(info)).sort(bzTypeSort);
    const bonus = colorize(bonusYields(info)).sort(bzTypeSort);
    const ageless = BZ_TYPE_COLOR[undefined];
    if (info.ConstructibleClass == "WONDER") return [base.at(0) ?? ageless];
    if (!base.length && !bonus.length) return null;  // walls
    if (!base.length) return bonus;  // no current examples of this
    // warehouse & infrastructure buildings: darken the base yield
    if (!bonus.length) return [base.at(-1) + "c0", ageless];
    // when possible, select different colors
    const cbase = base.at(-1);  // favor influence & happiness yields
    const cbonus = bonus.at(-1);
    if (cbase == cbonus) {
        if (bonus.length != 1) {
            return [cbase, bonus.at(0)];  // Mosque, Manigramam, Casa Consistorial
        } else if (base.length != 1) {
            return [base.at(0), cbonus];  // no examples of this
        }
    }
    return [cbase, cbonus];
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
    let towns = [];
    let cities = [];
    for (const id of ids) {
        const conn = Cities.get(id);
        if (!conn) {
            console.warn(`bz-city-tooltip: stale connection=${JSON.stringify(id)}`);
        } else if (conn.isTown) {
            towns.push(conn);
        } else {
            cities.push(conn);
        }
    }
    if (towns.length + cities.length == 0) return null;
    cities.sort((a, b) => bzNameSort(a.name, b.name));
    towns.sort((a, b) => bzNameSort(a.name, b.name));
    return { cities, towns };
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
    const isGrowing = city.Growth?.growthType == GrowthTypes.EXPAND;
    return { info, isGrowing, };
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
function setCapsuleStyle(element, style, ...classes) {
    if (!style) return;
    element.classList.add("px-2", "rounded-full");
    if (classes.length) element.classList.add(...classes);
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
        this.district = null;
        // settlement stats
        this.townFocus = null;
        this.isGrowingTown = false;
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
        console.warn(`TRIX TARGET=${this.target?.Root.tagName} LOC=${JSON.stringify(this.location)} CITY=${this.city?.name}`);
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
        this.district = null;
        // settlement stats
        this.settlementType = null;
        this.townFocus = null;
        this.isGrowingTown = false;
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
        // TODO: connections
        // TODO: growth
        // TODO: queue
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
            this.townFocus = focus.info;
            this.isGrowingTown = focus.isGrowing;
            this.settlementType =
                this.townFocus ? this.townFocus.Name :
                "LOC_UI_FOOD_CHOOSER_FOCUS_GROWTH";
        } else if (this.city.isCapital) {
            this.settlementType = "LOC_CAPITAL_SELECT_PROMOTION_CAPITAL";
        } else {
            this.settlementType = "LOC_CAPITAL_SELECT_PROMOTION_CITY";
        }
        // report fresh water supply
        this.isFreshWater = GameplayMap.isFreshWater(loc.x, loc.y);
        // settlement
        if (!this.city) return;
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
        this.renderFlexDivider(layout, true, "mt-1\\.5");
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
        if (this.townFocus && this.isGrowingTown) {
            notes.push("LOC_UI_FOOD_CHOOSER_FOCUS_GROWTH");
        }
        if (!this.isFreshWater) {
            notes.push("LOC_BZ_PLOTKEY_NO_FRESHWATER");
        }
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
    renderConnections() {
        if (!this.connections) return;
        this.renderTitleDivider("LOC_BZ_SETTLEMENT_CONNECTIONS");
        const tt = document.createElement("div");
        tt.classList.value =
            "self-center flex flex-wrap justify-center max-w-60 text-xs leading-snug";
        for (const row of this.connections.cities) {
            const ttName = document.createElement("div");
            ttName.classList.value = "mx-1\\.5";
            ttName.setAttribute('data-l10n-id', row.name);
            tt.appendChild(ttName);
        }
        for (const row of this.connections.towns) {
            const ttName = document.createElement("div");
            ttName.classList.value = "mr-1\\.5";
            const focus = getTownFocus(row);
            const icon =
                focus.isGrowing ? "PROJECT_GROWTH" :
                focus.info?.ProjectType ?? "PROJECT_GROWTH";
            const name = `[icon:${icon}]${Locale.compose(row.name)}`;
            ttName.setAttribute('data-l10n-id', name);
            tt.appendChild(ttName);
        }
        this.container.appendChild(tt);
    }
    renderOwnerInfo() {
        if (!this.owner || !Players.isAlive(this.owner.id)) return;
        const loc = this.location;
        // TODO: simplify this check? why is it here?
        const filteredConstructibles = MapConstructibles.getHiddenFilteredConstructibles(loc.x, loc.y);
        const constructibles = MapConstructibles.getConstructibles(loc.x, loc.y);
        if (constructibles.length && !filteredConstructibles.length) {
            console.warn(`bz-city-tooltip: skipping filtered constructibles`);
            console.warn(`bz-city-tooltip: ${JSON.stringify(constructibles)}`);
            return;
        }
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
        this.container.appendChild(layout);
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
    renderHexSection() {
        switch (this.district?.type) {
            case DistrictTypes.CITY_CENTER:
            case DistrictTypes.URBAN:
                this.renderUrbanSection();
                break;
            case DistrictTypes.RURAL:
            case DistrictTypes.WILDERNESS:
            default:
                this.renderRuralSection();
                break;
            case DistrictTypes.WONDER:
                this.renderWonderSection();
                break;
        }
    }
    renderUrbanSection() {
        const quarterOK = this.buildings.reduce((a, b) =>
            a + (b.isCurrent ? b.isLarge ? 2 : 1 : 0), 0);
        let hexName = this.city.name;
        let hexSubhead;
        let hexRules;
        // set name & description
        if (quarterOK >= 2) {
            const unique = this.buildings[0].uniqueTrait;
            if (this.buildings.every(b => b.uniqueTrait = unique)) {
                const uq = GameInfo.UniqueQuarters.find(e => e.TraitType == unique);
                hexName = uq.Name;
                // UQs don't have .Tooltip but most have parallel
                // LOC_QUARTER_XXX_DESCRIPTION and
                // LOC_QUARTER_XXX_TOOLTIP localization strings
                const tooltip = uq.Description.replace("_DESCRIPTION", "_TOOLTIP");
                hexRules = Locale.keyExists(tooltip) ? tooltip : uq.Description;
            } else {
                hexName = "LOC_DISTRICT_BZ_URBAN_QUARTER";
            }
        } else if (this.district.type == DistrictTypes.CITY_CENTER) {
            const owner = Players.get(this.city.owner);
            if (owner.isMinor) {
                hexName = "LOC_DISTRICT_BZ_CITY_STATE";
                const bonusType = Game.CityStates.getBonusType(owner.id);
                const bonus = GameInfo.CityStateBonuses.find(b => b.$hash == bonusType);
                if (bonus) {
                    hexSubhead = bonus.Name;
                    hexRules = bonus.Description;  // .Tooltip doesn't exist
                }
            } else if (this.city.isTown) {
                // rename "City Center" to "Town Center" in towns
                hexName = "LOC_DISTRICT_BZ_TOWN_CENTER";
            }
        } else if (this.buildings.length == 0) {
            // urban tile with canceled production
            hexName = "LOC_DISTRICT_BZ_URBAN_VACANT";
        } else {
            hexName = "LOC_DISTRICT_BZ_URBAN_DISTRICT";
        }
        // title bar
        this.renderTitleDivider(Locale.compose(hexName));
        this.renderDistrictDefense(this.location);
        // panel interior
        // show rules for city-states and unique quarters
        if (hexRules) {
            const title = "font-title uppercase text-xs leading-snug";
            if (hexSubhead) this.renderRules([hexSubhead], null, title);
            this.renderRules([hexRules], "w-60 mb-1");
        }
        // constructibles
        this.renderConstructibles();
        // report specialists
        if (this.specialists) {
            const text = Locale.compose("LOC_DISTRICT_BZ_SPECIALISTS",
                this.specialists.workers, this.specialists.maximum);
            this.renderRules([text], "w-full mt-1");
        }
        // bottom bar
        this.renderUrbanDivider();
    }
    renderRuralSection() {
        let hexName;
        let hexSubtitle;
        let hexRules = [];
        let hexIcon = this.improvement?.icon;
        let resourceIcon;
        // set name & description
        if (this.improvement?.districtName) {
            // village or discovery
            hexName = this.improvement?.districtName;
        } else if (this.feature?.Tooltip) {
            // natural wonder
            hexName = this.feature.Name;
            hexRules.push(this.feature.Tooltip);
        } else if (this.resource) {
            // resource
            hexName = this.resource.Name;
            const rctype = this.resource.ResourceClassType;
            const rc = rctype && GameInfo.ResourceClasses.lookup(rctype);
            if (rc?.Name) {
                let rcname = rc.Name + "_BZ";
                hexSubtitle = Locale.keyExists(rcname) ? rcname : rc.Name;
            }
            hexRules.push(this.resource.Tooltip);
            if (this.isDistantLands &&
                this.resource.ResourceClassType == "RESOURCECLASS_TREASURE") {
                // also show treasure fleet rules
                hexRules.push("LOC_CAN_CREATE_TREASURE_FLEET");
            }
            resourceIcon = this.resource.ResourceType;
        } else if (this.district?.type) {
            // rural
            hexName = GameInfo.Districts.lookup(this.district?.type).Name;
        } else if (this.city && this.freeConstructible) {
            // claimed but undeveloped
            hexName = "LOC_PLOT_TOOLTIP_UNIMPROVED";
        }
        // avoid useless section headings
        if (!this.improvement && !this.totalYields) return;
        // title bar
        if (hexName) this.renderTitleDivider(Locale.compose(hexName));
        // optional description
        if (hexRules.length) {
            const title = "text-2xs leading-none mb-1";
            if (hexSubtitle) this.renderRules([hexSubtitle], null, title);
            this.renderRules(hexRules, "w-60", "text-xs leading-snug mb-1");
        }
        // constructibles
        this.renderConstructibles();
        // bottom bar
        if (hexIcon || resourceIcon) {
            const style = [hexIcon == BZ_ICON_DISCOVERY ? "-my-2" : "-my-1"];
            const icon = { isSquare: true, style };
            if (hexIcon) {
                icon.icon = hexIcon;
                icon.overlay = resourceIcon;
                icon.oversize = 8;
                icon.isTurned = true;
                icon.colors = BZ_ICON_TYPES[hexIcon]?.map(type => BZ_TYPE_COLOR[type]);
            } else {
                icon.icon = resourceIcon;
            }
            this.renderIconDivider(icon, "mt-2");
        }
    }
    renderWonderSection() {
        if (!this.wonder) return;
        const info = this.wonder.info;
        this.renderTitleDivider(Locale.compose(info.Name));
        let rulesStyle = "w-60";
        const notes = this.wonder.notes;
        if (notes.length) {
            const ttState = document.createElement("div");
            ttState.classList.value = "text-2xs leading-none text-center";
            ttState.innerHTML = dotJoinLocale(notes);
            this.container.appendChild(ttState);
            rulesStyle = "w-60 mt-1";
        }
        const rules = info.Description;
        if (rules) this.renderRules([rules], rulesStyle);
        const colors = constructibleColors(this.wonder.info);
        const icon = {
            icon: info.ConstructibleType,
            isSquare: true,
            ringsize: 11.5,
            colors,
            glow: this.wonder.isCurrent,
            collapse: false,
            style: ["-my-0\\.5"],
        };
        this.renderIconDivider(icon, "mt-1");
    }
    // lay out a column of constructibles and their construction notes
    renderConstructibles() {
        if (!this.constructibles.length && !this.freeConstructible) return;
        const ttList = document.createElement("div");
        ttList.classList.value = "text-xs leading-snug text-center";
        for (const c of this.constructibles) {
            const ttConstructible = document.createElement("div");
            const ttName = document.createElement("div");
            ttName.classList.value = "text-accent-2 font-title uppercase";
            ttName.setAttribute("data-l10n-id", c.info.Name);
            ttConstructible.appendChild(ttName);
            const notes = dotJoinLocale(c.notes);
            if (notes) {
                const ttState = document.createElement("div");
                ttState.classList.value = "text-2xs mb-0\\.5";
                if (c.isDamaged) {
                    setCapsuleStyle(ttState, BZ_ALERT.caution);
                } else {
                    ttState.classList.add("leading-none");
                }
                ttState.innerHTML = notes;
                ttConstructible.appendChild(ttState);
            }
            ttList.appendChild(ttConstructible);
        }
        // expansion type for undeveloped & upgraded tiles
        if (this.freeConstructible) {
            const tt = document.createElement("div");
            if (this.constructibles.length) tt.classList.value = "text-2xs mt-1";
            tt.setAttribute("data-l10n-id", this.freeConstructible.text);
            ttList.appendChild(tt);
        }
        this.container.appendChild(ttList);
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
    renderDistrictDefense() {
        if (!this.district) return;
        // occupation status
        if (this.district.owner != this.district.controllingPlayer) {
            const conqueror = Players.get(this.district.controllingPlayer);
            const conquerorName = this.getCivName(conqueror, true);
            const conquerorText = Locale.compose("{1_Term} {2_Subject}", "LOC_PLOT_TOOLTIP_CONQUEROR", conquerorName);
            const tt = document.createElement("div");
            tt.classList.value = "text-xs leading-snug mb-1 py-1";
            setBannerStyle(tt, BZ_ALERT.conqueror);
            tt.innerHTML = conquerorText;
            this.container.appendChild(tt);
        }
        // district health
        const loc = this.location;
        const info = [];
        const ownerID = GameplayMap.getOwner(loc.x, loc.y);
        const ownerDistricts = Players.Districts.get(ownerID);
        if (!ownerDistricts) return;
        // This type is unresolved, is it meant to be number instead?
        const currentHealth = ownerDistricts.getDistrictHealth(loc);
        const maxHealth = ownerDistricts.getDistrictMaxHealth(loc);
        const isUnderSiege = ownerDistricts.getDistrictIsBesieged(loc);
        if (currentHealth != maxHealth) {
            // under siege or healing
            const ttStatus = document.createElement("div");
            ttStatus.setAttribute("data-l10n-id", isUnderSiege ?
                "LOC_PLOT_TOOLTIP_UNDER_SIEGE" : "LOC_PLOT_TOOLTIP_HEALING_DISTRICT");
            info.push(ttStatus);
            // current health
            const ttHealth = document.createElement("div");
            setStyle(ttHealth, { color: BZ_COLOR.caution });
            ttHealth.innerHTML = currentHealth + '/' + maxHealth;
            info.push(ttHealth);
        } else if (currentHealth) {
            const ttHealth = document.createElement("div");
            ttHealth.innerHTML = currentHealth + '/' + maxHealth;
            info.push(ttHealth);
        }
        if (info.length) {
            const ttDefense = document.createElement("div");
            ttDefense.classList.value = "text-xs leading-snug text-center mb-1";
            const style = currentHealth != maxHealth ? BZ_ALERT.danger : BZ_ALERT.note;
            setBannerStyle(ttDefense, style, "py-1");
            for (const row of info) ttDefense.appendChild(row);
            this.container.appendChild(ttDefense);
        }
    }
    renderIconDivider(info, ...style) {
        // icon divider with optional overlay
        if (info.icon.search(/blp:tech_/) != -1) {
            // tech icons need a frame
            info.size = 10;
            info.underlay = BZ_ICON_FRAME;
            info.undersize = 14;
            info.undershift = { x: -0.25, y: 0.25 };
            info.ringsize = 12;
        }
        const layout = document.createElement("div");
        layout.classList.value = "flex relative mx-2";
        this.renderIcon(layout, info);
        this.renderFlexDivider(layout, false, ...style);
    }
    renderUrbanDivider() {
        // there are at least two building slots (unless one is large)
        const slots = [...this.buildings];
        if (slots.length < 2 && !this.buildings[0]?.isLarge)
            slots.push(...[null, null].slice(this.buildings.length));
        // render the icons
        const layout = document.createElement("div");
        layout.classList.value = "flex relative mx-2";
        for (const slot of slots) {
            // if the building has more than one yield type, like the
            // Palace, use one type for the ring and one for the glow
            const icon = slot?.info.ConstructibleType ?? BZ_ICON_EMPTY_SLOT;
            const colors = constructibleColors(slot?.info);
            const info = {
                icon, colors, glow: slot?.isCurrent, collapse: false, style: ["-my-1"],
            };
            this.renderIcon(layout, info);
        }
        this.renderFlexDivider(layout, false, "mt-1");
    }
    renderYields() {
        if (!this.totalYields) return;  // no yields to show
        const tt = document.createElement('div');
        tt.classList.value = "plot-tooltip__resourcesFlex mt-1\\.5";
        // one column per yield type
        for (const column of this.yields) {
            tt.appendChild(this.yieldColumn(column));
        }
        // set column width based on number of digits (at least two)
        const numWidth = (n) => n.toFixed(0).length;
        const maxWidth = Math.max(2, ...this.yields.map(y => numWidth(y.value)));
        const yieldWidth = 1 + maxWidth / 3;  // width in rem
        tt.style.setProperty("--yield-width", `${yieldWidth}rem`);
        this.container.appendChild(tt);
    }
    yieldColumn(col) {
        const ttIndividualYieldFlex = document.createElement("div");
        ttIndividualYieldFlex.classList.add("plot-tooltip__IndividualYieldFlex");
        const ariaLabel = `${Locale.toNumber(col.value)} ${Locale.compose(col.name)}`;
        ttIndividualYieldFlex.ariaLabel = ariaLabel;
        const yieldIconCSS = UI.getIconCSS(col.type, "YIELD");
        const yieldIconShadow = document.createElement("div");
        yieldIconShadow.classList.add("plot-tooltip__IndividualYieldIcons-Shadow");
        yieldIconShadow.style.backgroundImage = yieldIconCSS;
        ttIndividualYieldFlex.appendChild(yieldIconShadow);
        const yieldIcon = document.createElement("div");
        yieldIcon.classList.add("plot-tooltip__IndividualYieldIcons");
        yieldIcon.style.backgroundImage = yieldIconCSS;
        yieldIconShadow.appendChild(yieldIcon);
        const ttIndividualYieldValues = document.createElement("div");
        ttIndividualYieldValues.classList.add("plot-tooltip__IndividualYieldValues", "font-body");
        ttIndividualYieldValues.textContent = col.value.toFixed(0);
        ttIndividualYieldFlex.appendChild(ttIndividualYieldValues);
        return ttIndividualYieldFlex;
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
