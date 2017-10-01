/*! RESOURCE: /scripts/concourse/directive.domainPicker.js */
angular.module('sn.concourse').directive('domainPicker', [
    'getTemplateUrl',
    'domainService',
    '$rootScope',
    'userPreferences',
    'snCustomEvent',
    function(getTemplateUrl, domainService, $rootScope, userPreferences, snCustomEvent) {
        "use strict";
        return {
            templateUrl: getTemplateUrl('concourse_domain_picker.xml'),
            restrict: 'E',
            replace: false,
            scope: {
                current: '=',
                inHeader: '=',
                showInHeader: '='
            },
            controller: function($scope) {
                $scope.domains = domainService.domainData;
                if ($scope.current)
                    domainService.initialize($scope.current, $scope.showInHeader);
                $scope.domainList = $scope.domains.list;
                $scope.getDomains = function() {
                    domainService.getDomainList();
                };
                $scope.updateDomain = function() {
                    domainService.setDomain();
                };
                $rootScope.$on('concourse.domain.refresh', function() {
                    $scope.refreshMainFrame();
                });
            },
            link: function(scope, element) {
                element.on('mouseover', function() {
                    if (!domainService.hasFetchedData()) {
                        domainService.getDomainList();
                    }
                });
                scope.refreshMainFrame = function() {
                    var iframe = jQuery('iframe#gsft_main');
                    if (iframe.length) {
                        iframe[0].contentWindow.location.reload();
                    }
                    snCustomEvent.fireTop('navigator.refresh');
                };
                element.on('change', 'input[type=checkbox]', function() {
                    var showInHeader = angular.element(this).prop('checked');
                    domainService.domainData.showInHeader = showInHeader;
                    scope.showInHeader = showInHeader;
                    if (showInHeader) {
                        userPreferences.setPreference('glide.ui.domain_picker.in_header', 'true');
                    } else {
                        userPreferences.setPreference('glide.ui.domain_picker.in_header', '');
                    }
                });
            }
        }
    }
]).factory('domainService', ['$http', 'snCustomEvent', '$rootScope', '$timeout', function($http, snCustomEvent, $rootScope, $timeout) {
    var fetchedInitialData = false;
    var initialized = false;
    var domainData = {
        list: [],
        current: {},
        currentValue: "",
        showInHeader: false
    };
    var hasFetchedData = function() {
        return fetchedInitialData;
    };
    var initialize = function(current, showInHeader) {
        if (initialized)
            return;
        initialized = true;
        domainData.list = [current];
        domainData.current = current;
        domainData.currentValue = current.value;
        domainData.showInHeader = showInHeader;
    };
    var getDomainList = function() {
        fetchedInitialData = true;
        return $http.get('/api/now/ui/concoursepicker/domain?cache=' + new Date().getTime()).then(function(response) {
            if (response && response.data && response.data.result) {
                if (response.data.result.list) {
                    domainData.list = response.data.result.list;
                    if (response.data.result.current) {
                        var list = domainData.list;
                        var curr = response.data.result.current.value;
                        for (var i = 0; i < list.length; i++) {
                            if (curr == list[i].value) {
                                domainData.current = list[i];
                                domainData.currentValue = list[i].value;
                            }
                        }
                    }
                }
            }
        });
    };
    var setDomain = function() {
        setCurrent(domainData.currentValue);
        $http.put('/api/now/ui/concoursepicker/domain', domainData.current).then(function(response) {
            if (response && response.data && response.data.result && response.data.result.current) {
                triggerMainFrameRefresh();
            }
        });
    };

    function triggerMainFrameRefresh() {
        $rootScope.$broadcast('concourse.domain.refresh', {});
        snCustomEvent.fireTop('navigator.refresh');
    }

    function setCurrent(value) {
        var list = domainData.list;
        for (var i = 0; i < list.length; i++) {
            if (value == list[i].value) {
                domainData.current = list[i];
                return;
            }
        }
    }

    function setDomainFromName(domainName) {
        if (!fetchedInitialData) {
            getDomainList().then(function() {
                $timeout(setDomainFromName(domainName));
            });
        }
        for (var i = 0; i < domainData.list.length; i++) {
            if (domainData.list[i].label == domainName) {
                domainData.current = domainData.list[i];
                domainData.currentValue = domainData.list[i].value;
            }
        }
    }
    snCustomEvent.observe('glide:ui_notification.session_change', function(data) {
        if (typeof data.xml.dataset !== 'undefined' &&
            data.xml.dataset.attrSession_domain !== 'undefined' &&
            domainData.currentValue !== data.xml.dataset.attrSession_domain) {
            domainData.currentValue = data.xml.dataset.attrSession_domain;
            setCurrent(domainData.currentValue);
        }
    });
    snCustomEvent.observe('record.domain', function(domain) {
        if (typeof domain === 'string' && domain.length && domainData.currentValue !== domain) {
            setDomainFromName(domain);
        }
    });
    return {
        initialize: initialize,
        setDomain: setDomain,
        getDomainList: getDomainList,
        hasFetchedData: hasFetchedData,
        domainData: domainData
    }
}]);;