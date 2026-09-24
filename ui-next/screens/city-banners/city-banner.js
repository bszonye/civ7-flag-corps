import { template, insert, use } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect, Switch, Match, createEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../../core/ui-next/components/tooltip.js';
import { WorldAnchor } from '../../../../core/ui-next/components/world-anchor.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { FocusContext } from '../../../../core/ui-next/services/focus.js';
import { RaiseDiplomacyEvent } from '../../../ui/diplomacy/diplomacy-events.js';
import { CityBannerFocusContext } from './city-banner-focus.js';
import { BannerType } from './city-banner-data.js';
// import { CityBannerNameTooltip } from './city-banner-name-tooltip.js';
import { CityBannerPopulation } from './city-banner-population.js';
import { CityBannerProduction } from './city-banner-production.js';

Controls.loadStyle("/bz-flag-corps/ui-next/screens/city-banners/bz-city-banner.css");

var
  _tmpl$ = template(`<div class="city-banner__stretch-bg absolute inset-0 pointer-events-none"></div>`),
  _tmpl$2 = template(`<div class="city-banner__portrait relative pointer-events-auto flex"><div class="city-banner__portrait-bg1 absolute inset-0 bg-center bg-cover bg-no-repeat"></div><div class="city-banner__portrait-bg2 absolute inset-x-0 top-0 -bottom-2 bg-center bg-cover bg-no-repeat"></div><div class="city-banner__portrait-img absolute -left-2 -right-2 -top-1 bottom-0 bg-cover bg-center bg-no-repeat pointer-events-none"></div></div>`),
  _tmpl$3 = template(`<div class="city-banner__original-capital-curr-star w-6 h-6 bg-cover bg-no-repeat pointer-events-auto"></div>`),
  _tmpl$4 = template(`<div class="city-banner__capital-star w-6 h-6 bg-cover bg-no-repeat pointer-events-auto"></div>`),
  _tmpl$5 = template(`<div class="city-banner__original-capital-star w-6 h-6 bg-cover bg-no-repeat pointer-events-auto city-banner__town-original-capital-star"></div>`),
  _tmpl$6 = template(`<p class="city-banner__name font-title text-base uppercase"></p>`),
  _tmpl$7 = template(`<div class="city-banner__status flex justify-center align-center opacity-100 pointer-events-auto"><div class="city-banner__status-background h-full w-full absolute"></div><div class="city-banner__status-icon absolute w-full h-full bg-no-repeat"></div></div>`),
  _tmpl$8 = template(`<div class="city-banner__religion-symbol-bg pointer-events-auto"></div>`),
  _tmpl$9 = template(`<div class="city-banner__religion-symbol-bg pointer-events-auto religion-bg--right"></div>`),
  _tmpl$10 = template(`<div class="city-banner__religion self-center relative flex flex-row"></div>`),
  _tmpl$11 = template(`<div class="city-banner__trade-network flex justify-center align-center pointer-events-auto"><div class="city-banner__trade-network-background h-full w-full absolute"></div><div class="city-banner__trade-network-icon absolute w-full h-full bg-no-repeat"></div></div>`),
  _tmpl$12 = template(`<div class="city-banner__production-container city-banner__queue-container queue-production items-center justify-center w-8 h-6 -mt-2"><div class="city-banner__production"></div></div>`),
  _tmpl$13 = template(`<div class="city-banner__city-state-icon size-8 self-center align-center bg-cover bg-no-repeat"></div>`),
  _tmpl$14 = template(`<div class="city-banner__city-state-container justify-center"><div class="city-banner__city-state-type size-7 self-center align-center justify-center flex"></div></div>`),
  // top level
  _tmpl$15 = template(`<div class="city-banner__container flex flex-col mt-2 pointer-events-none"><div class="city-banner__stretch absolute flex flex-row justify-center align-center w-full h-8 top-1\\.5 pointer-events-none"><div class="city-banner__city-state-border absolute -left-2 -right-2 -top-0 -bottom-0"></div><div class="city-banner__city-state-ring absolute -left-1 -right-1 top-1 bottom-0"></div></div><div class="city-banner__name-container relative flex justify-between"><div class="pointer-events-auto cursor-pointer max-h-10 relative flex flex-col"><div class="flex flex-row"></div><div class="city-banner__status-religion relative flex flex-row"></div></div><div class="city-banner__population-container city-banner__queue-container queue-growth items-center justify-center w-8 h-6 -mt-2"><div class="city-banner__population"></div></div></div></div>`),
  _tmpl$16 = template(`<div class="bz-city-banner__conquered flex-auto -mr-3 flex flex-col"><div class="city-banner__conquered-icon relative size-14 -mr-6 bg-cover bg-no-repeat flex"></div></div>`),
  _tmpl$17 = template(`<div class="city-banner__unrest -mr-3 flex flex-col"><div class="city-banner__unrest-icon relative size-14 bg-cover bg-no-repeat flex"></div><div class="city-banner__time-container -mt-3 pr-2 flex flex-row"><div class="city-banner__time-icon self-center bg-cover bg-no-repeat size-6 ml-1"></div><div class="city-banner__time-text self-center font-body-xs text-white"></div></div></div>`),
  _tmpl$18 = template(`<div class="city-banner__razing -mr-3 flex flex-col"><div class="city-banner__razing-icon relative size-14 bg-cover bg-no-repeat flex"></div><div class="city-banner__time-container -mt-3 pr-2 flex flex-row"><div class="city-banner__time-icon self-center bg-cover bg-no-repeat size-6 ml-1"></div><div class="city-banner__time-text self-center font-body-xs text-white"></div></div></div>`),
  _tmpl$19 = template(`<div class="items-center -ml-12 mt-10 city-banner__right-container flex flex-row"></div>`);

const BANNER_ANCHOR_OFFSET = {
  x: 0,
  y: 0,
  z: 42
};
const CityBannerImpl = (props) => {
  function onActivate() {
    const owner = props.cityID.owner;
    if (owner == GameContext.localPlayerID) {
      UI.Player.selectCity(props.cityID);
      return;
    }
    const otherPlayer = Players.get(owner);
    if (!otherPlayer) {
      return;
    }
    if (otherPlayer.isMajor || otherPlayer.isMinor || otherPlayer.isIndependent) {
      if (!Game.Diplomacy.hasMet(GameContext.localPlayerID, owner)) {
        return;
      }
      window.dispatchEvent(new RaiseDiplomacyEvent(owner));
    }
  }
  return createComponent(WorldAnchor, {
    get location() {
      return props.location ?? props.data.identity.location;
    },
    offset: BANNER_ANCHOR_OFFSET,
    get placement() {
      return PlacementMode.TERRAIN;
    },
    "class": "bz-flags city-banner -top-9 absolute flex flex-row justify-start items-center flex-nowrap bg-center whitespace-nowrap bg-no-repeat allow-pan",
    get classList() {
      return {
        hidden: !props.data.status.visible,
        "city-banner--town": props.data.identity.bannerType == BannerType.Town,
        "city-banner--city": props.data.identity.bannerType == BannerType.City && props.data.identity.isLocalPlayerCity,
        "city-banner--city-other": props.data.identity.bannerType == BannerType.City && !props.data.identity.isLocalPlayerCity,
        "city-banner--citystate": props.data.identity.bannerType == BannerType.CityState,
        "city-banner--village": props.data.identity.bannerType == BannerType.Village,
        "city-banner--has-religion": props.data.religion.hasReligion,
        "city-banner--conquered": props.data.conquered,
        "city-banner--unrest": props.data.status.hasUnrest,
        "city-banner--razing": props.data.status.isBeingRazed,
        "city-banner--friendly": props.data.relationship == "friendly",
        "city-banner--hostile": props.data.relationship == "hostile",
        "city-banner--neutral": props.data.relationship == "neutral",
        // TRIX: subtler shadow colors
        "bz-black-shadow": props.data.identity.playerColorLighting === "black",
        "bz-white-highlight": props.data.identity.playerColorLighting === "white",
        // TRIX: flags needed at top level
        "city-banner--infected": props.data.status.isInfected,
        "city-banner--unconnected": !props.data.status.tradeNetworkConnections.length,
        "city-banner--disconnected": props.data.status.tradeNetworkDisconnected,
        "city-banner--capital": props.data.capital.isCapital,
        "city-banner--original-capital": props.data.capital.isOriginalCapital,
        "city-banner--original-capital-curr": props.data.capital.isOriginalCapitalCurrent,
        "city-banner--rival": props.data.identity.isRival,
        // TRIX: happiness details
        [props.data.status.happinessStage.class]: true,
      };
    },
    get style() {
      return {
        "--player-color-primary": props.data.identity.playerColorPrimary,
        "--player-color-secondary": props.data.identity.playerColorSecondary,
        "--player-color-text": props.data.identity.playerColorText  // TRIX
      };
    },
    get children() {
      return createComponent(FocusContext.Provider, {
        value: CityBannerFocusContext,
        get children() {
          return createComponent(Activatable, {
            disableFocus: true,
            name: "CityBanner",
            onActivate,
            "class": "flex flex-row justify-start items-center flex-nowrap",
            style: {
              "pointer-events": "none"
            },
            get disabled() {
              return props.data.status.disabled();
            },
            get children() {
              return [(() => {
                // _tmpl$15 = template(`<div class="city-banner__container flex flex-col mt-2 pointer-events-none"><div class="city-banner__stretch absolute flex flex-row justify-center align-center w-full h-8 top-1\\.5 pointer-events-none"><div class="city-banner__city-state-border absolute -left-2 -right-2 -top-0 -bottom-0"></div><div class="city-banner__city-state-ring absolute -left-1 -right-1 top-1 bottom-0"></div></div><div class="city-banner__name-container relative flex justify-between"><div class="pointer-events-auto cursor-pointer max-h-10 relative flex flex-col"><div class="flex flex-row"></div><div class="city-banner__status-religion relative flex flex-row"></div></div><div class="city-banner__population-container city-banner__queue-container queue-growth items-center justify-center w-8 h-6 -mt-2"><div class="city-banner__population"></div></div></div></div>`);
                var
                  _el$ = _tmpl$15(),  // CONTAINER flex-col
                  _el$2 = _el$.firstChild,  // STRETCH absolute flex-row
                  _el$3 = _el$2.firstChild,  // CITY-STATE-BORDER absolute
                  _el$4 = _el$3.nextSibling,  // CITY-STATE-RING absolute
                  _el$6 = _el$2.nextSibling,  // NAME-CONTAINER relative flex
                  _el$11 = _el$6.firstChild,  // pointer-events-auto max-h-10
                  _el$12 = _el$11.firstChild,  // flex flex-row
                  _el$17 = _el$12.nextSibling,  // STATUS-RELIGION relative flex-row
                  _el$25 = _el$11.nextSibling,  // POPULATION-CONTAINER queue-container
                  _el$26 = _el$25.firstChild;  // POPULATION
                // TRIX: attach custom city tooltip
                const loc = props.location ?? props.data.identity.location;
                _el$.setAttribute("data-city-location", JSON.stringify(loc));
                _el$.setAttribute("data-city-owner", props.cityID.owner);
                _el$.setAttribute("data-city-local-id", props.cityID.id);
                _el$.setAttribute("data-tooltip-style", "bz-city-tooltip");
                insert(_el$2, createComponent(Show, {
                  get when() {
                    return props.data.identity.bannerType == BannerType.Town;
                  },
                  get fallback() {
                    return createComponent(Show, {  // CityBannerNameTooltip, {
                      when: true,
                      get data() {
                        return props.data.identity;
                      },
                      get children() {
                        return _tmpl$();
                      }
                    });
                  },
                  get children() {
                    return createComponent(Tooltip.Text, {
                      text: "LOC_CAPITAL_SELECT_PROMOTION_NONE",
                      get children() {
                        return _tmpl$();
                      }
                    });
                  }
                }), null);
                // TRIX: add conquered icon to NAME, not RIGHT-CONTAINER
                insert(_el$11, createComponent(Show, {
                  get when() {
                    return props.data.conquered;
                  },
                  get children() {
                    return createComponent(Tooltip.Text, {
                      text: "LOC_CITY_BANNER_CONQUERED_TOOLTIP",
                      get children() {
                        return _tmpl$16();
                      }
                    });
                  }
                }), _el$12);
                // TRIX: add unrest & razing to STRETCH, not RIGHT-CONTAINER
                insert(_el$2, createComponent(Show, {
                  get when() {
                    return props.data.status.hasUnrest;
                  },
                  get children() {
                    var _el$34 = _tmpl$17(), _el$35 = _el$34.firstChild, _el$36 = _el$35.nextSibling, _el$37 = _el$36.firstChild, _el$38 = _el$37.nextSibling;
                    insert(_el$38, () => props.data.status.unrestTurns);
                    return _el$34;
                  }
                }), null);
                insert(_el$2, createComponent(Show, {
                  get when() {
                    return props.data.status.isBeingRazed;
                  },
                  get children() {
                    var _el$39 = _tmpl$18(), _el$40 = _el$39.firstChild, _el$41 = _el$40.nextSibling, _el$42 = _el$41.firstChild, _el$43 = _el$42.nextSibling;
                    insert(_el$43, () => props.data.status.razedTurns);
                    return _el$39;
                  }
                }), null);
                insert(_el$6, createComponent(Show, {  // CityBannerNameTooltip, {
                  when: true,
                  get data() {
                    return props.data.identity;
                  },
                  get children() {
                    var _el$7 = _tmpl$2(), _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling, _el$10 = _el$9.nextSibling;
                    createRenderEffect((_$p) => (_$p = `url('${props.data.identity.portraitIcon}')`) != null ? _el$10.style.setProperty("background-image", _$p) : _el$10.style.removeProperty("background-image"));  // eslint-disable-line no-constant-binary-expression
                    return _el$7;
                  }
                }), _el$11);
                insert(_el$12, createComponent(Switch, {
                  get children() {
                    return [createComponent(Match, {
                      get when() {
                        return props.data.capital.isOriginalCapitalCurrent;
                      },
                      get children() {
                        return createComponent(Tooltip.Text, {
                          text: "LOC_UI_CITY_CAPITAL_OG_CURR_DESC",
                          get children() {
                            return _tmpl$3();
                          }
                        });
                      }
                    }), createComponent(Match, {
                      get when() {
                        return props.data.capital.isCapital;
                      },
                      get children() {
                        return createComponent(Tooltip.Text, {
                          text: "LOC_UI_CITY_CAPITAL_CURR_DESC",
                          get children() {
                            return _tmpl$4();
                          }
                        });
                      }
                    }), createComponent(Match, {
                      get when() {
                        return props.data.capital.isOriginalCapital;
                      },
                      get children() {
                        return createComponent(Tooltip.Text, {
                          text: "LOC_UI_CITY_CAPITAL_OG_DESC",
                          get children() {
                            return _tmpl$5();
                          }
                        });
                      }
                    }), createComponent(Match, {
                      get when() {
                        return props.data.identity.civIcon != null;
                      },
                      get children() {
                        return createComponent(Icon, {
                          "class": "city-banner__bz-civ-symbol size-8",
                          isUrl: true,
                          get name() {
                            return props.data.identity.civIcon;
                          },
                        });
                      }
                    })];
                  }
                }), null);
                insert(_el$12, createComponent(Show, {
                  get when() {
                    return props.data.identity.bannerType == BannerType.Town;
                  },
                  get fallback() {
                    return createComponent(Show, {  // CityBannerNameTooltip, {
                      when: true,
                      get data() {
                        return props.data.identity;
                      },
                      get children() {
                        var _el$45 = _tmpl$6();
                        insert(_el$45, createComponent(L10n.Compose, {
                          get text() {
                            return props.data.identity.name;
                          }
                        }));
                        return _el$45;
                      }
                    });
                  },
                  get children() {
                    return createComponent(Show, {  // Tooltip.Text, {
                      when: true,
                      text: "LOC_CAPITAL_SELECT_PROMOTION_NONE",
                      get children() {
                        var _el$16 = _tmpl$6();
                        insert(_el$16, createComponent(L10n.Compose, {
                          get text() {
                            return props.data.identity.name;
                          }
                        }));
                        return _el$16;
                      }
                    });
                  }
                }), null);
                insert(_el$17, createComponent(Tooltip.Text, {
                  get text() {
                    return props.data.status.statusTooltip;
                  },
                  get children() {
                    var _el$18 = _tmpl$7(), _el$19 = _el$18.firstChild, _el$20 = _el$19.nextSibling;
                    createRenderEffect((_$p) => (_$p = props.data.status.statusIcon) != null ? _el$20.style.setProperty("background-image", _$p) : _el$20.style.removeProperty("background-image"));
                    return _el$18;
                  }
                }), null);
                // TRIX: move trade before religion
                insert(_el$17, createComponent(Show, {
                  get when() {
                    return !props.data.status.tradeNetworkHidden;
                  },
                  get children() {
                    return createComponent(Tooltip.Text, {
                      get text() {
                        return props.data.status.tradeNetworkTooltip;
                      },
                      get children() {
                        var elTrade = _tmpl$11(), elIcon = elTrade.lastChild;
                        const connections =
                          props.data.status.tradeNetworkConnections.length;
                        const font = connections < 10 ? "font-body-xs" : "font-body-2xs";
                        elIcon.classList.add(font);
                        elIcon.textContent = connections;
                        return elTrade;
                      }
                    });
                  }
                }), null);
                insert(_el$17, createComponent(Show, {
                  get when() {
                    return props.data.religion.hasReligion;
                  },
                  get children() {
                    var _el$21 = _tmpl$10();
                    insert(_el$21, createComponent(Tooltip.Text, {
                      get text() {
                        return props.data.religion.urbanReligionTooltip;
                      },
                      get args() {
                        return props.data.religion.urbanReligionTooltipArgs;
                      },
                      get children() {
                        var _el$22 = _tmpl$8();
                        insert(_el$22, createComponent(Icon, {
                          isUrl: true,
                          get name() {
                            return props.data.religion.urbanReligionIcon;
                          },
                          "class": "city-banner__religion-symbol"
                        }));
                        return _el$22;
                      }
                    }), null);
                    insert(_el$21, createComponent(Show, {
                      get when() {
                        return props.data.religion.showRuralReligion;
                      },
                      get children() {
                        return createComponent(Tooltip.Text, {
                          get text() {
                            return props.data.religion.ruralReligionTooltip;
                          },
                          get args() {
                            return props.data.religion.ruralReligionTooltipArgs;
                          },
                          get children() {
                            var _el$23 = _tmpl$9();
                            insert(_el$23, createComponent(Icon, {
                              isUrl: true,
                              get name() {
                                return props.data.religion.ruralReligionIcon;
                              },
                              "class": "city-banner__religion-symbol religion-symbol--right"
                            }));
                            return _el$23;
                          }
                        });
                      }
                    }), null);
                    return _el$21;
                  }
                }), null);
                insert(_el$26, createComponent(CityBannerPopulation, {
                  get cityID() {
                    return props.cityID;
                  },
                  get population() {
                    return props.data.status.population;
                  },
                  get currentFood() {
                    return props.data.status.currentFood;
                  },
                  get canGrow() {
                    return props.data.status.canGrow;
                  },
                  get foodPerTurn() {
                    return props.data.status.foodPerTurn;
                  }
                }));
                insert(_el$6, createComponent(Show, {
                  get when() {
                    return props.data.status.showProductionQueue;
                  },
                  get children() {
                    var _el$27 = _tmpl$12(), _el$28 = _el$27.firstChild;
                    insert(_el$28, createComponent(CityBannerProduction, {
                      get currentProduction() {
                        return props.data.status.currentProduction;
                      },
                      get buildQueue() {
                        return props.data.status.buildQueue;
                      },
                      get turnsLeft() {
                        return props.data.status.turnsLeft;
                      },
                      get percent() {
                        return props.data.status.percent;
                      }
                    }));
                    return _el$27;
                  }
                }), null);
                insert(_el$6, createComponent(Show, {  // TRIX: town focus
                  get when() {
                    return props.data.identity.bannerType == BannerType.Town && props.data.status.townFocusInfo.isSpecialized;
                  },
                  get children() {
                    const tmplFocus = template(`<div class="city-banner__bz-town-focus-container relative size-8 justify-center"><div class="city-banner__bz-town-focus-bg bg-center bg-cover bg-no-repeat size-9 absolute flex"></div></div>`);
                    var elFocus = tmplFocus(), elFocusBG = elFocus.firstChild;
                    insert(elFocusBG, createComponent(Tooltip.Text, {
                      get text() {
                        return props.data.status.townFocusInfo?.Name;
                      },
                      get children() {
                        const info = props.data.status.townFocusInfo;
                        const tmplFocusIcon = template(`<div class="city-banner__bz-town-focus-icon bg-center bg-cover bg-no-repeat size-9 absolute"></div>`);
                        var elFocusIcon = tmplFocusIcon();
                        use((el) => {
                          createEffect(() => {
                            el.setAttribute("bz-town-focus", info.ProjectType);
                            el.classList.toggle("bz-paused-focus", info.isPaused);
                          });
                        }, elFocusIcon);
                        const icon = UI.getIconCSS(info.ProjectType);
                        createRenderEffect((_$p) => (_$p = icon) != null ? elFocusIcon.style.setProperty("background-image", _$p) : elFocusIcon.style.removeProperty("background-image"));
                        return elFocusIcon;
                      }
                    }));
                    return elFocus;
                  }
                }), null);
                insert(_el$6, createComponent(Show, {
                  get when() {
                    return props.data.identity.bannerType == BannerType.CityState || props.data.identity.bannerType == BannerType.Village;
                  },
                  get children() {
                    var _el$29 = _tmpl$14(), _el$30 = _el$29.firstChild;
                    insert(_el$30, createComponent(Tooltip.Text, {
                      get text() {
                        return props.data.identity.cityStateTypeName;
                      },
                      get children() {
                        var _el$31 = _tmpl$13();
                        use((el) => {
                          createEffect(() => {
                            el.style.setProperty("fxs-background-image-tint", props.data.identity.cityStateColor);
                          });
                        }, _el$31);
                        createRenderEffect((_$p) => (_$p = props.data.identity.cityStateIcon) != null ? _el$31.style.setProperty("background-image", _$p) : _el$31.style.removeProperty("background-image"));
                        return _el$31;
                      }
                    }));
                    return _el$29;
                  }
                }), null);
                return _el$;
              })()];
              // TRIX: moved from _tmpl$19 to _el$6 of _tmpl$15
              (() => {  // eslint-disable-line no-unreachable
                var _el$32 = _tmpl$19();
                insert(_el$32, createComponent(Show, {
                  get when() {
                    return props.data.conquered;
                  },
                  get children() {
                    return createComponent(Tooltip.Text, {
                      text: "LOC_CITY_BANNER_CONQUERED_TOOLTIP",
                      get children() {
                        return _tmpl$16();
                      }
                    });
                  }
                }), null);
                insert(_el$32, createComponent(Show, {
                  get when() {
                    return props.data.status.hasUnrest;
                  },
                  get children() {
                    var _el$34 = _tmpl$17(), _el$35 = _el$34.firstChild, _el$36 = _el$35.nextSibling, _el$37 = _el$36.firstChild, _el$38 = _el$37.nextSibling;
                    insert(_el$38, () => props.data.status.unrestTurns);
                    return _el$34;
                  }
                }), null);
                insert(_el$32, createComponent(Show, {
                  get when() {
                    return props.data.status.isBeingRazed;
                  },
                  get children() {
                    var _el$39 = _tmpl$18(), _el$40 = _el$39.firstChild, _el$41 = _el$40.nextSibling, _el$42 = _el$41.firstChild, _el$43 = _el$42.nextSibling;
                    insert(_el$43, () => props.data.status.razedTurns);
                    return _el$39;
                  }
                }), null);
                return _el$32;
              });
            }
          });
        }
      });
    }
  });
};
const CityBanner = ComponentRegistry.register("CityBanner", CityBannerImpl);

export { CityBanner };
//# sourceMappingURL=city-banner.js.map
// vim: sw=2
