import { template, insert, setAttribute } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, createComponent, Show, createRenderEffect, createMemo } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { RingMeter } from '../../../../core/ui-next/components/ring-meter.js';
import { TooltipKeyword } from '../../../../core/ui-next/components/tooltip-keyword.js';
import { Tooltip, TooltipHorizontalPosition, TooltipVerticalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { TicketSection, EntryDivider, TicketRow } from '../../tooltips/plot-tooltip/components/utility.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="city-banner__population-number font-body-xs text-white top-0 w-full text-center pointer-events-auto"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="city-banner__turn flex flex-col relative justify-end align-center self-center w-8 mt-0-\\\\.5 pointer-events-none"><div class="city-banner__turn-number font-body-xs text-white text-center w-full bg-cover bg-center bg-no-repeat"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="items-center justify-center w-6 h-6 relative"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="font-title-lg font-bold"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="size-16 relative self-center -mt-12 -mb-6 flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat pointer-events-none"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="w-full h-6"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-col items-stretch justify-center"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-row justify-between items-center"><div class="h-px w-4"></div><div class="text-sm"></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex items-center justify-center"></div>`);
const CityBannerPopulation = (props) => {
  const [isValid, setIsValid] = createSignal(false);
  const [canGrow, setCanGrow] = createSignal(false);
  const [currentPopulation, setCurrentPopulation] = createSignal(-1);
  const [urbanPop, setUrbanPop] = createSignal(-1);
  const [ruralPop, setRuralPop] = createSignal(-1);
  const [workerPop, setWorkerPop] = createSignal(-1);
  const [turnsUntilGrowth, setTurnsUntilGrowth] = createSignal(-1);
  const [currentFood, setCurrentFood] = createSignal(-1);
  const [currentThreshold, setCurrentThreshold] = createSignal(24);
  const [foodPerTurn, setFoodPerTurn] = createSignal(0);
  const truncateDecimal = (input) => {
    return input >= 1e3 ? Math.floor(input) : input;
  };
  createEffect(() => {
    const cityID = props.cityID;
    if (!cityID || !ComponentID.isValid(cityID)) {
      setIsValid(false);
      return;
    }
    const city = Cities.get(cityID);
    if (!city) {
      setIsValid(false);
      return;
    }
    const cityGrowth = city.Growth;
    if (!cityGrowth) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
    setCanGrow(props.canGrow);
    setCurrentPopulation(props.population);
    setUrbanPop(city.urbanPopulation);
    setRuralPop(city.ruralPopulation);
    setWorkerPop(city.Workers?.getNumWorkers(false) ?? 0);
    setCurrentFood(truncateDecimal(props.currentFood));
    setFoodPerTurn(truncateDecimal(props.foodPerTurn));
    setTurnsUntilGrowth(cityGrowth.turnsUntilGrowth);
    setCurrentThreshold(truncateDecimal(cityGrowth.getNextGrowthFoodThreshold().value));
  });
  return createComponent(Show, {
    get when() {
      return isValid();
    },
    get children() {
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
                get max() {
                  return currentThreshold();
                },
                get value() {
                  return currentFood();
                },
                "class": "city-banner__ring city-banner__population-ring bg-cover bg-center flex size-9 self-center align-center",
                get children() {
                  var _el$2 = _tmpl$();
                  insert(_el$2, currentPopulation);
                  createRenderEffect(() => setAttribute(_el$2, "aria-label", Locale.compose(`{LOC_CAPITAL_SELECT_POPULATION} ${currentPopulation()},`)));
                  return _el$2;
                }
              }), null);
              insert(_el$, createComponent(Show, {
                get when() {
                  return createMemo(() => turnsUntilGrowth() >= 0)() && canGrow();
                },
                get children() {
                  var _el$3 = _tmpl$2(), _el$4 = _el$3.firstChild;
                  insert(_el$4, turnsUntilGrowth);
                  createRenderEffect(() => setAttribute(_el$4, "aria-label", Locale.compose("LOC_UI_CITY_DETAILS_NEW_CITIZEN_IN_TURNS", turnsUntilGrowth())));
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
                      "class": "size-11 absolute flex justify-center bg-contain bg-center flex-auto items-center",
                      min: 0,
                      get max() {
                        return currentThreshold();
                      },
                      get value() {
                        return currentFood();
                      },
                      animationDuration: 1,
                      ringImage: `url("blp:progress_ring_triumph")`,
                      ringTint: "rgba(73, 209, 130, 1)",
                      get children() {
                        var _el$6 = _tmpl$4();
                        insert(_el$6, currentPopulation);
                        return _el$6;
                      }
                    }));
                    return _el$5;
                  })(), _tmpl$6(), (() => {
                    var _el$8 = _tmpl$7();
                    insert(_el$8, createComponent(L10n.Stylize, {
                      "class": "text-secondary text-center uppercase font-title",
                      text: "LOC_UI_CITY_DETAILS_GROWTH_TAB"
                    }), null);
                    insert(_el$8, createComponent(Show, {
                      get when() {
                        return canGrow();
                      },
                      get fallback() {
                        return (() => {
                          var _el$18 = _tmpl$9();
                          insert(_el$18, createComponent(L10n.Stylize, {
                            "class": "text-accent-3 text-sm",
                            text: "LOC_UI_CITY_DETAILS_TOWN_NO_GROWTH"
                          }));
                          return _el$18;
                        })();
                      },
                      get children() {
                        return [createComponent(TicketSection, {
                          "class": "flex flex-col",
                          get children() {
                            return [createComponent(L10n.Stylize, {
                              "class": "text-accent-3 text-xs text-center",
                              get args() {
                                return [currentFood(), currentThreshold(), foodPerTurn(), "YIELD_FOOD"];
                              },
                              text: "LOC_UI_CITY_BANNER_YIELD_BREAKDOWN"
                            }), createComponent(EntryDivider, {}), createComponent(L10n.Stylize, {
                              "class": "text-xs text-center",
                              get args() {
                                return [turnsUntilGrowth()];
                              },
                              text: "LOC_UI_CITY_DETAILS_NEW_CITIZEN_IN_TURNS"
                            })];
                          }
                        }), createComponent(L10n.Stylize, {
                          "class": "text-secondary text-xs text-center uppercase font-title mt-2",
                          text: "LOC_CAPITAL_SELECT_POPULATION"
                        })];
                      }
                    }), null);
                    return _el$8;
                  })(), createComponent(TicketSection, {
                    get children() {
                      return [createComponent(TicketRow, {
                        get icon() {
                          return createComponent(Icon, {
                            "class": "size-6",
                            name: "CITY_URBAN"
                          });
                        },
                        get children() {
                          var _el$9 = _tmpl$8(), _el$10 = _el$9.firstChild, _el$11 = _el$10.nextSibling;
                          insert(_el$9, createComponent(Tooltip.Text, {
                            text: "LOC_UI_CITY_DETAILS_URBAN_POPULATION_TOOLTIP",
                            get children() {
                              return createComponent(TooltipKeyword, {
                                get children() {
                                  return createComponent(L10n.Stylize, {
                                    "class": "font-title text-sm",
                                    text: "LOC_UI_CITY_STATUS_URBAN_POPULATION"
                                  });
                                }
                              });
                            }
                          }), _el$10);
                          insert(_el$11, urbanPop);
                          return _el$9;
                        }
                      }), createComponent(EntryDivider, {}), createComponent(TicketRow, {
                        get icon() {
                          return createComponent(Icon, {
                            "class": "size-6",
                            name: "CITY_RURAL"
                          });
                        },
                        get children() {
                          var _el$12 = _tmpl$8(), _el$13 = _el$12.firstChild, _el$14 = _el$13.nextSibling;
                          insert(_el$12, createComponent(Tooltip.Text, {
                            text: "LOC_UI_CITY_DETAILS_RURAL_POPULATION_TOOLTIP",
                            get children() {
                              return createComponent(TooltipKeyword, {
                                get children() {
                                  return createComponent(L10n.Stylize, {
                                    "class": "font-title text-sm",
                                    text: "LOC_UI_CITY_STATUS_RURAL_POPULATION"
                                  });
                                }
                              });
                            }
                          }), _el$13);
                          insert(_el$14, ruralPop);
                          return _el$12;
                        }
                      }), createComponent(EntryDivider, {}), createComponent(TicketRow, {
                        get icon() {
                          return createComponent(Icon, {
                            "class": "size-6",
                            name: "SPECIALIST"
                          });
                        },
                        get children() {
                          var _el$15 = _tmpl$8(), _el$16 = _el$15.firstChild, _el$17 = _el$16.nextSibling;
                          insert(_el$15, createComponent(Tooltip.Text, {
                            text: "LOC_UI_CITY_DETAILS_SPECIALIST_POPULATION_TOOLTIP",
                            get children() {
                              return createComponent(TooltipKeyword, {
                                get children() {
                                  return createComponent(L10n.Stylize, {
                                    "class": "font-title text-sm",
                                    text: "LOC_WORKERS_TITLE"
                                  });
                                }
                              });
                            }
                          }), _el$16);
                          insert(_el$17, workerPop);
                          return _el$15;
                        }
                      })];
                    }
                  })];
                }
              });
            }
          })];
        }
      });
    }
  });
};
defineLegacyComponent("city-banner-population", {
  attrs: {
    "data-cityid": null,
    "data-population": "-1",
    "data-current-food": "-1",
    "data-food-per-turn": "-1",
    "data-can-grow": "true"
  }
}, (attrs) => createComponent(CityBannerPopulation, {
  get cityID() {
    return createMemo(() => !!attrs["data-cityid"])() ? JSON.parse(attrs["data-cityid"]) : null;
  },
  get population() {
    return Number(attrs["data-population"]);
  },
  get currentFood() {
    return Number(attrs["data-current-food"]);
  },
  get foodPerTurn() {
    return Number(attrs["data-food-per-turn"]);
  },
  get canGrow() {
    return attrs["data-can-grow"] == "true";
  }
}));

export { CityBannerPopulation };
//# sourceMappingURL=city-banner-population.js.map
// vim: sw=2
