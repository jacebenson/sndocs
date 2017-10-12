/*! RESOURCE: /scripts/thirdparty/velocity/velocity.ui.js */ ;
(function(factory) {
    if (typeof require === "function" && typeof exports === "object") {
      module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
      define(["velocity"], factory);
    } else {
      factory();
    }
  }(function() {
      return function(global, window, document, undefined) {
          if (!global.Velocity || !global.Velocity.Utilities) {
            window.console && console.log("Velocity UI Pack: Velocity must be loaded first. Aborting.");
            return;
          } else {
            var Velocity = global.Velocity,
              $ = Velocity.Utilities;
          }
          var velocityVersion = Velocity.version,
            requiredVersion = {
              major: 1,
              minor: 1,
              patch: 0
            };

          function greaterSemver(primary, secondary) {
            var versionInts = [];
            if (!primary || !secondary) {
              return false;
            }
            $.each([primary, secondary], function(i, versionObject) {
              var versionIntsComponents = [];
              $.each(versionObject, function(component, value) {
                while (value.toString().length < 5) {
                  value = "0" + value;
                }
                versionIntsComponents.push(value);
              });
              versionInts.push(versionIntsComponents.join(""))
            });
            return (parseFloat(versionInts[0]) > parseFloat(versionInts[1]));
          }
          if (greaterSemver(requiredVersion, velocityVersion)) {
            var abortError = "Velocity UI Pack: You need to update Velocity (jquery.velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";
            alert(abortError);
            throw new Error(abortError);
          }
          Velocity.RegisterEffect = Velocity.RegisterUI = function(effectName, properties) {
            function animateParentHeight(elements, direction, totalDuration, stagger) {
              var totalHeightDelta = 0,
                parentNode;
              $.each(elements.nodeType ? [elements] : elements, function(i, element) {
                if (stagger) {
                  totalDuration += i * stagger;
                }
                parentNode = element.parentNode;
                $.each(["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function(i, property) {
                  totalHeightDelta += parseFloat(Velocity.CSS.getPropertyValue(element, property));
                });
              });
              Velocity.animate(
                parentNode, {
                  height: (direction === "In" ? "+" : "-") + "=" + totalHeightDelta
                }, {
                  queue: false,
                  easing: "ease-in-out",
                  duration: totalDuration * (direction === "In" ? 0.6 : 1)
                }
              );
            }
            Velocity.Redirects[effectName] = function(element, redirectOptions, elementsIndex, elementsSize, elements, promiseData) {
              var finalElement = (elementsIndex === elementsSize - 1);
              if (typeof properties.defaultDuration === "function") {
                properties.defaultDuration = properties.defaultDuration.call(elements, elements);
              } else {
                properties.defaultDuration = parseFloat(properties.defaultDuration);
              }
              for (var callIndex = 0; callIndex < properties.calls.length; callIndex++) {
                var call = properties.calls[callIndex],
                  propertyMap = call[0],
                  redirectDuration = (redirectOptions.duration || properties.defaultDuration || 1000),
                  durationPercentage = call[1],
                  callOptions = call[2] || {},
                  opts = {};
                opts.duration = redirectDuration * (durationPercentage || 1);
                opts.queue = redirectOptions.queue || "";
                opts.easing = callOptions.easing || "ease";
                opts.delay = parseFloat(callOptions.delay) || 0;
                opts._cacheValues = callOptions._cacheValues || true;
                if (callIndex === 0) {
                  opts.delay += (parseFloat(redirectOptions.delay) || 0);
                  if (elementsIndex === 0) {
                    opts.begin = function() {
                      redirectOptions.begin && redirectOptions.begin.call(elements, elements);
                      var direction = effectName.match(/(In|Out)$/);
                      if ((direction && direction[0] === "In") && propertyMap.opacity !== undefined) {
                        $.each(elements.nodeType ? [elements] : elements, function(i, element) {
                          Velocity.CSS.setPropertyValue(element, "opacity", 0);
                        });
                      }
                      if (redirectOptions.animateParentHeight && direction) {
                        animateParentHeight(elements, direction[0], redirectDuration + opts.delay, redirectOptions.stagger);
                      }
                    }
                  }
                  if (redirectOptions.display !== null) {
                    if (redirectOptions.display !== undefined && redirectOptions.display !== "none") {
                      opts.display = redirectOptions.display;
                    } else if (/In$/.test(effectName)) {
                      var defaultDisplay = Velocity.CSS.Values.getDisplayType(element);
                      opts.display = (defaultDisplay === "inline") ? "inline-block" : defaultDisplay;
                    }
                  }
                  if (redirectOptions.visibility && redirectOptions.visibility !== "hidden") {
                    opts.visibility = redirectOptions.visibility;
                  }
                }
                if (callIndex === properties.calls.length - 1) {
                  function injectFinalCallbacks() {
                    if ((redirectOptions.display === undefined || redirectOptions.display === "none") && /Out$/.test(effectName)) {
                      $.each(elements.nodeType ? [elements] : elements, function(i, element) {
                        Velocity.CSS.setPropertyValue(element, "display", "none");
                      });
                    }
                    redirectOptions.complete && redirectOptions.complete.call(elements, elements);
                    if (promiseData) {
                      promiseData.resolver(elements || element);
                    }
                  }
                  opts.complete = function() {
                    if (properties.reset) {
                      for (var resetProperty in properties.reset) {
                        var resetValue = properties.reset[resetProperty];
                        if (Velocity.CSS.Hooks.registered[resetProperty] === undefined && (typeof resetValue === "string" || typeof resetValue === "number")) {
                          properties.reset[resetProperty] = [properties.reset[resetProperty], properties.reset[resetProperty]];
                        }
                      }
                      var resetOptions = {
                        duration: 0,
                        queue: false
                      };
                      if (finalElement) {
                        resetOptions.complete = injectFinalCallbacks;
                      }
                      Velocity.animate(element, properties.reset, resetOptions);
                    } else if (finalElement) {
                      injectFinalCallbacks();
                    }
                  };
                  if (redirectOptions.visibility === "hidden") {
                    opts.visibility = redirectOptions.visibility;
                  }
                }
                Velocity.animate(element, propertyMap, opts);
              }
            };
            return Velocity;
          };
          Velocity.RegisterEffect.packagedEffects = {
              "callout.bounce": {
                defaultDuration: 550,
                calls: [
                  [{
                    translateY: -30
                  }, 0.25],
                  [{
                    translateY: 0
                  }, 0.125],
                  [{
                    translateY: -15
                  }, 0.125],
                  [{
                    translateY: 0
                  }, 0.25]
                ]
              },
              "callout.shake": {
                defaultDuration: 800,
                calls: [
                  [{
                    translateX: -11
                  }, 0.125],
                  [{
                    translateX: 11
                  }, 0.125],
                  [{
                    translateX: -11
                  }, 0.125],
                  [{
                    translateX: 11
                  }, 0.125],
                  [{
                    translateX: -11
                  }, 0.125],
                  [{
                    translateX: 11
                  }, 0.125],
                  [{
                    translateX: -11
                  }, 0.125],
                  [{
                    translateX: 0
                  }, 0.125]
                ]
              },
              "callout.flash": {
                defaultDuration: 1100,
                calls: [
                  [{
                    opacity: [0, "easeInOutQuad", 1]
                  }, 0.25],
                  [{
                    opacity: [1, "easeInOutQuad"]
                  }, 0.25],
                  [{
                    opacity: [0, "easeInOutQuad"]
                  }, 0.25],
                  [{
                    opacity: [1, "easeInOutQuad"]
                  }, 0.25]
                ]
              },
              "callout.pulse": {
                defaultDuration: 825,
                calls: [
                  [{
                    scaleX: 1.1,
                    scaleY: 1.1
                  }, 0.50, {
                    easing: "easeInExpo"
                  }],
                  [{
                    scaleX: 1,
                    scaleY: 1
                  }, 0.50]
                ]
              },
              "callout.swing": {
                defaultDuration: 950,
                calls: [
                  [{
                    rotateZ: 15
                  }, 0.20],
                  [{
                    rotateZ: -10
                  }, 0.20],
                  [{
                    rotateZ: 5
                  }, 0.20],
                  [{
                    rotateZ: -5
                  }, 0.20],
                  [{
                    rotateZ: 0
                  }, 0.20]
                ]
              },
              "callout.tada": {
                defaultDuration: 1000,
                calls: [
                  [{
                    scaleX: 0.9,
                    scaleY: 0.9,
                    rotateZ: -3
                  }, 0.10],
                  [{
                    scaleX: 1.1,
                    scaleY: 1.1,
                    rotateZ: 3
                  }, 0.10],
                  [{
                    scaleX: 1.1,
                    scaleY: 1.1,
                    rotateZ: -3
                  }, 0.10],
                  ["reverse", 0.125],
                  ["reverse", 0.125],
                  ["reverse", 0.125],
                  ["reverse", 0.125],
                  ["reverse", 0.125],
                  [{
                    scaleX: 1,
                    scaleY: 1,
                    rotateZ: 0
                  }, 0.20]
                ]
              },
              "transition.fadeIn": {
                defaultDuration: 500,
                calls: [
                  [{
                    opacity: [1, 0]
                  }]
                ]
              },
              "transition.fadeOut": {
                defaultDuration: 500,
                calls: [
                  [{
                    opacity: [0, 1]
                  }]
                ]
              },
              "transition.flipXIn": {
                defaultDuration: 700,
                calls: [
                  [{
                    opacity: [1, 0],
                    transformPerspective: [800, 800],
                    rotateY: [0, -55]
                  }]
                ],
                reset: {
                  transformPerspective: 0
                }
              },
              "transition.flipXOut": {
                defaultDuration: 700,
                calls: [
                  [{
                    opacity: [0, 1],
                    transformPerspective: [800, 800],
                    rotateY: 55
                  }]
                ],
                reset: {
                  transformPerspective: 0,
                  rotateY: 0
                }
              },
              "transition.flipYIn": {
                defaultDuration: 800,
                calls: [
                  [{
                    opacity: [1, 0],
                    transformPerspective: [800, 800],
                    rotateX: [0, -45]
                  }]
                ],
                reset: {
                  transformPerspective: 0
                }
              },
              "transition.flipYOut": {
                defaultDuration: 800,
                calls: [
                  [{
                    opacity: [0, 1],
                    transformPerspective: [800, 800],
                    rotateX: 25
                  }]
                ],
                reset: {
                  transformPerspective: 0,
                  rotateX: 0
                }
              },
              "transition.flipBounceXIn": {
                defaultDuration: 900,
                calls: [
                  [{
                    opacity: [0.725, 0],
                    transformPerspective: [400, 400],
                    rotateY: [-10, 90]
                  }, 0.50],
                  [{
                    opacity: 0.80,
                    rotateY: 10
                  }, 0.25],
                  [{
                    opacity: 1,
                    rotateY: 0
                  }, 0.25]
                ],
                reset: {
                  transformPerspective: 0
                }
              },
              "transition.flipBounceXOut": {
                defaultDuration: 800,
                calls: [
                  [{
                    opacity: [0.9, 1],
                    transformPerspective: [400, 400],
                    rotateY: -10
                  }, 0.50],
                  [{
                    opacity: 0,
                    rotateY: 90
                  }, 0.50]
                ],
                reset: {
                  transformPerspective: 0,
                  rotateY: 0
                }
              },
              "transition.flipBounceYIn": {
                defaultDuration: 850,
                calls: [
                  [{
                    opacity: [0.725, 0],
                    transformPerspective: [400, 400],
                    rotateX: [-10, 90]
                  }, 0.50],
                  [{
                    opacity: 0.80,
                    rotateX: 10
                  }, 0.25],
                  [{
                    opacity: 1,
                    rotateX: 0
                  }, 0.25]
                ],
                reset: {
                  transformPerspective: 0
                }
              },
              "transition.flipBounceYOut": {
                defaultDuration: 800,
                calls: [
                  [{
                    opacity: [0.9, 1],
                    transformPerspective: [400, 400],
                    rotateX: -15
                  }, 0.50],
                  [{
                    opacity: 0,
                    rotateX: 90
                  }, 0.50]
                ],
                reset: {
                  transformPerspective: 0,
                  rotateX: 0
                }
              },
              "transition.swoopIn": {
                defaultDuration: 850,
                calls: [
                    [{
                        o