/**
 * @file district-health.ts
 * @copyright 2023, Firaxis Games
 * @description A health bar that is attached to the 3D world and floats up.
 */

import DistrictHealthManager, { DistrictHealth } from '/base-standard/ui/district/district-health-manager.js';
import { Icon } from '/core/ui/utilities/utilities-image.js';
import { PlotCoord } from '/core/ui/utilities/utilities-plotcoord.js';
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';
import { MustGetElement } from '/core/ui/utilities/utilities-dom.js';

const DISTRICT_BANNER_OFFSET = { x: -30, y: 15, z: 8 };
const CITY_CENTER_BANNER_OFFSET = { x: -20, y: 25, z: 8 };

export class DistrictHealthBar extends Component implements DistrictHealth {

	private _componentID: ComponentID = ComponentID.getInvalidID();
	private _worldAnchorHandle: number | null = null;
	private progressBar: HTMLElement | null = null;
	private progressInk: HTMLElement | null = null;
	private civHexInner: HTMLElement | null = null;
	private civHexOuter: HTMLElement | null = null;
	private isCityCenter: boolean = false;

	private readonly MEDIUM_HEALTH_THRESHHOLD: number = .75;		// thresholds for health bar color changes
	private readonly LOW_HEALTH_THRESHHOLD: number = .5;

	onAttach() {
		super.onAttach();

		const position: string = this.Root.getAttribute('data-district-location')!;
		const healthValue: string = this.Root.getAttribute('data-district-health')!;
		const id: string = this.Root.getAttribute('data-district-id')!;

		this._componentID = ComponentID.fromString(id);
		const location: PlotCoord = PlotCoord.fromString(position)!;
		const player = Players.get(this.componentID.owner);

		if (!player) {
			console.error(`district-health.ts: Couldn't find district with ComponentID ${ComponentID.toLogString(this.componentID)}`);
			return;
		}
		const districtId: ComponentID | null = MapCities.getDistrict(location.x, location.y);
		if (!districtId) {
			console.error(`district-health: couldn't find district ID at hex (${location.x}, ${location.y})`)
			return;
		}
		const district: District | null = Districts.get(districtId);
		if (!district || !ComponentID.isValid(districtId)) {
			console.error(`district-health: couldn't find any district with the given id: ${districtId}`);
			return;
		}
		this.isCityCenter = (district.type == DistrictTypes.CITY_CENTER);

		const hslot = document.createElement("fxs-hslot");
		hslot.classList.add("district-health-hslot", "w-full", "h-9");

		if (!this.isCityCenter) {
			this.civHexOuter = document.createElement("div");
			this.civHexOuter.classList.add("bg-contain", "bg-center", "bg-no-repeat", "relative", "w-9", "h-9");
			this.civHexOuter.style.backgroundImage = "url('blp:city_hex_base')";
			this.civHexOuter.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(this.componentID.owner);

			this.civHexInner = document.createElement("div");
			this.civHexInner.classList.add("bg-contain", "bg-center", "bg-no-repeat", "absolute", "inset-1");
			this.civHexInner.style.backgroundImage = "url('blp:city_hex_base')";
			this.civHexInner.style.fxsBackgroundImageTint = UI.Player.getPrimaryColorValueAsString(this.componentID.owner);
			this.civHexOuter.appendChild(this.civHexInner);

			const civIcon = document.createElement("div");
			const iconCSS = Icon.getCivSymbolCSSFromCivilizationType(player.civilizationType);
			civIcon.classList.add("district-health_civ-icon", "absolute", "inset-2", "bg-contain", "bg-center", "bg-no-repeat");
			civIcon.style.backgroundImage = iconCSS;
			civIcon.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(this.componentID.owner);

			this.civHexOuter.appendChild(civIcon);
			hslot.appendChild(this.civHexOuter);
		}
		this.progressBar = document.createElement("div");
		this.progressBar.classList.add("district-health-bar", "relative", "self-center");
		this.progressBar.setAttribute('value', healthValue);

		this.progressInk = document.createElement("div");
		this.progressInk.classList.add("district-health-bar-ink", "absolute", "inset-1");
		const healthAmt = parseFloat(healthValue);
		this.progressInk.style.widthPERCENT = healthAmt * 100;

		if (healthAmt <= this.MEDIUM_HEALTH_THRESHHOLD) {
			if (healthAmt <= this.LOW_HEALTH_THRESHHOLD) {
				this.progressInk.classList.add("district-health-low");
			} else {
				this.progressInk.classList.add("district-health-med");
			}
		}

		this.progressBar.appendChild(this.progressInk);
		hslot.appendChild(this.progressBar);
		this.Root.appendChild(hslot);

		this.makeWorldAnchor(location);

		// Let the manage know of it's existance; which assigns it an ID.
		const manager: DistrictHealthManager = DistrictHealthManager.instance;
		manager.addChildForTracking(this);
	}

	onDetach() {
		this.cleanup();
		super.onDetach();
	}

	private cleanup() {
		this.destroyWorldAnchor();
		const manager: DistrictHealthManager = DistrictHealthManager.instance;
		manager.removeChildFromTracking(this);
	}

	private makeWorldAnchor(location: float2) {
		this.destroyWorldAnchor()
		let worldAnchorHandle: number | null = null;

		if (this.isCityCenter) {
			worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(location, CITY_CENTER_BANNER_OFFSET);
		} else {
			worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(location, DISTRICT_BANNER_OFFSET);
		}

		if (worldAnchorHandle !== null && worldAnchorHandle >= 0) {
			this.Root.setAttribute('data-bind-style-transform2d', `{{FixedWorldAnchors.offsetTransforms[${worldAnchorHandle}].value}}`);
			this.Root.setAttribute('data-bind-style-opacity', `{{FixedWorldAnchors.visibleValues[${worldAnchorHandle}]}}`)
		}
		else {
			console.error(`Failed to create WorldAnchorHandle for DistrictHealthBar, District id: ${ComponentID.toLogString(this._componentID)}`,);
		}
	}

	private destroyWorldAnchor() {
		if (this._worldAnchorHandle) {
			this.Root.removeAttribute('data-bind-style-transform2d');
			this.Root.removeAttribute('data-bind-style-opacity');
			WorldAnchors.UnregisterUnitAnchor(this._worldAnchorHandle);
		}

		this._worldAnchorHandle = null;
	}

	setContested(_isContested: boolean, controllingPlayer: PlayerId) {
		const player = Players.get(controllingPlayer);
		if (player) {
			if (this.civHexOuter && this.civHexInner) {
				const civIcon = MustGetElement(".district-health_civ-icon", this.civHexOuter);
				const iconCSS = Icon.getCivSymbolCSSFromCivilizationType(player.civilizationType);
				civIcon.style.backgroundImage = iconCSS;
				civIcon.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(controllingPlayer);
				this.civHexInner.style.fxsBackgroundImageTint = UI.Player.getPrimaryColorValueAsString(controllingPlayer);
				this.civHexOuter.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(controllingPlayer);
			}
		} else {
			console.warn(`district-health: couldn't find player ID ${controllingPlayer} in setContested()`);
		}
	}

	updateDistrictHealth(value: string) {
		if (this.progressBar && this.progressInk) {
			const healthAmt = parseFloat(value);
			this.progressInk.style.widthPERCENT = healthAmt * 100;

			this.progressInk.classList.remove("district-health-med");
			this.progressInk.classList.remove("district-health-low");

			if (healthAmt <= this.MEDIUM_HEALTH_THRESHHOLD) {
				if (healthAmt <= this.LOW_HEALTH_THRESHHOLD) {
					this.progressInk.classList.add("district-health-low");
				} else {
					this.progressInk.classList.add("district-health-med");
				}
			}
		}
	}

	get componentID(): Readonly<ComponentID> {
		return this._componentID;
	}
}

Controls.define('district-health-bar', {
	createInstance: DistrictHealthBar,
	description: 'District Health Bar',
	classNames: ['district-health-container'],
	styles: ["fs://game/base-standard/ui/district/district-health.css"],
});
