/*! RESOURCE: /scripts/sn/common/presence/directive.snPresence.js */
angular.module('sn.common.presence').directive('snPresence', function(snPresence, $rootScope, $timeout, i18n) {
    'use strict';
    $timeout(snPresence.init, 100);
    var presenceStatus = {};
    i18n.getMessages(['maybe offline', 'probably offline', 'offline', 'online', 'entered', 'viewing'], function(results) {
        presenceStatus.maybe_offline = results['maybe offline'];
        presenceStatus.probably_offline = results['probably offline'];
        presenceStatus.offline = results['offline'];
        presenceStatus.online = results['online'];
        presenceStatus.entered = results['entered'];
        presenceStatus.viewing = results['viewing'];
    });
    var presences = {};
    $rootScope.$on('sn.presence', function(event, presenceArray) {
        if (!presenceArray) {
            angular.forEach(presences, function(p) {
                p.status = "offline";
            });
            return;
        }
        presenceArray.forEach(function(presence) {
            presences[presence.user] = presence;
        });
    });
    return {
        restrict: 'EA',
        replace: false,
        scope: {
            userId: '@?',
            snPresence: '=?',
            user: '=?',
            profile: '=?',
            displayName: '=?'
        },
        link: function(scope, element) {
            if (scope.profile) {
                scope.user = scope.profile.userID;
                scope.profile.tabIndex = -1;
                if (scope.profile.isAccessible)
                    scope.profile.tabIndex = 0;
            }
            if (!element.hasClass('presence'))
                element.addClass('presence');

            function updatePresence() {
                var id = scope.snPresence || scope.user;
                if (!angular.isDefined(id) && angular.isDefined(scope.userId)) {
                    id = scope.userId;
                }
                if (presences[id]) {
                    var status = presences[id].status;
                    if (status === 'maybe offline' || status === 'probably offline') {
                        element.removeClass('presence-online presence-offline presence-away');
                        element.addClass('presence-away');
                    } else if (status == "offline" && !element.hasClass('presence-offline')) {
                        element.removeClass('presence-online presence-away');
                        element.addClass('presence-offline');
                    } else if ((status == "online" || status == "entered" || status == "viewing") && !element.hasClass('presence-online')) {
                        element.removeClass('presence-offline presence-away');
                        element.addClass('presence-online');
                    }
                    status = status.replace(/ /g, "_");
                    if (scope.profile)
                        angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.profile.userName + ' ' + presenceStatus[status]);
                    else
                        angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.displayName + ' ' + presenceStatus[status]);
                } else {
                    if (!element.hasClass('presence-offline'))
                        element.addClass('presence-offline');
                }
            }
            var unbind = $rootScope.$on('sn.presence', updatePresence);
            scope.$on('$destroy', unbind);
            updatePresence();
        }
    };
});;