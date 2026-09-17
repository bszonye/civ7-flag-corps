// TODO: realign district healthbars
import { PlotCoord } from '/core/ui/utilities/utilities-plotcoord.js';
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';
import DistrictHealthManager from '/base-standard/ui/district/district-health-manager.js';

Controls.loadStyle("/bz-flag-corps/ui/district/bz-district-health.css");

// fix district ownership initialization
const DHMproto = DistrictHealthManager.prototype;
const DHM_addChildForTracking = DHMproto.addChildForTracking;
DHMproto.addChildForTracking = function(...args) {
    DHM_addChildForTracking.apply(this, args);
    const [child] = args;
    const id = child.componentID ?? ComponentID.getInvalidID();
    if (ComponentID.isInvalid(id)) return;
    const district = Districts.get(id);
    if (district.owner != district.controllingPlayer) {
        const districtHealth = this.children.get(ComponentID.toBitfield(district.id));
        districtHealth?.setContested(true, district.controllingPlayer);
    }
};

// align with city banners (0, 0, 42) or unit flags (0, 0, 30)
const BZ_DISTRICT_BANNER_OFFSET = { x: 0, y: 0, z: 30 };
const BZ_CITY_CENTER_BANNER_OFFSET = { x: 0, y: 0, z: 30 };
// const BZ_CITY_CENTER_BANNER_OFFSET = { x: 0, y: 0, z: 42 };
export class bzDistrictHealthBar {
    static c;
    constructor(component) {
        this.component = component;
        this.component.bzFlagCorps = this;
        this.patchPrototype(Object.getPrototypeOf(component));
    }
    patchPrototype(proto) {
        if (bzDistrictHealthBar.c) return;  // one-time initialization
        // patch DistrictHealthBar methods & properties
        const c = bzDistrictHealthBar.c = { proto };
        // replace DistrictHealthBar.makeWorldAnchor
        c.makeWorldAnchor = c.proto.makeWorldAnchor;
        c.proto.makeWorldAnchor = this.makeWorldAnchor;
        // afterUpdateDistrictHealth
        c.updateDistrictHealth = c.proto.updateDistrictHealth;
        c.proto.updateDistrictHealth = function(...args) {
            const crv = c.updateDistrictHealth.apply(this, args);
            const arv = this.bzFlagCorps.afterUpdateDistrictHealth(...args);
            return arv ?? crv;
        }
    }
    makeWorldAnchor(location) {
        this.destroyWorldAnchor();
        const offset = this.isCityCenter ?
            BZ_CITY_CENTER_BANNER_OFFSET : BZ_DISTRICT_BANNER_OFFSET;
        const worldAnchorHandle = WorldAnchors
            .RegisterFixedWorldAnchor(location, offset);
        if (!worldAnchorHandle || worldAnchorHandle < 0) {
            console.error(`Failed to create WorldAnchorHandle for DistrictHealthBar, District id: ${ComponentID.toLogString(this._componentID)}`);
            return;
        }
        this.Root.setAttribute('data-bind-style-transform2d', `{{FixedWorldAnchors.offsetTransforms[${worldAnchorHandle}].value}}`);
        this.Root.setAttribute('data-bind-style-opacity', `{{FixedWorldAnchors.visibleValues[${worldAnchorHandle}]}}`);
        this._worldAnchorHandle = worldAnchorHandle;
    }
    afterUpdateDistrictHealth(value) {
        const c = this.component;
        if (!c.progressBar || !c.progressInk) return;
        const healthAmt = parseFloat(value);
        const MAX = 94/100 * 100;  // ink/healthbar = 94/100 pixels
        c.progressInk.style.widthPERCENT = healthAmt * MAX;
    }
    beforeAttach() { }
    afterAttach() {
        const c = this.component;
        c.Root.classList.add("bz-flags");
        if (c.isCityCenter) c.Root.classList.add("bz-city-center");
        c.Root.classList.toggle("bz-city-center", c.isCityCenter);
        c.civHexOuter.classList.add("bz-district-hex");
        // fix "ink" proportions
        const healthValue = c.Root.getAttribute('data-district-health');
        this.afterUpdateDistrictHealth(healthValue);
    }
    beforeDetach() { }
    afterDetach() { }
    onAttributeChanged(_name, _prev, _next) { }
}
function refreshAllHealthBars() {
    const districts = DistrictHealthManager.instance?.children;
    if (!districts) {
        console.warn(`bz-district-health: no districts to refresh`);
        return;
    }
    districts.forEach((district, _key) => {
        const position = district.Root.getAttribute('data-district-location');
        const location = PlotCoord.fromString(position);
        district.makeWorldAnchor(location);
    });
}
window.addEventListener('bz-flag-corps-options', refreshAllHealthBars);
Controls.decorate('district-health-bar', (component) => new bzDistrictHealthBar(component));
