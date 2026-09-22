import { createSignal } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { Icon } from '../../../../core/ui/utilities/utilities-image.js';
import { ProductionPanelCategory } from '../../../ui/production-chooser/production-chooser-helpers.js';
import { getTextColors } from '/bz-flag-corps/ui-next/screens/city-banners/bz-city-banner.js';

var BannerType = /* @__PURE__ */ ((BannerType2) => {
  BannerType2["Town"] = "town";
  BannerType2["City"] = "city";
  BannerType2["Village"] = "village";
  BannerType2["CityState"] = "citystate";
  return BannerType2;
})(BannerType || {});
const happinessStages = [];
GameInfo.HappinessStages.forEach((row) => {
  happinessStages.push({
    name: row.HappinessStageType.replace("HAPPINESS_STAGE_", "LOC_UI_CITY_DETAILS_"),
    icon: row.HappinessStageType.replace("HAPPINESS_STAGE_", "YIELD_"),
    min: row.StageMinThreshold ?? -Infinity,
    max: row.StageMaxThreshold ?? Infinity
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
        cityStateColor = "#FFD553";
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
  let portraitIcon = "";
  let leaderName = "";  // eslint-disable-line no-useless-assignment
  const leaderType = player.leaderType;
  if (leaderType != -1) {
    portraitIcon = Icon.getLeaderPortraitIcon(leaderType);
    const leader = GameInfo.Leaders.lookup(leaderType);
    leaderName = leader ? leader.Name : "LOC_LEADER_NONE_NAME";
  } else {
    leaderName = bannerType == "village" /* Village */ || (bannerType == "town" /* Town */ || bannerType == "city" /* City */) && player.isIndependent ? player.name : "LOC_LEADER_NONE_NAME";
  }
  const civName = GameplayMap.getOwnerName(bannerLocation.x, bannerLocation.y);
  if (player.isMinor && player.Influence?.hasSuzerain) {
    const suzerainPlayer = Players.get(player.Influence.getSuzerain());
    if (suzerainPlayer) {
      portraitIcon = Icon.getLeaderPortraitIcon(suzerainPlayer.leaderType);
      leaderName = suzerainPlayer.leaderName;
    }
  }
  const owner = cityID.owner;
  const cityStateBonusName = bonusDefinition?.Name ?? "";
  let playerColorPrimary = UI.Player.getPrimaryColorValueAsString(owner);
  const playerColorSecondary = UI.Player.getSecondaryColorValueAsString(owner);
  if (playerColorPrimary == playerColorSecondary) {
    playerColorPrimary = "rgb(155, 0, 0)";
  }
  const { playerColorText, playerColorLighting } = getTextColors(owner);  // TRIX
  return {
    location: bannerLocation,
    bannerType,
    isLocalPlayerCity,
    name: validCity?.name ?? player.civilizationFullName,
    leaderName,
    civName,
    cityStateBonusName,
    portraitIcon,
    cityStateColor,
    cityStateIcon,
    cityStateTypeName,
    playerColorPrimary,
    playerColorSecondary,
    playerColorText,  // TRIX
    playerColorLighting  // TRIX
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
    isCapital: showCapitalIndicators && city.isCapital && !city.isOriginalCapital,
    isOriginalCapital: showCapitalIndicators && city.isOriginalCapital && !city.isCapital,
    isOriginalCapitalCurrent: showCapitalIndicators && city.isCapital && city.isOriginalCapital
  };
}
function computeReligionInfo(cityID, location) {
  const city = Cities.get(cityID);
  if (!city || !city.isValid) {
    return location ? {
      hasReligion: false,
      urbanReligionIcon: "",
      urbanReligionTooltip: "",
      urbanReligionTooltipArgs: [],
      showRuralReligion: false,
      ruralReligionIcon: "",
      ruralReligionTooltip: "",
      ruralReligionTooltipArgs: []
    } : null;
  }
  let hasReligion = false;
  let urbanReligionIcon = "";
  let urbanReligionTooltip = "";
  let urbanReligionTooltipArgs = [];
  let showRuralReligion = false;
  let ruralReligionIcon = "";
  let ruralReligionTooltip = "";
  let ruralReligionTooltipArgs = [];
  const majorityReligion = GameInfo.Religions.find((t) => t.$hash == city.Religion?.majorityReligion);
  if (majorityReligion) {
    const religionPlayer = Players.get(Game.Religion.getPlayerFromReligion(majorityReligion.ReligionType));
    const playerReligion = religionPlayer?.Religion;
    if (playerReligion) {
      hasReligion = true;
      urbanReligionIcon = UI.getIconCSS(majorityReligion.ReligionType, "RELIGION");
      urbanReligionTooltip = playerReligion.getReligionName();
    }
  } else {
    const urbanReligion = GameInfo.Religions.find((t) => t.$hash == city.Religion?.urbanReligion);
    if (urbanReligion) {
      const urbanReligionPlayer = Players.get(Game.Religion.getPlayerFromReligion(urbanReligion.ReligionType));
      const urbanPlayerRel = urbanReligionPlayer?.Religion;
      if (urbanPlayerRel) {
        hasReligion = true;
        urbanReligionIcon = UI.getIconCSS(urbanReligion.ReligionType, "RELIGION");
        urbanReligionTooltip = "{LOC_DISTRICT_URBAN_NAME}[N]{1_ReligionName}";
        urbanReligionTooltipArgs = [urbanPlayerRel.getReligionName()];
      }
    }
    const ruralReligion = GameInfo.Religions.find((t) => t.$hash == city.Religion?.ruralReligion);
    if (ruralReligion) {
      const ruralReligionPlayer = Players.get(Game.Religion.getPlayerFromReligion(ruralReligion.ReligionType));
      const ruralPlayerRel = ruralReligionPlayer?.Religion;
      if (ruralPlayerRel) {
        hasReligion = true;
        showRuralReligion = true;
        ruralReligionIcon = UI.getIconCSS(ruralReligion.ReligionType, "RELIGION");
        ruralReligionTooltip = "{LOC_DISTRICT_RURAL_NAME}[N]{1_ReligionName}";
        ruralReligionTooltipArgs = [ruralPlayerRel.getReligionName()];
      }
    }
  }
  return {
    hasReligion,
    urbanReligionIcon,
    urbanReligionTooltip,
    urbanReligionTooltipArgs,
    showRuralReligion,
    ruralReligionIcon,
    ruralReligionTooltip,
    ruralReligionTooltipArgs
  };
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
  let relationship = Game.IndependentPowers.getIndependentRelationship(playerID, localPlayerID);
  if (player.isMinor) {
    const suzerain = player.Influence?.hasSuzerain ? Players.get(player.Influence.getSuzerain()) : null;
    if (suzerain) {
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
      foodPerTurn: 0,
      canGrow: false,
      showProductionQueue: false,
      prodPerTurn: 0,
      turnsLeft: 0,
      percent: 0,
      currentProduction: void 0,
      buildQueue: []
    } : null;
  }
  const isLocalPlayerCity = cityID.owner === GameContext.localObserverID;
  let statusIcon = "";
  let statusTooltip = "";
  if (city.isInfected) {
    statusTooltip = "LOC_UI_CITY_DETAILS_INFECTED";
    statusIcon = `url('${UI.getIconURL("YIELD_PLAGUE", "YIELD")}')`;
  } else {
    const happiness = city.Yields?.getYield(YieldTypes.YIELD_HAPPINESS) ?? 0;
    for (const stage of happinessStages) {
      if (happiness >= stage.min && happiness <= stage.max) {
        statusTooltip = stage.name;
        statusIcon = `url('${UI.getIconURL(stage.icon, "YIELD")}')`;
        break;
      }
    }
  }
  let tradeNetworkHidden = true;
  let tradeNetworkTooltip = "";
  if (city.Trade) {
    const isInNetwork = city.Trade.isInTradeNetwork();
    tradeNetworkHidden = !isLocalPlayerCity || isInNetwork;
    if (!isInNetwork) {
      tradeNetworkTooltip = "{LOC_UI_CITY_STATUS_TRADE_NOT_CONNECTED} {LOC_UI_CITY_STATUS_TRADE_NOT_CONNECTED_DESCRIPTION}";
    }
  }
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
  return {
    visible: GameplayMap.getRevealedState(GameContext.localObserverID, city.location.x, city.location.y) != RevealedStates.HIDDEN,
    disabled: areCityBannersDisabled,
    statusIcon,
    statusTooltip,
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
    buildQueue
  };
}
function computeFullBannerData(cityID, location) {
  const identity = computeIdentity(cityID, location);
  const capital = computeCapitalInfo(cityID, location);
  const religion = computeReligionInfo(cityID, location);
  const conquered = computeConquered(cityID, location);
  const status = computeStatusInfo(cityID, location);
  if (!identity || !capital || !religion || conquered === null || !status) {
    console.warn(`Failed to compute full banner data for cityID: ${ComponentID.toString(cityID)}`);
    return null;
  }
  const relationship = computeRelationship(cityID.owner);
  return { identity, capital, religion, conquered, relationship, status };
}

export { BannerType, areCityBannersDisabled, computeCapitalInfo, computeConquered, computeFullBannerData, computeIdentity, computeRelationship, computeReligionInfo, computeStatusInfo, setCityBannersDisabled };
//# sourceMappingURL=city-banner-data.js.map
// vim: sw=2
