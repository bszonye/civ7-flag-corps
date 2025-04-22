/**
 * @file unit-info
 * @copyright 2021, Firaxis Games
 * @description Additional (3d model, Fx, etc..) UI for a unit's information
 */
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';
var PipColors;
(function (PipColors) {
    PipColors[PipColors["normal"] = 4283826175] = "normal";
})(PipColors || (PipColors = {}));
class Unit3DInfo {
    set enabled(isEnabled) {
        if (isEnabled == this._enabled) {
            return; // nothing to do.
        }
        this._enabled = isEnabled;
        if (this._enabled) {
            this.movementModelGroup = WorldUI.createModelGroup("movementPips");
        }
        else {
            this.movementModelGroup.destroy();
        }
    }
    constructor(componentID) {
        this.movementModelGroup = WorldUI.createModelGroup("movementPips");
        /// Is 3D information turned off?
        this._enabled = false;
        this.componentID = componentID;
    }
    Destroy() {
        this.movementModelGroup.destroy();
    }
    /**
     * Place pips on the hex based on remaining movement.
     * @param movesRemaining
     */
    setMoves(movesRemaining) {
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
        const unit = this.unit;
        const plot = { i: unit.location.x, j: unit.location.y };
        const parameters = { followTerrain: true, angle: 0, alpha: 0.7, color: PipColors.normal };
        // Fill up remaining pips.
        this.movementModelGroup.clear();
        for (let pipIndex = 0; pipIndex < movesRemaining; pipIndex++) {
            this.movementModelGroup.addModelAtPlot("UI_Movement_Pip", plot, PipHexPlacement[pipIndex], parameters);
        }
        // Fill up remaining slots with empty "used" pips.
        let max = unit.Movement?.formationMaxMoves;
        if (max != undefined) {
            if (max > PipHexPlacement.length) {
                console.log(`unit.Movement?.formationMaxMoves (${max}) is higher than expected.`);
                max = PipHexPlacement.length;
            }
            for (let pipIndex = movesRemaining; pipIndex < max; pipIndex++) {
                this.movementModelGroup.addModelAtPlot("UI_Movement_Pip_Empty", plot, PipHexPlacement[pipIndex], parameters);
            }
        }
    }
    get unit() {
        const unit = Units.get(this.componentID);
        if (!unit) {
            console.error("Failed attempt to get a unit for unit 3D info: ", ComponentID.toLogString(this.componentID));
        }
        return unit;
    }
}
export { Unit3DInfo as default };

//# sourceMappingURL=file:///base-standard/ui/unit-flags/unit-info.js.map
