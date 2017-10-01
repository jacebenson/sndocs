/*! RESOURCE: /scripts/app.magellan/directive.magellanHistoryCompact.js */
angular.module('Magellan').directive('magellanHistoryCompact', ['getTemplateUrl', 'timeAgo', '$timeout', function(getTemplateUrl, timeAgo, $timeout) {
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('magellan_history_compact.xml'),
        scope: {
            historyList: '=',
            isLoading: '='
        },
        controller: function($scope) {
            var FIVE_MIN = 15 * 60 * 1000;
            var interval = 1;
            var now = new Date().getTime();
            var timestampLookup = {};
            var currentTimeAgo = "";
            $scope.titleCharacterLimit = 40;
            $scope.clearHourCount = function(index) {
                if (index === 0) {
                    interval = 1;
                    now = new Date().getTime();
                    timestampLookup = {};
                    currentTimeAgo = "";
                }
            };
            $scope.checkForHeader = function(createDate) {
                if (typeof timestampLookup[createDate] == 'undefined') {
                    var diff = now - createDate;
                    var comparitor = FIVE_MIN * interval;
                    if (diff > comparitor && timeAgo.toWords(diff) != currentTimeAgo) {
                        interval += 1;
                        currentTimeAgo = timeAgo.toWords(diff);
                        timestampLookup[createDate] = currentTimeAgo.charAt(0).toUpperCase() + currentTimeAgo.slice(1);
                        return true;
                    }
                    timestampLookup[createDate] = false;
                    return false;
                } else {
                    return timestampLookup[createDate];
                }
            };
            $scope.getHourCount = function(createDate) {
                return timestampLookup[createDate];
            };
        },
        link: function(scope, element) {
            scope.historyInit = function(index, last) {
                scope.clearHourCount(index);
                scope.addTooltip(last);
            };
            scope.addTooltip = function(last) {
                if (last) {
                    $timeout(function() {
                        jQuery(element).find('a').tooltip({
                            placement: 'right',
                            container: 'body'
                        });
                        jQuery(element).on('click', 'a', function(evt) {
                            jQuery(this).tooltip('hide');
                        })
                    })
                }
            };
        }
    };
}]);;