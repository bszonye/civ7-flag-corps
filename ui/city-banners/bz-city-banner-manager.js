import { ComponentID } from '/core/ui/utilities/utilities-component-id.js';
export class bzCityBannerManager {
    static c_prototype;
    constructor(component) {
        this.component = component;
        component.bzComponent = this;
        this.Root = this.component.Root;
        this.banners = this.component.banners;
        this.patchPrototypes(this.component);
        this.cityRazingStartedListener = this.onCityRazingStarted.bind(this);
    }
    patchPrototypes(component) {
        const c_prototype = Object.getPrototypeOf(component);
        if (bzCityBannerManager.c_prototype == c_prototype) return;
    }
    beforeAttach() { }
    afterAttach() {
        engine.on('CityRazingStarted', this.cityRazingStartedListener);
    }
    beforeDetach() {
        engine.off('CityRazingStarted', this.cityRazingStartedListener);
    }
    afterDetach() { }
    onAttributeChanged(_name, _prev, _next) { }
    onCityRazingStarted(data) {
        const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
        if (cityBanner == undefined) {
            console.error("A city started razing but no associated banner was found. cid: ", ComponentID.toLogString(data.cityID));
            return;
        }
        // will trigger a full update
        cityBanner.queueNameUpdate();
    }
}
Controls.decorate('city-banners', (component) => new bzCityBannerManager(component));
