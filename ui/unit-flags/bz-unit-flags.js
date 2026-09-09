import bzFlagCorpsOptions from '/bz-flag-corps/ui/options/bz-flag-corps-options.js';
import { Layout } from '/core/ui/utilities/utilities-layout.js';
import { UnitFlagManager } from '/base-standard/ui/unit-flags/unit-flag-manager.js';
import { GenericUnitFlag } from '/base-standard/ui/unit-flags/unit-flags.js';
import { IndependentPowersUnitFlag } from '/base-standard/ui/unit-flags/unit-flags-independent-powers.js';

// additional CSS definitions
const BZ_HEAD_STYLE = [
`
.bz-flags-no-shadow .unit-flag__shadow,
.bz-flags-no-shadow .unit-flag--civilian .unit-flag__shadow,
.bz-flags-no-shadow .unit-flag--army .unit-flag__shadow,
.bz-flags-no-shadow .unit-flag--combat .unit-flag__shadow {
    background-image: none;
}
`,
`
.bz-flags.bz-flags-no-shadow .unit-flag__healthbar-container {
    top: 0.2222222222rem;
}
.bz-flags .unit-flag__healthbar-container {
    top: 0.1666666667rem;
}
.bz-flags .unit-flag__healthbar {
    height: 0.5555555556rem;
    border-radius: 0.2777777778rem / 0.4444444444rem;
}
.bz-flags .unit-flag__healthbar-inner {
    height: 0.3333333333rem;
    border-radius: 0.1666666667rem / 0.3333333333rem;
}
`,
];
BZ_HEAD_STYLE.map(style => {
    const e = document.createElement('style');
    e.textContent = style;
    document.head.appendChild(e);
});
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
    this.unitContainer.style.top = "0";  // adjust y axis
    this.realizeAffinity();  // show unit affinity
};
const IPUF_onAttach = IndependentPowersUnitFlag.prototype.onAttach;
IndependentPowersUnitFlag.prototype.onAttach = function(...args) {
    IPUF_onAttach.apply(this, args);
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
