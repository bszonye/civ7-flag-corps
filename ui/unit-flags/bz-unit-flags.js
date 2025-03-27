import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';
import { utils } from '/core/ui/graph-layout/utils.js';
import { Layout } from '/core/ui/utilities/utilities-layout.js';
import { UnitFlagManager } from '/base-standard/ui/unit-flags/unit-flag-manager.js';
import { GenericUnitFlag } from '/base-standard/ui/unit-flags/unit-flags.js';
import { IndependentPowersUnitFlag } from '/base-standard/ui/unit-flags/unit-flags-independent-powers.js';

const UFMproto = UnitFlagManager.prototype;
const UFM_onInitialize = UFMproto.onInitialize;
UFMproto.onInitialize = function(...args) {
    UFM_onInitialize.apply(this, args);
    console.warn(`TRIX ONINIT ${UnitFlagManager.instance}`);
};

const _onRecalculateFlagOffsets = UFMproto.onRecalculateFlagOffsets;
UFMproto.onRecalculateFlagOffsets = function() {
    console.warn(`TRIX RECALC`);
    for (const plotIndex of this.plotIndicesToCheck) {
        const loc = GameplayMap.getLocationFromIndex(plotIndex);
        const units = MapUnits.getUnits(loc.x, loc.y);
        const position = { x: 0, y: 0 };
        // is there a city or town banner?
        const cityID = MapCities.getCity(loc.x, loc.y);
        const city = cityID && Cities.get(cityID);
        if (city) {
            position.y = city.isTown ? 24 : 8;
        } else {
            const village =
                MapConstructibles.getHiddenFilteredConstructibles(loc.x, loc.y)
                .map(c => Constructibles.getByComponentID(c))
                .map(c => GameInfo.Constructibles.lookup(c.type))
                .some(c => c.ConstructibleType == "IMPROVEMENT_VILLAGE");
            if (village) position.y = 24;
            console.warn(`TRIX VILLAGE=${position.y}`);
        }
        // TODO: villages
        for (let u = 0; u < units.length; u++) {
            const unitFlag = UnitFlagManager.instance.getFlag(units[u]);
            if (unitFlag) {
                console.warn(`TRIX CITY=${JSON.stringify(city)}`);
                position.x = 36 * (u - 1/2);
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
GUFproto.updatePosition = IUFproto.updatePosition = function(position) {
    // console.warn(`TRIX UPDATE ${position}`);
    if (this.unitContainer && this.flagOffset != position) {
        this.flagOffset = position;
        this.unitContainer.style.left = Layout.pixels(position.x);
        this.unitContainer.style.top = Layout.pixels(position.y);
    }
};
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
        this.unitHealthBarInner.style.widthPERCENT = utils.clamp(damage, 0, 1) * 85;
    }
}
// undo other patches
// dynamically import conflicting mods
const override = () => {
    const overrides = [
        "/sukritacts_simple_ui_adjustments/ui/unit-flags/suk-unit-flags.js",
        "foo",
    ];
    for (const mod of overrides) {
        import(mod)
            .then(_mod => console.warn(`bz-unit-flags: override=${mod}`))
            .catch((_err) => console.warn(`bz-unit-flags: skipped=${mod}`));
    }
    console.warn(`TRIX INIT`);
    GUFproto.checkUnitPosition = IUFproto.checkUnitPosition = function(unit) {
        // console.warn(`TRIX OK`);
        UnitFlagManager.instance.recalculateFlagOffsets(unit.location);
    }
};
engine.whenReady.then(override);
