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
        this.districtDamageChangedListener = this.onDistrictDamageChanged.bind(this);
        this.playerResourceChangedListener = this.onPlayerResourceChanged.bind(this);
        this.playerTurnListener = this.onPlayerTurn.bind(this);
    }
    patchPrototypes(component) {
        const c_prototype = Object.getPrototypeOf(component);
        if (bzCityBannerManager.c_prototype == c_prototype) return;
    }
    beforeAttach() { }
    afterAttach() {
        engine.on('PlayerTurnActivated', this.playerTurnListener);
        engine.on('CityRazingStarted', this.cityRazingStartedListener);
        engine.on('DistrictDamageChanged', this.districtDamageChangedListener);
        engine.on('PlayerResourceChanged', this.playerResourceChangedListener);
    }
    beforeDetach() {
        engine.off('PlayerTurnActivated', this.playerTurnListener);
        engine.off('CityRazingStarted', this.cityRazingStartedListener);
        engine.off('DistrictDamageChanged', this.districtDamageChangedListener);
        engine.off('PlayerResourceChanged', this.playerResourceChangedListener);
    }
    afterDetach() { }
    onAttributeChanged(_name, _prev, _next) { }
    onPlayerTurn(data) {
        console.warn(`TRIX UPDATE ${JSON.stringify(data)}`);
        this.banners.forEach((banner, _key) => {
            if (banner.city && banner.componentID.owner == data.player) {
                console.warn(`TRIX BANNER ${JSON.stringify(banner.city)}`);
                banner.queueBuildsUpdate();
            }
        });
    }
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
    onPlayerResourceChanged(data) {
        // resource changes can affect food, production, happiness
        this.banners.forEach((banner, _key) => {
            if (banner.city && banner.componentID.owner == data.player) {
                banner.queueBuildsUpdate();
            }
        });
    }
}
Controls.decorate('city-banners', (component) => new bzCityBannerManager(component));
