/**
 * @file unit-flags-independent-powers.ts
 * @copyright 2021-2023, Firaxis Games
 * @description Unit flag for independent powers.  These eventually can become city-states.
 */

import { utils } from '/core/ui/graph-layout/utils.js';
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js'
import { Icon } from '/core/ui/utilities/utilities-image.js'
import { UnitFlagFactory, UnitFlagFactoryMaker, UnitFlagManager, UnitFlagType } from '/base-standard/ui/unit-flags/unit-flag-manager.js'
import { InputEngineEvent } from '/core/ui/input/input-support.js';
import { Layout } from '/core/ui/utilities/utilities-layout.js';
import { ActionActivateEvent } from '/core/ui/components/fxs-activatable.js'


/**
 * Create independent powers (IP) flags which are used for city-states as well.
 * Also maintains IP specific states for changes.
 */
class IndependentPowersFlagMaker implements UnitFlagFactoryMaker {

	private static ipflags: Map<number, IndependentPowersUnitFlag[]> = new Map<number, []>();

	initialize() {
		engine.on('DiplomacyEventStarted', (data: DiplomacyEvent_EventData) => { IndependentPowersFlagMaker.onDiplomacyEventStarted(data); });
		engine.on('DiplomacyEventEnded', (data: DiplomacyEvent_EventData) => { IndependentPowersFlagMaker.onDiplomacyEventEnded(data); });
	}

	isMatch(unit: Unit, _unitDefinition: UnitDefinition, _others?: UnitFlagFactoryMaker[]): boolean {
		const playerID: number = unit.owner;
		const player: PlayerLibrary | null = Players.get(playerID);
		if (player?.isIndependent) {
			return true;
		}
		return false;
	}
	getComponentName(): string {
		return "unit-flags-independent-powers";
	}

	static addChildForTracking(index: number, flag: IndependentPowersUnitFlag) {
		let flagsOfIndex: IndependentPowersUnitFlag[] | undefined = this.ipflags.get(index);
		if (flagsOfIndex == undefined) {
			this.ipflags.set(index, [flag]);	// First flag of an index, add it.
			return;
		}
		// If here at least one flag of the index type has been created; make sure it isn't a dupe and add.
		const existingFlag: IndependentPowersUnitFlag | undefined = flagsOfIndex.find(existingFlag => { return ComponentID.isMatch(existingFlag.componentID, flag.componentID) });
		if (existingFlag != undefined) {
			console.error(`unit-flags-independent-powers: Attempt to add a IP unit flag with index ${index} for factory tracking but its already being tracked. cid: ${ComponentID.toLogString(flag.componentID)}`);
			return;
		}
		flagsOfIndex.push(flag);
	}

	static removeChildFromTracking(index: number, flag: IndependentPowersUnitFlag) {
		let flagsOfIndex: IndependentPowersUnitFlag[] | undefined = this.ipflags.get(index);
		if (flagsOfIndex == undefined) {
			console.warn(`unit-flags-independent-powers: Attempt to remove child from tracking at factory but no children of that index '${index}' exist.`);
			return;
		}
		const found: boolean = flagsOfIndex.some((existingFlag: IndependentPowersUnitFlag, index: number, array: IndependentPowersUnitFlag[]) => {
			if (ComponentID.isMatch(existingFlag.componentID, flag.componentID)) {
				array.splice(index, 1);
				return true;
			}
			return false;
		});
		if (!found) {
			console.warn(`unit-flags-independent-powers: Was unable to find flag to delete from factory. index: ${index}, unit: ${ComponentID.toLogString(flag.componentID)}`);
		}
	}

	private static onDiplomacyEventStarted(_data: DiplomacyEvent_EventData) {
		// TODO: use data.location to match up index or type and update only those flags (current updates all)
		IndependentPowersFlagMaker.ipflags.forEach((flagArray: IndependentPowersUnitFlag[]) => {
			flagArray.some((flag: IndependentPowersUnitFlag) => {
				flag.updateAffinity();
			});
		});
	}

	private static onDiplomacyEventEnded(data: DiplomacyEvent_EventData) {
		if (data.location == undefined) {
			return;	// Different diplomacy event, not related to independent powers (affinity changing)
		}
		const playerID: PlayerId = GameplayMap.getOwner(data.location.x, data.location.y);
		const player: PlayerLibrary | null = Players.get(playerID);
		if (!player) {
			return;	// Valid for some diplomacy events: No one owns the plot location.
		}
		const independentID: PlayerId = Game.IndependentPowers.getIndependentPlayerIDAt(data.location.x, data.location.y)
		if (independentID == PlayerIds.NO_PLAYER) {
			return; // Valid for events not related to independents.
		}
		const flagArray: IndependentPowersUnitFlag[] | undefined = IndependentPowersFlagMaker.ipflags.get(independentID);
		if (flagArray == undefined) {
			return; // No flag for that type exist.
		}
		flagArray.some((flag: IndependentPowersUnitFlag) => {
			flag.updateAffinity();
		});
	}


}


export class IndependentPowersUnitFlag extends Component implements UnitFlagType {

	private _componentID: ComponentID = ComponentID.getInvalidID();
	private _worldAnchor: number | null = null;
	private engineInputListener: EventListener = (inputEvent: InputEngineEvent) => { this.onEngineInput(inputEvent); }
	private unitContainer: HTMLElement | null = null;
	private unitHealthBar: HTMLElement | null = null;
	private unitHealthBarInner: HTMLElement | null = null;
	private unitFlagIcon: HTMLElement | null = null;
	private isHidden: boolean = false;
	private independentID: PlayerId = PlayerIds.NO_PLAYER;

	/** 
	 * A vertical offset when the unit is 'stacked' with other units.
	 * TODO - The unit world anchor should be able to incorporate this offset in C++ to avoid constantly recalculating this in Script.
	 */
	private flagOffset: number = 0;

	onAttach() {
		super.onAttach();

		const id = this.Root.getAttribute('unit-id');
		this._componentID = ComponentID.fromString(id);

		// Obtain player colors used later on.
		let playerColorPri: string = 'rgb(0, 0, 0)';
		let playerColorSec: string = 'rgb(255, 255, 255)';

		const unitFlagContainer = document.createElement('div');
		unitFlagContainer.classList.add('unit-flag__container', 'absolute', '-top-6', '-left-6', 'pointer-events-auto', 'flex', 'flex-col', 'justify-center', 'items-center', 'w-12', 'h-12');
		this.unitContainer = unitFlagContainer;
		this.unitContainer.style.left = '0';

		const unitFlagShadow = document.createElement('div');
		unitFlagShadow.classList.add('unit-flag__shadow', 'pointer-events-none', 'absolute', 'inset-0', 'bg-cover');
		unitFlagContainer.appendChild(unitFlagShadow);

		if (this.componentID.owner == GameContext.localObserverID) {
			const unitFlagHighlight = document.createElement('div');
			unitFlagHighlight.classList.add('unit-flag__highlight', 'opacity-0', 'pointer-events-none', 'absolute', 'bg-no-repeat');
			unitFlagContainer.appendChild(unitFlagHighlight);
		}

		const unitFlagInnerShape = document.createElement('div');
		unitFlagInnerShape.classList.add('unit-flag__shape', 'unit-flag__shape--inner', "pointer-events-none", "absolute", "inset-0", "bg-no-repeat");
		unitFlagInnerShape.style.filter = `fxs-color-tint(${playerColorPri})`;
		unitFlagContainer.appendChild(unitFlagInnerShape);

		const unitFlagOuterShape = document.createElement('div');
		unitFlagOuterShape.classList.add('unit-flag__shape', 'unit-flag__shape--outer', "pointer-events-none", "absolute", "inset-0", "bg-no-repeat");
		unitFlagOuterShape.style.filter = `fxs-color-tint(${playerColorSec})`;
		unitFlagContainer.appendChild(unitFlagOuterShape);

		const unitFlagHealthbarContainer = document.createElement('div');
		unitFlagHealthbarContainer.classList.add('unit-flag__healthbar-container', 'absolute', 'h-full', 'self-center', 'pointer-events-none');
		unitFlagContainer.appendChild(unitFlagHealthbarContainer);

		const unitFlagHealthbar = document.createElement('div');
		unitFlagHealthbar.classList.add('unit-flag__healthbar', 'relative', 'h-3', 'w-full', 'bg-black');
		unitFlagHealthbarContainer.appendChild(unitFlagHealthbar);
		this.unitHealthBar = unitFlagHealthbar;

		const unitFlagHealthbarInner = document.createElement('div');
		unitFlagHealthbarInner.classList.add('unit-flag__healthbar-inner', 'absolute', 'h-2', 'bg-no-repeat');
		unitFlagHealthbar.appendChild(unitFlagHealthbarInner);
		this.unitHealthBarInner = unitFlagHealthbarInner;

		const unitFlagIcon = document.createElement('div');
		unitFlagIcon.classList.add('unit-flag__icon', 'pointer-events-none', 'absolute', 'bg-contain', 'bg-no-repeat');
		unitFlagIcon.style.filter = `fxs-color-tint(${playerColorSec})`;
		unitFlagContainer.appendChild(unitFlagIcon);
		this.unitFlagIcon = unitFlagIcon;

		const unitFlagArmyStats = document.createElement('div');
		unitFlagArmyStats.classList.add('unit-flag__army-stats"', 'items-center', 'text-center', 'absolute', '-left-3', '-right-3', 'bg-transparent');
		unitFlagContainer.appendChild(unitFlagArmyStats);

		const unitFlagPromotionContainer = document.createElement('div');
		unitFlagPromotionContainer.classList.add('promotion-container', 'flex', 'flex-col-reverse', 'pointer-events-none', 'absolute');
		unitFlagContainer.appendChild(unitFlagPromotionContainer);

		this.Root.appendChild(unitFlagContainer);

		engine.on('AffinityLevelChanged', this.onAffinityLevelChanged, this);
		engine.on('BeforeUnload', this.onUnload, this);
		const manager: UnitFlagManager = UnitFlagManager.instance;
		manager.addChildForTracking(this);

		// Sanity check early on (subsequent unit calls will be from componentID in getter)
		const unit: Unit | null = Units.get(this.componentID);
		if (!unit) {
			console.error("unit-flags-independent-powers: Could not attach unit flag; no unit object for cid: ", ComponentID.toLogString(this.componentID));
			return;
		}

		// Obtain independent index used in various realization calls.
		const playerID: PlayerId = this.componentID.owner;
		const player: PlayerLibrary | null = Players.get(playerID);
		if (!player) {
			console.error(`unit-flags-independent-powers: failed to get player of independent in attaching flag. palyerID: ${playerID} for ${ComponentID.toLogString(this.componentID)}.`)
			return;
		}
		this.independentID = Game.IndependentPowers.getIndependentPlayerIDFromUnit(this.componentID);

		IndependentPowersFlagMaker.addChildForTracking(this.independentID, this);	// Register with factory to IPflag specific updates

		this.Root.addEventListener('engine-input', this.engineInputListener);

		this.makeWorldAnchor(this.componentID);

		this.realizeIcon();
		this.realizeUnitHealth();
		this.realizeAffinity();
		this.realizeTooltip();

		if (unit) {
			const location: float2 = unit.location;
			const revealedState: RevealedStates = GameplayMap.getRevealedState(GameContext.localObserverID, location.x, location.y);
			if (!this.isHidden) {
				this.setVisibility(revealedState);
			}
		}
		else {
			this.setVisibility(RevealedStates.HIDDEN);
		}
		this.checkUnitPosition(unit);
	}

	onUnload() {
		this.cleanup();
	}

	onDetach() {
		this.cleanup();

		super.onDetach();
	}

	private cleanup() {
		const manager: UnitFlagManager = UnitFlagManager.instance;
		IndependentPowersFlagMaker.removeChildFromTracking(this.independentID, this);
		manager.removeChildFromTracking(this);
		engine.off('AffinityLevelChanged', this.onAffinityLevelChanged, this);
		engine.off('BeforeUnload', this.onUnload, this);
		this.destroyWorldAnchor();
		this.Root.removeEventListener('engine-input', this.engineInputListener);
		this._componentID = ComponentID.getInvalidID();
	}

	private onEngineInput(inputEvent: InputEngineEvent) {
		if (inputEvent.detail.status != InputActionStatuses.FINISH) {
			return;
		}

		if (inputEvent.detail.name == "accept" || inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "touch-tap") {
			if (ComponentID.isInvalid(this._componentID)) {
				console.warn("unit-flags-independent-powers: Attempt to activate a unit-flag but invalid associated unit.");
				return;
			}
			if (GameContext.localObserverID != this._componentID.owner) {
				return;
			}
			UI.Player.selectUnit(this._componentID);

			window.dispatchEvent(new SetActivatedComponentEvent(null));
			this.Root.dispatchEvent(new ActionActivateEvent(inputEvent.detail.x, inputEvent.detail.y));
			inputEvent.stopPropagation();
			inputEvent.preventDefault();
		}
	}

	hide() {
		this.isHidden = true;
		this.unitContainer?.classList.add("hidden");
	}

	show() {
		this.isHidden = false;
		if (this.unit) {
			const location: float2 = this.unit.location;
			const revealedState: RevealedStates = GameplayMap.getRevealedState(GameContext.localObserverID, location.x, location.y);
			this.setVisibility(revealedState);
		}
	}

	disable() {
		this.unitContainer?.classList.add("disabled");
	}

	enable() {
		this.unitContainer?.classList.remove("disabled");
	}

	/**
	 * @description An independent power's affinity level with a player changed.  Update flags if it's the local player.
	 * @param {AffinityLevelChanged_EventData} data 
	 */
	private onAffinityLevelChanged(data: AffinityLevelChanged_EventData) {
		if (data.player == GameContext.localObserverID) {
			this.updateAffinity();
		}
	}

	/**
	 * Helper to get the Indy object related to this flag.
	 * @returns {IndependentDefition|null}
	 */
	private getIndyName(): string {
		const name: string | null = Game.IndependentPowers.independentName(this.independentID);
		if (name != null) {
			return name;
		}
		return "";
	}

	private realizeUnitHealth() {
		if (!this.unitHealthBar) {
			console.error("unit-flags-independent-powers: realizeUnitHealth(): Missing this.unitHealthBar with '.unit-flag__healthbar'. cid: " + ComponentID.toLogString(this.componentID));
			return;
		}

		let unit: Unit | null = this.unit;

		// reset health stats
		this.unitHealthBar.classList.remove("unit-flag__healthbar-med-health");
		this.unitHealthBar.classList.remove("unit-flag__healthbar-low-health");
		let damage: number = 1.0;

		if (unit?.Health) {
			damage = (unit.Health.maxDamage - unit.Health.damage) / unit.Health.maxDamage;
			this.unitContainer?.classList.toggle("unit-flag--with-healthbar", (unit.Health.damage > 0));
			if (damage <= 0.75 && damage >= 0.5) {
				this.unitContainer?.classList.add("unit-flag__healthbar-med-health");
			}
			else if (damage < 0.5) {
				this.unitContainer?.classList.add("unit-flag__healthbar-low-health");
			}
		}

		if (this.unitHealthBarInner) {
			this.unitHealthBarInner.style.widthPERCENT = utils.clamp(damage, 0, 1) * 100;
		}
	}

	private realizeIcon() {

		const unit: Unit | null = this.unit;
		if (!unit) {
			console.error("unit-flags-independent-powers: Unit flag finished loading its HTML content but is not associated with a valid unit. cid: ", ComponentID.toLogString(this.componentID));
			return;
		}

		const unitDefinition: UnitDefinition | null = GameInfo.Units.lookup(unit.type);
		if (!unitDefinition) {
			console.warn("unit-flags-independent-powers: Cannot set unit flag icon due to missing Unit Definition. type: ", unit.type, "  cid: ", ComponentID.toLogString(this.componentID));
			return;
		}

		if (unit.isCommanderUnit) {
			this.unitContainer?.classList.add('unit-flag--army');
		}
		else if (unit.Combat?.canAttack) {
			this.unitContainer?.classList.add('unit-flag--combat');
		}
		else if (unitDefinition.CoreClass != "CORE_CLASS_SUPPORT" && unitDefinition.CoreClass != "CORE_CLASS_RECON") {
			this.unitContainer?.classList.add('unit-flag--civilian');
		}

		if (this.unitFlagIcon) {
			const iconName: string = Icon.getUnitIconFromDefinition(unitDefinition);
			this.unitFlagIcon.style.backgroundImage = `url(${iconName})`;
		}
	}

	private realizeTooltip() {
		const playerId: PlayerId = this.componentID.owner;
		const player: PlayerLibrary | null = Players.get(playerId);
		if (player) {
			const unit: Unit | null = this.unit;
			const unitName: string = ((unit) ? Locale.compose(unit.name) : "ERROR, unit: " + ComponentID.toLogString(this._componentID));
			const playerName: string = Locale.compose("LOC_UNITFLAG_INDEPENDENT_POWER_NAME", this.getIndyName());
			const affinityRelationship: string = Locale.compose(Game.IndependentPowers.getIndependentHostility(this.independentID, GameContext.localObserverID));
			const tooltipDiv: HTMLDivElement | null = this.Root.querySelector<HTMLDivElement>('.unit-flag__container');
			if (tooltipDiv) {
				tooltipDiv.setAttribute("data-tooltip-content", `<div>${playerName}</div><div>${unitName}</div><div>${affinityRelationship}</div>`);
			}
		}
	}

	/** 
	 * Change the visibility of the unit's flag.
	 * @param {RevealState} state - The visibility state to change to.
	 */
	setVisibility(state: RevealedStates) {
		if (this.isHidden) {
			return;
		}
		switch (state) {
			case RevealedStates.HIDDEN:
				this.unitContainer?.classList.add("hidden");
				break;
			case RevealedStates.REVEALED:
				this.unitContainer?.classList.add("hidden");
				break;
			case RevealedStates.VISIBLE:
				this.unitContainer?.classList.remove("hidden");
				break;
			default:
				console.warn("unit-flags-independent-powers: Unknown visibility reveal type passed to unit flag. vis: ", state, "  cid: ", ComponentID.toLogString(this.componentID));
				break;
		}
	}

	private makeWorldAnchor(componentID: ComponentID) {
		this.destroyWorldAnchor();
		const height: number = 40.0;
		const worldAnchor = WorldAnchors.RegisterUnitAnchor(componentID, height);

		if (worldAnchor) {
			this.Root.setAttribute('data-bind-style-transform2d', `{{UnitAnchors.offsetTransforms[${worldAnchor}].value}}`)
			this.Root.setAttribute('data-bind-style-opacity', `{{UnitAnchors.visibleValues[${worldAnchor}]}}`)
		}
		else {
			console.error(`Failed to create WorldAnchor for unit ${JSON.stringify(componentID)}.`);
		}
	}

	private destroyWorldAnchor() {
		if (this._worldAnchor) {
			this.Root.removeAttribute('data-bind-style-transform2d');
			this.Root.removeAttribute('data-bind-style-opacity');
			WorldAnchors.UnregisterUnitAnchor(this._worldAnchor);
		}
		this._worldAnchor = null;
	}

	updateHealth() {
		this.realizeUnitHealth();
	}

	updateMovement() {
		// movement can come in while a unit is being destroyed, so safety check here
		if (this.unit && this.unit.isOnMap) {
			this.checkUnitPosition(this.unit);
		}
	}

	private checkUnitPosition(unit: Unit) {
		UnitFlagManager.instance.recalculateFlagOffsets(unit.location);
	}

	updateTop(position: number, total: number) {
		const offset: number = position - ((total - 1) / 2) - 0.5;
		if (this.unitContainer) {
			if (this.flagOffset != offset) {
				this.flagOffset = offset;
				this.unitContainer.style.left = Layout.pixels(offset * 32);
			}
		}
	}


	updateAffinity() {
		this.realizeAffinity();
		this.realizeTooltip();
	}

	/**
	 * Helper to get the affinity relationship between the player and independent power.
	 * @returns {IndependentRelationship} enum representing the affinity level
	 */
	private getRelationship(): IndependentRelationship {
		const localObserverID: PlayerId = GameContext.localObserverID;
		const playerID: PlayerId = this.componentID.owner;
		const player: PlayerLibrary | null = Players.get(playerID);
		if (!player) {
			console.warn(`unit-flags-independent-powers: Unable to get affinity relationship due to null player from playerID ${playerID}`);
			return IndependentRelationship.NOT_APPLICABLE;
		}
		if (!player.isIndependent) {
			console.warn(`unit-flags-independent-powers: Unable to get affinity relationship due to non-independent player from playerID ${playerID}, name: ${player.name}`);
			return IndependentRelationship.NOT_APPLICABLE;
		}
		return Game.IndependentPowers.getIndependentRelationship(this.independentID, localObserverID);
	}

	private realizeAffinity() {
		const relationship: IndependentRelationship = this.getRelationship();
		if (relationship == IndependentRelationship.NOT_APPLICABLE) {
			console.warn("Village Banner unable to determine affinity relationship.");
			return;
		}
		const classList: DOMTokenList = this.Root.classList;
		classList.toggle('unit-flag--friendly', (relationship == IndependentRelationship.FRIENDLY));
		classList.toggle('unit-flag--hostile', (relationship == IndependentRelationship.HOSTILE));
		classList.toggle('unit-flag--neutral', (relationship == IndependentRelationship.NEUTRAL));
	}

	get componentID(): Readonly<ComponentID> {
		return this._componentID;
	}

	get unit(): Readonly<Unit> {
		const unit: Unit | null = Units.get(this.componentID);
		if (!unit) {
			console.error("unit-flags-independent-powers: Failed attempt to get a unit for: ", ComponentID.toLogString(this.componentID));
		}
		return unit!;
	}
}

Controls.define('unit-flags-independent-powers', {
	createInstance: IndependentPowersUnitFlag,
	description: 'Independent Powers Unit Flag',
	classNames: ['unit-flag', 'allowCameraMovement'],
	styles: ['fs://game/base-standard/ui/unit-flags/unit-flags.css']
})

UnitFlagFactory.registerStyle(new IndependentPowersFlagMaker());
