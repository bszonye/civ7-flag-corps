/**
 * @file unit-info
 * @copyright 2021, Firaxis Games
 * @description Additional (3d model, Fx, etc..) UI for a unit's information
 */

import { ComponentID } from '/core/ui/utilities/utilities-component-id.js'


enum PipColors {
	normal = 0xFF55FFFF,
}

class Unit3DInfo {
	private componentID: ComponentID;
	private movementModelGroup: WorldUI.ModelGroup = WorldUI.createModelGroup("movementPips");

	/// Is 3D information turned off?
	private _enabled: boolean = false;
	set enabled(isEnabled: boolean) {
		if (isEnabled == this._enabled) {
			return;	// nothing to do.
		}

		this._enabled = isEnabled;
		if (this._enabled) {
			this.movementModelGroup = WorldUI.createModelGroup("movementPips");
		} else {
			this.movementModelGroup.destroy();
		}

	}

	constructor(componentID: ComponentID) {
		this.componentID = componentID;
	}

	Destroy() {
		this.movementModelGroup.destroy();
	}

	/**
	 * Place pips on the hex based on remaining movement.
	 * @param movesRemaining 
	 */
	setMoves(movesRemaining: number) {
		if (!this._enabled) {
			return;
		}

		// TODO: Move this to module level once we support modules. (putting there now will result in multiple defines)
		const PipHexPlacement = [
			{ x: 0, y: -0.45, z: 0 },
			{ x: -0.2, y: -0.37, z: 0 },
			{ x: 0.2, y: -0.37, z: 0 },
			{ x: -0.4, y: -0.25, z: 0 },
			{ x: 0.4, y: -0.25, z: 0 }
		];
		if (movesRemaining > PipHexPlacement.length) {
			console.log(`Warning: movesRemaining is higher than expected ${movesRemaining}`);
			movesRemaining = PipHexPlacement.length;
		}
		const unit: Unit = this.unit;
		const plot: int2 = { i: unit.location.x, j: unit.location.y };
		const parameters: object = { followTerrain: true, angle: 0, alpha: 0.7, color: PipColors.normal };

		// Fill up remaining pips.
		this.movementModelGroup.clear();
		for (let pipIndex: number = 0; pipIndex < movesRemaining; pipIndex++) {
			this.movementModelGroup.addModelAtPlot("UI_Movement_Pip", plot, PipHexPlacement[pipIndex], parameters);
		}

		// Fill up remaining slots with empty "used" pips.
		let max: number | undefined = unit.Movement?.formationMaxMoves;
		if (max != undefined) {
			if (max > PipHexPlacement.length) {
				console.log(`unit.Movement?.formationMaxMoves (${max}) is higher than expected.`);
				max = PipHexPlacement.length;
			}

			for (let pipIndex: number = movesRemaining; pipIndex < max; pipIndex++) {
				this.movementModelGroup.addModelAtPlot("UI_Movement_Pip_Empty", plot, PipHexPlacement[pipIndex], parameters);
			}
		}
	}

	private get unit(): Unit {
		const unit: Unit | null = Units.get(this.componentID);
		if (!unit) {
			console.error("Failed attempt to get a unit for unit 3D info: ", ComponentID.toLogString(this.componentID));
		}
		return unit!;
	}
}

export { Unit3DInfo as default }
