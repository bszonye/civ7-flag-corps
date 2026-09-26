import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../../core/ui-next/components/tooltip.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex-auto p-0"><div></div></div>`);
const CityBannerNameTooltip = (props) => {
  return createComponent(Tooltip, {
    showFiligrees: false,
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return props.children;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            "class": "relative flex flex-col pb-1 max-w-128",
            get children() {
              var _el$ = _tmpl$2(), _el$3 = _el$.firstChild;
              insert(_el$, createComponent(Show, {
                get when() {
                  return props.data.leaderName;
                },
                get children() {
                  var _el$2 = _tmpl$();
                  insert(_el$2, createComponent(L10n.Compose, {
                    get text() {
                      return props.data.leaderName;
                    }
                  }));
                  return _el$2;
                }
              }), _el$3);
              insert(_el$3, createComponent(L10n.Compose, {
                get text() {
                  return props.data.civName;
                }
              }));
              insert(_el$, createComponent(Show, {
                get when() {
                  return props.data.cityStateBonusName;
                },
                get children() {
                  var _el$4 = _tmpl$();
                  insert(_el$4, createComponent(L10n.Compose, {
                    get text() {
                      return props.data.cityStateBonusName;
                    }
                  }));
                  return _el$4;
                }
              }), null);
              return _el$;
            }
          });
        }
      })];
    }
  });
};

export { CityBannerNameTooltip };
//# sourceMappingURL=city-banner-name-tooltip.js.map
// vim: sw=2
