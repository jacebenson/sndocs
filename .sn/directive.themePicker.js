/*! RESOURCE: /scripts/concourse/directive.themePicker.js */
angular.module('sn.concourse').directive('themePicker', function(getTemplateUrl, userPreferences, $timeout, snCustomEvent) {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('concourse_theme_picker.xml'),
        controller: function($scope, $http) {
            $scope.executionCount = 0;
            var lazyLoaded = false;

            function getData() {
                $http.get("/api/now/ui/theme").then(function(response) {
                    if (response && response.data && response.data.result && response.data.result.themes) {
                        $scope.themes = response.data.result.themes;
                        if (response.data.result.defaultTheme)
                            $scope.defaultTheme = response.data.result.defaultTheme;
                        var initialPress = true;
                        document.getElementById("nav-settings-button").addEventListener("click", function() {
                            if (initialPress) {
                                initialPress = false;
                                processLazyLoad();
                            }
                        });
                    }
                });
            }
            getData();

            function processLazyLoad() {
                if (lazyLoaded)
                    return;
                var cb = function() {
                    lazyLoad($scope.themes, document);
                    if (document.getElementById("gsft_main"))
                        lazyLoad($scope.themes, document.getElementById("gsft_main").contentDocument);
                };
                (function() {
                    var lastTime = 0;
                    var vendors = ['webkit', 'moz'];
                    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                        window.cancelAnimationFrame =
                            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
                    }
                    if (!window.requestAnimationFrame)
                        window.requestAnimationFrame = function(callback) {
                            var currTime = new Date().getTime();
                            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                            var id = window.setTimeout(function() {
                                    callback(currTime + timeToCall);
                                },
                                timeToCall);
                            lastTime = currTime + timeToCall;
                            return id;
                        };
                    if (!window.cancelAnimationFrame)
                        window.cancelAnimationFrame = function(id) {
                            clearTimeout(id);
                        };
                }());
                var raf = requestAnimationFrame;
                if (raf) raf(cb);
                else document.getElementById("gsft_main").contentWindow.addEventListener('load', cb);
                lazyLoaded = true;
            }

            function lazyLoad(themes, frameContext) {
                var links = frameContext.getElementsByTagName("link");
                var styles = [];
                for (var i = 0; links.length > i; i++) {
                    if (links[i].getAttribute("type") == "text/css") {
                        styles.push(links[i]);
                    }
                }
                var styleFrame;
                if (!document.getElementById("styleFrame")) {
                    styleFrame = frameContext.createElement("iframe");
                    document.head.appendChild(styleFrame);
                    styleFrame.id = "styleFrame0";
                    lazyLoadStyles(themes, frameContext, styleFrame, styles);
                } else {
                    var highestStyle = 0;
                    var currentStyle = 0;
                    var allFrames = document.getElementsByTagName("iframe");
                    for (i = 0; i < allFrames.length; i++) {
                        if (allFrames[i].id.indexOf("styleFrame") > -1) {
                            currentStyle = allFrames[i].id.split("styleFrame")[0];
                            if (currentStyle.parseInt() > highestStyle)
                                highestStyle = currentStyle;
                        }
                    }
                    styleFrame = document.getElementById("styleFrame" + highestStyle);
                    styleFrame.setAttribute("style", "display:none");
                    lazyLoadStyles(themes, frameContext, styleFrame, styles);
                }
            }

            function lazyLoadStyles(themes, frameContext, styleFrame, styles) {
                var styleCount = 0;
                var frameCount = 1;
                var firstRun = true;
                for (var i = 0; styles.length > i; i++) {
                    var styleLink = styles[i].getAttribute("href");
                    styleLink = styleLink.split("&theme=");
                    for (var n = 0; themes.length > n; n++) {
                        if (!styleLink[1] || styleLink[1] != $scope.themes[n].id) {
                            if (firstRun && !styleFrame.contentDocument.body) {
                                var frameForm = styleFrame.contentDocument.createElement('html');
                                styleFrame.contentDocument.appendChild(frameForm);
                                var frameHead = styleFrame.contentDocument.createElement('body');
                                styleFrame.contentDocument.getElementsByTagName("html")[0].appendChild(frameHead);
                                firstRun = false;
                            }
                            insertStyles(styleFrame, styleLink, n);
                            styleCount++;
                            if (styleCount >= (31 * frameCount) && !document.getElementById("styleFrame" + frameCount)) {
                                styleFrame = frameContext.createElement("iframe");
                                document.head.appendChild(styleFrame);
                                styleFrame.id = "styleFrame" + frameCount;
                                styleFrame.setAttribute("style", "display:none");
                                frameCount++;
                                firstRun = true;
                            }
                        }
                    }
                }
            }

            function insertStyles(styleFrame, styleLink, count) {
                var linkElement = styleFrame.contentDocument.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.type = "text/css";
                linkElement.href = styleLink[0] + "&theme=" + $scope.themes[count].id;
                styleFrame.contentDocument.body.appendChild(linkElement);
            }
            snCustomEvent.observe('sn:set_theme', function(themeId) {
                processLazyLoad();
                setTimeout(function() {
                    $scope.updateTheme({
                        id: themeId
                    });
                }, 500);
            });
            $scope.updateTheme = function(theme) {
                userPreferences.setPreference('glide.css.theme.ui16', theme.id);
                $http.put("/api/now/ui/theme/preference", theme);
                if (theme.name)
                    document.getElementById(theme.name).children[2].checked = true;
                $scope.executionCount++;
                if ($scope.executionCount < 2) {
                    callStylePanes(theme);
                } else {
                    setTimeout(function() {
                        callStylePanes(theme);
                    }, 1000);
                }
                $scope.defaultTheme = theme.id;

                function callStylePanes(theme) {
                    setStyles(theme, "nav");
                    setStyles(theme, "content");
                    setStyles(theme, "collab");
                    setStyles(theme, "jsdebug");
                }

                function setStyles(theme, pane) {
                    var styles = [];
                    var frameContext = "";
                    var headTag = "";
                    if (pane == "nav") {
                        headTag = document.getElementsByTagName("head")[0];
                        if (!headTag)
                            return;
                        styles = headTag.getElementsByTagName("link");
                        frameContext = document;
                    } else if (pane == "content") {
                        if (!document.getElementById("gsft_main"))
                            return;
                        headTag = document.getElementById("gsft_main").contentDocument.getElementsByTagName("head")[0];
                        styles = headTag.getElementsByTagName("link");
                        frameContext = document.getElementById("gsft_main").contentDocument;
                    } else if (pane == "collab") {
                        if (document.getElementById("edge_east")) {
                            headTag = document.getElementById("edge_east").parentElement;
                            if (!headTag)
                                return;
                            styles = headTag.getElementsByTagName("link");
                            if (!styles)
                                return;
                            frameContext = document;
                        } else
                            return;
                    } else if (pane == "jsdebug") {
                        if (document.getElementById("javascript_debugger")) {
                            headTag = document.getElementById("javascript_debugger").contentDocument.getElementsByTagName("body")[0];
                            if (!headTag)
                                return;
                            styles = headTag.getElementsByTagName("link");
                            if (!styles)
                                return;
                            frameContext = document.getElementById("javascript_debugger").contentDocument;
                        } else
                            return;
                    }
                    applyStyles(styles, theme, frameContext);
                }

                function applyStyles(styles, theme, frameContext) {
                    var styleObject = [];
                    var styleList = [];
                    if (styles.length > 20)
                        removeOldStyles(frameContext);
                    for (var i = 0; styles.length > i; i++) {
                        var styleLink = styles[i].getAttribute("href");
                        var link = styles[i].getAttribute("href");
                        if (styles[i].getAttribute("type") == "text/css" && styles[i].getAttribute("class") != "old-template" &&
                            link != "/styles/spectrum.css" && link != "/styles/third-party/jquery_notification.css") {
                            styleObject.push(styles[i]);
                            styleLink = styleLink.split("&theme=");
                            styleLink = styleLink[0];
                            styleLink += "&theme=" + theme.id;
                            var newStyle = frameContext.createElement("link");
                            newStyle.setAttribute("type", "text/css");
                            newStyle.setAttribute("rel", "stylesheet");
                            newStyle.setAttribute("href", styleLink);
                            styleList.push(newStyle);
                            styles[i].setAttribute("class", "old-template");
                        }
                    }
                    for (i = 0; styleList.length > i; i++) {
                        styleObject[i].parentNode.appendChild(styleList[i]);
                    }
                    setTimeout(function() {
                        removeOldStyles(frameContext)
                    }, 2000);
                    $scope.executionCount--;
                }

                function removeOldStyles(frameContext) {
                    var oldTemplates = frameContext.getElementsByClassName("old-template");
                    var otLength = oldTemplates.length;
                    for (var i = 0; otLength > i; i++) {
                        oldTemplates[0].parentNode.removeChild(oldTemplates[0]);
                    }
                }
            }
        },
        link: function(scope, element) {
            scope.addTooltip = function(first) {
                if (first) {
                    $timeout(function() {
                        jQuery(element).find('a').tooltip({
                            placement: 'auto',
                            container: 'body'
                        })
                    });
                }
            };
        }
    }
});;