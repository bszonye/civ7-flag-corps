import bzFlagCorpsOptions from '/bz-flag-corps/ui/options/bz-flag-corps-options.js';
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';
import { Layout } from '/core/ui/utilities/utilities-layout.js';
import { UnitFlagManager } from '/base-standard/ui/unit-flags/unit-flag-manager.js';
import { GenericUnitFlag } from '/base-standard/ui/unit-flags/unit-flags.js';
import { IndependentPowersUnitFlag } from '/base-standard/ui/unit-flags/unit-flags-independent-powers.js';

// additional CSS definitions
const BZ_HEAD_STYLE = [
`
.bz-flags-no-shadow .unit-flag__shadow,
.bz-flags-no-shadow .unit-flag--civilian .unit-flag__shadow,
.bz-flags-no-shadow .unit-flag--army .unit-flag__shadow,
.bz-flags-no-shadow .unit-flag--combat .unit-flag__shadow {
    background-image: none;
}
`,
`
.bz-flags.bz-flags-no-shadow .unit-flag__healthbar-container {
    top: 0.2222222222rem;
}
.bz-flags .unit-flag__healthbar-container {
    top: 0.1666666667rem;
}
.bz-flags .unit-flag__healthbar {
    height: 0.5555555556rem;
    border-radius: 0.2777777778rem / 0.4444444444rem;
}
.bz-flags .unit-flag__healthbar-inner {
    height: 0.3333333333rem;
    border-radius: 0.1666666667rem / 0.3333333333rem;
}
`,
];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});
// sync optional styling
document.body.classList.toggle("bz-flags-no-shadow", bzFlagCorpsOptions.noShadow);

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
        const position = { x: 0, y: -32 };
        // dimensions
        const yBanners = bzFlagCorpsOptions.banners ? 0 : null;
        const yCity = yBanners ?? 8;
        const yTown = yBanners ?? 24;
        const yVillage = yBanners ?? 18;
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
// undo conflicting patches
function checkUnitPosition(unit) {
    UnitFlagManager.instance.recalculateFlagOffsets(unit.location);
}
function updateTop(position, total) {
    const offset = position - ((total - 1) / 2) - 0.5;
    if (this.unitContainer) {
        if (this.flagOffset != offset) {
            this.flagOffset = offset;
            this.unitContainer.style.left = Layout.pixels(offset * 32);
        }
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
