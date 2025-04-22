/**
 * @file army-commander-flags
 * @copyright 2021, Firaxis Games
 * @description Special unit flag for army commanders.
 * The flag manages the lifetime and update of any additional 3D pieces and/or overlays.
 */
import { UnitFlagManager, UnitFlagFactory } from '/base-standard/ui/unit-flags/unit-flag-manager.js';
import { GenericUnitFlag } from '/base-standard/ui/unit-flags/unit-flags.js';
class ArmyCommanderFlagMaker {
    constructor() {
        this.onUnitCommandStartedListener = this.onUnitCommand.bind(this);
    }
    initialize() {
        engine.on('UnitAddedToArmy', this.onUnitArmyChange, this);
        engine.on('UnitRemovedFromArmy', this.onUnitArmyChange, this);
        engine.on('UnitPromoted', this.onUnitPromoted, this);
        engine.on('UnitCommandStarted', this.onUnitCommandStartedListener, this);
    }
    isMatch(unit, _unitDefinition, _others) {
        if (unit.isCommanderUnit) { // Handles flags for all commanders
            return true;
        }
        return false;
    }
    getComponentName() {
        return "army-commander-flag";
    }
    /**
     * Handler for events specific for this type (army commander) flags.
     * Obtains the apporpriate instance from the manager and updates based on
     * a unit being added or removed.
     * @param {Unit_Army_EventData} data
     */
    onUnitArmyChange(data) {
        const unitFlag = UnitFlagManager.instance.getFlag(data.initiatingUnit);
        if (unitFlag) {
            // TODO: Wait a frame because the new numbers aren't ready quite yet (GameCore is investigating)
            window.requestAnimationFrame(() => {
                unitFlag.updateArmy();
            });
        }
    }
    onUnitCommand(data) {
        if (data.command == Database.makeHash("UNITCOMMAND_NAME_UNIT")) {
            const unitFlag = UnitFlagManager.instance.getFlag(data.unit);
            if (!unitFlag) {
                return;
            }
            unitFlag.updateTooltip();
        }
    }
    onUnitPromoted(data) {
        const unitFlag = UnitFlagManager.instance.getFlag(data.unit);
        if (!unitFlag) {
            // May be opponent and not visible yet.
            return;
        }
        unitFlag.updatePromotions();
    }
}
class ArmyCommanderFlag extends GenericUnitFlag {
    constructor() {
        super(...arguments);
        this.armyFlags = [];
    }
    onAttach() {
        super.onAttach();
        this.updateArmy();
    }
    updateArmy() {
        this.realizeArmyInfo();
    }
    updateTooltip() {
        this.realizeTooltip();
    }
    realizeArmyInfo() {
        const unit = this.unit;
        if (unit && unit.armyId) {
            const army = Armies.get(unit.armyId);
            if (army) {
                let unitFlagArmyContainer = this.Root.querySelector(".unit-flag__container");
                if (unitFlagArmyContainer != null) {
                    this.armyFlags.forEach((flag) => {
                        unitFlagArmyContainer?.removeChild(flag);
                    });
                    this.armyFlags = [];
                    if (army.unitCount > 1) {
                        for (let index = 1; index < army.unitCount; index++) {
                            const unitFlagInnerShape = document.createElement('div');
                            unitFlagInnerShape.classList.add('unit-flag__stack-shape', 'unit-flag__shape--inner', 'pointer-events-none', 'absolute', 'inset-0', 'bg-no-repeat');
                            unitFlagInnerShape.style.setProperty('--stackOffset', index.toString());
                            unitFlagInnerShape.style.fxsBackgroundImageTint = UI.Player.getPrimaryColorValueAsString(this.componentID.owner);
                            unitFlagArmyContainer.insertBefore(unitFlagInnerShape, unitFlagArmyContainer.childNodes[0]);
                            this.armyFlags.push(unitFlagInnerShape);
                            const unitFlagOutterStackShape = document.createElement('div');
                            unitFlagOutterStackShape.classList.add('unit-flag__stack-shape', 'unit-flag__shape--outer', 'pointer-events-none', 'absolute', 'inset-0', 'bg-no-repeat');
                            unitFlagOutterStackShape.style.setProperty('--stackOffset', index.toString());
                            unitFlagOutterStackShape.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(this.componentID.owner);
                            unitFlagArmyContainer.insertBefore(unitFlagOutterStackShape, unitFlagArmyContainer.childNodes[0]);
                            this.armyFlags.push(unitFlagOutterStackShape);
                        }
                    }
                }
                let numCivilians = 0;
                const armyUnits = army.getUnitIds();
                // Unit 0 is always the commander in an army, so start with index 1
                for (let i = 1; i < armyUnits.length; i++) {
                    const armyUnit = Units.get(armyUnits[i]);
                    if (armyUnit) {
                        const unitDef = GameInfo.Units.lookup(armyUnit.type);
                        if (unitDef) {
                            // if this is a civilian unit, count it there
                            if (unitDef.FormationClass == "FORMATION_CLASS_CIVILIAN") {
                                numCivilians++;
                            }
                        }
                    }
                }
                const armyStats = this.Root.querySelector('.unit-flag__army-stats');
                if (armyStats) {
                    // the commander is included in the unit count, but not the capacity.
                    // to avoid confusion, we don't count/show the commander.
                    const unitCount = army.unitCount - 1;
                    if (numCivilians > 0) {
                        armyStats.textContent = `${unitCount - numCivilians}|${army.combatUnitCapacity} + ${numCivilians}`;
                    }
                    else {
                        armyStats.textContent = `${unitCount}|${army.combatUnitCapacity}`;
                    }
                }
            }
        }
    }
}
Controls.define('army-commander-flag', {
    createInstance: ArmyCommanderFlag,
    description: 'Army Commander Unit Flag',
    classNames: ['unit-flag', 'allowCameraMovement'],
    styles: ["fs://game/base-standard/ui/unit-flags/unit-flags.css"]
});
UnitFlagFactory.registerStyle(new ArmyCommanderFlagMaker());

//# sourceMappingURL=file:///base-standard/ui/unit-flags/army-commander-flags.js.map
