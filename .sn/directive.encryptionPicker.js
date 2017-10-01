/*! RESOURCE: /scripts/concourse/directive.encryptionPicker.js */
angular.module('sn.concourse').directive('encryptionPicker', [
    'snCustomEvent',
    'getTemplateUrl',
    'encryptionService',
    '$rootScope',
    'userPreferences',
    function(snCustomEvent, getTemplateUrl, encryptionService, $rootScope, userPreferences) {
        "use strict"
        return {
            templateUrl: getTemplateUrl('concourse_encryption_picker.xml'),
            restrict: 'E',
            replace: false,
            scope: {
                current: '=',
                inHeader: '=',
                showInHeader: '='
            },
            controller: function($scope) {
                $scope.encryptions = encryptionService.encryptionData;
                if ($scope.current)
                    encryptionService.initialize($scope.current, $scope.showInHeader);
                $scope.getEncryptions = function() {
                    encryptionService.getEncryptionList();
                };
                $scope.updateEncryption = function() {
                    encryptionService.setEncryption();
                };
            },
            link: function(scope, element) {
                element.on('mouseover', function() {
                    if (!encryptionService.hasFetchedData()) {
                        encryptionService.getEncryptionList();
                    }
                });
                element.on('change', 'input[type=checkbox]', function() {
                    var showInHeader = angular.element(this).prop('checked');
                    encryptionService.encryptionData.showInHeader = showInHeader;
                    scope.showInHeader = showInHeader;
                    if (showInHeader) {
                        userPreferences.setPreference('glide.ui.encryption_picker.in_header', 'true');
                    } else {
                        userPreferences.setPreference('glide.ui.encryption_picker.in_header', '');
                    }
                });
            }
        }
    }
]).factory('encryptionService', ['$http', 'snCustomEvent', '$rootScope', function($http, snCustomEvent, $rootScope) {
    var fetchedInitialData = false;
    var initialized = false;
    var encryptionData = {
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
        encryptionData.list = [current];
        encryptionData.current = current;
        encryptionData.currentValue = current.value;
        encryptionData.showInHeader = showInHeader;
    };
    var getEncryptionList = function() {
        fetchedInitialData = true;
        $http.get('/api/now/ui/concoursepicker/encryption?cache=' + new Date().getTime()).then(function(response) {
            if (response && response.data && response.data.result) {
                if (response.data.result.list) {
                    encryptionData.list = response.data.result.list;
                    if (response.data.result.current) {
                        var list = encryptionData.list;
                        var curr = response.data.result.current.value;
                        for (var i = 0; i < list.length; i++) {
                            if (curr == list[i].value) {
                                encryptionData.current = list[i];
                                encryptionData.currentValue = list[i].value;
                            }
                        }
                    }
                }
            }
        });
    };
    var setEncryption = function() {
        setCurrent(encryptionData.currentValue);
        $http.put('/api/now/ui/concoursepicker/encryption', {
            id: encryptionData.current.value
        }).then(function(response) {});
    };

    function setCurrent(id) {
        var list = encryptionData.list;
        for (var i = 0; i < list.length; i++) {
            if (id == list[i].value) {
                encryptionData.current = list[i];
                return;
            }
        }
    };
    return {
        initialize: initialize,
        setEncryption: setEncryption,
        getEncryptionList: getEncryptionList,
        hasFetchedData: hasFetchedData,
        encryptionData: encryptionData
    }
}]);;