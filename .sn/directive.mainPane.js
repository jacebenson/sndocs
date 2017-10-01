/*! RESOURCE: /scripts/concourse/directive.mainPane.js */
angular.module('sn.concourse').directive('mainPane', function(snCustomEvent, $log) {
    "use strict";
    return {
        restrict: 'A',
        link: function($scope, $element) {
            var permalinkBlacklist = new RegExp('login_redirect.do|about:blank|sysparm_nostack=|/welcome.do|/blank.do|/login.do');

            function isBlacklisted(uri) {
                return permalinkBlacklist.test(uri);
            }

            function setPermalink(win) {
                if (win && win.location && !isBlacklisted(win.location.href)) {
                    var pageUrl = win.location.href.substr(win.location.href.indexOf(win.location.pathname));
                    snCustomEvent.fire('magellanNavigator.permalink.set', {
                        title: win.document.title,
                        relativePath: pageUrl
                    });
                    overloadTitle(win);
                }
            }

            function overloadTitle(win) {
                win.document.origTitle = win.document.title;
                $element[0].title = win.document.title;
                try {
                    Object.defineProperty(win.document, "title", {
                        set: function(title) {
                            this.origTitle = title;
                            snCustomEvent.fire('magellanNavigator.permalink.set', {
                                title: title
                            });
                        },
                        get: function() {
                            if (typeof this.origTitle == 'undefined')
                                return '';
                            return this.origTitle;
                        },
                        configurable: true
                    });
                } catch (e) {
                    $log.error(e);
                }
            }
            $element.load(function() {
                var win = this.contentWindow;
                setPermalink(win);
            });
            var iframeWindow = $element.get(0).contentWindow;
            if (iframeWindow)
                setPermalink(iframeWindow);
            snCustomEvent.observe('glide:nav_open_url', function(options) {
                if (options && options.url) {
                    $element.attr('src', options.url);
                }
            });
        }
    }
});