/**
 * @file city-banner-manager.ts
 * @copyright 2021-2023, Firaxis Games
 * @description World anchored information about cities.
 */

import { ComponentID } from '/core/ui/utilities/utilities-component-id.js'
import { CityBanner, BANNER_INVALID_LOCATION } from '/base-standard/ui/city-banners/banner-support.js'
import { CityBannerComponent } from '/base-standard/ui/city-banners/city-banners.js'

declare global {
	interface Window {
		banners: Map<Number, CityBannerComponent>;
	}
}

// set this to true to get more diagnostic messages
const enableDebugMessages: boolean = false;

class CityBannerManager extends Component {

	private citiesNotFullyCreated = new Map<Number, ComponentID>();
	private banners = new Map<Number, CityBannerComponent>();

	private cityIntegratedListener = this.onCityIntegrated.bind(this);
	private cityAddedToMapListener = this.onCityAddedToMap.bind(this);
	private cityInitializedListener = this.onCityInitialized.bind(this);
	private cityNameChangedListener = this.onCityNameChanged.bind(this);
	private cityPopulationChangedListener = this.onCityPopulationChanged.bind(this);
	private cityProductionChangedListener = this.onCityProductionChanged.bind(this);
	private cityProductionQueueChangedListener = this.onCityProductionQueueChanged.bind(this);
	private cityYieldChangedListener = this.onCityYieldChanged.bind(this);
	private cityProductionUpdatedListener = this.onCityProductionUpdated.bind(this);
	private foodQueueOrCityGrowthModeListener = this.onCityFoodQueueUpdated.bind(this);
	private cityReligionChangedListener = this.onCityReligionChanged.bind(this);
	private urbanReligionChangedListener = this.onUrbanReligionChanged.bind(this);
	private ruralReligionChangedListener = this.onRuralReligionChanged.bind(this);
	private uiDisableCityBannersListener = this.onDisableBanners.bind(this);
	private uiEnableCityBannersListener = this.onEnableBanners.bind(this);
	private globalHideListener = this.onGlobalHide.bind(this);
	private globalShowListener = this.onGlobalShow.bind(this);
	private plotVisibilityChangedListener = this.onPlotVisibilityChanged.bind(this);
	private cityRemovedFromMapListener = this.onCityRemovedFromMap.bind(this);
	private citySelectionChangedListener = this.onCitySelectionChanged.bind(this);
	private cityGovernmentLevelChangedListener = this.onCityGovernmentLevelChanged.bind(this);
	private cityStateBonusChosenListener = this.onCityStateBonusChosen.bind(this);
	private cityYieldGrantedListener = this.onCityYieldGranted.bind(this);
	private capitalCityChangedListener = this.onCapitalCityChanged.bind(this);

	private static _instance: CityBannerManager | null = null;
	static get instance(): CityBannerManager {
		return CityBannerManager._instance!;
	}

	/**
	 * Onetime callback on creation.
	 */
	onInitialize() {
		if (CityBannerManager._instance == null) {
			CityBannerManager._instance = this;
		} else {
			console.error("Multiple city banner managers are attempting to be created, but it's a singleton!");
		}
	}

	onAttach() {
		super.onAttach();

		this.createAllBanners();

		window.banners = this.banners;

		engine.on('AffinityLevelChanged', this.onAffinityLevelChanged, this);
		engine.on('CityAddedToMap', this.cityAddedToMapListener);
		engine.on('CityInitialized', this.cityInitializedListener);	// Use instead of CityAddedToMap, as not all values are populated when that event fires.
		engine.on('CityNameChanged', this.cityNameChangedListener);
		engine.on('CapitalCityChanged', this.capitalCityChangedListener);
		engine.on('CityPopulationChanged', this.cityPopulationChangedListener);
		engine.on('CityProductionChanged', this.cityProductionChangedListener);
		engine.on('CityYieldChanged', this.cityYieldChangedListener);
		engine.on('CityProductionUpdated', this.cityProductionUpdatedListener);
		engine.on('CityProductionQueueChanged', this.cityProductionQueueChangedListener);
		engine.on('CityReligionChanged', this.cityReligionChangedListener);
		engine.on('DiplomacyEventStarted', this.onDiplomacyEventStarted, this);
		engine.on('DiplomacyEventEnded', this.onDiplomacyEventEnded, this);
		engine.on('DiplomacyRelationshipChanged', this.onDiplomacyRelationshipChanged, this);
		engine.on('UrbanReligionChanged', this.urbanReligionChangedListener);
		engine.on('RuralReligionChanged', this.ruralReligionChangedListener);
		engine.on('CityRemovedFromMap', this.cityRemovedFromMapListener);
		engine.on('CitySelectionChanged', this.citySelectionChangedListener);
		engine.on('CityStateBonusChosen', this.cityStateBonusChosenListener);
		engine.on('CityGovernmentLevelChanged', this.cityGovernmentLevelChangedListener);
		engine.on('FoodQueueChanged', this.foodQueueOrCityGrowthModeListener);
		engine.on('CityGrowthModeChanged', this.foodQueueOrCityGrowthModeListener);
		engine.on('CityYieldGranted', this.cityYieldGrantedListener);
		engine.on('PlotVisibilityChanged', this.plotVisibilityChangedListener);
		engine.on('ConqueredSettlementIntegrated', this.cityIntegratedListener)
		engine.on('DistrictAddedToMap', this.onDistrictAddedToMap, this);
		engine.on('DistrictRemovedFromMap', this.onDistrictRemovedFromMap, this);
		engine.on('NotificationAdded', this.onNotificationAdded, this);

		window.addEventListener('ui-disable-city-banners', this.uiDisableCityBannersListener);
		window.addEventListener('ui-enable-city-banners', this.uiEnableCityBannersListener);
		window.addEventListener('ui-hide-city-banners', this.globalHideListener);
		window.addEventListener('ui-show-city-banners', this.globalShowListener);
	}

	onDetach() {
		engine.off('AffinityLevelChanged', this.onAffinityLevelChanged, this);
		engine.off('CityAddedToMap', this.cityAddedToMapListener);
		engine.off('CityInitialized', this.cityInitializedListener);
		engine.off('CityNameChanged', this.cityNameChangedListener);
		engine.off('CityPopulationChanged', this.cityPopulationChangedListener);
		engine.off('CityProductionChanged', this.cityProductionChangedListener);
		engine.off('CityYieldChanged', this.cityYieldChangedListener);
		engine.off('CityProductionUpdated', this.cityProductionUpdatedListener);
		engine.off('CityProductionQueueUpdated', this.cityProductionUpdatedListener);
		engine.off('CityReligionChanged', this.cityReligionChangedListener);
		engine.off('DiplomacyEventStarted', this.onDiplomacyEventStarted, this);
		engine.off('DiplomacyEventEnded', this.onDiplomacyEventEnded, this);
		engine.off('DiplomacyRelationshipChanged', this.onDiplomacyRelationshipChanged, this);
		engine.off('UrbanReligionChanged', this.urbanReligionChangedListener);
		engine.off('RuralReligionChanged', this.ruralReligionChangedListener);
		engine.off('CityRemovedFromMap', this.cityRemovedFromMapListener);
		engine.off('CitySelectionChanged', this.citySelectionChangedListener);
		engine.off('CityStateBonusChosen', this.cityStateBonusChosenListener);
		engine.off('CityGovernmentLevelChanged', this.cityGovernmentLevelChangedListener);
		engine.off('FoodQueueChanged', this.foodQueueOrCityGrowthModeListener);
		engine.off('CityGrowthModeChanged', this.foodQueueOrCityGrowthModeListener);
		engine.off('CityYieldGranted', this.cityYieldGrantedListener);
		engine.off('PlotVisibilityChanged', this.plotVisibilityChangedListener);
		engine.off('ConqueredSettlementIntegrated', this.cityIntegratedListener)
		engine.off('DistrictAddedToMap', this.onDistrictAddedToMap, this);
		engine.off('DistrictRemovedFromMap', this.onDistrictRemovedFromMap, this);
		engine.off('NotificationAdded', this.onNotificationAdded, this);

		window.removeEventListener('ui-disable-city-banners', this.uiDisableCityBannersListener);
		window.removeEventListener('ui-enable-city-banners', this.uiEnableCityBannersListener);
		window.removeEventListener('ui-hide-city-banners', this.globalHideListener);
		window.removeEventListener('ui-show-city-banners', this.globalShowListener);

		super.onDetach();
	}

	/**
	 * Determine if a city/town already has a banner associated with it.
	 * @param {ComponentID} cityComponentID - An component ID related to a city
	 * @returns true if a banner was already created (and still exists), false otherwise.
	 */
	private isBannerAlreadyCreated(cityComponentID: ComponentID): boolean {
		// Loop backwards as this check is likely best needed when something is called
		// twice and so the child with the highest index is likely the dupe.
		const children: NodeListOf<ChildNode> = this.Root.childNodes;
		for (let i: number = children.length - 1; i >= 0; i--) {
			const node = children.item(i);

			// ignore non-HTMLElements (i.e. text nodes)
			if (!(node instanceof HTMLElement)) {
				continue;
			}

			const id = node.getAttribute('data-banner-cid')!;
			const cid: ComponentID = ComponentID.fromString(id)!;
			if (ComponentID.isMatch(cid, cityComponentID)) {
				return true;	// Early out on first match; we're done here.
			}
		}
		return false;
	}


	private createAllBanners() {
		const playerList: PlayerLibrary[] = Players.getAlive();
		for (const player of playerList) {
			const playerCities: PlayerCities | undefined = player.Cities;
			if (playerCities == undefined) {
				console.warn("Cannot make banners for player with misisng playerCities object: ", player.name);
				continue;
			}
			const cityIDs: ComponentID[] = playerCities.getCityIds();
			for (const cityID of cityIDs) {
				this.createBanner(cityID, BANNER_INVALID_LOCATION, BANNER_INVALID_LOCATION);
			}
			if (player.isIndependent) {
				const playerConstructibles: PlayerConstructibles | undefined = player.Constructibles;
				if (!playerConstructibles) {
					console.error("city-banner-manager: createAllBanners - no playerConstructibles found for player " + player.id);
					continue;
				}
				for (const construct of playerConstructibles.getConstructibles()) {
					const constructDef: ConstructibleDefinition | null = GameInfo.Constructibles.lookup(construct.type);
					if (!constructDef) {
						console.error(`city-banner-manager: createAllBanners - No construct def found for constructible of type ${construct.type}`);
						return;
					}
					if (constructDef.ConstructibleType == "IMPROVEMENT_VILLAGE" || constructDef.ConstructibleType == "IMPROVEMENT_ENCAMPMENT") {
						this.createBanner(construct.cityId, construct.location.x, construct.location.y);
					}
				}
			}
		}
	}


	/**
	 * Creates the city banner HTML DOM object.
	 * @param {ComponentID} cityComponentID - The city's componentID linked to this banner.
	 */
	private createBanner(cityComponentID: ComponentID, x: number, y: number) {
		if (this.isBannerAlreadyCreated(cityComponentID)) {
			console.error("Attempt to create a city banner for a city that already has a banner. cid: " + ComponentID.toLogString(cityComponentID));
			return;
		}
		const banner = document.createElement("city-banner");

		// TODO - Replace this with a Map of componentID -> Elements.
		banner.setAttribute('data-banner-cid', ComponentID.toString(cityComponentID));

		banner.setAttribute('x', x.toString());
		banner.setAttribute('y', y.toString());
		banner.setAttribute('city-id', ComponentID.toString(cityComponentID));
		this.Root.appendChild(banner);
	}

	private onCityIntegrated(data: City_EventData) {
		//Only the local player's cities get the conquered icon/warning so only update that icon if it is the local player's city
		if (data.cityID.owner != GameContext.localObserverID) {
			return;
		}
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			console.error("A city was integrated but no associated banner was found. cid: ", ComponentID.toLogString(data.cityID));
			return;
		}
		cityBanner.updateConqueredIcon();
	}

	/**
	 * Engine Event
	 */
	private onCityAddedToMap(data: CityAddedToMap_EventData) {
		const bitfield: number = ComponentID.toBitfield(data.cityID);
		const pendingCityID: ComponentID | undefined = this.citiesNotFullyCreated.get(bitfield);
		if ((pendingCityID != undefined) && !ComponentID.isInvalid(pendingCityID)) {
			//TODO: Add back once engine/script stops making multiple add calls for same city: console.warn("Multiple calls to onCityAddedToMap were raised by the engine for: ", bitfield);
			return;
		}
		this.citiesNotFullyCreated.set(bitfield, data.cityID);
	}

	/**
	 * If a district is added to the map and its a village, then add the village banner (and 3d info)
	 * @param {DistrictAddedToMap_EventData} data 
	 */
	private onDistrictAddedToMap(data: DistrictAddedToMap_EventData) {
		if (data.cityID.owner == PlayerIds.NO_PLAYER) {
			return;		// No one owns this plot, nothing city related to do.
		}

		const playerID: PlayerId = GameplayMap.getOwner(data.location.x, data.location.y);
		const player: PlayerLibrary | null = Players.get(playerID);
		if (player?.isIndependent) {
			const cityComponentID: ComponentID | null = GameplayMap.getOwningCityFromXY(data.location.x, data.location.y);
			if (!cityComponentID || ComponentID.isInvalid(cityComponentID)) {
				console.error(`city-banner-manager: onDistrictAddedToMap - Invalid village at ${data.location.x},${data.location.y}`);
				return;
			}

			// Need to ensure the plot has a "village" constructible before creating a banner.
			const constructibles: ComponentID[] = MapConstructibles.getConstructibles(data.location.x, data.location.y);
			constructibles.some((item: ComponentID) => {
				const instance: Constructible | null = Constructibles.getByComponentID(item);
				if (!instance) {
					return;
				}
				const info: ConstructibleDefinition | null = GameInfo.Constructibles.lookup(instance.type);
				if (!info) {
					return;
				}
				if (info.ConstructibleType == "IMPROVEMENT_VILLAGE" || info.ConstructibleType == "IMPROVEMENT_ENCAMPMENT") {
					this.createBanner(cityComponentID, data.location.x, data.location.y);
				}
			});
		}
	}

	/**
	 * If a district is removed from the map and its a village, then remove the village banner
	 * @param data 
	 */
	private onDistrictRemovedFromMap(data: DistrictRemovedFromMap_EventData) {
		if (data.cityID.owner == PlayerIds.NO_PLAYER) {
			return;		// No one owns this plot, nothing city related to do.
		}

		const player: PlayerLibrary | null = Players.get(data.cityID.owner);
		if (player?.isIndependent || player?.isMinor) {
			const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
			if (cityBanner) {
				// Only delete the banner if the district being removed is the city center where the banner is rooted
				if (cityBanner.getLocation().x == data.location.x && cityBanner.getLocation().y == data.location.y) {
					cityBanner.remove();
				}
			}
		}
	}

	/**
	  * @description An independent power's affinity level with a player changed.  Update banners if it's the local player.
	  * @param {AffinityLevelChanged_EventData} data 
	  */
	private onAffinityLevelChanged(data: AffinityLevelChanged_EventData) {
		if (data.player == GameContext.localObserverID) {
			this.banners.forEach((banner: CityBannerComponent, _key: number) => {
				banner.affinityUpdate();
			});
		}
	}

	/**
	  * @description Affinities for an independent power are signaled at the end of a diplomacy change, see if thisis related
	  * @param {DiplomacyEvent} data 
	  */
	private onDiplomacyEventStarted(data: DiplomacyEvent_EventData) {
		if (data.location == undefined) {
			return;	// Different diplomacy data, not related to independent powers (affinity changing)
		}
		this.banners.forEach((banner: CityBannerComponent, _key: number) => {
			banner.affinityUpdate();
		});
	}

	/**
	 * @description Affinities for an independent power are signaled at the end of a diplomacy change, see if thisis related
	 * @param {DiplomacyEvent} data 
	 */
	private onDiplomacyEventEnded(data: DiplomacyEvent_EventData) {
		if (data.location == undefined) {
			return;	// Different diplomacy data, not related to independent powers (affinity changing)
		}
		let searching: boolean = true;
		this.banners.forEach((banner: CityBannerComponent, _key: number) => {
			if (searching && banner.bannerLocation.x == data.location.x && banner.bannerLocation.y == data.location.y) {
				searching = false;
				banner.affinityUpdate();
			}
		});
	}

	/**
	 * @description A diplo relationship changed.  If it involves the local player, refresh the village banners
	 * @param {DiplomacyRelationshipChanged_EventData} data 
	 */
	private onDiplomacyRelationshipChanged(data: DiplomacyRelationshipChanged_EventData) {
		// if this involves the local player, update the village affinities
		if ((data.player1 == GameContext.localObserverID) || (data.player2 == GameContext.localObserverID)) {
			this.banners.forEach((banner: CityBannerComponent, _key: number) => {
				banner.affinityUpdate();
			});
		}
	}

	/**
	 * @description Game callback; same as CityAddedToMap (same data payload) 
	 * but happens at the end of creation so all values are populated.
	 * @param {CityAddedToMap_EventData} data - Details about created city.
	 */
	private onCityInitialized(data: CityAddedToMap_EventData) {
		const bitfield: number = ComponentID.toBitfield(data.cityID);
		const pendingCityID: ComponentID | undefined = this.citiesNotFullyCreated.get(bitfield);
		if ((pendingCityID != undefined) && !ComponentID.isInvalid(pendingCityID)) {	// Was a city put in for add?
			this.citiesNotFullyCreated.delete(bitfield);
		} else {
			if (this.isBannerAlreadyCreated(data.cityID)) {
				return;	// City wasn't in pending add list but it was already created; bug in engine has initalized called 4x times per add!
			}
			console.warn("Creating a city banner at city initialization but a paired onAddedToMap call never occurred! cid: " + ComponentID.toLogString(data.cityID));
		}
		this.createBanner(data.cityID, data.location.x, data.location.y);
	}

	/**
	 * City has a new name.
	 * @param {City_EventData} data 
	 */
	private onCityNameChanged(data: City_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			return;
		}
		cityBanner.queueNameUpdate();
	}

	private onCityGovernmentLevelChanged(data: CityGovernmentLevelChanged_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			return;
		}

		// Convert
		if (data.governmentlevel == CityGovernmentLevels.CITY) {
			cityBanner.queueNameUpdate();	// this causes a full rebuild of the city's banner, which is what we want
		}
	}

	private onCityRemovedFromMap(data: City_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			return;
		}
		cityBanner.remove();
	}

	private onCapitalCityChanged(data: City_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner) {
			cityBanner.capitalUpdate();
		}
	}

	// TODO: Remove to let world view raise view based on plot selection (or banner from banner activation) not from city selection change.
	private onCitySelectionChanged(data: CitySelectionChangedData) {
		if (!data.selected) {
			return;
		}
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			console.error("A city's selection status changed but no associated banner was found. cid: ", ComponentID.toLogString(data.cityID));
			return;
		}
	}

	private onCityStateBonusChosen(data: CityStateBonus_EventData) {
		// synthesize a full component ID: for city-states only the owner field is significant.
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(ComponentID.make(data.cityState, 1, 65536)));
		if (cityBanner == undefined) {
			return;
		}
		// this does a full refresh of the banner, so it works for what we need
		cityBanner.queueNameUpdate();
	}

	/**
	 * @description Called by a city banner to let manager directly access it's instance.
	 * When banner is being initalized.
	 * @param {CityBanner} child - banner which manager created.
	 */
	addChildForTracking(child: CityBannerComponent) {
		const key: number = child.getKey();
		if (this.banners.has(key)) {
			console.error("Attempt to add a city banner to the manager for tracking but something (itself?) already is added with that key: " + child.getDebugString());
			return;
		}

		child.Root.id = `city-banner-${this.banners.size}`;
		this.banners.set(key, child);
	}

	/**
	 * @description Called by a city banner to remove itself from being tracked by the manager
	 * @param {CityBanner} child - banner which is being tracked by the manager
	 */
	removeChildFromTracking(child: CityBanner) {
		const key: number = child.getKey();
		if (!this.banners.has(key)) {
			return;
		}
		this.banners.delete(key);
	}

	/// Turns off interactivity with banners
	private onDisableBanners() {
		this.banners.forEach((banner: CityBanner) => {
			banner.disable();
		});
	}

	/// Turns on interactivity with banners
	private onEnableBanners() {
		this.banners.forEach((banner: CityBanner) => {
			banner.enable();
		});
	}

	private checkCityVis(cityID: ComponentID): boolean {
		let result: boolean = false;

		const city = Cities.get(cityID);
		if (city) {
			const visibility = GameplayMap.getRevealedState(GameContext.localObserverID, city.location.x, city.location.y);
			if (visibility == RevealedStates.REVEALED) {
				result = true;
			}
		}

		return result;
	}

	private onCityPopulationChanged(data: CityPopulationChanged_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			if (enableDebugMessages) {
				// Ensure missing city id isn't in the pending creation list (if so, just ignore call).
				const bitfield: number = ComponentID.toBitfield(data.cityID);
				const pendingCityID: ComponentID | undefined = this.citiesNotFullyCreated.get(bitfield);
				if (pendingCityID == undefined || ComponentID.isInvalid(pendingCityID)) {
					const player: PlayerLibrary | null = Players.get(data.cityID.owner);
					if (!player?.isIndependent && this.checkCityVis(data.cityID)) {
						console.error("Unable to set city banner for population change via CityPopulationChanged; none in manager with id: " + ComponentID.toLogString(data.cityID));
					}
				}
			}
			return;
		}
		cityBanner.queueBuildsUpdate();
	}

	private onCityReligionChanged(data: CityReligionChanged_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			if (enableDebugMessages && this.checkCityVis(data.cityID)) {
				console.error("city-banner-manager: Unable to set city banner for religion change via CityReligionChanged; none in manager with id: " + ComponentID.toLogString(data.cityID));
			}
			return;
		}
		cityBanner.realizeReligion();
	}

	private onUrbanReligionChanged(data: UrbanReligionChanged_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			if (enableDebugMessages && this.checkCityVis(data.cityID)) {
				console.error("city-banner-manager: Unable to set city banner for religion change via CityReligionChanged; none in manager with id: " + ComponentID.toLogString(data.cityID));
			}
			return;
		}
		cityBanner.realizeReligion();
	}

	private onRuralReligionChanged(data: RuralReligionChanged_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			if (enableDebugMessages && this.checkCityVis(data.cityID)) {
				console.error("city-banner-manager: Unable to set city banner for religion change via CityReligionChanged; none in manager with id: " + ComponentID.toLogString(data.cityID));
			}
			return;
		}
		cityBanner.realizeReligion();
	}

	private onCityProductionChanged(data: CityProductionChanged_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			if (enableDebugMessages && this.checkCityVis(data.cityID)) {
				console.error("city-banner-manager: Unable to set city banner for production change via cityProductionChanged; none in manager with id: " + ComponentID.toLogString(data.cityID));
			}
			return;
		}
		cityBanner.queueBuildsUpdate();
	}

	private onCityProductionQueueChanged(data: CityProductionChanged_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			if (enableDebugMessages && this.checkCityVis(data.cityID)) {
				console.error("city-banner-manager: Unable to set city banner for production change via CityProductionQueueChanged; none in manager with id: " + ComponentID.toLogString(data.cityID));
			}
			return;
		}
		cityBanner.queueBuildsUpdate();
	}

	private onCityYieldChanged(data: CityYieldChanged_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			const player: PlayerLibrary | null = Players.get(data.cityID.owner);
			if (enableDebugMessages && !player?.isIndependent && this.checkCityVis(data.cityID)) {
				console.error("city-banner-manager: Unable to set city banner for city yields change via CityYieldChanged; none in manager with id: " + ComponentID.toLogString(data.cityID));
			}
			return;
		}
		cityBanner.queueBuildsUpdate();
	}

	private onCityProductionUpdated(data: CityProductionUpdated_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			if (enableDebugMessages && this.checkCityVis(data.cityID)) {
				console.error("city-banner-manager: Unable to set city banner for population change via CityProductioUpdated; none in manager with id: " + ComponentID.toLogString(data.cityID));
			}
			return;
		}
		cityBanner.queueBuildsUpdate();
	}

	private onCityYieldGranted(data: CityYieldGranted_EventData) {
		//Only really need to update banners if recieve these two types of yields
		if (data.yield == YieldTypes.YIELD_FOOD || data.yield == YieldTypes.YIELD_PRODUCTION) {
			const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
			if (cityBanner == undefined) {
				if (enableDebugMessages && this.checkCityVis(data.cityID)) {
					console.error("city-banner-manager: Unable to set city banner for granted yield change via onCityYieldGranted; none in manager with id: " + ComponentID.toLogString(data.cityID));
				}
				return;
			}
			cityBanner.queueBuildsUpdate();
		}
	}

	private onCityFoodQueueUpdated(data: CityProductionUpdated_EventData) {
		const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(data.cityID));
		if (cityBanner == undefined) {
			if (enableDebugMessages && this.checkCityVis(data.cityID)) {
				console.error("city-banner-manager: Unable to set city banner for food queue change via onCityFoodQueueUpdated; none in manager with id: " + ComponentID.toLogString(data.cityID));
			}
			return;
		}
		cityBanner.queueBuildsUpdate();
	}

	private onNotificationAdded(data: Notification_EventData) {
		const thisNotification = Game.Notifications.find(data.id);

		if (thisNotification) {
			const typeName = Game.Notifications.getTypeName(thisNotification.Type);

			switch (typeName) {
				case 'NOTIFICATION_PLAGUE_MAJOR_OUTBREAK':
				case 'NOTIFICATION_PLAGUE_MINOR_OUTBREAK':
				case 'NOTIFICATION_PLAGUE_SPREADS':
				case 'NOTIFICATION_PLAGUE_DISSIPATES':
					if (thisNotification.Target) {
						const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(thisNotification.Target));
						if (cityBanner) {
							cityBanner.realizeHappiness();
						}
					}
					break;
			}
		}
	}

	private onGlobalHide() {
		// We should be able to hide the root element inline, but there's a gameface bug that prevents some children from rendering again
		// this.Root.style.display = 'none';
		this.Root.classList.add('hidden');
	}

	private onGlobalShow() {
		// We should be able to hide the root element inline, but there's a gameface bug that prevents some children from rendering again
		// this.Root.style.display = '';
		this.Root.classList.remove('hidden');

		// we must force a visibility transition on each child that's supposed to be visible due to the above-noted GameFace bug.
		this.banners.forEach((banner: CityBanner) => {
			const vis = banner.getVisibility();
			if (vis != RevealedStates.HIDDEN) {
				banner.setVisibility(RevealedStates.HIDDEN);
				banner.setVisibility(vis);
			}
		});
	}

	// TODO: This is a lot of script search to find a matching city for a given plot.  Add feature of engine for fast lookup?
	private onPlotVisibilityChanged(data: PlotVisibilityChanged_EventData) {
		const location: float2 = data.location;
		const playerID: PlayerId = GameplayMap.getOwner(location.x, location.y);
		if (playerID == PlayerIds.NO_PLAYER) {
			return;	// No one owns this plot, nothing city related to do.
		}

		const player: PlayerLibrary | null = Players.get(playerID);
		if (!player) {
			return;
		}

		if (player.isIndependent) {
			this.banners.forEach((banner: CityBannerComponent, _key: number) => {
				if (banner.bannerLocation.x == data.location.x && banner.bannerLocation.y == data.location.y) {
					banner.setVisibility(data.visibility);
					return;
				}
			});
		}

		const playerCities: PlayerCities | undefined = player.Cities;
		if (playerCities == undefined) {
			console.error("Banner checking plot visibility change; no cities for player: " + player.leaderType);
			return;
		}
		const cityIDs: ComponentID[] = playerCities.getCityIds();
		for (const cityID of cityIDs) {
			const city: City | null = Cities.get(cityID);
			if (city == null) {
				console.error("Banner checking plot visibility change; NULL city. cid: " + ComponentID.toLogString(cityID));
				continue;
			}
			const isCityBannerPlot: boolean = (city.location.x == location.x && city.location.y == location.y);
			const districtIDs: ComponentID[] | undefined = city.Districts?.getIds();
			if (districtIDs == undefined) {
				console.error("Banner checking plot visibility change; no district IDs for city. cid: " + ComponentID.toLogString(cityID));
				continue;
			}
			for (const districtID of districtIDs) {
				const district: District | null = Districts.get(districtID);
				if (!district) {
					console.error("Banner checking plot visibility change; null district.  DistrictID: " + ComponentID.toLogString(districtID) + ", cid: " + ComponentID.toLogString(cityID));
					continue;
				}
				if (district.location.x == location.x && district.location.y == location.y) {
					const cityBanner: CityBanner | undefined = this.banners.get(ComponentID.toBitfield(cityID));
					if (cityBanner == undefined) {
						console.error(`Unable to change the banner visibility of city's plot ${data.location.x}, ${data.location.y} because no city banner return for id: ${ComponentID.toLogString(cityID)}`);
						return;
					}
					if (isCityBannerPlot) {
						cityBanner.setVisibility(data.visibility);
					}
					return;
				}
			}
		}
	}
}

export { CityBannerManager as default };

Controls.define('city-banners', {
	createInstance: CityBannerManager,
	description: 'City Banners',
	requires: ['city-banner']
})
