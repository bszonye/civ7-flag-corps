// TODO: realign district healthbars
import bzFlagCorpsOptions from '/bz-flag-corps/ui/options/bz-flag-corps-options.js';
import { PlotCoord } from '/core/ui/utilities/utilities-plotcoord.js';
import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';
import DistrictHealthManager from '/base-standard/ui/district/district-health-manager.js';

const BZ_HEAD_STYLE = [
// set healthbar snug against city banner
`
.bz-flags .district-health-container {
    top: -3.3888888889rem;
    left: -4.7777777778rem;
    height: 1.8888888889rem;
    width: 11.1111111111rem;
}
.bz-flags .district-health-bar {
    position: absolute;
    left: 2rem;
    width: 5.5555555556rem;
    height: 0.8888888889rem;
    pointer-events: auto;
    border-radius: 0.4444444444rem / 0.5555555556rem;
    background-color: black;
}
.bz-flags .district-health-bar-ink {
    top: 0.1666666667rem;
    right: 0.1666666667rem;
    bottom: 0.1666666667rem;
    left: 0.1666666667rem;
    border-radius: 0.2777777778rem / 0.3888888889rem;
}
`,
];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});

const DISTRICT_BANNER_OFFSET = { x: -30, y: 15, z: 8 };
const CITY_CENTER_BANNER_OFFSET = { x: -20, y: 25, z: 8 };
const BZ_DISTRICT_BANNER_OFFSET = { x: 0, y: 0, z: 42 };
const BZ_CITY_CENTER_BANNER_OFFSET = { x: 0, y: 0, z: 42 };
export class bzDistrictHealthBar {
    static c_prototype;
    constructor(component) {
        this.component = component;
        component.bzComponent = this;
        this.patchPrototypes(this.component);
    }
    patchPrototypes(component) {
        const c_prototype = Object.getPrototypeOf(component);
        if (bzDistrictHealthBar.c_prototype == c_prototype) return;
        // patch component methods
        const proto = bzDistrictHealthBar.c_prototype = c_prototype;
        // replace DistrictHealthBar.makeWorldAnchor
        const bzMakeWorldAnchor = this.bzMakeWorldAnchor;
        bzDistrictHealthBar.c_makeWorldAnchor = proto.makeWorldAnchor;
        proto.makeWorldAnchor = function(...args) {
            return bzMakeWorldAnchor.apply(this.bzComponent, args);
        }
    }
    bzMakeWorldAnchor(location) {
        this.component.destroyWorldAnchor();
        let worldAnchorHandle = null;
        if (this.component.isCityCenter) {
            const offset = bzFlagCorpsOptions.banners ?
                BZ_CITY_CENTER_BANNER_OFFSET : CITY_CENTER_BANNER_OFFSET;
            worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(location, offset);
        }
        else {
            const offset = bzFlagCorpsOptions.banners ?
                BZ_DISTRICT_BANNER_OFFSET : DISTRICT_BANNER_OFFSET;
            worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(location, offset);
        }
        if (worldAnchorHandle !== null && worldAnchorHandle >= 0) {
            this.component.Root.setAttribute('data-bind-style-transform2d', `{{FixedWorldAnchors.offsetTransforms[${worldAnchorHandle}].value}}`);
            this.component.Root.setAttribute('data-bind-style-opacity', `{{FixedWorldAnchors.visibleValues[${worldAnchorHandle}]}}`);
            this.component._worldAnchorHandle = worldAnchorHandle;
        }
        else {
            console.error(`Failed to create WorldAnchorHandle for DistrictHealthBar, District id: ${ComponentID.toLogString(this.component._componentID)}`);
        }
    }
    beforeAttach() { }
    afterAttach() { }
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
