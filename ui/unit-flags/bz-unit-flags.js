import bzFlagCorpsOptions from '/bz-flag-corps/ui/options/bz-flag-corps-options.js';
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';
import { utils } from '/core/ui/graph-layout/utils.js';
import { Layout } from '/core/ui/utilities/utilities-layout.js';
import { UnitFlagManager } from '/base-standard/ui/unit-flags/unit-flag-manager.js';
import { GenericUnitFlag } from '/base-standard/ui/unit-flags/unit-flags.js';
import { IndependentPowersUnitFlag } from '/base-standard/ui/unit-flags/unit-flags-independent-powers.js';

// additional CSS definitions
const BZ_HEAD_STYLE = document.createElement('style');
BZ_HEAD_STYLE.textContent = [
`
.bz-flags-no-shadow .unit-flag__shadow,
.bz-flags-no-shadow .unit-flag--civilian .unit-flag__shadow,
.bz-flags-no-shadow .unit-flag--army .unit-flag__shadow,
.bz-flags-no-shadow .unit-flag--combat .unit-flag__shadow {
    background-image: none;
}
`,
].join('\n');
document.head.appendChild(BZ_HEAD_STYLE);
// sync optional styling
if (bzFlagCorpsOptions.noShadow) {
    document.body.classList.add("bz-flags-no-shadow");
} else {
    document.body.classList.remove("bz-flags-no-shadow");
}

function isVillage(loc) {
    for (const item of MapConstructibles.getHiddenFilteredConstructibles(loc.x, loc.y)) {
        const cons = Constructibles.getByComponentID(item);
        const info = GameInfo.Constructibles.lookup(cons.type);
        if (info.ConstructibleType == "IMPROVEMENT_VILLAGE") return true;
        if (info.ConstructibleType == "IMPROVEMENT_ENCAMPMENT") return true;
    }
    return false;
}

const UFMproto = UnitFlagManager.prototype;
const UFM_onInitialize = UFMproto.onInitialize;
UFMproto.onInitialize = function(...args) {
    UFM_onInitialize.apply(this, args);
    engine.on('DiplomacyEventStarted', (_data) => { this.requestFlagsRebuild() });
    engine.on('DiplomacyEventEnded', (_data) => { this.requestFlagsRebuild() });
};

const _onRecalculateFlagOffsets = UFMproto.onRecalculateFlagOffsets;
UFMproto.onRecalculateFlagOffsets = function() {
    for (const plotIndex of this.plotIndicesToCheck) {
        const loc = GameplayMap.getLocationFromIndex(plotIndex);
        const units = MapUnits.getUnits(loc.x, loc.y);
        const position = { x: 0, y: -24 };
        // dimensions
        const yCity = 8;
        const yTown = 24;
        const yVillage = 18;
        const xOrigin = -6;
        const xOffset = 36;  // x-offset between icons
        const width = units.length * xOffset;
        // is there a city or town banner?
        const cityID = MapCities.getCity(loc.x, loc.y);
        const city = cityID && Cities.get(cityID);
        if (city && city.location.x == loc.x && city.location.y == loc.y) {
            position.y = city.isTown ? yTown : yCity;
        } else if (isVillage(loc)) {
            position.y = yVillage;
        }
        for (let u = 0; u < units.length; u++) {
            const unitFlag = UnitFlagManager.instance.getFlag(units[u]);
            if (unitFlag) {
                position.x = xOrigin - width/2 + xOffset * u;
                unitFlag.bzUpdatePosition(position);
            }
            else {
                console.error("unit-flag-manager: onRecalculateFlagOffsets(): Unit flag's for unit " + ComponentID.toLogString(units[u]) + " is not found");
            }
        }
    }
    this.plotIndicesToCheck.clear();
}

// patched methods
const GUF_onAttach = GenericUnitFlag.prototype.onAttach;
GenericUnitFlag.prototype.onAttach = function(...args) {  // GeneralUnitFlag only
    GUF_onAttach.apply(this, args);
    this.realizeAffinity();
};
function bzUpdatePosition(position) {
    if (this.unitContainer && this.flagOffset != position) {
        this.flagOffset = position;
        this.unitContainer.style.left = Layout.pixels(position.x);
        this.unitContainer.style.top = Layout.pixels(position.y);
    }
};
GenericUnitFlag.prototype.bzUpdatePosition = bzUpdatePosition;
IndependentPowersUnitFlag.prototype.bzUpdatePosition = bzUpdatePosition;
// show relationships for majors & city-states
GenericUnitFlag.prototype.getRelationship = function() {
    // parallel to IndependentPowersUnitFlag.getRelationship
    const IR = IndependentRelationship;
    const ownerID = this.componentID.owner;
    const observerID = GameContext.localObserverID;
    if (ownerID == observerID) return IR.FRIENDLY;
    const owner = Players.get(ownerID);
    if (owner.Diplomacy?.hasAllied(observerID)) return IR.FRIENDLY;
    if (owner.Diplomacy?.isAtWarWith(observerID)) return IR.HOSTILE;
    if (owner.isMinor && owner.Influence?.hasSuzerain &&
        owner.Influence.getSuzerain() == observerID) {
        return IR.FRIENDLY;
    }
    return IR.NEUTRAL;
}
GenericUnitFlag.prototype.realizeAffinity =
    IndependentPowersUnitFlag.prototype.realizeAffinity;
// fix unit health bars
function bzFixUnitHealth() {
    if (this.unitHealthBarInner) {
        const health = this.unit?.Health ?? 1.0;
        const damage = (health.maxDamage - health.damage) / health.maxDamage;
        const MAX = 28/33 * 100;  // healthbar/container = 28/33 pixels
        this.unitHealthBarInner.style.widthPERCENT = utils.clamp(damage, 0, 1) * MAX;
    }
}
GenericUnitFlag.prototype.bzFixUnitHealth = bzFixUnitHealth;
IndependentPowersUnitFlag.prototype.bzFixUnitHealth = bzFixUnitHealth;
const GUFrealizeUnitHealth = GenericUnitFlag.prototype.realizeUnitHealth;
GenericUnitFlag.prototype.realizeUnitHealth = function(...args) {
    GUFrealizeUnitHealth.apply(this, args);
    this.bzFixUnitHealth();
}
const IUFrealizeUnitHealth = IndependentPowersUnitFlag.prototype.realizeUnitHealth;
IndependentPowersUnitFlag.prototype.realizeUnitHealth = function(...args) {
    IUFrealizeUnitHealth.apply(this, args);
    this.bzFixUnitHealth();
}
// undo conflicting patches
function checkUnitPosition(unit) {
    UnitFlagManager.instance.recalculateFlagOffsets(unit.location);
}
function updateTop(position) {
    if (this.unitContainer && this.flagOffset != position) {
        this.flagOffset = position;
        this.unitContainer.style.top = Layout.pixels(position * -16);
    }
}
// dynamically import the conflicting mods
const conflicts = [
    "/sukritacts_simple_ui_adjustments/ui/unit-flags/suk-unit-flags.js",
];
const promises = conflicts.map(mod => import(mod));
Promise.allSettled(promises).then((mods) => {
    if (!mods.some(mod => mod.status == "fulfilled")) return;  // no conflicts
    GenericUnitFlag.prototype.checkUnitPosition = checkUnitPosition;
    GenericUnitFlag.prototype.updateTop = updateTop;
    IndependentPowersUnitFlag.prototype.checkUnitPosition = checkUnitPosition;
    IndependentPowersUnitFlag.prototype.updateTop = updateTop;
});
