/*! RESOURCE: /scripts/concourse/directive.applicationPicker.js */
angular.module('sn.concourse').directive('applicationPicker', [
    'snCustomEvent',
    'getTemplateUrl',
    '$rootScope',
    'userPreferences',
    'applicationService',
    function(snCustomEvent, getTemplateUrl, $rootScope, userPreferences, applicationService) {
        "use strict"
        return {
            restrict: 'E',
            replace: false,
            templateUrl: getTemplateUrl('concourse_application_picker.xml'),
            scope: {
                current: '=',
                inHeader: '=',
                showInHeader: '='
            },
            controller: function($scope) {
                $scope.closeModal = function() {
                    angular.element('#settings_modal').modal('hide');
                };
                $scope.app = applicationService.applicationData;
                if ($scope.current) {
                    applicationService.initialize($scope.current, $scope.showInHeader);
                }
                $scope.refreshApplicationPicker = function() {
                    applicationService.getApplicationList();
                };
                $scope.updateCurrent = function() {
                    applicationService.updateCurrent();
                };
                snCustomEvent.observe('glide:ui_notification.application_change', function() {
                    applicationService.getApplicationList();
                });
                snCustomEvent.observe('sn:refresh_application_picker', function() {
                    applicationService.getApplicationList();
                });
                snCustomEvent.observe('sn:change_application', function(appId) {
                    applicationService.getApplicationList().then(function() {
                        applicationService.applicationData.currentId = appId;
                        $scope.updateCurrent();
                    });
                });
            },
            link: function(scope, element) {
                element.tooltip({
                    selector: '[data-toggle="tooltip"]',
                    title: function() {
                        var $this = angular.element(this);
                        return $this.attr('title') || $this.text();
                    }
                });
                element.on('mouseover', function() {
                    if (!applicationService.hasFetchedData()) {
                        applicationService.getApplicationList();
                    }
                });
                element.on('change', 'input[type=checkbox]', function() {
                    var showInHeader = angular.element(this).prop('checked');
                    applicationService.applicationData.showInHeader = showInHeader;
                    scope.showInHeader = showInHeader;
                    if (showInHeader) {
                        userPreferences.setPreference('glide.ui.application_picker.in_header', 'true');
                    } else {
                        userPreferences.setPreference('glide.ui.application_picker.in_header', '');
                    }
                });
                $rootScope.$on('concourse.application.refresh', function() {
                    var iframe = jQuery('iframe#gsft_main');
                    if (iframe.length) {
                        iframe[0].contentWindow.location.reload();
                    }
                });
            }
        }
    }
]).factory('applicationService', ['$http', 'snCustomEvent', '$rootScope', function($http, snCustomEvent, $rootScope) {
    var fetchedInitialData = false;
    var initialized = false;
    var applicationData = {
        list: [],
        current: {},
        currentId: '',
        showInHeader: false
    };
    var hasFetchedData = function() {
        return fetchedInitialData;
    };
    var initialize = function(current, showInHeader) {
        if (initialized)
            return;
        initialized = true;
        applicationData.list = [current];
        applicationData.current = current;
        applicationData.currentId = current.sysId;
        applicationData.showInHeader = showInHeader;
    };
    var getApplicationList = function() {
        fetchedInitialData = true;
        return $http.get('/api/now/ui/concoursepicker/application?cache=' + new Date().getTime()).then(function(response) {
            if (response && response.data && response.data.result) {
                applicationData.list = response.data.result.list;
                if (response.data.result.current && response.data.result.current != applicationData.currentId) {
                    var apps = response.data.result.list;
                    var curr = response.data.result.current;
                    for (var i = 0; i < apps.length; i++) {
                        if (curr == apps[i].sysId) {
                            applicationData.current = apps[i]
                            applicationData.currentId = apps[i].sysId;
                            break;
                        }
                    }
                    triggerChangeEvent();
                }
            }
        });
    };
    var updateCurrent = function() {
        var apps = applicationData.list;
        var curr = applicationData.currentId;
        for (var i = 0; i < apps.length; i++) {
            if (curr == apps[i].sysId) {
                applicationData.current = apps[i];
                break;
            }
        }
        $http.put('/api/now/ui/concoursepicker/application', {
            app_id: applicationData.currentId
        }).then(function(response) {
            if (response && response.data && response.data.result && response.data.result.app_id) {
                triggerRefreshFrameEvent();
                triggerChangeEvent();
            }
        });
    };

    function triggerChangeEvent() {
        $rootScope.$broadcast('concourse.application.changed', applicationData.current);
    }

    function triggerRefreshFrameEvent() {
        $rootScope.$broadcast('concourse.application.refresh', {});
    }
    $rootScope.$on('concourse.application.changed', function(evt, current) {
        applicationData.current = current;
        applicationData.currentId = current.sysId;
    });
    return {
        hasFetchedData: hasFetchedData,
        getApplicationList: getApplicationList,
        updateCurrent: updateCurrent,
        applicationData: applicationData,
        initialize: initialize
    }
}]);;