/**
 * @file Unit Flag Manger
 * @copyright 2021-2023, Firaxis Games
 * @description Handle showing information for units. 
 */

import { ComponentID } from '/core/ui/utilities/utilities-component-id.js'
import UpdateGate from '/core/ui/utilities/utilities-update-gate.js';


export interface UnitFlagType {
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
	updateTop(position: number): void

	Destroy(): void;
}

export interface UnitFlagFactoryMaker {
	/**
	 * Called when a factory is registered so that it can register events.
	 */
	initialize(): void;

	/**
	 * Is this the best unit flag factory to be used for creating unit flags for this type?
	 * @param {Unit} unit - the unit being created
	 * @param {UnitDefinition} unitDefinition - Definition of the unit type being created
	 * @param {UnitFlagFactory[]} [others] - other factories that match creating for this unit; if populated its assumed to contain this factory as well
	 */
	isMatch(unit: Unit, unitDefinition: UnitDefinition, otherMatchingFactories?: UnitFlagFactoryMaker[]): boolean;

	/**
	 * @returns The name of a custom HTML component to instantiate.
	 */
	getComponentName(): string;
}

/**
 * Helper to determine if an object implemented the UnitFlagType interface.
 * @param object - Object to check out.
 * @returns true if object implements the UnitFlagType interface, false otherwise.
 */
export function instanceOfUnitFlagType(object: any): object is UnitFlagType {
	return (
		object != null &&
		'componentID' in object &&	// TODO: Fix, doesn't match!
		'unit' in object);
}


/**
 * 
 */
export class UnitFlagFactory {
	private static makers: Map<string, UnitFlagFactoryMaker> = new Map();// { [componentName: string]: UnitFlagFactoryMaker } = {};

	/**
	 * Register a "maker" class that can determine what component should be used	 to make a particulr type of unit flag.
	 * @param {UnitFlagFactoryMaker} makerInstance Instance of a "maker" which has the name of HTML component type to instantiate.
	 */
	static registerStyle(makerInstance: UnitFlagFactoryMaker) {
		const componentName: string = makerInstance.getComponentName();
		if (UnitFlagFactory.makers.has(componentName)) {
			console.warn("Redefining unit flag style '" + componentName + "', is that the intention?");
		}
		UnitFlagFactory.makers.set(componentName, makerInstance);
		makerInstance.initialize();

		// If the UnitFlagManager is already created, request a rebuild since if the flags already exist the handler just added may be able to create a better suited associated style.
		if (UnitFlagManager.instance) {
			UnitFlagManager.instance.requestFlagsRebuild();
		}
	}

	static getBestHTMLComponentName(componentID: ComponentID): string {

		let defaultHTMLComponent: string = "unit-flag";

		const unit: Unit | null = Units.get(componentID);
		if (!unit) {
			console.warn("Using default flag; unable to get HTML component name for a unit due to a cid not matching a unit. cid: ", ComponentID.toLogString(componentID));
			return defaultHTMLComponent;
		}
		const unitDefinition: UnitDefinition | null = GameInfo.Units.lookup(unit.type);
		if (!unitDefinition) {
			console.warn("Using default flag; unable to get HTML component name for a unit due to a missing unit defintion for: ", unit.type, "  cid: ", ComponentID.toLogString(componentID));
			return defaultHTMLComponent;
		}

		// Loop through finding all matches.
		let matches: UnitFlagFactoryMaker[] = [];
		for (let maker of UnitFlagFactory.makers.values()) {
			if (maker.isMatch(unit, unitDefinition)) {
				matches.push(maker);
			}
		}
		if (matches.length > 0) {
			for (let maker of matches) {
				if (maker.isMatch(unit, unitDefinition, matches)) {
					return maker.getComponentName();
				}
			}
		}
		console.warn("Returning the default unit flag to use because of no matches (including the default!): ", unit.type, "  cid: ", ComponentID.toLogString(componentID));
		return defaultHTMLComponent;
	}
}


/**
 * Manages lifetime of unit flags.
 */
export class UnitFlagManager extends Component {

	unitFlagZoomScale: number = 1;

	private flags: Map<Number, UnitFlagType> = new Map<Number, UnitFlagType>();
	private rebuildPending: boolean = false;		/// Should all flags be rebuilt.
	private globalHide: boolean = false;

	/** Flag set by debug panel to disable all unit flags. */
	private systemDisabled: boolean = false;

	/** Flag set by debug panel to generate a ton of test units. */
	private stressTestUnitsEnabled: boolean = false;

	/** Array of generated test units used to remove them when the stress test is disabled. */
	private stressTestUnits: {
		Kind: string,
		Type: string,
		Location: PlotCoord,
		Owner: PlayerId,
	}[] = [];

	private globalHideListener = this.onGlobalHide.bind(this);
	private globalShowListener = this.onGlobalShow.bind(this);
	private interactUnitShowListener = this.onInteractUnitShow.bind(this);
	private interactUnitHideListener = this.onInteractUnitHide.bind(this);
	private uiDisableUnitFlagsListener = this.onDisableFlags.bind(this);
	private uiEnableUnitFlagsListener = this.onEnableFlags.bind(this);

	private zoomLevel: number = 1;

	private styleMap: StylePropertyMap | null = null;
	private opacityStyle = CSS.number(1);

	private flagOffsetUpdateGate: UpdateGate = new UpdateGate(this.onRecalculateFlagOffsets.bind(this));
	private plotIndicesToCheck: Set<number> = new Set<number>();

	private flagRoots = new Map<PlayerId, HTMLDivElement>();

	private static _instance: UnitFlagManager | null = null;
	static get instance(): UnitFlagManager {
		return UnitFlagManager._instance!;
	}

	/**
	 * Onetime callback on creation.
	 */
	onInitialize() {
		this.styleMap = this.Root.attributeStyleMap;
		this.styleMap.set('opacity', this.opacityStyle);

		if (UnitFlagManager._instance == null) {
			UnitFlagManager._instance = this;
		} else {
			console.error("Multiple unit flag manager are attempting to be created, but it's a singleton!");
		}

		// Register debug widget.
		const disableUnitIcons: UIDebugWidgetDefinition = {
			id: 'disableUnitIcons',
			category: 'Systems',
			caption: 'Disable Unit Icons',
			domainType: 'bool',
			value: false,
		};

		const stressTestUnits: UIDebugWidgetDefinition = {
			id: 'stressTestUnitIcons',
			category: 'Profiling',
			caption: 'Stress Test Unit Icons',
			domainType: 'bool',
			value: false,
		};

		UI.Debug.registerWidget(disableUnitIcons);
		UI.Debug.registerWidget(stressTestUnits);

		engine.on('DebugWidgetUpdated', (id: string, value: boolean) => {
			if (id == 'disableUnitIcons') {
				const systemWasDisabled = this.systemDisabled;
				this.systemDisabled = value;

				if (!systemWasDisabled && value) {
					this.removeAllFlags();
				}

				if (systemWasDisabled && !value) {
					this.requestFlagsRebuild();
				}
			}
			else if (id == 'stressTestUnitIcons') {
				const stressTestUnitsEnabled = this.stressTestUnitsEnabled;
				this.stressTestUnitsEnabled = value;

				if (!stressTestUnitsEnabled && value) {
					this.removeAllFlags();
					this.createStressTestFlags();
				}

				if (stressTestUnitsEnabled && !value) {
					this.removeStressTestUnits();
					this.removeAllFlags();
					this.requestFlagsRebuild();
				}
			}
		});
	}

	onAttach() {
		super.onAttach();

		window.addEventListener('ui-hide-unit-flags', this.globalHideListener);
		window.addEventListener('ui-show-unit-flags', this.globalShowListener);
		window.addEventListener("unit-actions-show", this.interactUnitShowListener);
		window.addEventListener("unit-actions-hide", this.interactUnitHideListener);
		window.addEventListener('ui-disable-unit-flags', this.uiDisableUnitFlagsListener);
		window.addEventListener('ui-enable-unit-flags', this.uiEnableUnitFlagsListener);

		engine.on('CameraChanged', this.onZoomChange, this);
		engine.on('CityInitialized', this.onCityInitialized, this);
		engine.on('UnitDamageChanged', this.onUnitDamageChanged, this);
		engine.on('UnitMovementPointsChanged', this.onUnitMovementPointsChanged, this);
		engine.on('UnitRemovedFromMap', this.onUnitRemovedFromMap, this);
		engine.on('UnitVisibilityChanged', this.onUnitVisibilityChanged, this);

		this.setZoomLevel(Camera.getState().zoomLevel ?? 1);

		// Purposely wait one frame to prevent a build with an immediate rebuild occuring due to flag styles being registered later this same frame.
		window.requestAnimationFrame(() => {
			this.requestFlagsRebuild();
		});
	}

	onDetach() {
		window.removeEventListener('ui-hide-unit-flags', this.globalHideListener);
		window.removeEventListener('ui-show-unit-flags', this.globalShowListener);
		window.removeEventListener("unit-actions-show", this.interactUnitShowListener);
		window.removeEventListener("unit-actions-hide", this.interactUnitHideListener);
		engine.off('CameraChanged', this.onZoomChange, this);
		engine.off('CityInitialized', this.onCityInitialized, this);
		engine.off('UnitDamageChanged', this.onUnitDamageChanged, this);
		engine.off('UnitMovementPointsChanged', this.onUnitMovementPointsChanged, this);
		engine.off('UnitRemovedFromMap', this.onUnitRemovedFromMap, this);
		engine.off('UnitVisibilityChanged', this.onUnitVisibilityChanged, this);

		this.removeAllFlags();

		super.onDetach();
	}

	/**
	 * Obtain a root element that contains all unit flags for a given player.
	 * This helps partition the flags so that certain changes (add/remove) do not invalidate all flags.
	 * @param playerId The player id associated with the unit flag root.
	 * @returns 
	 */
	getFlagRoot(playerId: PlayerId) {
		let root = this.flagRoots.get(playerId);
		if (!root) {
			root = document.createElement("div");
			root.classList.add('fullscreen');
			this.Root.appendChild(root);
			this.flagRoots.set(playerId, root);
		}
		return root;
	}

	getFlag(componentID: ComponentID): UnitFlagType | undefined {
		const bitfieldID: number = ComponentID.toBitfield(componentID);
		const unitFlag: UnitFlagType | undefined = this.flags.get(bitfieldID);
		return unitFlag;
	}

	recalculateFlagOffsets(location: float2) {
		/**
		 * This is a stop-gap measure for now.
		 * Ideally, the position of the unit flag should be 100% controlled by the C++ location model to minimize the work and updates being made.
		 */
		const index = GameplayMap.getIndexFromLocation(location);
		this.plotIndicesToCheck.add(index);
		this.flagOffsetUpdateGate.call('recalculateFlagOffsets');
	}

	private onRecalculateFlagOffsets() {
		for (const plotIndex of this.plotIndicesToCheck) {
			const location = GameplayMap.getLocationFromIndex(plotIndex);
			const units: ComponentID[] = MapUnits.getUnits(location.x, location.y);

			for (let u: number = 0; u < units.length; u++) {
				const unitFlag = UnitFlagManager.instance.getFlag(units[u]);
				if (unitFlag) {
					unitFlag.updateTop(u);
				}
				else {
					console.error("unit-flag-manager: onRecalculateFlagOffsets(): Unit flag's for unit " + ComponentID.toLogString(units[u]) + " is not found");
				}
			}
		}
		this.plotIndicesToCheck.clear();
	}

	private onInteractUnitShow(event: CustomEvent) {
		const sourceUnit: ComponentID = event.detail.unitId;
		for (let [, flag] of this.flags) {
			const unit = flag.unit;
			if (unit) {
				if (ComponentID.isMatch(sourceUnit, unit.id)) {
					flag.hide();	// Hide the flag as the interact is hiding.
				}
			}
		}
	}

	private onInteractUnitHide(event: CustomEvent) {
		const sourceUnit: ComponentID = event.detail.unitId;
		for (let [, flag] of this.flags) {
			const unit = flag.unit;
			if (unit) {
				if (ComponentID.isMatch(sourceUnit, unit.id)) {
					flag.show();	// Show the flag as the interact is hiding.
				}
			}
		}
	}

	private onDisableFlags() {
		for (let [, flag] of this.flags) {
			flag.disable();
		}
	}

	private onEnableFlags() {
		for (let [, flag] of this.flags) {
			flag.enable();
		}
	}

	private onUnitDamageChanged(data: UnitDamageChanged_EventData) {
		const unitFlag: UnitFlagType | undefined = this.getFlag(data.unit);
		// unit can't be found, it might be part of an army in which case don't warn
		if (!unitFlag) {
			if (!this.isUnitInArmy(data.unit)) {
				console.error("A unit's health changed but couldn't obtain its unit flag.  cid: " + ComponentID.toLogString(data.unit));
			}
			return;
		}
		unitFlag.updateHealth();
	}

	private onUnitMovementPointsChanged(data: UnitMovementPointsChanged_EventData) {
		const unitFlag: UnitFlagType | undefined = this.getFlag(data.unit);
		if (!unitFlag) {
			// May be opponent and not visible yet.
			return;
		}
		unitFlag.updateMovement();
	}

	private onUnitRemovedFromMap(data: Unit_EventData) {
		const unitFlag: UnitFlagType | undefined = this.getFlag(data.unit);
		if (!unitFlag) {
			console.error("A unit was removed from the map but couldn't obtain its unit flag.  cid: " + ComponentID.toLogString(data.unit));
			return;
		}
		unitFlag.Destroy();
	}

	private onZoomChange(cameraState: CameraState) {
		const zoomLevel = cameraState.zoomLevel;
		if (this.zoomLevel == zoomLevel || isNaN(zoomLevel)) {
			return;
		}
		this.setZoomLevel(zoomLevel);
	}

	private calculateZoom(zoomLevel: number): number {
		const invertedZoom: number = 1 - zoomLevel;
		const zoomEased: number = invertedZoom * invertedZoom * invertedZoom;
		return zoomEased
	}

	private setZoomLevel(zoomLevel: number) {
		this.zoomLevel = zoomLevel;
		const zoomEased: number = this.calculateZoom(zoomLevel);
		this.unitFlagZoomScale = zoomEased;

		const value = Math.round((1 - zoomEased) / .25);
		if (value != this.opacityStyle.value) {
			this.opacityStyle.value = value;
			this.styleMap?.set('opacity', this.opacityStyle);
		}
	}

	private isUnitInArmy(unitID: ComponentID): boolean {
		const unit: Unit | null = Units.get(unitID);
		if (unit && unit.armyId) {
			const army: Army | null = Armies.get(unit.armyId);
			if (army) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Engine callback when visibility of a unit changed.
	 * Using this instead of UnitAddedToMap because of event race condition in looking up a valid Unit in WorldAnchor.
	 * @param {UnitVisibilityChanged_EventData} data 
	 */
	onUnitVisibilityChanged(data: UnitVisibilityChanged_EventData) {
		// Can't use onAdd to check because this always triggers in the case an enemy unit is first revealed.
		const componentID: ComponentID = data.unit;
		const bitfieldID: number = ComponentID.toBitfield(componentID);

		if (!this.flags.has(bitfieldID)) {
			this.createFlag(componentID);
			return;
		}

		const unitFlag: UnitFlagType | undefined = this.flags.get(bitfieldID);
		if (!unitFlag) {
			console.error("A valid UnitFlagType was not returned from the unit flag manager. cid: " + ComponentID.toLogString(componentID));
			return;
		}
		unitFlag.setVisibility(data.visibility);
	}

	private removeAllFlags() {
		this.Root.innerHTML = '';
		this.flagRoots.clear();
		this.flags = new Map<Number, UnitFlagType>()
	}

	removeStressTestUnits() {
		for (const u of this.stressTestUnits) {
			Game.PlayerOperations.sendRequest(u.Owner, 'DESTROY_ELEMENT', u);
		}
	}

	createStressTestFlags() {

		const stressTestUnits = this.stressTestUnits;

		function getRandom(array: any[]): any {
			return array[Math.floor(Math.random() * array.length)];
		}

		function createStressUnit(playerID: PlayerId, unitType: string, x: number, y: number) {
			let plotCoordinate = { x: x, y: y };

			//const type: string = type; //"UNIT_SCOUT";
			const args: any = {
				Kind: "UNIT",
				Type: unitType,
				Location: plotCoordinate,
				Owner: playerID
			};

			stressTestUnits.push(args);
			Game.PlayerOperations.sendRequest(args.Owner, 'CREATE_ELEMENT', args);
			console.log(`Creating ${unitType} at ${x}x${y}.`);
		}

		const alivePlayers = Players.getAliveIds();
		const trainableUnits = GameInfo.Units.filter(u => u.CanTrain && u.FormationClass != 'FORMATION_CLASS_COMMAND');
		const landOrAirUnits = trainableUnits.filter(u => u.Domain == 'DOMAIN_LAND' || u.Domain == 'DOMAIN_AIR').map(u => u.UnitType);
		const waterOrAirUnits = trainableUnits.filter(u => u.Domain == 'DOMAIN_SEA' || u.Domain == 'DOMAIN_AIR').map(u => u.UnitType);

		const xlow: number = 0;
		const xhigh: number = GameplayMap.getGridWidth();
		const ylow: number = 0;
		const yhigh: number = GameplayMap.getGridHeight();
		for (let x = xlow; x <= xhigh; x++) {
			for (let y = ylow; y < yhigh; y++) {

				///createStressUnit(getRandom(alivePlayers), 'UNIT_WARRIOR', x, y);
				const terrainType = GameplayMap.getTerrainType(x, y);
				const terrain = GameInfo.Terrains.lookup(terrainType);

				if (terrain) {
					if (terrain.TerrainType == "TERRAIN_HILL" || terrain.TerrainType == "TERRAIN_FLAT") {
						createStressUnit(getRandom(alivePlayers), getRandom(landOrAirUnits), x, y);
					}
					else if (terrain.TerrainType == "TERRAIN_COAST") {
						createStressUnit(getRandom(alivePlayers), getRandom(waterOrAirUnits), x, y);
					}
				}
			}
		}
	}


	/**
	 * Make a request to rebuild all flags next frame.
	 * Not necessary initially but found when hotloading, sometimes the flags were
	 * being built before all flag handlers were registered.
	 */
	requestFlagsRebuild() {
		if (this.rebuildPending || this.systemDisabled) {
			return;
		}
		this.rebuildPending = true;
		window.requestAnimationFrame(() => { this.checkFlagRebuild(); });
	}

	/**
	 * Handles kick off creating all flags or waiting if the component isn't built yet.
	 */
	checkFlagRebuild() {
		if (this.systemDisabled) {
			return;
		}

		if (!this.rebuildPending) {
			console.warn("unit-flag-manager: Check to rebuild the flags called but no rebuild pending!");
			return;
		}
		if (!this.Root.isConnected) {
			window.requestAnimationFrame(() => { this.checkFlagRebuild(); });
			return;
		}
		this.rebuildPending = false;
		if (this.flags.size > 0) {
			this.removeAllFlags();
		}
		this.createAllFlags();
	}

	/**
	 * Create all unit flags.
	 * TODO: Evaluate if it this will be removed; one of three things must happen first:
	 * 		An equivalent of a playerVisibility( x, y) call exposure is made
	 * 		The revealed visibility of a unit can be checked on the unit object
	 * 		The UnitVisibilityChanged call is guaranteed to fire for units when they are first created
	 */
	private createAllFlags() {
		const playerList: PlayerLibrary[] = Players.getAlive();
		for (const playerLibrary of playerList) {
			const playerUnits: PlayerUnits | undefined = playerLibrary.Units;
			if (playerUnits == undefined) {
				continue;
			}
			const unitIDs: ComponentID[] = playerUnits.getUnitIds();
			for (const unitID of unitIDs) {
				this.createFlag(unitID);
			}
		}
	}

	/**
	 * Create a unit flag associated with a unit ID. External access for panels.
	 * @param {ComponentID} unitID The cid that represents the unit.
	 */
	createFlagComponent(unitID: ComponentID): HTMLElement | undefined {
		const unit: Unit | null = Units.get(unitID);
		if (!unit) {
			console.warn("Cannot create unit flag for null unit object with ID: " + ComponentID.toLogString(unitID));
			return;
		}

		const tagName: string = UnitFlagFactory.getBestHTMLComponentName(unitID);
		const flag = document.createElement(tagName);
		flag.setAttribute('unit-id', ComponentID.toString(unitID));
		flag.setAttribute('manager-tracked', 'false');
		return flag;
	}

	/**
	 * Create a unit flag associated with a unit ID.
	 * @param {ComponentID} unitID The cid that represents the unit.
	 */
	private createFlag(unitID: ComponentID) {
		const unit: Unit | null = Units.get(unitID);
		if (!unit) {
			console.warn("Cannot create unit flag for null unit object with ID: " + ComponentID.toLogString(unitID));
			return;
		}

		if (!unit.isOnMap) {
			return;	// Don't create flags for units that are not on the map.
		}
		// TODO: Add here a lookup to the flag factories and create the approriate flag type based on information about the unit.

		const tagName: string = UnitFlagFactory.getBestHTMLComponentName(unitID);
		const flag = document.createElement(tagName);
		flag.setAttribute('unit-id', ComponentID.toString(unitID));
		const playerRoot = this.getFlagRoot(unit.owner);
		playerRoot?.appendChild(flag);
	}

	/**
	 * @description Called by a unit flag to let manager directly access it's instance.
	 * @param {UnitFlagType} child - flag which manager created.
	 */
	addChildForTracking(child: UnitFlagType) {
		const id: ComponentID = child.unit?.id ?? ComponentID.getInvalidID();
		if (ComponentID.isInvalid(id)) {
			console.error("Unable to connect a unit flag to the manager because the unit has an invalid componentID!");
			return;
		}
		if (this.flags.has(ComponentID.toBitfield(id))) {
			console.error("Attempt to add a unit flag to the manager for tracking but something (itself?) already is added with that id: " + ComponentID.toLogString(id));
			return;
		}
		this.flags.set(ComponentID.toBitfield(id), child);
	}

	/**
	 * @description Called by a unit flag to remove itself from being tracked by the manager
	 * @param {UnitFlagType} child - flag which manager created.
	 */
	removeChildFromTracking(child: UnitFlagType) {
		const id: ComponentID = child.componentID;	// Get the componentID of the unit from the child, don't try and get it from the child.unit, the actual instance is probably already gone by now
		if (ComponentID.isInvalid(id)) {
			console.warn("Unable to remove a unit flag from the manager because the unit has an invalid componentID!");
			return;
		}
		const bitfield = ComponentID.toBitfield(id);
		if (!this.flags.has(bitfield)) {
			console.warn("Attempt to remove a unit flag from the manager for tracking but none exists with that id: " + ComponentID.toLogString(id));
			return;
		}
		this.flags.delete(bitfield);
	}

	/**
	 * @description Game callback; same as CityAddedToMap (same data payload) 
	 * but happens at the end of creation so all values are populated.
	 * @param {CityAddedToMap_EventData} data - Details about created city.
	 */
	private onCityInitialized(data: CityAddedToMap_EventData) {
		// There isn't currently an unambiguous event for an IP being
		// promoted to a City State.  So when a new city is done being
		// added, check if it's that civ's first city and regenerate 
		// unit flags if so.	
		const player: PlayerLibrary | null = Players.get(data.player);
		if (player) {
			const playerCities: PlayerCities | undefined = player.Cities;
			if (playerCities && playerCities.getCities().length == 1) {
				this.requestFlagsRebuild();
			}
		}
	}

	private onGlobalHide() {
		if (!this.globalHide) {
			// We should be able to hide the root element inline, but there's a gameface bug that prevents some children from rendering again
			// this.Root.style.display = 'none';
			this.Root.classList.add('hidden');
			this.globalHide = true;
		}
	}

	private onGlobalShow() {
		if (this.globalHide) {
			// We should be able to hide the root element inline, but there's a gameface bug that prevents some children from rendering again
			// this.Root.style.display = '';
			this.Root.classList.remove('hidden');
			this.globalHide = false;
		}
	}
}


Controls.define('unit-flags', {
	createInstance: UnitFlagManager,
	description: 'Unit flags',
	styles: ['fs://game/base-standard/ui/unit-flags/unit-flags.css']
})
