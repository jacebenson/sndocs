/*! RESOURCE: /scripts/app.$sp/service.spUtil.js */
angular.module('sn.$sp').factory('spUtil', function($rootScope, $http, $location, snRecordWatcher, $q, spPreference, spConf, $window) {
    "use strict";
    var spUtil = {
        isMobile: function() {
            if (navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/webOS/i) ||
                navigator.userAgent.match(/iPhone/i) ||
                navigator.userAgent.match(/iPad/i) ||
                navigator.userAgent.match(/iPod/i) ||
                navigator.userAgent.match(/BlackBerry/i) ||
                navigator.userAgent.match(/Windows Phone/i)) {
                return true;
            } else {
                return false;
            }
        },
        format: function(tpl, data) {
            var re = /{([^}]+)?}/g,
                match;
            while (match = new RegExp(re).exec(tpl)) {
                tpl = tpl.replace(match[0], data[match[1]]);
            }
            return tpl;
        },
        update: function($scope) {
            var s = $scope;
            return this.get(s, s.data).then(function(response) {
                if (!response)
                    return {};
                angular.extend(s.data, response.data);
                return response.data;
            })
        },
        refresh: function($scope) {
            var s = $scope;
            return this.get(s, null).then(function(response) {
                angular.extend(s.options, response.options);
                angular.extend(s.data, response.data);
                return response;
            })
        },
        get: function($scope, data) {
            var qs = $location.search();
            return $http({
                method: 'POST',
                url: this.getWidgetURL($scope),
                params: qs,
                headers: this.getHeaders(),
                data: data
            }).then(function(response) {
                var r = response.data.result;
                if (r && r._server_time) {
                    var w = $scope.widget;
                    if (w)
                        w._server_time = r._server_time;
                }
                if (r && r.$$uiNotification) {
                    if ($scope.$emit)
                        $scope.$emit("$$uiNotification", r.$$uiNotification);
                    else
                        $rootScope.$broadcast("$$uiNotification", r.$$uiNotification);
                }
                return r;
            });
        },
        getHeaders: function() {
            return {
                'Accept': 'application/json',
                'x-portal': $rootScope.portal_id
            };
        },
        getWidgetURL: function(arg) {
            if (typeof arg == 'string')
                return "/api/now/sp/widget/" + arg;
            else if (arg.widget && arg.widget.rectangle_id)
                return "/api/now/sp/rectangle/" + arg.widget.rectangle_id;
            else
                return "/api/now/sp/widget/" + arg.widget.sys_id;
        },
        setBreadCrumb: function($scope, list) {
            $scope.$emit('sp.update.breadcrumbs', list);
        },
        setSearchPage: function(searchPage) {
            $rootScope.$emit("update.searchpage", searchPage);
        },
        addTrivialMessage: function(message) {
            $rootScope.$broadcast("$$uiNotification", {
                type: "trivial",
                message: message
            });
        },
        addInfoMessage: function(message) {
            $rootScope.$broadcast("$$uiNotification", {
                type: "info",
                message: message
            });
        },
        addErrorMessage: function(message) {
            $rootScope.$broadcast("$$uiNotification", {
                type: "error",
                message: message
            });
        },
        getURL: function(type) {
            var n;
            if (type !== null && typeof type === 'object') {
                n = $.param(type);
            } else {
                n = $.param({
                    sysparm_type: spConf.sysParamType,
                    sysparm_ck: $window.g_ck,
                    type: type
                });
            }
            return spConf.angularProcessor + '?' + n;
        },
        getHost: function() {
            var host = $location.protocol() + '://' + $location.host();
            if ($location.port()) {
                host += ':' + $location.port();
            }
            return host;
        },
        scrollTo: function(id, time) {
            $rootScope.$broadcast('$sp.scroll', {
                selector: id,
                time: time || 1000,
                offset: 'header'
            });
        },
        getAccelerator: function(char) {
            if (!$window.ontouchstart) {
                if ($window.navigator.userAgent.indexOf("Mac OS X") > -1) {
                    return '⌘ + ' + char;
                } else {
                    return 'Ctrl + ' + char;
                }
            }
            return '';
        },
        recordWatch: function($scope, table, filter, callback) {
            var watcherChannel = snRecordWatcher.initChannel(table, filter || 'sys_id!=-1');
            var subscribe = callback || function() {
                $scope.server.update()
            };
            watcherChannel.subscribe(subscribe);
            $scope.$on('$destroy', function() {
                watcherChannel.unsubscribe();
            });
        },
        createUid: function(str) {
            return str.replace(/[xy]/g, function(c) {
                var r, v;
                r = Math.random() * 16 | 0;
                v = c === 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
        },
        setPreference: function(pref, value) {
            spPreference.set(pref, value);
        },
        getPreference: function(pref, callback) {
            spPreference.get(pref, callback);
        },
        parseAttributes: function(strAttributes) {
            if (typeof strAttributes === 'object')
                return strAttributes;
            var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
            var attributeObj = {};
            for (var i = 0; i < attributeArray.length; i++) {
                if (attributeArray[i].length > 0) {
                    var attribute = attributeArray[i].split('=');
                    attributeObj[attribute[0].trim()] = attribute.length > 1 ? attribute[1].trim() : '';
                }
            }
            return attributeObj;
        }
    };
    return spUtil;
});