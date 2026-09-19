import { Layout } from '/core/ui/utilities/utilities-layout.js';
import { utils } from '/core/ui/graph-layout/utils.js';
import { UnitFlagManager } from '/base-standard/ui/unit-flags/unit-flag-manager.js';
import { GenericUnitFlag } from '/base-standard/ui/unit-flags/unit-flags.js';
import { IndependentPowersUnitFlag } from '/base-standard/ui/unit-flags/unit-flags-independent-powers.js';

Controls.loadStyle("/bz-flag-corps/ui/unit-flags/bz-unit-flags.css");

const bzFlagCorpsOptions = { noShadow: false };

// sync optional styling
document.body.classList.toggle("bz-flags-no-shadow", bzFlagCorpsOptions.noShadow);

const UFM = { proto: UnitFlagManager.prototype };
const GUF = { proto: GenericUnitFlag.prototype };
const IPUF = { proto: IndependentPowersUnitFlag.prototype };

// patched methods
UFM.onInitialize = UFM.proto.onInitialize;
UFM.proto.onInitialize = function(...args) {
    UFM.onInitialize.apply(this, args);
    engine.on('DiplomacyEventStarted', (_data) => { this.requestFlagsRebuild() });
    engine.on('DiplomacyEventEnded', (_data) => { this.requestFlagsRebuild() });
};
GUF.onAttach = GUF.proto.onAttach;
GUF.proto.onAttach = function(...args) {
    GUF.onAttach.apply(this, args);
    this.Root.classList.add("bz-flags");
    // this.unitContainer.style.top = "0";  // adjust y axis
    this.realizeAffinity();  // show unit affinity
};
IPUF.onAttach = IPUF.proto.onAttach;
IPUF.proto.onAttach = function(...args) {
    IPUF.onAttach.apply(this, args);
    this.Root.classList.add("bz-flags", "bz-flags-independent");
    // this.unitContainer.style.top = "0";  // adjust y axis
};
IPUF.proto.updateTop = function(position, total) {
  const offset = position - (total - 1) / 2 - 0.75;  // fix horizontal alignment
  if (this.unitContainer) {
    if (this.flagOffset != offset) {
      this.flagOffset = offset;
      this.unitContainer.style.left = Layout.pixels(offset * 32);
    }
  }
}
IPUF.realizeUnitHealth = IPUF.proto.realizeUnitHealth;
IPUF.proto.realizeUnitHealth = function(...args) {
    IPUF.realizeUnitHealth.apply(this, args);
    if (this.unitHealthBarInner) {
        const health = this.unit.Health;
        const damage = (health.maxDamage - health.damage) / health.maxDamage;
        const MAX = 100 * 25/31;
        this.unitHealthBarInner.style.widthPERCENT = utils.clamp(damage, 0, 1) * MAX;
    }
};
// show relationships for majors & city-states
GUF.proto.getRelationship = function() {
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
GUF.proto.realizeAffinity = IPUF.proto.realizeAffinity;
