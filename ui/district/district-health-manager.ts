/**
 * @file district-health-manager.ts
 * @copyright 2023, Firaxis Games
 * @description Manages the tracking and updating of the floating district health.
 */

import { PlotCoord } from '/core/ui/utilities/utilities-plotcoord.js';
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';

export interface DistrictHealth {
	componentID: ComponentID;
	updateDistrictHealth(value: string): void;
	setContested(isContested: boolean, contestingPlayer: PlayerId): void;
}

class DistrictHealthManager extends Component {

	private children: Map<Number, DistrictHealth> = new Map<number, DistrictHealth>();

	private static _instance: DistrictHealthManager | null = null;
	static get instance(): DistrictHealthManager {
		return DistrictHealthManager._instance!;
	}

	/**
	 * Onetime callback on creation.
	 */
	onInitialize() {
		if (DistrictHealthManager._instance == null) {
			DistrictHealthManager._instance = this;
		} else {
			console.error("district-health-manager: Multiple district health managers are attempting to be created, but it's a singleton.");
		}
	}

	onAttach() {
		super.onAttach();

		this.createAllDistrictHealth();

		engine.on('DistrictAddedToMap', this.onDistrictAddedToMap, this);
		engine.on('DistrictRemovedFromMap', this.onDistrictRemovedFromMap, this);
		engine.on('DistrictDamageChanged', this.onDistrictDamageChanged, this);
		engine.on('CityTransfered', this.onCityTransfered, this);
		engine.on('DistrictControlChanged', this.onDistrictControlChanged, this);
	}

	onDetach() {
		engine.off('DistrictAddedToMap', this.onDistrictAddedToMap, this);
		engine.off('DistrictRemovedFromMap', this.onDistrictRemovedFromMap, this);
		engine.off('DistrictDamageChanged', this.onDistrictDamageChanged, this);
		engine.off('CityTransfered', this.onCityTransfered, this);
		engine.off('DistrictControlChanged', this.onDistrictControlChanged, this);

		super.onDetach();
	}

	private createAllDistrictHealth() {
		const playerList: PlayerLibrary[] = Players.getAlive();
		for (const player of playerList) {
			const playerDistricts: PlayerDistricts | undefined = player.Districts;
			if (playerDistricts == undefined) {
				console.warn("district-health-manager: Cannot make district health bars for player with misisng playerDistricts object: ", player.name);
				continue;
			}
			const districtIDs: ComponentID[] = playerDistricts.getDistrictIds();
			for (const districtID of districtIDs) {
				if (ComponentID.isInvalid(districtID)) {
					console.warn("district-health-manager: Invalid ComponentID for district. Player id: " + player.id);
					continue;
				}
				const district: District | null = Districts.get(districtID);
				if (!district) {
					console.warn("district-health-manager: District not found. id: ", districtID);
					continue;
				}
				this.createDistrictHealth(district.id, district.location);
			}
		}
	}

	private createDistrictHealth(id: ComponentID, location: PlotCoord): HTMLElement | null {

		const playerID: PlayerId = GameplayMap.getOwner(location.x, location.y);
		const playerDistricts: PlayerDistricts | null = Players.Districts.get(playerID);
		const revealedState: RevealedStates = GameplayMap.getRevealedState(GameContext.localPlayerID, location.x, location.y);
		if (revealedState != RevealedStates.VISIBLE) {
			return null;		// Message is on a plot the player can't see
		}

		if (!playerDistricts) {
			console.warn("district-health-manager: createDistrictHealth: No districts found for playerID: " + playerID);
			return null;
		}

		const currentHealth = playerDistricts.getDistrictHealth(location);
		const maxHealth = playerDistricts.getDistrictMaxHealth(location);
		const normalizedProgress: number = Math.min(1, (currentHealth / maxHealth));

		if (!DistrictHealthManager.canShowDistrictHealth(currentHealth, maxHealth)) {
			return null;
		}

		const districtHealth: HTMLElement = document.createElement("district-health-bar");
		districtHealth.setAttribute('data-district-location', PlotCoord.toString(location));
		districtHealth.setAttribute('data-district-health', normalizedProgress.toString());
		districtHealth.setAttribute('data-district-id', ComponentID.toString(id));

		this.Root.appendChild(districtHealth);

		return districtHealth;
	}

	/**
	 * Called by an instance of DistrictHealth to register it with the manager
	 * @param child Anchor text object
	 */
	addChildForTracking(child: DistrictHealth) {
		const id: ComponentID = child.componentID ?? ComponentID.getInvalidID();
		if (ComponentID.isInvalid(id)) {
			console.error("district-health-manager: Unable to connect a district health to the manager because the unit has an invalid componentID!");
			return;
		}
		if (this.children.has(ComponentID.toBitfield(id))) {
			console.error("district-health-manager: Attempt to add a district health to the manager for tracking but something (itself?) already is added with that id: " + ComponentID.toLogString(id));
			return;
		}
		this.children.set(ComponentID.toBitfield(id), child);
	}

	/**
	 * Called by an instance of DistrictHealth to unregister it with the manager
	 * @param child Anchor text object
	*/
	removeChildFromTracking(child: DistrictHealth) {
		const id: ComponentID = child.componentID;	// Get the componentID of the unit from the child, don't try and get it from the child.unit, the actual instance is probably already gone by now
		if (ComponentID.isInvalid(id)) {
			console.warn("district-health-manager: Unable to remove a district health from the manager because the unit has an invalid componentID!");
			return;
		}
		const bitfield = ComponentID.toBitfield(id);
		if (!this.children.has(bitfield)) {
			console.warn("district-health-manager: Attempt to remove a district health from the manager for tracking but none exists with that id: " + ComponentID.toLogString(id));
			return;
		}
		this.children.delete(bitfield);
	}

	private onDistrictDamageChanged(data: DistrictDamageChanged_EventData) {
		const district: DistrictHealth | undefined = this.children.get(ComponentID.toBitfield(data.id));
		// first attack on a district will hit this
		if (district == undefined) {
			this.createDistrictHealth(data.id, data.location);
			return;
		}

		const location: PlotCoord = data.location;
		const playerID: PlayerId = GameplayMap.getOwner(location.x, location.y);
		const playerDistricts: PlayerDistricts | null = Players.Districts.get(playerID);

		const revealedState: RevealedStates = GameplayMap.getRevealedState(GameContext.localPlayerID, location.x, location.y);
		if (revealedState != RevealedStates.VISIBLE) {
			return;		// Message is on a plot the player can't see
		}

		if (!playerDistricts) {
			console.warn("district-health-manager: onDistrictDamageChanged: No districts found for playerID: " + playerID);
			return;
		}

		const currentHealth = playerDistricts.getDistrictHealth(location);
		const maxHealth = playerDistricts.getDistrictMaxHealth(location);
		const normalizedProgress: number = Math.min(1, (currentHealth / maxHealth));

		// when a district reaches full health, turn off the health bar
		if (currentHealth == maxHealth) {
			this.updateCity(data.cityID, false);
		} else {
			district.updateDistrictHealth(normalizedProgress.toString());
		}
	}

	private onDistrictControlChanged(data: DistrictControlChanged_EventData) {
		this.updateCity(data.cityID, false);
	}

	private onCityTransfered(data: CityTransfered_EventData) {
		this.updateCity(data.cityID, true);
	}

	private updateCity(cityID: ComponentID, isTransfer: boolean) {
		const city: City | null = Cities.get(cityID);
		if (city == null) {
			console.warn(`Unable to find the city(${ComponentID.toLogString(cityID)}) from DistrictControlChanged event`);
			return;
		}

		const districts: CityDistricts | undefined = city.Districts;
		if (districts == undefined) {
			console.warn("Unable to find the districts from DistrictControlChanged event");
			return;
		}

		for (const districtID of districts.getIds()) {
			const district: District | null = Districts.get(districtID);
			if (district == null) {
				console.error("null district building city info. cid: " + ComponentID.toLogString(cityID) + ",  districtID: " + ComponentID.toLogString(districtID));
				continue;
			}

			const districtHealth: DistrictHealth | undefined = this.children.get(ComponentID.toBitfield(district.id));

			// is this plot contested?
			if (district.owner != district.controllingPlayer) {
				if (districtHealth) {
					// district is now contested and was previously showing health (should be the common case)
					districtHealth.setContested(true, district.controllingPlayer);
				} else {
					// district is now contested but there's no districtHealth object, so create one to show the contention
					const newHealth = this.createDistrictHealth(district.id, district.location);
					if (newHealth) {
						newHealth.setAttribute("data-is-contested", "true")
					}
				}
			} else {
				// district is no longer contested.  does it need to show a health bar?
				const playerDistricts: PlayerDistricts | null = Players.Districts.get(district.owner);

				if (playerDistricts) {
					const currentHealth = playerDistricts.getDistrictHealth(district.location);
					const maxHealth = playerDistricts.getDistrictMaxHealth(district.location);

					if (districtHealth) {
						// we're no longer contested but have districtHealth (the normal case)
						// is there a healthbar to show still?
						// Also if the city is being transferred, wipe all health bars
						if (DistrictHealthManager.canShowDistrictHealth(currentHealth, maxHealth) && !isTransfer) {
							districtHealth.setContested(false, district.owner);

							const normalizedProgress: number = Math.min(1, (currentHealth / maxHealth));
							districtHealth.updateDistrictHealth(normalizedProgress.toString());
						} else {
							// no health to show, nuke the object
							this.onDistrictRemovedFromMap({ id: district.id, location: district.location, cityID: cityID, districtType: DistrictTypes.CITY_CENTER });
						}
					} else {	// no health object exists, do we need to show a health bar still?
						if (DistrictHealthManager.canShowDistrictHealth(currentHealth, maxHealth)) {
							// create the object
							this.createDistrictHealth(district.id, district.location);
						}
					}
				}
			}
		}
	}

	private onDistrictAddedToMap(data: DistrictAddedToMap_EventData) {
		const isTracked: boolean = this.children.has(ComponentID.toBitfield(data.id));
		if (isTracked) {
			console.error("district-health-manager: onDistrictAddedToMap: Already created. id: " + data.id);
			return;
		}

		this.createDistrictHealth(data.id, data.location);
	}

	private onDistrictRemovedFromMap(data: DistrictRemovedFromMap_EventData) {
		const district: DistrictHealth | undefined = this.children.get(ComponentID.toBitfield(data.id));
		if (district == undefined) {
			console.warn("district-health-manager: Cannot find district for damage change. CityId: " + ComponentID.toLogString(data.cityID) + ", districtID: " + ComponentID.toLogString(data.id));
			return;
		}

		const children: NodeListOf<ChildNode> = this.Root.childNodes;
		let foundChild: Node | undefined = undefined;
		for (let i: number = children.length - 1; i >= 0; i--) {
			const node: ChildNode = children.item(i);
			// ignore non-HTMLElements (i.e. text nodes)
			if (!(node instanceof HTMLElement)) {
				continue;
			}

			const id = node.getAttribute('data-district-id');
			const cid: ComponentID = ComponentID.fromString(id);
			if (ComponentID.isMatch(cid, district.componentID)) {
				foundChild = node;
				break;
			}
		}

		if (!foundChild) {
			console.warn("district-health-manager: Cannot find district for remove change. CityId: " + ComponentID.toLogString(data.cityID) + ", districtID: " + ComponentID.toLogString(data.id));
			return;
		}

		this.Root.removeChild(foundChild);
	}

	static canShowDistrictHealth(currentHealth: number, maxHealth: number): boolean {
		// only show if the district is not healthy or it is conquered
		return (!!currentHealth && !!maxHealth) && (maxHealth > currentHealth && currentHealth > 0);
	}
}

export { DistrictHealthManager as default };

Controls.define('district-health-bars', {
	createInstance: DistrictHealthManager,
	description: 'District Health Manager',
	attributes: []
});
