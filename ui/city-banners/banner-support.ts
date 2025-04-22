/**
 * @file banner-support.ts
 * @copyright 2022, Firaxis Games
 * @description Define and common support functions for city and village banners.
 */

export enum BannerType {
	custom,		// unknown type
	town,
	city,
	village,
	cityState
}

export enum CityStatusType {
	none,
	happy = "YIELD_HAPPINESS",
	unhappy = "YIELD_UNHAPPINESS",
	angry = "YIELD_ANGRY",
	plague = "YIELD_PLAGUE"
}

export type BannerData = {
	bannerType: BannerType;
	name?: string;
	tooltip: string;
	icon?: string;
}
export function makeEmptyBannerData(): BannerData {
	return {
		bannerType: BannerType.custom,
		tooltip: ""
	};
}

export interface Banner {
	getKey(): number;	// Get a 64-bit number to use as the key in storing the banner
	getLocation(): float2;
	getDebugString(): string;	// A string that identifies the banner; for debug logging.
	setVisibility(state: RevealedStates): void;
	getVisibility(): RevealedStates;
	hide(): void;
	show(): void;
	disable(): void;	// No longer able to be interacted with
	enable(): void;		// Can be interacted with	
	remove(): void;
}

export interface CityBanner extends Banner {
	queueBuildsUpdate(): void;
	queueNameUpdate(): void;
	realizeReligion(): void;
	realizeHappiness(): void;
	updateConqueredIcon(): void;
	affinityUpdate(): void;
	capitalUpdate(): void;
}

export const BANNER_INVALID_LOCATION: number = -9999;
