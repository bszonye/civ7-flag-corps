function srgbToHex(rgba) {
  const { r, g, b, a } = rgba;
  const hex = "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  return a != null && a != 255 ? hex + a.toString(16).padStart(2, "0") : hex;
}
function srgbToLinear(rgba) {
  const G = (c) => Math.pow(c / 255, 2.4);
  const r = G(rgba.r);
  const g = G(rgba.g);
  const b = G(rgba.b);
  if (rgba.a != null) return { r, g, b, a: rgba.a / 255 };
  return { r, g, b };
}
function linearToSRGB(rgba) {
  const G = (c) => Math.round(Math.pow(c, 1 / 2.4) * 255);
  const r = G(rgba.r);
  const g = G(rgba.g);
  const b = G(rgba.b);
  if (rgba.a != null) return { r, g, b, a: Math.round(rgba.a * 255) };
  return { r, g, b };
}
function getLuminance(c) {
  c = srgbToLinear(c);
  return 0.2126729 * c.r + 0.7151522 * c.g + 0.0721750 * c.b;
}
const Bclip = 1.414, Bthrsh = 0.022;
const Nbg = 0.56, Nfg = 0.57, Rbg = 0.65, Rfg = 0.62;
const Wscale = 1.14, Woffset = 0.027;
const fsc = (Y) => Y < 0 ? 0 : Y < Bthrsh ? Y + Math.pow(Bthrsh - Y, Bclip) : Y;
function getYLc(bg, fg) {
  const Ybg = fsc(bg);
  const Yfg = fsc(fg);
  const [Xbg, Xfg] = Yfg < Ybg ? [Nbg, Nfg] : [Rbg, Rfg];
  const Sapc = (Math.pow(Ybg, Xbg) - Math.pow(Yfg, Xfg)) * Wscale;
  return Math.abs(Sapc) < 0.1 ? 0 : 100 * (Sapc - Math.sign(Sapc) * Woffset);
}
function getLcTarget(Y, Lc) {
  if (!Lc) return Y;
  if (0 < Lc) {
    // normal contrast, dark on light
    if (getYLc(Y, 0) <= Lc) return 0;  // black
    const Srev = (Lc/100 + Woffset) / Wscale;
    const Ybg = fsc(Y);
    const Yfg = Math.pow(Math.pow(Ybg, Nbg) - Srev, 1 / Nfg);
    return Yfg;  // approximate for Y < 0.022
  } else {
    // reverse contrast, light on dark
    if (Lc <= getYLc(Y, 1)) return 1;  // white
    const Srev = (Lc/100 - Woffset) / Wscale;
    const Ybg = fsc(Y);
    const Yfg = Math.pow(Math.pow(Ybg, Rbg) - Srev, 1 / Rfg);
    return Yfg;
  }
}
const cacheColors = [];
function getTextColors(id) {
  // TRIX: determine a contrasting text color
  const player = Players.get(id);
  if (!player || player.isIndependent) {
    return { playerColorText: "white", playerColorLighting: "black" };
  }
  const cache = cacheColors.at(id);
  if (cache) return cache;
  const c1 = UI.Player.getPrimaryColorValue(id);
  const c2 = UI.Player.getSecondaryColorValue(id);
  const Y1 = getLuminance(c1);
  const Y2 = getLuminance(c2);
  const playerColorLighting = Y1 < Y2 ? "black" : "white";
  const Lc = getYLc(Y1, Y2);
  const YT = (() => Y2 < Y1 ?
    Math.max(getLcTarget(Y1, 75), 0.025) :
    Math.min(getLcTarget(Y1, Math.min((Lc - 75) / 2, -45)), 0.900))();
  if (Y1 <= Y2 && YT <= Y2 || Y2 <= Y1 && Y2 <= YT) {
    return cacheColors[id] = { playerColorText: srgbToHex(c2), playerColorLighting };
  }
  const lighten = (c) => 1 - ((1 - c) * (1 - YT) / (1 - Y2));
  const n2 = srgbToLinear(c2);
  const nt = Y2 < YT ? {
    r: lighten(n2.r),
    g: lighten(n2.g),
    b: lighten(n2.b),
    a: 1
  } : {
    r: n2.r * YT / Y2,
    g: n2.g * YT / Y2,
    b: n2.b * YT / Y2,
    a: 1
  }
  const ct = linearToSRGB(nt);
  return cacheColors[id] = { playerColorText: srgbToHex(ct), playerColorLighting };
}

function getTownFocusInfo(city) {
  if (!city?.isTown) return void 0;
  const id = (() => {
    const id = city.Growth?.projectType ?? -1;
    if (id != -1) return id;
    // check for locked focus
    const projects = Game.CityCommands.canStart(
      city.id,
      CityCommandTypes.CHANGE_GROWTH_MODE,
      { Type: GrowthTypes.PROJECT },
      false
    )?.Projects;
    return projects?.length == 1 ? projects[0] : -1;
  })();
  const info = {
    ProjectType: "PROJECT_GROWTH",
    Name: "LOC_UI_FOOD_CHOOSER_FOCUS_GROWTH",
    Description: "LOC_PROJECT_TOWN_FOOD_INCREASE_DESCRIPTION",
    ...GameInfo.Projects.lookup(id),
  };
  info.isGrowing = city.Growth.growthType == GrowthTypes.EXPAND;
  info.isSpecialized = info.ProjectType != "PROJECT_GROWTH";
  info.isPaused = info.isGrowing && info.isSpecialized;
  return info;
}

export { getTextColors, getTownFocusInfo };
// vim: sw=2
