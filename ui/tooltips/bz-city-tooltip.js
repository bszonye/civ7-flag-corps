// TODO: recalculate metrics during update
// TODO: config option to show yields
import TooltipManager from '/core/ui/tooltips/tooltip-manager.js';

var bzTarget;
(function (bzTarget) {
        bzTarget[bzTarget["GROWTH"] = '.city-banner__population-container'] = "GROWTH";
        bzTarget[bzTarget["PRODUCTION"] = '.city-banner__queue-container'] = "PRODUCTION";
})(bzTarget || (bzTarget = {}));

// horizontal list separator
const BZ_DOT_DIVIDER = Locale.compose("LOC_PLOT_DIVIDER_DOT");

// custom & adapted icons
const BZ_TIMER_ICON = "url('hud_turn-timer')";

// color palette
const BZ_COLOR = {
    // game colors
    silver: "#4c5366",  // = primary
    bronze: "#e5d2ac",  // = secondary
    primary: "#4c5366",
    primary1: "#8d97a6",
    primary2: "#4c5366",
    primary3: "#333640",
    primary4: "#23252b",
    primary5: "#12151f",
    secondary: "#e5d2ac",
    secondary1: "#e5d2ac",
    secondary2: "#8c7e62",
    secondary3: "#4c473d",
    accent: "#616266",
    accent1: "#e5e5e5",
    accent2: "#c2c4cc",
    accent3: "#9da0a6",
    accent4: "#85878c",
    accent5: "#616266",
    accent6: "#05070d",
    // bronze shades
    bronze1: "#f9ecd2",
    bronze2: "#e5d2ac",  // = secondary1
    bronze3: "#c7b28a",
    bronze4: "#a99670",
    bronze5: "#8c7e62",  // = secondary 2
    bronze6: "#4c473d",  // = secondary 3
    // alert colors
    black: "#000000",
    danger: "#af1b1c99",  // danger = militaristic 60% opacity
    caution: "#cea92f",  // caution = healthbar-medium
    note: "#ff800033",  // note = orange 20% opacity
    // geographic colors
    hill: "#a9967066",  // Rough terrain = dark bronze 40% opacity
    vegetated: "#aaff0033",  // Vegetated features = green 20% opacity
    wet: "#55aaff66",  // Wet features = teal 40% opacity
    road: "#f9ecd2cc",  // Roads & Railroads = pale bronze 80% opacity
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
    secondary: { "background-color": BZ_COLOR.secondary, color: BZ_COLOR.black },
    black: { "background-color": BZ_COLOR.black },
    danger: { "background-color": BZ_COLOR.danger },
    enemy: { "background-color": BZ_COLOR.danger },
    conqueror: { "background-color": BZ_COLOR.danger, color: BZ_COLOR.caution },
    caution: { "background-color": BZ_COLOR.caution, color: BZ_COLOR.black },
    note: { "background-color": BZ_COLOR.note },
    DEBUG: { "background-color": "#80808080" },
}
const bzNameSort = (a, b) => {
    const aname = Locale.compose(a).toUpperCase();
    const bname = Locale.compose(b).toUpperCase();
    return aname.localeCompare(bname);
}

// box metrics (for initialization, tooltip can update)
const BASE_FONT_SIZE = 18;
const BZ_FONT_SPACING = 1.5;
const BZ_PADDING = 0.6666666667;
const BZ_MARGIN = BZ_PADDING / 2;
const BZ_BORDER = 0.1111111111;
let metrics = getFontMetrics();

// additional CSS definitions
const BZ_HEAD_STYLE = [
// 1. #TOOLTIP-ROOT.NEW-TOOLTIP--ROOT absolute max-w-96 p-3 img-tooltip-border img-tooltip-bg pointer-events-none break-words [z-index: 99]
//    2. #TOOLTIP-ROOT-CONTENT relative font-body text-xs
`
.tooltip.bz-city-tooltip .tooltip__content {
    padding: ${metrics.padding.y.css} ${metrics.padding.x.css};
}
.bz-city-tooltip .img-tooltip-border {
    border-radius: ${metrics.radius.tooltip.css};
    border-image-source: none;
    border-width: 0.1111111111rem;
    border-style: solid;
    border-color: ${BZ_COLOR.bronze3} ${BZ_COLOR.bronze4};
    filter: drop-shadow(0 1rem 1rem #000c);
}
.bz-city-tooltip .img-tooltip-bg {
    background-image: linear-gradient(to bottom, ${BZ_COLOR.primary4}cc 0%, ${BZ_COLOR.primary5}cc 100%);
}
.bz-city-tooltip .shadow {
    filter: drop-shadow(0 0.0555555556rem 0.0555555556rem black);
}
.bz-city-tooltip .text-secondary {
    fxs-font-gradient-color: ${BZ_COLOR.bronze1};
    color: ${BZ_COLOR.bronze2};
}
`,  // enables consistent centering of text with font icons
`
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

function docBanner(text, style) {
    // create a banner
    const banner = document.createElement("div");
    setStyle(banner, style);
    // extend banner to full width
    banner.style.paddingLeft = banner.style.paddingRight = metrics.padding.x.css;
    banner.style.marginLeft = banner.style.marginRight = `-${metrics.padding.x.css}`;
    // center content vertically and horizontally
    banner.style.display = 'flex';
    banner.style.flexDirection = 'column';
    banner.style.justifyContent = 'center';
    banner.style.alignItems = 'center';
    banner.style.textAlign = 'center';
    // make sure the banner is tall enough for end bumpers
    banner.style.minHeight = metrics.bumper.css;
    // set the text
    for (const item of text) {
        const row = document.createElement("div");
        row.setAttribute("data-l10n-id", item);
        banner.appendChild(row);
    }
    return banner;
}
function docIcon(image, size, resize, ...style) {
    // create an icon to fit size (with optional image resizing)
    const icon = document.createElement("div");
    icon.classList.value = "relative bg-contain bg-no-repeat shadow";
    if (style.length) icon.classList.add(...style);
    icon.style.height = size;
    icon.style.width = size;
    // note: this sets image width and auto height
    if (resize && resize != size) icon.style.backgroundSize = resize;
    icon.style.backgroundPosition = "center";
    icon.style.backgroundImage =
        image.startsWith("url(") ? image : UI.getIconCSS(image);
    return icon;
}
function docRules(text, style=null) {
    // create a paragraph of rules text
    // font icons are squirrely!  only center them at top level
    const tt = document.createElement("div");
    tt.style.textAlign = 'center';
    tt.style.widthPERCENT = 100;
    for (const item of text) {
        const row = document.createElement("div");
        if (style) row.classList.value = style;
        row.classList.add("bz-rules-item");
        row.setAttribute("data-l10n-id", item);
        tt.appendChild(row);
    }
    return tt;
}
function docText(text, style) {
    const e = document.createElement("div");
    if (style) e.classList.value = style;
    e.setAttribute('data-l10n-id', text);
    return e;
}
function docTimer(size, resize, ...style) {
    if (!style.length) style = ["-mx-1"];
    return docIcon(BZ_TIMER_ICON, size, resize, ...style);
}
function dotJoin(list, dot=BZ_DOT_DIVIDER) {
    // join text with dots after removing empty elements
    return list.filter(e => e).join("&nbsp;" + dot + " ");
}
function dotJoinLocale(list, dot=BZ_DOT_DIVIDER) {
    return dotJoin(list.map(s => s && Locale.compose(s)), dot);
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
function getDigits(list, min=0) {
    return Math.max(min, ...list.map(n => n.length));
}
function getFontMetrics() {
    const sizes = (rem, round=Math.round) => {
        const css = `${rem.toFixed(10)}rem`;
        const base = round(rem * BASE_FONT_SIZE);
        const scale = round(rem * GlobalScaling.currentScalePx);
        const px = `${scale}px`;
        return { rem, css, base, scale, px, };
    }
    // global metrics
    const padding = sizes(BZ_PADDING);
    const margin = sizes(BZ_MARGIN);  // top & bottom of each block
    padding.x = sizes(padding.rem);
    padding.y = sizes(padding.rem - margin.rem);  // room for end block margins
    const border = sizes(BZ_BORDER);
    // font metrics
    const font = (name, ratio=BZ_FONT_SPACING) => {
        const rem = typeof name === "string" ?
            getFontSizeBasePx(name) / BASE_FONT_SIZE : name;
        const size = sizes(rem);  // font size
        const spacing = sizes(size.rem * ratio);  // line height
        const leading = sizes(spacing.rem - size.rem);  // interline spacing
        leading.half = sizes(leading.rem / 2);
        const margin = sizes(BZ_MARGIN - leading.half.rem);
        const radius = sizes(spacing.rem / 2);
        const figure = sizes(0.6 * size.rem, Math.ceil);  // figure width
        const digits = (n) => sizes(n * figure.rem, Math.ceil);
        return { size, ratio, spacing, leading, margin, radius, figure, digits, };
    }
    const body = font('xs', 1.25);
    const rules = font('xs');  // is this needed?
    const table = font('xs');
    const yields = font(8/9);
    const head = font('sm', 1.25);
    const radius = sizes(2/3 * padding.rem);  // TODO: fine-tuning
    radius.content = sizes(radius.rem);
    radius.tooltip = sizes(radius.rem + border.rem);
    // minimum end banner height to avoid radius glitches
    const bumper = sizes(Math.max(table.spacing.rem, 2*radius.rem));
    return {
        sizes, font,
        padding, margin, border,
        body, rules, table, yields, head,
        radius, bumper,
    };
}
function getFigureWidth(size, digits=1) {
    const nwidth = 0.6 * getFontSizeScalePx(size);
    return Math.round(nwidth * digits);
}
function getFontHeight(size, leading) {
    return Math.round(leading * getFontSizeScalePx(size));
}
function getFontSizeBasePx(size) {
    return GlobalScaling.getFontSizePx(size);
}
function getFontSizeRem(size) {
    const fpx = getFontSizeBasePx(size);
    return GlobalScaling.pixelsToRem(fpx);
}
function getFontSizeScalePx(size) {
    if (typeof size === "string") size = getFontSizeRem(size);
    return size * GlobalScaling.currentScalePx;
}
function getReligionInfo(id) {
    // find a matching player religion, to get custom names
    const info = GameInfo.Religions.lookup(id);
    if (!info) return null;
    // find custom religion name, if any
    const customName = (info) => {
        for (const founder of Players.getEverAlive()) {
            if (founder.Religion?.getReligionType() != id) continue;
            return founder.Religion.getReligionName();
        }
        return info.Name;
    }
    const name = customName(info);
    const icon = info.ReligionType;
    return { name, icon, info, };
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
const BZ_PRELOADED_ICONS = {};
function preloadIcon(icon, context) {
    if (!icon) return;
    const url = icon.startsWith("url(") ? icon : UI.getIcon(icon, context);
    const name = url.replace(/url|[(\042\047)]/g, '');  // \042\047 = quotation marks
    if (!name || name in BZ_PRELOADED_ICONS) return;
    BZ_PRELOADED_ICONS[name] = true;
    Controls.preloadImage(name, 'plot-tooltip');
}
function setStyle(element, style) {
    if (!element || !style) return;
    for (const [property, value] of Object.entries(style)) {
        if (property == "classList") {
            element.classList.add(...value.split(/\s+/));
        } else {
            element.style.setProperty(property, value);
        }
    }
}
class bzCityTooltip {
    constructor() {
        // tooltip target
        this.updateQueued = false;
        this.target = null;
        this.subtarget = null;
        this.location = null;
        this.city = null;
        // coordinates
        this.plotIndex = null;
        // document root
        this.tooltip = document.createElement('fxs-tooltip');
        this.tooltip.classList.value = "bz-tooltip bz-city-tooltip max-w-96";
        this.tooltip.style.lineHeight = metrics.table.ratio;
        this.container = document.createElement('div');
        this.container.classList.value = "relative font-body text-xs";
        this.tooltip.appendChild(this.container);
        // point-of-view info
        this.observerID = GameContext.localObserverID;
        this.observer = Players.get(this.observerID);
        this.playerID = GameContext.localPlayerID;
        this.player = Players.get(this.playerID);
        this.isDebug = UI.isDebugPlotInfoVisible();
        // ownership
        this.owner = null;
        this.relationship = null;
        this.originalOwner = null;
        // settlement stats
        this.settlementType = null;
        this.townFocus = null;
        this.isFreshWater = null;
        this.religion = null;
        this.connections = null;
        this.growth = null;
        this.production = null;
        // yields
        this.yields = [];
        this.totalYields = 0;
        Loading.runWhenFinished(() => {
            for (const y of GameInfo.Yields) {
                // Controls.preloadImage(url, 'plot-tooltip');
                preloadIcon(`${y.YieldType}`, "YIELD");
            }
        });
    }
    static get instance() { return bzCityTooltip._instance; }
    static queueUpdate(target) {
        if (bzCityTooltip._instance?.target != target) return;
        bzCityTooltip._instance.updateQueued = true;
    }
    getHTML() { return this.tooltip; }
    isUpdateNeeded(target) {
        // first check for a subtarget
        const sub = [ bzTarget.GROWTH, bzTarget.PRODUCTION ];
        const subtarget = sub.find(t => target.closest(t)) ?? null;
        // get main target, if possible
        const banner = target.closest('city-banner');
        target = banner?.bzComponent ?? null;
        if (target == this.target && subtarget == this.subtarget &&
            !this.updateQueued) return false;
        // set target, location, and city
        this.target = target;
        this.subtarget = subtarget;
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
        this.isDebug = UI.isDebugPlotInfoVisible();
        // ownership
        this.owner = null;
        this.relationship = null;
        this.originalOwner = null;
        // settlement stats
        this.settlementType = null;
        this.townFocus = null;
        this.isFreshWater = null;
        this.religion = null;
        this.connections = null;
        this.growth = null;
        this.production = null;
        // yields
        this.yields = [];
        this.totalYields = 0;
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
        this.modelConnections();
        this.modelGrowth();
        this.modelProduction();
        this.modelYields();
    }
    render() {
        // update metrics
        metrics = getFontMetrics();
        const border = this.tooltip.querySelector('.img-tooltip-border');
        if (border) border.borderRadius = metrics.radius.tooltip.css;
        // render subtarget tooltips, if needed
        if (this.subtarget == bzTarget.GROWTH) return this.renderGrowth();
        if (this.subtarget == bzTarget.PRODUCTION) return this.renderProduction();
        // render main tooltip
        this.renderSettlement();
        this.renderConnections();
        this.renderGrowth();
        this.renderProduction();
        // only show yields in autoplay or debug mode
        if (!this.player || this.isDebug) this.renderYields();
    }
    // data modeling methods
    modelSettlement() {
        // owner, civ, city
        const loc = this.location;
        const ownerID = GameplayMap.getOwner(loc.x, loc.y);
        this.owner = Players.get(ownerID);
        this.relationship = this.getCivRelationship(this.owner);
        // original owner
        if (this.city && this.city.originalOwner != this.city.owner) {
            this.originalOwner = Players.get(this.city.originalOwner);
        }
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
    }
    modelConnections() {
        if (!this.city) return;
        const ids = this.city.getConnectedCities();
        if (!ids) return;
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
        if (settlements.length == 0) return;
        this.connections = { settlements, cities, towns, focused, growing, };
    }
    modelGrowth() {
        if (!this.city) return;
        // food
        const isGrowing = this.city.Growth?.growthType == GrowthTypes.EXPAND;
        const current = this.city.Growth?.currentFood ?? -1;
        const threshold = this.city.Growth?.getNextGrowthFoodThreshold().value ?? -1;
        const net = this.city.Yields.getNetYield(YieldTypes.YIELD_FOOD);
        const turns = this.city.Growth?.turnsUntilGrowth ?? -1;
        const food = { isGrowing, current, threshold, net, turns, };
        // population
        const urban = this.city.urbanPopulation ?? 0;
        const rural = this.city.ruralPopulation ?? 0;
        const specialists = this.city.Workers.getNumWorkers(false) ?? 0;
        const pop = { urban, rural, specialists, };
        // religion
        const religion = { majority: null, urban: null, rural: null, };
        if (this.city.Religion) {
            const info = this.city.Religion;
            religion.majority = getReligionInfo(info.majorityReligion);
            religion.urban = getReligionInfo(info.urbanReligion);
            religion.rural = getReligionInfo(info.ruralReligion);
        }
        this.growth = { food, pop, religion, };
    }
    modelProduction() {
        if (!this.city) return;
        const queue = [];
        for (const item of this.city.BuildQueue.getQueue()) {
            const kind = item.kind;
            const type = item.type;
            const turnsLeft = this.city.BuildQueue.getTurnsLeft(type);
            const progress = this.city.BuildQueue.getPercentComplete(type);
            const info =
                GameInfo.Constructibles.lookup(type) ??
                GameInfo.Units.lookup(type) ??
                GameInfo.Projects.lookup(type) ??
                null;
            const name = info?.Name ?? null;
            const q = { name, kind, type, info, turnsLeft, progress, };
            queue.push(q);
        }
        if (queue.length) this.production = queue;
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
    renderTitleHeading(text) {
        if (!text) return;
        const layout = document.createElement("div");
        layout.classList.value = "text-secondary font-title-sm uppercase text-center";
        layout.style.lineHeight = metrics.head.ratio;
        layout.style.marginTop = metrics.head.margin.css;
        const ttText = document.createElement("div");
        ttText.setAttribute('data-l10n-id', text);
        layout.appendChild(ttText);
        this.container.appendChild(layout);
    }
    renderSettlement() {
        if (!this.owner) return;
        // render headings and notes
        this.renderTitleHeading(this.settlementType);
        const notes = [];
        if (this.townFocus?.note) notes.push(this.townFocus.note);
        if (!this.isFreshWater) notes.push("LOC_BZ_SETTLEMENT_NO_FRESHWATER");
        if (notes.length) {
            // note: extra div layer here to align bz-debug levels
            const tt = document.createElement("div");
            tt.classList.value = "text-xs text-center mb-1";
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
        const rows = [];
        // show name, relationship, and civ
        const ownerName = this.getOwnerName(this.owner);
        const relType = Locale.compose(this.relationship.type ?? "");
        rows.push(dotJoin([ownerName, relType]));
        rows.push(this.getCivName(this.owner, true));  // full name
        // show original owner
        if (this.originalOwner) {
            const adjective = this.originalOwner.civilizationAdjective;
            const text = Locale.compose("LOC_BZ_WAS_PREVIOUSLY", adjective);
            rows.push(text);
        }
        const style = this.relationship?.isEnemy ?
            { ...BZ_ALERT.danger, classList: "py-1" } : null;
        const banner = docBanner(rows, style);
        banner.style.lineHeight = metrics.body.ratio;
        banner.style.marginBottom = metrics.body.margin.css;
        this.container.appendChild(banner);
        // show city-state bonus
        if (this.owner.isMinor) {
            const bonusType = Game.CityStates.getBonusType(this.owner.id);
            const bonus = GameInfo.CityStateBonuses.find(b => b.$hash == bonusType);
            if (bonus) {
                const rules = docRules([bonus.Name, bonus.Description]);
                rules.style.marginTop = metrics.body.margin.css;
                rules.style.width = '12rem';
                rules.style.marginBottom = metrics.rules.margin.css;
                const title = rules.children[0];
                title.classList.add("text-secondary", "font-title", "uppercase");
                title.style.lineHeight = metrics.body.ratio;
                this.container.append(rules);
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
        const height = getFontHeight('xs', 1.5);
        const size = `${height}px`;
        const small = `${Math.round(2/3*height)}px`;
        this.renderTitleHeading("LOC_BZ_SETTLEMENT_CONNECTIONS");
        const tt = document.createElement("div");
        tt.classList.value = "flex justify-center text-xs";
        const rows = [];
        const connections = [
            ...this.connections.cities,
            ...this.connections.growing,
            ...this.connections.focused,
        ];
        for (const conn of connections) {
            const row = document.createElement("div");
            row.classList.value = "relative flex justify-start";
            row.style.minHeight = row.style.lineHeight = size;
            if (conn.isTown) {
                const focus = getTownFocus(conn);
                row.appendChild(docIcon(focus.icon, size, size));
            } else {
                row.appendChild(docIcon("YIELD_CITIES", size, small));
            }
            const name = document.createElement("div");
            name.classList.value = "max-w-36 mx-1 text-left";
            name.setAttribute('data-l10n-id', conn.name);
            row.appendChild(name);
            rows.push(row);
        }
        const columns = [];
        const half = rows.length < 5 ? rows.length : Math.ceil(rows.length / 2);
        columns.push(rows.slice(0, half));
        if (half < rows.length) columns.push(rows.slice(half));
        for (const column of columns) {
            const col = document.createElement("div");
            col.classList.value = "flex-col justify-start mx-1";
            for (const row of column) col.appendChild(row);
            tt.appendChild(col);
        }
        tt.style.marginBottom = metrics.table.margin.css;
        this.container.appendChild(tt);
    }
    renderGrowth() {
        if (!this.growth) return;
        // alternate titles:
        // LOC_UI_FOOD_CHOOSER_TITLE = Growth
        // LOC_UI_CITY_GROWTH_TITLE = City Growth
        // LOC_UI_TOWN_GROWTH_TITLE = Town Growth
        // LOC_UI_CITY_STATUS_POPULATION_TITLE = Population
        this.renderTitleHeading("LOC_UI_FOOD_CHOOSER_TITLE");
        const { food, pop, religion, } = this.growth;
        const layout = [
            {
                icon: religion.urban?.icon ?? "CITY_URBAN",
                label: "LOC_UI_CITY_STATUS_URBAN_POPULATION",
                value: pop.urban,
            },
            {
                icon: religion.rural?.icon ?? "CITY_RURAL",
                label: "LOC_UI_CITY_STATUS_RURAL_POPULATION",
                value: pop.rural,
            },
            {
                icon: "CITY_SPECIAL_BASE",
                label: "LOC_UI_SPECIALISTS_SUBTITLE",
                value: pop.specialists,
            },
        ];
        const height = getFontHeight('xs', 1.5);
        const size = `${height}px`;
        const small = `${Math.round(5/6*height)}px`;
        const digits = getDigits(layout.map(i => i.value.toFixed()));
        const dwidth = `${getFigureWidth('xs', digits)}px`;
        if (food.isGrowing) {
            const row = document.createElement("div");
            row.classList.value =
                "self-center flex text-xs px-1 rounded-2xl mb-1";
            row.style.backgroundColor = `${BZ_COLOR.food}55`;
            row.style.minHeight = size;
            row.style.marginTop = metrics.body.leading.half.css;
            row.appendChild(docIcon("YIELD_FOOD", size, small, "-mx-1"));
            const current = Locale.compose("LOC_BZ_GROUPED_DIGITS", food.current);
            const threshold = Locale.compose("LOC_BZ_GROUPED_DIGITS", food.threshold);
            const progress = `${current} / ${threshold}`;
            row.appendChild(docText(progress, "text-left flex-auto mx-1"));
            row.appendChild(docText('•'));
            row.appendChild(docText(food.turns.toFixed(), "text-right mx-1"));
            row.appendChild(docTimer(size, size));
            this.container.appendChild(row);
        }
        const rows = [];
        for (const item of layout) {
            const row = document.createElement("div");
            row.classList.value = "flex justify-start px-1";
            row.style.minHeight = size;
            row.appendChild(docIcon(item.icon, size, small, "-mx-1"));
            row.appendChild(docText(item.label, "text-left flex-auto mx-2"));
            const value = docText(item.value.toFixed(), "text-right");
            value.style.width = dwidth;
            row.appendChild(value);
            rows.push(row);
        }
        this.renderTable(rows);
    }
    renderProduction() {
        if (!this.production) return;
        // only allowed for local player, autoplay, or debug
        if (this.player && this.owner.id != this.playerID && !this.isDebug) return;
        this.renderTitleHeading("LOC_UI_PRODUCTION_TITLE");
        const single = this.production.length == 1;
        const height = getFontHeight('xs', 1.5);
        const size = `${height}px`;
        const digits = getDigits(this.production.map(i => i.turnsLeft.toFixed()));
        const dwidth = `${getFigureWidth('xs', digits)}px`;
        const rows = [];
        for (const item of this.production) {
            const row = document.createElement("div");
            row.classList.value = "flex justify-start px-1";
            row.style.minHeight = size;
            const name = document.createElement("div");
            name.classList.value = "text-left flex-auto";
            name.classList.add("mx-1");  // wider spacing
            name.setAttribute('data-l10n-id', item.name);
            row.appendChild(name);
            if (single) row.appendChild(docText('•'));
            const turns = document.createElement("div");
            turns.classList.value = "text-right mx-1";
            turns.style.width = dwidth;
            turns.textContent = item.turnsLeft.toFixed();
            row.appendChild(turns);
            row.appendChild(docTimer(size, size));
            rows.push(row);
        }
        const color = single ? null : `${BZ_COLOR.production}55`;
        this.renderTable(rows, color, single);
    }
    // display formatted rows as a stripy table
    renderTable(rows, color, narrow=false) {
        const table = document.createElement("div");
        table.classList.value = "flex-table justify-start text-xs";
        // set bottom margin (ignoring leading)
        table.style.marginBottom = metrics.margin.css;
        // collect rows into the table
        for (const [i, row] of rows.entries()) {
            // add stripes to multi-row tables
            if (color && !(i % 2)) {
                row.classList.add("rounded-2xl");
                row.style.backgroundColor = color;
            }
            table.appendChild(row);
        }
        if (narrow) {
            // optionally prevent single-row tables from
            // expanding to the full width of the tooltip
            // TODO: why does this work?
            const tt = document.createElement("div");
            tt.classList.value = "flex justify-center";
            tt.append(table);
            this.container.appendChild(tt);
            return;
        }
        // full-width table
        this.container.appendChild(table);
    }
    renderYields() {
        if (!this.totalYields) return;  // no yields to show
        // set column width based on number of digits (at least three)
        const digits = getDigits(this.yields.map(y => y.value.toFixed()), 2);
        const width = metrics.yields.digits(digits).css;
        const tt = document.createElement('div');
        tt.classList.value = "self-center flex flex-wrap justify-center w-full";
        // one column per yield type
        for (const [i, column] of this.yields.entries()) {
            const y = this.yieldColumn(column, width);
            if (i) y.style.marginLeft = '0.3333333333rem';  // all but first column
            tt.appendChild(y);
        }
        tt.style.marginTop = metrics.yields.margin.css;
        tt.style.marginBottom = metrics.yields.margin.css;
        this.container.appendChild(tt);
    }
    yieldColumn(col, width) {
        const tt = document.createElement("div");
        tt.classList.value = "flex-col justify-start font-body";
        const ariaLabel = `${Locale.toNumber(col.value)} ${Locale.compose(col.name)}`;
        tt.ariaLabel = ariaLabel;
        const size = metrics.yields.spacing.css;
        const iconCSS = UI.getIconCSS(col.type, "YIELD");
        const icon = docIcon(iconCSS, size, size, "self-center", "shadow");
        tt.appendChild(icon);
        const value = docText(col.value.toFixed(), "self-center text-center");
        value.style.fontSize = metrics.yields.size.css;
        value.style.lineHeight = metrics.yields.spacing.css;
        value.style.width = width;
        tt.appendChild(value);
        return tt;
    }
    setWarningCursor() {
        // highlight enemy territory & units with a red cursor
        if (UI.isCursorLocked()) return;
        const isEnemy = this.relationship?.isEnemy ?? false;
        const cursor = isEnemy ? UIHTMLCursorTypes.Enemy : UIHTMLCursorTypes.Default;
        UI.setCursorByType(cursor);
    }
}

bzCityTooltip._instance = new bzCityTooltip();
TooltipManager.registerType('bz-city-tooltip', bzCityTooltip.instance);
export { bzCityTooltip as default };
