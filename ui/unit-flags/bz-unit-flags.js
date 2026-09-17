import bzFlagCorpsOptions from '/bz-flag-corps/ui/options/bz-flag-corps-options.js';
import { Layout } from '/core/ui/utilities/utilities-layout.js';
import { UnitFlagManager } from '/base-standard/ui/unit-flags/unit-flag-manager.js';
import { GenericUnitFlag } from '/base-standard/ui/unit-flags/unit-flags.js';
import { IndependentPowersUnitFlag } from '/base-standard/ui/unit-flags/unit-flags-independent-powers.js';

Controls.loadStyle("/bz-flag-corps/ui/unit-flags/bz-unit-flags.css");

// sync optional styling
document.body.classList.toggle("bz-flags-no-shadow", bzFlagCorpsOptions.noShadow);

const UFMproto = UnitFlagManager.prototype;
const UFM_onInitialize = UFMproto.onInitialize;
UFMproto.onInitialize = function(...args) {
    UFM_onInitialize.apply(this, args);
    engine.on('DiplomacyEventStarted', (_data) => { this.requestFlagsRebuild() });
    engine.on('DiplomacyEventEnded', (_data) => { this.requestFlagsRebuild() });
};

// patched methods
const GUF_onAttach = GenericUnitFlag.prototype.onAttach;
GenericUnitFlag.prototype.onAttach = function(...args) {
    GUF_onAttach.apply(this, args);
    this.unitContainer.classList.add("bz-flags");
    this.unitContainer.style.top = "0";  // adjust y axis
    this.realizeAffinity();  // show unit affinity
};
const IPUF_onAttach = IndependentPowersUnitFlag.prototype.onAttach;
IndependentPowersUnitFlag.prototype.onAttach = function(...args) {
    IPUF_onAttach.apply(this, args);
    this.Root.classList.add("bz-flags");
    this.unitContainer.style.top = "0";  // adjust y axis
};
IndependentPowersUnitFlag.prototype.updateTop = function(position, total) {
  const offset = position - (total - 1) / 2 - 0.75;  // fix horizontal alignment
  if (this.unitContainer) {
    if (this.flagOffset != offset) {
      this.flagOffset = offset;
      this.unitContainer.style.left = Layout.pixels(offset * 32);
    }
  }
}
// show relationships for majors & city-states
GenericUnitFlag.prototype.getRelationship = function() {
    // parallel to IndependentPowersUnitFlag.getRelationship
    const IR = IndependentRelationship;
    const ownerID = this.componentID.owner;
    const observerID = GameContext.localObserverID;
    if (ownerID == observerID) return IR.FRIENDLY;
    const owner = Players.get(ownerID);
    if (owner.Diplomacy?.hasAllied(observerID)) return IR.FRIENDLY;
    if (owner.Diplomacy?.isAtWarWith(observerID)) return IR.HOSTILE;
    if (owner.isMinor && owner.Influence?.hasSuzerain &&
        owner.Influence.getSuzerain() == observerID) {
        return IR.FRIENDLY;
    }
    return IR.NEUTRAL;
}
GenericUnitFlag.prototype.realizeAffinity =
    IndependentPowersUnitFlag.prototype.realizeAffinity;
