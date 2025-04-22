/**
 * @file army-commander-flags
 * @copyright 2021, Firaxis Games
 * @description Special unit flag for army commanders.
 * The flag manages the lifetime and update of any additional 3D pieces and/or overlays.
 */

import { UnitFlagManager, UnitFlagFactory, UnitFlagFactoryMaker } from '/base-standard/ui/unit-flags/unit-flag-manager.js'
import { GenericUnitFlag } from '/base-standard/ui/unit-flags/unit-flags.js'

interface ArmyCommanderFlagType {
	/** ComponentID of the unit attached to the flag. */
	componentID: ComponentID;

	/** Get property for the unit associated with the component ID. */
	unit: Unit;

	/** Change the visibility of the unit's flag. */
	setVisibility(state: RevealedStates): void;

	hide(): void;
	show(): void;
	disable(): void;
	enable(): void;
	updateHealth(): void;
	updateMovement(): void;
	updateTop(position: number): void;
	updateArmy(): void;
	updatePromotions(): void;
	updateTooltip(): void;

	Destroy(): void;
}

class ArmyCommanderFlagMaker implements UnitFlagFactoryMaker {

	private onUnitCommandStartedListener = this.onUnitCommand.bind(this);

	initialize() {
		engine.on('UnitAddedToArmy', this.onUnitArmyChange, this);
		engine.on('UnitRemovedFromArmy', this.onUnitArmyChange, this);
		engine.on('UnitPromoted', this.onUnitPromoted, this);
		engine.on('UnitCommandStarted', this.onUnitCommandStartedListener, this);
	}

	isMatch(unit: Unit, _unitDefinition: UnitDefinition, _others?: UnitFlagFactoryMaker[]): boolean {
		if (unit.isCommanderUnit) {		// Handles flags for all commanders
			return true;
		}
		return false;
	}
	getComponentName(): string {
		return "army-commander-flag";
	}

	/**
	 * Handler for events specific for this type (army commander) flags.
	 * Obtains the apporpriate instance from the manager and updates based on 
	 * a unit being added or removed.
	 * @param {Unit_Army_EventData} data 
	 */
	private onUnitArmyChange(data: Unit_Army_EventData) {
		const unitFlag: ArmyCommanderFlagType | undefined = UnitFlagManager.instance.getFlag(data.initiatingUnit) as ArmyCommanderFlagType | undefined;
		if (unitFlag) {
			// TODO: Wait a frame because the new numbers aren't ready quite yet (GameCore is investigating)
			window.requestAnimationFrame(() => {
				unitFlag.updateArmy();
			})
		}
	}

	private onUnitCommand(data: UnitCommand_EventData) {
		if (data.command == Database.makeHash("UNITCOMMAND_NAME_UNIT")) {
			const unitFlag: ArmyCommanderFlagType | undefined = UnitFlagManager.instance.getFlag(data.unit) as ArmyCommanderFlagType;
			if (!unitFlag) {
				return;
			}
			unitFlag.updateTooltip();
		}
	}

	private onUnitPromoted(data: Unit_EventData) {
		const unitFlag: ArmyCommanderFlagType | undefined = UnitFlagManager.instance.getFlag(data.unit) as ArmyCommanderFlagType;
		if (!unitFlag) {
			// May be opponent and not visible yet.
			return;
		}

		unitFlag.updatePromotions();
	}
}

class ArmyCommanderFlag extends GenericUnitFlag implements ArmyCommanderFlagType {
	private armyFlags: HTMLElement[] = [];

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

	private realizeArmyInfo() {
		const unit: Unit | null = this.unit;
		if (unit && unit.armyId) {
			const army: Army | null = Armies.get(unit.armyId);
			if (army) {

				let unitFlagArmyContainer: HTMLElement | null = this.Root.querySelector<HTMLElement>(".unit-flag__container");
				if (unitFlagArmyContainer != null) {
					this.armyFlags.forEach((flag) => {
						unitFlagArmyContainer?.removeChild(flag);
					});
					this.armyFlags = [];
					if (army.unitCount > 1) {
						for (let index: number = 1; index < army.unitCount; index++) {
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

				let numCivilians: number = 0;
				const armyUnits: ComponentID[] = army.getUnitIds();
				// Unit 0 is always the commander in an army, so start with index 1
				for (let i: number = 1; i < armyUnits.length; i++) {
					const armyUnit: Unit | null = Units.get(armyUnits[i]);
					if (armyUnit) {
						const unitDef: UnitDefinition | null = GameInfo.Units.lookup(armyUnit.type);
						if (unitDef) {
							// if this is a civilian unit, count it there
							if (unitDef.FormationClass == "FORMATION_CLASS_CIVILIAN") {
								numCivilians++;
							}
						}
					}
				}

				const armyStats: HTMLElement | null = this.Root.querySelector<HTMLElement>('.unit-flag__army-stats');
				if (armyStats) {
					// the commander is included in the unit count, but not the capacity.
					// to avoid confusion, we don't count/show the commander.
					const unitCount: number = army.unitCount - 1;
					if (numCivilians > 0) {
						armyStats.textContent = `${unitCount - numCivilians}|${army.combatUnitCapacity} + ${numCivilians}`;
					} else {
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
})

UnitFlagFactory.registerStyle(new ArmyCommanderFlagMaker());
