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
}`,
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
        const position = { x: 0, y: 0 };
        // dimensions
        const yCity = 8;
        const yTown = 24;
        const yVillage = 18;
        const icon = 33;  // icon width (healthbar)
        const offset = icon + 3;  // x-offset between icons
        const width = icon + (units.length - 1) * offset;
        const xorigin = -icon/4;  // origin for centering
        // is there a city or town banner?
        const cityID = MapCities.getCity(loc.x, loc.y);
        const city = cityID && Cities.get(cityID);
        if (city && city.location.x == loc.x && city.location.y == loc.y) {
            position.y = city.isTown ? yTown : yCity;
        } else if (isVillage(loc)) {
            console.warn(`TRIX VILLAGE ${JSON.stringify(loc)}`);
            position.y = yVillage;
        }
        for (let u = 0; u < units.length; u++) {
            const unitFlag = UnitFlagManager.instance.getFlag(units[u]);
            if (unitFlag) {
                position.x = xorigin - width/2 + offset * u;
                unitFlag.updatePosition(position);
            }
            else {
                console.error("unit-flag-manager: onRecalculateFlagOffsets(): Unit flag's for unit " + ComponentID.toLogString(units[u]) + " is not found");
            }
        }
    }
    this.plotIndicesToCheck.clear();
}

const GUFproto = GenericUnitFlag.prototype;
const IUFproto = IndependentPowersUnitFlag.prototype;

// patched methods
const GUF_onAttach = GUFproto.onAttach;
GUFproto.onAttach = function(...args) {  // GeneralUnitFlag only
    GUF_onAttach.apply(this, args);
    this.realizeAffinity();
};
GUFproto.updatePosition = IUFproto.updatePosition = function(position) {
    if (this.unitContainer && this.flagOffset != position) {
        this.flagOffset = position;
        this.unitContainer.style.left = Layout.pixels(position.x);
        this.unitContainer.style.top = Layout.pixels(position.y);
    }
};
// show relationships for majors & city-states
GUFproto.getRelationship = function() {
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
GUFproto.realizeAffinity = IUFproto.realizeAffinity;
// fix unit health bars
const GUFrealizeUnitHealth = GUFproto.realizeUnitHealth;
GUFproto.realizeUnitHealth = function(...args) {
    GUFrealizeUnitHealth.apply(this, args);
    if (this.unitHealthBarInner) {
        const health = this.unit.Health;
        const damage = (health.maxDamage - health.damage) / health.maxDamage;
        this.unitHealthBarInner.style.widthPERCENT = utils.clamp(damage, 0, 1) * 85;
    }
}
const IUFrealizeUnitHealth = IUFproto.realizeUnitHealth;
IUFproto.realizeUnitHealth = function(...args) {
    IUFrealizeUnitHealth.apply(this, args);
    if (this.unitHealthBarInner) {
        const health = this.unit.Health;
        const damage = (health.maxDamage - health.damage) / health.maxDamage;
        const MAX = 28/33 * 100;  // healthbar/container = 28/33 pixels
        this.unitHealthBarInner.style.widthPERCENT = utils.clamp(damage, 0, 1) * MAX;
    }
}
// undo other patches
// dynamically import conflicting mods
const override = () => {
    const overrides = [
        "/sukritacts_simple_ui_adjustments/ui/unit-flags/suk-unit-flags.js",
    ];
    for (const mod of overrides) {
        import(mod)
            .then(_mod => console.warn(`bz-unit-flags: override=${mod}`))
            .catch((_err) => null);
    }
    // restore standard implementation
    GUFproto.checkUnitPosition = IUFproto.checkUnitPosition = function(unit) {
        UnitFlagManager.instance.recalculateFlagOffsets(unit.location);
    }
};
engine.whenReady.then(override);
