/**
 * @file banner-support.ts
 * @copyright 2022, Firaxis Games
 * @description Define and common support functions for city and village banners.
 */
export var BannerType;
(function (BannerType) {
    BannerType[BannerType["custom"] = 0] = "custom";
    BannerType[BannerType["town"] = 1] = "town";
    BannerType[BannerType["city"] = 2] = "city";
    BannerType[BannerType["village"] = 3] = "village";
    BannerType[BannerType["cityState"] = 4] = "cityState";
})(BannerType || (BannerType = {}));
export var CityStatusType;
(function (CityStatusType) {
    CityStatusType[CityStatusType["none"] = 0] = "none";
    CityStatusType["happy"] = "YIELD_HAPPINESS";
    CityStatusType["unhappy"] = "YIELD_UNHAPPINESS";
    CityStatusType["angry"] = "YIELD_ANGRY";
    CityStatusType["plague"] = "YIELD_PLAGUE";
})(CityStatusType || (CityStatusType = {}));
export function makeEmptyBannerData() {
    return {
        bannerType: BannerType.custom,
        tooltip: ""
    };
}
export const BANNER_INVALID_LOCATION = -9999;

//# sourceMappingURL=file:///base-standard/ui/city-banners/banner-support.js.map
