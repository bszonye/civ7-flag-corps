import { Portal } from '/core/vendor/solid-js/web/dist/web.js';
import { onMount, onCleanup, createComponent, For } from '/core/vendor/solid-js/dist/solid.js';
import { createStore } from '/core/vendor/solid-js/store/dist/store.js';
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';
import { createArraySignal } from '/core/ui-next/utilities/solid-utilities.js';
import { computeFullBannerData, computeRelationship, computeIdentity, computeCapitalInfo, computeReligionInfo, computeConquered, computeStatusInfo } from '/base-standard/ui-next/screens/city-banners/city-banner-data.js';
import { CityBanner } from '/base-standard/ui-next/screens/city-banners/city-banner.js';
import { CityBannersStressTest } from '/base-standard/ui-next/screens/city-banners/city-banners-stress-test.js';

function indexResourceTypes() {
  const yieldTagTypes = /* @__PURE__ */ new Map([["FOOD", "YIELD_FOOD"], ["PRODUCTION", "YIELD_PRODUCTION"], ["GOLD", "YIELD_GOLD"], ["SCIENCE", "YIELD_SCIENCE"], ["CULTURE", "YIELD_CULTURE"], ["HAPPINESS", "YIELD_HAPPINESS"]]);
  const resourceYields = /* @__PURE__ */ new Map();
  GameInfo.Resources.forEach((resource) => {
    resourceYields.set(resource.ResourceType, /* @__PURE__ */ new Set());
  });
  GameInfo.TypeTags.forEach((typeTag) => {
    const yields = resourceYields.get(typeTag.Type);
    const yieldType = yieldTagTypes.get(typeTag.Tag);
    if (yields && yieldType) {
      yields.add(yieldType);
    }
  });
  return resourceYields;
}
const resourceYieldTags = indexResourceTypes();
function isVillageConstructible(constructible) {
  const definition = GameInfo.Constructibles.lookup(constructible.type);
  return definition?.ConstructibleType == "IMPROVEMENT_VILLAGE" || definition?.ConstructibleType == "IMPROVEMENT_ENCAMPMENT";
}
function getInitialBannerData() {
  const cityIds = [];
  const villageLocations = /* @__PURE__ */ new Map();
  for (const player of Players.getAlive()) {
    const playerCities = player.Cities;
    if (playerCities) {
      cityIds.push(...playerCities.getCityIds());
    }
    if (!player.isIndependent) {
      continue;
    }
    for (const constructible of player.Constructibles?.getConstructibles() ?? []) {
      if (!isVillageConstructible(constructible) || ComponentID.isMatchInArray(cityIds, constructible.cityId)) {
        continue;
      }
      cityIds.push(constructible.cityId);
      villageLocations.set(ComponentID.toBitfield(constructible.cityId), constructible.location);
    }
  }
  return {
    cityIds,
    villageLocations
  };
}
const CityBanners = () => {
  const initialBannerData = getInitialBannerData();
  const [cityIds, mutateCityIds] = createArraySignal(initialBannerData.cityIds);
  const bannerStores = /* @__PURE__ */ new Map();
  const villageLocations = initialBannerData.villageLocations;
  const pendingCityIds = /* @__PURE__ */ new Map();
  const bannerContainer = document.getElementById("city-banner-container");
  let restoreVisibilityFrame;
  function getVillageLocation(cityID) {
    return villageLocations.get(ComponentID.toBitfield(cityID));
  }
  function getOrCreateBannerStore(cityID) {
    const key = ComponentID.toBitfield(cityID);
    let entry = bannerStores.get(key);
    if (!entry) {
      const initialData = computeFullBannerData(cityID, getVillageLocation(cityID));
      if (!initialData) {
        return void 0;
      }
      const [store, setStore] = createStore(initialData);
      entry = [store, setStore];
      bannerStores.set(key, entry);
    }
    return entry;
  }
  function updateBanner(cityID, slice, data) {
    if (data === null) {
      return;
    }
    bannerStores.get(ComponentID.toBitfield(cityID))?.[1](slice, data);
  }
  function refreshAllRelationships() {
    for (const cityID of cityIds()) {
      updateBanner(cityID, "relationship", computeRelationship(cityID.owner));
    }
  }
  function onCityAddedToMap(data) {
    pendingCityIds.set(ComponentID.toBitfield(data.cityID), data.cityID);
  }
  function onCityInitialized(data) {
    pendingCityIds.delete(ComponentID.toBitfield(data.cityID));
    mutateCityIds((ids) => {
      if (!ComponentID.isMatchInArray(ids, data.cityID)) {
        ids.push(data.cityID);
      }
    });
  }
  function onCityRemovedFromMap(data) {
    pendingCityIds.delete(ComponentID.toBitfield(data.cityID));
    villageLocations.delete(ComponentID.toBitfield(data.cityID));
    mutateCityIds((ids) => {
      const index = ids.findIndex((id) => ComponentID.isMatch(id, data.cityID));
      if (index !== -1) {
        ids.splice(index, 1);
      }
    });
    bannerStores.delete(ComponentID.toBitfield(data.cityID));
  }
  function onIdentityChanged(data) {
    updateBanner(data.cityID, "identity", computeIdentity(data.cityID, getVillageLocation(data.cityID)));
  }
  function onCityGovernmentLevelChanged(data) {
    if (data.governmentlevel == CityGovernmentLevels.CITY || data.governmentlevel == CityGovernmentLevels.TOWN) {
      updateBanner(data.cityID, "identity", computeIdentity(data.cityID, getVillageLocation(data.cityID)));
    }
  }
  function onCityStateBonusChosen(data) {
    for (const cityID of cityIds()) {
      if (cityID.owner == data.cityState) {
        updateBanner(cityID, "identity", computeIdentity(cityID, getVillageLocation(cityID)));
      }
    }
  }
  function onCapitalCityChanged(data) {
    updateBanner(data.cityID, "capital", computeCapitalInfo(data.cityID));
  }
  function onReligionChanged(data) {
    updateBanner(data.cityID, "religion", computeReligionInfo(data.cityID));
  }
  function onConqueredSettlementIntegrated(data) {
    if (data.cityID.owner != GameContext.localObserverID) {
      return;
    }
    updateBanner(data.cityID, "conquered", computeConquered(data.cityID));
  }
  function onAffinityLevelChanged(data) {
    if (data.player == GameContext.localObserverID) {
      refreshAllRelationships();
    }
  }
  function onDiplomacyRelationshipChanged(data) {
    if (data.player1 == GameContext.localObserverID || data.player2 == GameContext.localObserverID) {
      refreshAllRelationships();
    }
  }
  function onDiplomacyEventStarted(data) {
    if (data.location) {
      refreshAllRelationships();
    }
  }
  function onDiplomacyEventEnded(data) {
    // TRIX: this needs a full refresh when wars end
    if (data.location) {
      refreshAllRelationships();
    }
  }
  function onLocalPlayerChanged() {
    for (const cityID of cityIds()) {
      updateBanner(cityID, "identity", computeIdentity(cityID, getVillageLocation(cityID)));
    }
    refreshAllRelationships();
  }
  function onStatusChanged(data) {
    updateBanner(data.cityID, "status", computeStatusInfo(data.cityID, getVillageLocation(data.cityID)));
  }
  function onPlotVisibilityChanged(data) {
    for (const cityID of cityIds()) {
      const location = getVillageLocation(cityID) ?? Cities.get(cityID)?.location;
      if (location?.x == data.location.x && location.y == data.location.y) {
        bannerStores.get(ComponentID.toBitfield(cityID))?.[1]("status", "visible", data.visibility != RevealedStates.HIDDEN);
        return;
      }
    }
  }
  function onGlobalHide() {
    if (restoreVisibilityFrame !== void 0) {
      cancelAnimationFrame(restoreVisibilityFrame);
      restoreVisibilityFrame = void 0;
    }
    bannerContainer.classList.add("hidden");
  }
  function onGlobalShow() {
    if (restoreVisibilityFrame !== void 0) {
      cancelAnimationFrame(restoreVisibilityFrame);
    }
    bannerContainer.classList.remove("hidden");
    const visibleCityIds = [];
    for (const cityID of cityIds()) {
      const location = getVillageLocation(cityID) ?? Cities.get(cityID)?.location;
      if (location && GameplayMap.getRevealedState(GameContext.localObserverID, location.x, location.y) != RevealedStates.HIDDEN) {
        bannerStores.get(ComponentID.toBitfield(cityID))?.[1]("status", "visible", false);
        visibleCityIds.push(cityID);
      }
    }
    restoreVisibilityFrame = requestAnimationFrame(() => {
      restoreVisibilityFrame = void 0;
      for (const cityID of visibleCityIds) {
        const location = getVillageLocation(cityID) ?? Cities.get(cityID)?.location;
        if (!location) {
          continue;
        }
        bannerStores.get(ComponentID.toBitfield(cityID))?.[1]("status", "visible", GameplayMap.getRevealedState(GameContext.localObserverID, location.x, location.y) != RevealedStates.HIDDEN);
      }
    });
  }
  function onCityYieldGranted(data) {
    if (data.yield == YieldTypes.YIELD_FOOD || data.yield == YieldTypes.YIELD_PRODUCTION) {
      updateBanner(data.cityID, "status", computeStatusInfo(data.cityID, getVillageLocation(data.cityID)));
    }
  }
  function onDistrictAddedToMap(data) {
    if (data.cityID.owner == PlayerIds.NO_PLAYER) {
      return;
    }
    const player = Players.get(GameplayMap.getOwner(data.location.x, data.location.y));
    if (!player?.isIndependent) {
      return;
    }
    const cityID = GameplayMap.getOwningCityFromXY(data.location.x, data.location.y);
    if (!cityID || ComponentID.isInvalid(cityID)) {
      console.error(`CityBanners: invalid village at ${data.location.x},${data.location.y}`);
      return;
    }
    const constructibleIds = MapConstructibles.getConstructibles(data.location.x, data.location.y);
    const hasVillage = constructibleIds.some((constructibleID) => {
      const constructible = Constructibles.getByComponentID(constructibleID);
      return constructible ? isVillageConstructible(constructible) : false;
    });
    if (!hasVillage) {
      return;
    }
    villageLocations.set(ComponentID.toBitfield(cityID), data.location);
    mutateCityIds((ids) => {
      if (!ComponentID.isMatchInArray(ids, cityID)) {
        ids.push(cityID);
      }
    });
  }
  function onDistrictRemovedFromMap(data) {
    const key = ComponentID.toBitfield(data.cityID);
    const location = villageLocations.get(key);
    if (!location || location.x != data.location.x || location.y != data.location.y) {
      return;
    }
    villageLocations.delete(key);
    bannerStores.delete(key);
    mutateCityIds((ids) => {
      const index = ids.findIndex((cityID) => ComponentID.isMatch(cityID, data.cityID));
      if (index !== -1) {
        ids.splice(index, 1);
      }
    });
  }
  function onResourceChanged(data) {
    if (!bannerStores.has(ComponentID.toBitfield(data.targetCity))) {
      console.error("A resource was changed in a city but no associated banner was found. cid: ", ComponentID.toLogString(data.targetCity));
      return;
    }
    const resourceDef = GameInfo.Resources.lookup(data.resourceType);
    if (resourceDef && resourceYieldTags.get(resourceDef.ResourceType)?.has("YIELD_HAPPINESS")) {
      updateBanner(data.targetCity, "status", computeStatusInfo(data.targetCity, getVillageLocation(data.targetCity)));
    }
  }
  function onNotificationAdded(data) {
    const notification = Game.Notifications.find(data.id);
    if (!notification) {
      return;
    }
    switch (Game.Notifications.getTypeName(notification.Type)) {
      case "NOTIFICATION_PLAGUE_MAJOR_OUTBREAK":
      case "NOTIFICATION_PLAGUE_MINOR_OUTBREAK":
      case "NOTIFICATION_PLAGUE_SPREADS":
      case "NOTIFICATION_PLAGUE_DISSIPATES":
        if (notification.Target) {
          updateBanner(notification.Target, "status", computeStatusInfo(notification.Target));
        }
        break;
    }
  }
  onMount(() => {
    engine.on("CityAddedToMap", onCityAddedToMap);
    engine.on("CityInitialized", onCityInitialized);
    engine.on("CityRemovedFromMap", onCityRemovedFromMap);
    engine.on("CityNameChanged", onIdentityChanged);
    engine.on("CityGovernmentLevelChanged", onCityGovernmentLevelChanged);
    engine.on("SuzerainChanged", onCityStateBonusChosen);
    engine.on("CityStateBonusChosen", onCityStateBonusChosen);
    engine.on("CapitalCityChanged", onCapitalCityChanged);
    engine.on("CityReligionChanged", onReligionChanged);
    engine.on("UrbanReligionChanged", onReligionChanged);
    engine.on("RuralReligionChanged", onReligionChanged);
    engine.on("ConqueredSettlementIntegrated", onConqueredSettlementIntegrated);
    engine.on("AffinityLevelChanged", onAffinityLevelChanged);
    engine.on("DiplomacyEventEnded", onDiplomacyEventEnded);
    engine.on("DiplomacyEventStarted", onDiplomacyEventStarted);
    engine.on("DiplomacyRelationshipChanged", onDiplomacyRelationshipChanged);
    engine.on("DistrictAddedToMap", onDistrictAddedToMap);
    engine.on("DistrictRemovedFromMap", onDistrictRemovedFromMap);
    engine.on("LocalPlayerChanged", onLocalPlayerChanged);
    engine.on("CityPopulationChanged", onStatusChanged);
    engine.on("CityYieldChanged", onStatusChanged);
    engine.on("CityYieldGranted", onCityYieldGranted);
    engine.on("CityProductionChanged", onStatusChanged);
    engine.on("CityProductionUpdated", onStatusChanged);
    engine.on("CityProductionQueueChanged", onStatusChanged);
    engine.on("CityGrowthModeChanged", onStatusChanged);
    engine.on("FoodQueueChanged", onStatusChanged);
    engine.on("NotificationAdded", onNotificationAdded);
    engine.on("PlotVisibilityChanged", onPlotVisibilityChanged);
    engine.on("ResourceAssigned", onResourceChanged);
    engine.on("ResourceUnassigned", onResourceChanged);
    window.addEventListener("ui-hide-city-banners", onGlobalHide);
    window.addEventListener("ui-show-city-banners", onGlobalShow);
  });
  onCleanup(() => {
    engine.off("CityAddedToMap", onCityAddedToMap);
    engine.off("CityInitialized", onCityInitialized);
    engine.off("CityRemovedFromMap", onCityRemovedFromMap);
    engine.off("CityNameChanged", onIdentityChanged);
    engine.off("CityGovernmentLevelChanged", onCityGovernmentLevelChanged);
    engine.off("SuzerainChanged", onCityStateBonusChosen);
    engine.off("CityStateBonusChosen", onCityStateBonusChosen);
    engine.off("CapitalCityChanged", onCapitalCityChanged);
    engine.off("CityReligionChanged", onReligionChanged);
    engine.off("UrbanReligionChanged", onReligionChanged);
    engine.off("RuralReligionChanged", onReligionChanged);
    engine.off("ConqueredSettlementIntegrated", onConqueredSettlementIntegrated);
    engine.off("AffinityLevelChanged", onAffinityLevelChanged);
    engine.off("DiplomacyEventEnded", onDiplomacyEventEnded);
    engine.off("DiplomacyEventStarted", onDiplomacyEventStarted);
    engine.off("DiplomacyRelationshipChanged", onDiplomacyRelationshipChanged);
    engine.off("DistrictAddedToMap", onDistrictAddedToMap);
    engine.off("DistrictRemovedFromMap", onDistrictRemovedFromMap);
    engine.off("LocalPlayerChanged", onLocalPlayerChanged);
    engine.off("CityPopulationChanged", onStatusChanged);
    engine.off("CityYieldChanged", onStatusChanged);
    engine.off("CityYieldGranted", onCityYieldGranted);
    engine.off("CityProductionChanged", onStatusChanged);
    engine.off("CityProductionUpdated", onStatusChanged);
    engine.off("CityProductionQueueChanged", onStatusChanged);
    engine.off("CityGrowthModeChanged", onStatusChanged);
    engine.off("FoodQueueChanged", onStatusChanged);
    engine.off("NotificationAdded", onNotificationAdded);
    engine.off("PlotVisibilityChanged", onPlotVisibilityChanged);
    engine.off("ResourceAssigned", onResourceChanged);
    engine.off("ResourceUnassigned", onResourceChanged);
    window.removeEventListener("ui-hide-city-banners", onGlobalHide);
    window.removeEventListener("ui-show-city-banners", onGlobalShow);
    if (restoreVisibilityFrame !== void 0) {
      cancelAnimationFrame(restoreVisibilityFrame);
    }
  });
  return (
    // TODO: remove portal when the UI is solidjs managed
    createComponent(Portal, {
      mount: bannerContainer,
      get children() {
        return [createComponent(For, {
          get each() {
            return cityIds();
          },
          children: (cityId) => {
            const entry = getOrCreateBannerStore(cityId);
            return entry ? createComponent(CityBanner, {
              cityID: cityId,
              get data() {
                return entry[0];
              }
            }) : null;
          }
        }), createComponent(CityBannersStressTest, {
          get cityIds() {
            return cityIds();
          },
          getBannerData: (cityID) => getOrCreateBannerStore(cityID)?.[0]
        })];
      }
    })
  );
};

export { CityBanners };
//# sourceMappingURL=city-banners.js.map
// vim: sw=2
