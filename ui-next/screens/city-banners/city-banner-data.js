import { createSignal, onMount, onCleanup } from '../../../../core/vendor/solid-js/dist/solid.js';
import { createStore } from '../../../../core/vendor/solid-js/store/dist/store.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { Icon } from '../../../../core/ui/utilities/utilities-image.js';
import { ModelRegistry, ModelLifecycle } from '../../../../core/ui-next/services/model-registry.js';
import { createArraySignal } from '../../../../core/ui-next/utilities/solid-utilities.js';
import { ProductionPanelCategory } from '../../../ui/production-chooser/production-chooser-helpers.js';
import { getTextColors, getTownFocusInfo } from '/bz-flag-corps/ui-next/screens/city-banners/bz-city-banner.js';

var BannerType = /* @__PURE__ */ ((BannerType2) => {
  BannerType2["Town"] = "town";
  BannerType2["City"] = "city";
  BannerType2["Village"] = "village";
  BannerType2["CityState"] = "citystate";
  return BannerType2;
})(BannerType || {});
function hasProxyWarDiplomacy(diplomacy) {
  return "isCityStateInProxyWar" in diplomacy;
}
const portraitMoods = {
  ECSTATIC: "friendly",
  JOYOUS: "friendly",
  HAPPY: "neutral",
  UNHAPPY: "hostile",
  ANGRY: "hostile",
};
const happinessStages = [];
GameInfo.HappinessStages.forEach((row) => {
  const type = row.HappinessStageType.replace("HAPPINESS_STAGE_", "");
  happinessStages.push({
    name: "LOC_UI_CITY_DETAILS_" + type,
    icon: "YIELD_" + type,
    min: row.StageMinThreshold ?? -Infinity,
    max: row.StageMaxThreshold ?? Infinity,
    // TRIX
    "class": "city-banner--" + type.toLowerCase(),
    level: 2 - row.$index,
    mood: portraitMoods[type],
  });
});
function processBuilds(buildQueue, cityProduction) {
  const queueData = [];
  const queueNodes = buildQueue.getQueue() ?? [];
  const queueMax = 4;
  if (queueNodes.length > 0) {
    for (let index = 0; index < queueNodes.length; index++) {
      if (index > queueMax) break;
      const queueItem = queueNodes[index];
      switch (queueItem.kind) {
        case ProductionKind.CONSTRUCTIBLE: {
          const buildingInfo = GameInfo.Constructibles.lookup(queueItem.constructibleType);
          if (buildingInfo) {
            queueData.push({
              type: buildingInfo.ConstructibleType,
              name: buildingInfo.Name,
              icon: `url('${Icon.getConstructibleIconFromDefinition(buildingInfo)}')`,
              kind: ProductionPanelCategory.BUILDINGS,
              cost: cityProduction.getConstructibleProductionCost(buildingInfo.ConstructibleType),
              progress: buildQueue.getPercentComplete(queueItem.type),
              turns: buildQueue.getTurnsLeft(queueItem.constructibleType)
            });
          }
          break;
        }
        case ProductionKind.UNIT: {
          const unitInfo = GameInfo.Units.lookup(queueItem.unitType);
          if (unitInfo) {
            queueData.push({
              type: unitInfo.UnitType,
              name: unitInfo.Name,
              icon: `url('${Icon.getUnitIconFromDefinition(unitInfo)}')`,
              kind: ProductionPanelCategory.UNITS,
              cost: cityProduction.getUnitProductionCost(unitInfo.UnitType),
              progress: buildQueue.getPercentComplete(queueItem.type),
              turns: buildQueue.getTurnsLeft(queueItem.unitType)
            });
          }
          break;
        }
        case ProductionKind.PROJECT: {
          const projectInfo = GameInfo.Projects.lookup(queueItem.projectType);
          if (projectInfo) {
            queueData.push({
              type: projectInfo.ProjectType,
              name: projectInfo.Name,
              icon: `url('${Icon.getProjectIconFromDefinition(projectInfo)}')`,
              kind: ProductionPanelCategory.PROJECTS,
              cost: cityProduction.getProjectProductionCost(projectInfo.ProjectType),
              progress: buildQueue.getPercentComplete(queueItem.type),
              turns: buildQueue.getTurnsLeft(queueItem.projectType)
            });
          }
          break;
        }
        default:
          break;
      }
    }
  }
  while (queueData.length <= queueMax) {
    queueData.push({
      type: "",
      name: "",
      icon: "",
      kind: ProductionPanelCategory.BUILDINGS,
      cost: 0,
      progress: 0,
      turns: 0
    });
  }
  return queueData;
}
const [areCityBannersDisabled, setCityBannersDisabled] = createSignal(false);
function getBannerType(city, player) {
  if (!city) {
    return "village" /* Village */;
  }
  return player.isMinor ? "citystate" /* CityState */ : city.isTown ? "town" /* Town */ : "city" /* City */;
}
function computeIdentity(cityID, location) {
  const city = Cities.get(cityID);
  const validCity = city?.isValid ? city : null;
  const player = Players.get(cityID.owner);
  const bannerLocation = validCity?.location ?? location;
  if (!player || !bannerLocation) {
    return null;
  }
  const isLocalPlayerCity = cityID.owner === GameContext.localObserverID;
  const bannerType = getBannerType(validCity, player);
  let cityStateColor = "";
  let cityStateIcon = "";
  let cityStateTypeName = "";
  let cityStateBonusType = "";
  let bonusDefinition = void 0;
  if (bannerType == "citystate" /* CityState */ || bannerType == "village" /* Village */) {
    const bonusType = Game.CityStates.getBonusType(cityID.owner);
    bonusDefinition = GameInfo.CityStateBonuses.find((t) => t.$hash == bonusType);
    let indCivType = GameInfo.Civilizations.lookup(player.civilizationType)?.CivilizationType;
    GameInfo.Independents.forEach((indDef) => {
      if (player.civilizationAdjective == indDef.CityStateName) {
        indCivType = indDef.CityStateType;
      }
    });
    switch (indCivType) {
      case "MILITARISTIC":
        cityStateColor = "#AF1B1C";
        cityStateIcon = "url('blp:bonustype_militaristic.png')";
        cityStateTypeName = "LOC_ATTRIBUTE_MILITARISTIC";
        break;
      case "SCIENTIFIC":
        cityStateColor = "#4D7C96";
        cityStateIcon = "url('blp:bonustype_scientific.png')";
        cityStateTypeName = "LOC_ATTRIBUTE_SCIENTIFIC";
        break;
      case "ECONOMIC":
        cityStateColor = "#FFD535";
        cityStateIcon = "url('blp:bonustype_economic.png')";
        cityStateTypeName = "LOC_ATTRIBUTE_ECONOMIC";
        break;
      case "CULTURAL":
        cityStateColor = "#892BB3";
        cityStateIcon = "url('blp:bonustype_cultural.png')";
        cityStateTypeName = "LOC_ATTRIBUTE_CULTURAL";
        break;
      case "DIPLOMATIC":
        cityStateColor = "#255BE4";
        cityStateIcon = "url('blp:bonustype_diplomatic.png')";
        cityStateTypeName = "LOC_ATTRIBUTE_POLITICAL";
        break;
      case "EXPANSIONIST":
        cityStateColor = "#00A717";
        cityStateIcon = "url('blp:bonustype_expansionist.png')";
        cityStateTypeName = "LOC_ATTRIBUTE_EXPANSIONIST";
        break;
      case "CIVILIZATION_INDEPENDENT":
        cityStateColor = "#AF1B1C";
        cityStateIcon = "url('blp:bonustype_crisis.png')";
        cityStateTypeName = "LOC_IMPROVEMENT_ENCAMPMENT_NAME";
        break;
    }
  }
  const suzerainPlayerId = player.isMinor && player.Influence?.hasSuzerain ?
    player.Influence.getSuzerain() : PlayerIds.NO_PLAYER;
  const leader = Players.get(player.isMajor ? player.id : suzerainPlayerId);
  const leaderType = leader?.leaderType ?? -1;
  const leaderInfo = GameInfo.Leaders.lookup(leaderType);
  const leaderName = leaderInfo?.Name ?? "LOC_LEADER_NONE_NAME";
  const portraitIcons = leader ? {
    friendly: UI.getIconURL(leaderInfo.LeaderType, "LEADER_HAPPY"),
    neutral: UI.getIconURL(leaderInfo.LeaderType),
    hostile: UI.getIconURL(leaderInfo.LeaderType, "LEADER_ANGRY"),
  } : {
    friendly: "blp:icon_razed",
    neutral: "blp:icon_razed",
    hostile: "blp:icon_razed",
  }
  const portraitIcon = portraitIcons.neutral;
  const isRival = leader && leader.id != GameContext.localObserverID;
  const civ = leader?.civilizationType ?? -1;
  const civInfo = GameInfo.Civilizations.lookup(civ);
  const civIcon = civInfo && UI.getIconCSS(civInfo.CivilizationType);
  const civName = GameplayMap.getOwnerName(bannerLocation.x, bannerLocation.y);

  const owner = cityID.owner;
  const cityStateBonusName = bonusDefinition?.Name ?? "";
  // TRIX: handle towns conquered by villages & encampments
  let playerColorPrimary = player.isIndependent ? "black" :
    UI.Player.getPrimaryColorValueAsString(owner);
  const playerColorSecondary = player.isIndependent ? "white" :
    UI.Player.getSecondaryColorValueAsString(owner);
  // if (playerColorPrimary == playerColorSecondary) {
  //   playerColorPrimary = "rgb(155, 0, 0)";
  // }
  const { playerColorText, playerColorLighting } = getTextColors(owner);  // TRIX
  return {
    location: bannerLocation,
    bannerType,
    isLocalPlayerCity,
    name: validCity?.name ?? player.civilizationFullName,
    leaderName,
    cityID,
    civName,
    cityStateBonusName,
    portraitIcon,
    cityStateColor,
    suzerainPlayerId,
    cityStateBonusType,
    cityStateTypeName,
    cityStateIcon,
    playerColorPrimary,
    playerColorSecondary,
    // TRIX
    civIcon,
    isRival,
    playerColorLighting,
    playerColorText,
    portraitIcons,
  };
}
function computeCapitalInfo(cityID, location) {
  const city = Cities.get(cityID);
  const player = Players.get(cityID.owner);
  if (!player || !city || !city.isValid) {
    return location ? { isCapital: false, isOriginalCapital: false, isOriginalCapitalCurrent: false } : null;
  }
  const showCapitalIndicators = !player.isIndependent && !player.isMinor;
  return {
    isCapital: showCapitalIndicators && city.isCapital,
    isOriginalCapital: showCapitalIndicators && city.isOriginalCapital,
    isOriginalCapitalCurrent: showCapitalIndicators && city.isCapital && city.isOriginalCapital
  };
}
function computeReligionInfo(cityID, location) {
  let hasReligion = false;
  let urbanReligionType;
  let urbanReligionTooltip;
  let urbanReligionTooltipArgs = [];
  let showRuralReligion = false;
  let ruralReligionType;
  let ruralReligionTooltip;
  let ruralReligionTooltipArgs = [];
  let isHolyCity = false;
  const city = Cities.get(cityID);
  if (!city || !city.isValid) {
    return location ? {
      isHolyCity,
      hasReligion,
      urbanReligionType,
      urbanReligionTooltip,
      urbanReligionTooltipArgs,
      showRuralReligion,
      ruralReligionType,
      ruralReligionTooltip,
      ruralReligionTooltipArgs
    } : null;
  }
  const cityReligion = city.Religion;
  isHolyCity = cityReligion?.isHolyCity ?? false;
  const majorityReligion = GameInfo.Religions.lookup(cityReligion?.majorityReligion ?? -1);
  if (majorityReligion) {
    const religionPlayer = Players.get(Game.Religion.getPlayerFromReligion(majorityReligion.ReligionType));
    const playerReligion = religionPlayer?.Religion;
    if (playerReligion) {
      hasReligion = true;
      urbanReligionType = majorityReligion.ReligionType;
      urbanReligionTooltip = playerReligion.getReligionName();
    }
  } else {
    const urbanReligion = GameInfo.Religions.lookup(cityReligion?.urbanReligion ?? -1);
    if (urbanReligion) {
      const urbanReligionPlayer = Players.get(Game.Religion.getPlayerFromReligion(urbanReligion.ReligionType));
      const urbanPlayerRel = urbanReligionPlayer?.Religion;
      if (urbanPlayerRel) {
        hasReligion = true;
        urbanReligionType = urbanReligion.ReligionType;
        urbanReligionTooltip = "{LOC_DISTRICT_URBAN_NAME}[N]{1_ReligionName}";
        urbanReligionTooltipArgs = [urbanPlayerRel.getReligionName()];
      }
    }
    const ruralReligion = GameInfo.Religions.lookup(cityReligion?.ruralReligion ?? -1);
    if (ruralReligion) {
      const ruralReligionPlayer = Players.get(Game.Religion.getPlayerFromReligion(ruralReligion.ReligionType));
      const ruralPlayerRel = ruralReligionPlayer?.Religion;
      if (ruralPlayerRel) {
        hasReligion = true;
        showRuralReligion = true;
        ruralReligionType = ruralReligion.ReligionType;
        ruralReligionTooltip = "{LOC_DISTRICT_RURAL_NAME}[N]{1_ReligionName}";
        ruralReligionTooltipArgs = [ruralPlayerRel.getReligionName()];
      }
    }
  }
  return {
    isHolyCity,
    hasReligion,
    urbanReligionType,
    urbanReligionTooltip,
    urbanReligionTooltipArgs,
    showRuralReligion,
    ruralReligionType,
    ruralReligionTooltip,
    ruralReligionTooltipArgs
  };
}
function computeWarInfo(playerID) {
  const player = Players.get(playerID);
  const diplomacy = player?.Diplomacy;
  const isAtWar = diplomacy?.isAtWarWith(GameContext.localPlayerID) ?? false;
  const isInProxyWar = diplomacy && hasProxyWarDiplomacy(diplomacy) ? diplomacy.isCityStateInProxyWar() : false;
  const controllingPlayerId = player?.Influence?.hasSuzerain ? player.Influence.getSuzerain() : PlayerIds.NO_PLAYER;
  return { isAtWar, isInProxyWar, controllingPlayerId };
}
function computeConquered(cityID, location) {
  const city = Cities.get(cityID);
  if (!city || !city.isValid) {
    return location ? false : null;
  }
  return city.originalOwner != city.owner && city.mostRecentTranseferType != CityTransferTypes.BY_INCORPORATE_CITY_STATE && city.owner == GameContext.localObserverID;
}
function computeRelationship(playerID) {
  const localPlayerID = GameContext.localObserverID;
  if (localPlayerID == PlayerIds.NO_PLAYER && Autoplay.isActive) {
    return void 0;
  }
  const player = Players.get(playerID);
  if (!player) {
    return void 0;
  }
  if (player.Diplomacy?.isAtWarWith(localPlayerID)) return "hostile";  // TRIX
  if (player.Diplomacy?.hasAllied(localPlayerID)) return "friendly";  // TRIX
  let relationship = Game.IndependentPowers.getIndependentRelationship(playerID, localPlayerID);
  if (player.isMinor) {
    const suzerain = player.Influence?.hasSuzerain ? Players.get(player.Influence.getSuzerain()) : null;
    if (suzerain) {
      if (suzerain.id == localPlayerID) return "friendly";
      relationship = Game.IndependentPowers.getIndependentRelationship(suzerain.id, localPlayerID);
    }
  }
  switch (relationship) {
    case IndependentRelationship.FRIENDLY:
      return "friendly";
    case IndependentRelationship.HOSTILE:
      return "hostile";
    case IndependentRelationship.NEUTRAL:
      return "neutral";
    default:
      return void 0;
  }
}
function computeStatusInfo(cityID, location) {
  const city = Cities.get(cityID);
  if (!city || !city.isValid) {
    return location ? {
      visible: GameplayMap.getRevealedState(GameContext.localObserverID, location.x, location.y) != RevealedStates.HIDDEN,
      disabled: areCityBannersDisabled,
      statusIcon: "",
      statusTooltip: "",
      tradeNetworkHidden: true,
      tradeNetworkTooltip: "",
      hasUnrest: false,
      unrestTurns: 0,
      isBeingRazed: false,
      razedTurns: 0,
      population: 0,
      currentFood: 0,
      growthThreshold: 0,
      turnsUntilGrowth: 0,
      foodPerTurn: 0,
      canGrow: false,
      growthType: null,
      projectType: null,
      showProductionQueue: false,
      prodPerTurn: 0,
      turnsLeft: 0,
      percent: 0,
      currentProduction: void 0,
      buildQueue: [],
      // TRIX
      townFocusInfo: {},
      tradeNetworkConnections: [],
      isInfected: false,
      happinessStage: {},
    } : null;
  }
  const isLocalPlayerCity = cityID.owner === GameContext.localObserverID;
  const happiness = city.Yields?.getYield(YieldTypes.YIELD_HAPPINESS) ?? 0;
  const happinessStage = happinessStages
    .find(stage => stage.min <= happiness && happiness <= stage.max);
  const isInfected = city.isInfected;
  const statusTooltip =
    isInfected ? "LOC_UI_CITY_DETAILS_INFECTED" : happinessStage.name;
  const statusIcon =
    `url('${UI.getIconURL(isInfected ? "YIELD_PLAGUE" : happinessStage.icon, "YIELD")}')`;
  const tradeNetworkConnections = [];
  const ids = city.getConnectedCities() ?? [];
  for (const id of ids) {
      const conn = Cities.get(id);
      if (conn) tradeNetworkConnections.push(conn); // ignore stale connections
  }
  const tradeNetworkDisconnected = city.Trade && !city.Trade.isInTradeNetwork();
  const tradeNetworkHidden = false;  // !isLocalPlayerCity;
  const tradeNetworkTooltip = [
    tradeNetworkConnections.length || !tradeNetworkDisconnected ?
    Locale.compose(
      "LOC_UI_CITY_DETAILS_NUMBER_OF_CONNECTIONS",
      city.name, tradeNetworkConnections.length
    ) : null,
    tradeNetworkDisconnected ? "{LOC_UI_CITY_STATUS_TRADE_NOT_CONNECTED} {LOC_UI_CITY_STATUS_TRADE_NOT_CONNECTED_DESCRIPTION}" : null,
  ].filter(e => e).join("[n] [n]");
  let showProductionQueue = false;
  let prodPerTurn = 0;
  let turnsLeft = 0;
  let percent = 0;
  let currentProduction = void 0;
  let buildQueue = [];
  if (isLocalPlayerCity && city.BuildQueue && city.Production && !city.BuildQueue.isEmpty) {
    showProductionQueue = true;
    const cityBuildQueue = city.BuildQueue;
    prodPerTurn = city.Yields?.getNetYield(YieldTypes.YIELD_PRODUCTION) ?? 0;
    turnsLeft = cityBuildQueue.currentTurnsLeft;
    percent = cityBuildQueue.getPercentComplete(cityBuildQueue.currentProductionTypeHash);
    const queueData = processBuilds(cityBuildQueue, city.Production);
    currentProduction = queueData.shift();
    buildQueue = queueData;
  }
  // TRIX: town focus status
  const townFocusInfo = getTownFocusInfo(city);
  return {
    visible: GameplayMap.getRevealedState(GameContext.localObserverID, city.location.x, city.location.y) != RevealedStates.HIDDEN,
    disabled: areCityBannersDisabled,
    statusIcon,
    statusTooltip,
    tradeNetworkDisconnected,  // TRIX
    tradeNetworkHidden,
    tradeNetworkTooltip,
    hasUnrest: city.Happiness?.hasUnrest ?? false,
    unrestTurns: Math.max(0, city.Happiness?.turnsOfUnrest ?? 0),
    isBeingRazed: city.isBeingRazed,
    razedTurns: city.getTurnsUntilRazed,
    population: city.population,
    currentFood: city.Growth?.currentFood ?? 0,
    foodPerTurn: city.Yields?.getNetYield(YieldTypes.YIELD_FOOD) ?? 0,
    canGrow: !city.isTown || city.Growth?.growthType == GrowthTypes.EXPAND,
    showProductionQueue,
    prodPerTurn,
    turnsLeft,
    percent,
    currentProduction,
    buildQueue,
    // TRIX
    townFocusInfo,
    tradeNetworkConnections,
    isInfected,
    happinessStage,
  };
}
function computeFullBannerData(cityID, location) {
  const identity = computeIdentity(cityID, location);
  const capital = computeCapitalInfo(cityID, location);
  const religion = computeReligionInfo(cityID, location);
  const war = computeWarInfo(cityID.owner);
  const conquered = computeConquered(cityID, location);
  const status = computeStatusInfo(cityID, location);
  if (!identity || !capital || !religion || conquered === null || !status) {
    console.warn(`Failed to compute full banner data for cityID: ${ComponentID.toString(cityID)}`);
    return null;
  }
  const relationship = computeRelationship(cityID.owner);
  return { identity, capital, religion, war, conquered, relationship, status };
}
function indexResourceTypes() {
  const yieldTagTypes = /* @__PURE__ */ new Map([
    ["FOOD", "YIELD_FOOD"],
    ["PRODUCTION", "YIELD_PRODUCTION"],
    ["GOLD", "YIELD_GOLD"],
    ["SCIENCE", "YIELD_SCIENCE"],
    ["CULTURE", "YIELD_CULTURE"],
    ["HAPPINESS", "YIELD_HAPPINESS"]
  ]);
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
  return { cityIds, villageLocations };
}
function createCityBannersModel() {
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
  function getBannerData(cityID) {
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
    return entry[0];
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
  function refreshAllWarInfo() {
    for (const cityID of cityIds()) {
      updateBanner(cityID, "war", computeWarInfo(cityID.owner));
    }
  }
  function refreshAllStatusInfo() {
    for (const cityID of cityIds()) {
      updateBanner(cityID, "status", computeStatusInfo(cityID, getVillageLocation(cityID)));
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
        updateBanner(cityID, "war", computeWarInfo(cityID.owner));
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
    if (!data.location) {
      return;
    }
    for (const cityID of cityIds()) {
      const location = getVillageLocation(cityID) ?? Cities.get(cityID)?.location;
      if (location?.x == data.location.x && location.y == data.location.y) {
        updateBanner(cityID, "relationship", computeRelationship(cityID.owner));
        return;
      }
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
        bannerStores.get(ComponentID.toBitfield(cityID))?.[1](
          "status",
          "visible",
          data.visibility != RevealedStates.HIDDEN
        );
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
        bannerStores.get(ComponentID.toBitfield(cityID))?.[1](
          "status",
          "visible",
          GameplayMap.getRevealedState(GameContext.localObserverID, location.x, location.y) != RevealedStates.HIDDEN
        );
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
      console.error(
        "A resource was changed in a city but no associated banner was found. cid: ",
        ComponentID.toLogString(data.targetCity)
      );
      return;
    }
    const resourceDef = GameInfo.Resources.lookup(data.resourceType);
    if (resourceDef && resourceYieldTags.get(resourceDef.ResourceType)?.has("YIELD_HAPPINESS")) {
      updateBanner(
        data.targetCity,
        "status",
        computeStatusInfo(data.targetCity, getVillageLocation(data.targetCity))
      );
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
    engine.on("DiplomacyDeclareWar", refreshAllWarInfo);
    engine.on("DiplomacyMakePeace", refreshAllWarInfo);
    engine.on("DiplomacyICStartRecognize", refreshAllStatusInfo);
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
    engine.on("LocalPlayerTurnBegin", refreshAllStatusInfo);
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
    engine.off("DiplomacyDeclareWar", refreshAllWarInfo);
    engine.off("DiplomacyMakePeace", refreshAllWarInfo);
    engine.off("DiplomacyICStartRecognize", refreshAllStatusInfo);
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
    engine.off("LocalPlayerTurnBegin", refreshAllStatusInfo);
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
  return { cityIds, getBannerData };
}
const CityBannersModel = ModelRegistry.register(
  "CityBannersModel",
  ModelLifecycle.SharedInstance,
  createCityBannersModel
);

export { BannerType, CityBannersModel, areCityBannersDisabled, createCityBannersModel, setCityBannersDisabled };
//# sourceMappingURL=city-banner-data.js.map
// vim: sw=2
