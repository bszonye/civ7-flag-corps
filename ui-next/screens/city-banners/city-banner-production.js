import { template, insert, setAttribute } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createEffect, createComponent, createRenderEffect, Show, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { RingMeter } from '../../../../core/ui-next/components/ring-meter.js';
import { TooltipKeyword } from '../../../../core/ui-next/components/tooltip-keyword.js';
import { Tooltip, TooltipHorizontalPosition, TooltipVerticalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { TicketSection, EntryDivider } from '../../tooltips/plot-tooltip/components/utility.js';
import { ProductionTooltip } from '../../tooltips/production-tooltip.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="bz-city-banner__production-icon size-4 self-center bg-contain bg-no-repeat"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="city-banner__turn flex flex-col relative justify-end align-center self-center w-8 mt-0-\\\\.5 pointer-events-none"><div class="city-banner__turn-number font-body-xs text-white text-center w-full bg-cover bg-center bg-no-repeat"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="items-center justify-center w-6 h-6 relative"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="size-11 self-center bg-contain bg-no-repeat"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="size-20 relative self-center -mt-14 -mb-8 flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat pointer-events-none"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="w-full h-7"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-col items-stretch justify-center"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="h-px"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="grow h-px"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="w-px self-stretch bg-accent-2 opacity-30 mx-2"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="flex flex-col"><div class="size-9 self-center bg-contain bg-no-repeat"></div><div class="flex flex-row items-center justify-center"><div class="text-xs text-accent-3"></div><div class="size-5 bg-cover bg-no-repeat"></div></div></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="w-9 flex item-center justify-center"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="self-center uppercase font-title text-accent-3 opacity-60"></div>`);
const CityBannerProduction = (props) => {
  const [currentProd, setCurrentProd] = createSignal(void 0);
  const [buildQueue, setBuildQueue] = createSignal([]);
  const [turnsLeft, setTurnsLeft] = createSignal(-1);
  const [percent, setPercent] = createSignal(-1);
  const isQueueEmpty = createMemo(() => {
    for (const item of buildQueue()) {
      if (item.type.length > 0) return false;
    }
    return true;
  });
  createEffect(() => {
    const production = props.currentProduction;
    if (!production) {
      return;
    }
    setCurrentProd(production);
    setBuildQueue(props.buildQueue);
    setTurnsLeft(props.turnsLeft);
    setPercent(props.percent);
  });
  return createComponent(Tooltip, {
    get initialVPosition() {
      return TooltipVerticalPosition.BOTTOM;
    },
    get initialHPosition() {
      return TooltipHorizontalPosition.RIGHT;
    },
    offset: 22,
    allowFlip: true,
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          var _el$ = _tmpl$3();
          insert(_el$, createComponent(RingMeter, {
            min: 0,
            max: 100,
            get value() {
              return percent();
            },
            "class": "city-banner__ring city-banner__production-ring bg-cover bg-center flex size-9 self-center align-center pointer-events-auto",
            get children() {
              var _el$2 = _tmpl$();
              createRenderEffect((_p$) => {
                var _v$ = Locale.compose(`{LOC_UI_CITY_BANNER_PRODUCTION} {${currentProd()?.name ?? ""}}, `), _v$2 = currentProd()?.icon ?? "";
                _v$ !== _p$.e && setAttribute(_el$2, "aria-label", _p$.e = _v$);
                _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$2.style.setProperty("background-image", _v$2) : _el$2.style.removeProperty("background-image"));
                return _p$;
              }, {
                e: void 0,
                t: void 0
              });
              return _el$2;
            }
          }), null);
          insert(_el$, createComponent(Show, {
            get when() {
              return turnsLeft() >= 0;
            },
            get children() {
              var _el$3 = _tmpl$2(), _el$4 = _el$3.firstChild;
              insert(_el$4, turnsLeft);
              createRenderEffect(() => setAttribute(_el$4, "aria-label", Locale.compose("LOC_UI_CITY_BANNER_TURNS_TO_COMPLETION", turnsLeft())));
              return _el$3;
            }
          }), null);
          return _el$;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            "class": "w-auto min-w-62 max-w-84 self-start text-sm",
            get children() {
              return [(() => {
                var _el$5 = _tmpl$5();
                _el$5.style.setProperty("background-image", "url(blp:base_triumph_ring)");
                insert(_el$5, createComponent(RingMeter, {
                  "class": "size-14 absolute flex justify-center bg-contain bg-center flex-auto items-center",
                  min: 0,
                  max: 100,
                  get value() {
                    return percent();
                  },
                  animationDuration: 1,
                  ringImage: `url("blp:progress_ring_triumph")`,
                  ringTint: "rgb(143, 113, 71)",
                  get children() {
                    var _el$6 = _tmpl$4();
                    createRenderEffect((_$p) => (_$p = currentProd().icon) != null ? _el$6.style.setProperty("background-image", _$p) : _el$6.style.removeProperty("background-image"));
                    return _el$6;
                  }
                }));
                return _el$5;
              })(), _tmpl$6(), createComponent(L10n.Stylize, {
                "class": "text-secondary text-center uppercase font-title",
                text: "LOC_UI_CITY_INSPECTOR_CURRENTLY_PRODUCING"
              }), createComponent(TicketSection, {
                get children() {
                  var _el$8 = _tmpl$7();
                  insert(_el$8, createComponent(ProductionTooltip, {
                    get type() {
                      return currentProd().type;
                    },
                    get name() {
                      return currentProd().name;
                    },
                    get category() {
                      return currentProd().kind;
                    },
                    get cost() {
                      return currentProd().cost.toString();
                    },
                    get initialVPosition() {
                      return TooltipVerticalPosition.BOTTOM;
                    },
                    get initialHPosition() {
                      return TooltipHorizontalPosition.RIGHT;
                    },
                    allowFlip: true,
                    get children() {
                      return createComponent(TooltipKeyword, {
                        get children() {
                          return createComponent(L10n.Stylize, {
                            "class": "font-title text-center text-sm",
                            get text() {
                              return currentProd().name;
                            }
                          });
                        }
                      });
                    }
                  }), null);
                  insert(_el$8, createComponent(EntryDivider, {
                    "class": "w-full"
                  }), null);
                  insert(_el$8, createComponent(L10n.Stylize, {
                    "class": "text-xs text-center",
                    get args() {
                      return [turnsLeft()];
                    },
                    text: "LOC_UI_CITY_BANNER_TURNS_TO_COMPLETION"
                  }), null);
                  return _el$8;
                }
              }), createComponent(L10n.Stylize, {
                "class": "text-xs text-secondary text-center font-title uppercase mt-2",
                text: "LOC_UI_CITY_INTERACT_PRODUCTION"
              }), createComponent(TicketSection, {
                "class": "flex flex-row items-center justify-between min-h-9",
                get children() {
                  return createComponent(Show, {
                    get when() {
                      return !isQueueEmpty();
                    },
                    get fallback() {
                      return [_tmpl$9(), createComponent(L10n.Stylize, {
                        "class": "text-sm text-accent-3 opacity-60 text-center",
                        text: "LOC_UI_CITY_BANNER_EMPTY_PRODUCTION_QUEUE"
                      }), _tmpl$9()];
                    },
                    get children() {
                      return [_tmpl$8(), createComponent(For, {
                        get each() {
                          return buildQueue();
                        },
                        children: (item, index) => [createComponent(Show, {
                          get when() {
                            return index() > 0;
                          },
                          get children() {
                            return _tmpl$10();
                          }
                        }), (() => {
                          var _el$14 = _tmpl$12();
                          insert(_el$14, createComponent(Show, {
                            get when() {
                              return item.type.length > 0;
                            },
                            get fallback() {
                              return (() => {
                                var _el$20 = _tmpl$13();
                                insert(_el$20, () => index() + 1);
                                return _el$20;
                              })();
                            },
                            get children() {
                              return createComponent(ProductionTooltip, {
                                get type() {
                                  return item.type;
                                },
                                get name() {
                                  return item.name;
                                },
                                get category() {
                                  return item.kind;
                                },
                                get cost() {
                                  return item.cost.toString();
                                },
                                get initialVPosition() {
                                  return TooltipVerticalPosition.BOTTOM;
                                },
                                get initialHPosition() {
                                  return TooltipHorizontalPosition.RIGHT;
                                },
                                allowFlip: true,
                                get children() {
                                  var _el$15 = _tmpl$11(), _el$16 = _el$15.firstChild, _el$17 = _el$16.nextSibling, _el$18 = _el$17.firstChild, _el$19 = _el$18.nextSibling;
                                  insert(_el$18, () => item.turns);
                                  _el$19.style.setProperty("background-image", 'url("fs://game/hud_turn-timer.png")');
                                  createRenderEffect((_$p) => (_$p = item.icon) != null ? _el$16.style.setProperty("background-image", _$p) : _el$16.style.removeProperty("background-image"));
                                  return _el$15;
                                }
                              });
                            }
                          }));
                          return _el$14;
                        })()]
                      }), _tmpl$8()];
                    }
                  });
                }
              })];
            }
          });
        }
      })];
    }
  });
};
defineLegacyComponent("city-banner-production", {
  attrs: {
    "data-cityid": null,
    "data-build-queue": null,
    "data-current-production": null,
    "data-prod-per-turn": "0",
    "data-turns-left": "0",
    "data-percent": "0"
  }
}, (attrs) => createComponent(CityBannerProduction, {
  get currentProduction() {
    return createMemo(() => !!attrs["data-current-production"])() ? JSON.parse(attrs["data-current-production"]) : void 0;
  },
  get buildQueue() {
    return createMemo(() => !!attrs["data-build-queue"])() ? JSON.parse(attrs["data-build-queue"]) : [];
  },
  get turnsLeft() {
    return Number(attrs["data-turns-left"]);
  },
  get percent() {
    return Number(attrs["data-percent"]);
  }
}));

export { CityBannerProduction };
//# sourceMappingURL=city-banner-production.js.map
// vim: sw=2
