import { C as ComponentID } from '/core/ui/utilities/utilities-component-id.chunk.js';
export class bzCityBannerManager {
    static c_prototype;
    constructor(component) {
        this.component = component;
        component.bzComponent = this;
        this.Root = this.component.Root;
        this.banners = this.component.banners;
        this.patchPrototypes(this.component);
        this.cityRazingStartedListener = this.onCityRazingStarted.bind(this);
        this.districtDamageChangedListener = this.onDistrictDamageChanged.bind(this);
        this.playerUpdateListener = this.onPlayerUpdate.bind(this);
    }
    patchPrototypes(component) {
        const c_prototype = Object.getPrototypeOf(component);
        if (bzCityBannerManager.c_prototype == c_prototype) return;
    }
    beforeAttach() { }
    afterAttach() {
        engine.on('CityRazingStarted', this.cityRazingStartedListener);
        engine.on('DistrictDamageChanged', this.districtDamageChangedListener);
        engine.on('PlayerResourceChanged', this.playerUpdateListener);
        engine.on('PlayerTurnActivated', this.playerUpdateListener);
    }
    beforeDetach() {
        engine.off('CityRazingStarted', this.cityRazingStartedListener);
        engine.off('DistrictDamageChanged', this.districtDamageChangedListener);
        engine.off('PlayerResourceChanged', this.playerUpdateListener);
        engine.off('PlayerTurnActivated', this.playerUpdateListener);
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
    onDistrictDamageChanged(data) {
        const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
        if (cityBanner == undefined) {
            console.error("District damage changed but no associated banner was found. cid: ", ComponentID.toLogString(data.cityID));
            return;
        }
        cityBanner.queueBuildsUpdate();
    }
    onPlayerUpdate(data) {
        // update all player banners when player data changes
        // (at the start of each turn and after resource allocation)
        this.banners.forEach((banner, _key) => {
            if (banner.city && banner.componentID.owner == data.player) {
                banner.queueBuildsUpdate();
            }
        });
    }
}
Controls.decorate('city-banners', (component) => new bzCityBannerManager(component));
