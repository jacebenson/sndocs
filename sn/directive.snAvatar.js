/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatar.js */
angular.module('sn.common.avatar')
    .run(function($http, $templateCache, getTemplateUrl) {
        function uppercaseFirst(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        var templateTypes = {
            'singleBinding': null,
            'default': null
        };
        var templateUrl = getTemplateUrl('sn_avatar.xml');

        function getTemplate(_templateType) {
            var templateType = _templateType || 'default';
            if (templateTypes[templateType])
                return $q.when(templateTypes[templateType]);
            return $http.get(templateUrl, {
                    cache: $templateCache
                })
                .then(function(response) {
                    var replacement = templateType === 'singleBinding' ? '::' : '';
                    return templateTypes[templateType] = response.data.replace(/REPLACE_ME/g, replacement)
                });
        }
        Object.keys(templateTypes).forEach(function(_type) {
            getTemplate(_type).then(function(template) {
                $templateCache.put('snAvatar' + uppercaseFirst(_type.replace('default', '')) + '.tpl', template);
            });
        });
    })
    .factory('snAvatarFactory', function($http, $compile, $templateCache, $q, getTemplateUrl, snCustomEvent, snConnectService) {
        'use strict';
        return function() {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    members: '=',
                    primary: '=',
                    showPresence: '=?',
                    enableContextMenu: '=?',
                    enableTooltip: '=?',
                    enableBindOnce: '@',
                    displayMemberCount: "=?",
                    groupAvatar: "@"
                },
                compile: function(tElement) {
                    var template = tElement.html();
                    return function(scope, element, attrs, controller, transcludeFn) {
                        var newElement = $compile(template, transcludeFn)(scope);
                        element.html(newElement);
                        if (scope.enableTooltip) {
                            element.tooltip({
                                placement: 'auto top',
                                container: 'body'
                            }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
                            if (element.hideFix)
                                element.hideFix();
                        }
                        if (attrs.enableBindOnce === 'false') {
                            scope.$watch('primary', recompile);
                            scope.$watch('members', recompile);
                        }
                        if (scope.enableTooltip) {
                            var usersWatch = scope.$watch('users', function() {
                                if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
                                    element.tooltip({
                                        placement: 'auto top',
                                        container: 'body'
                                    }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
                                    if (element.hideFix)
                                        element.hideFix();
                                    usersWatch();
                                }
                            });
                        }
                        if (scope.enableContextMenu !== false) {
                            scope.contextOptions = [];
                            var gUser = null;
                            try {
                                gUser = g_user;
                            } catch (err) {}
                            if (scope.users && scope.users.length === 1 && scope.users[0] && (scope.users[0].userID || scope.users[0].sys_id)) {
                                scope.contextOptions = [
                                    ["Open user's profile", function() {
                                        if (scope.users && scope.users.length > 0) {
                                            window.open('/nav_to.do?uri=' + encodeURIComponent('sys_user.do?sys_id=' + scope.users[0].userID), '_blank');
                                        }
                                    }]
                                ];
                                if ((gUser && scope.users[0].userID && scope.users[0].userID !== gUser.userID) ||
                                    (scope.liveProfileID && scope.users[0] && scope.users[0].sysID !== scope.liveProfileID)) {
                                    scope.contextOptions.push(["Open a new chat", function() {
                                        snConnectService.openWithProfile(scope.users[0]);
                                    }]);
                                }
                            }
                        } else {
                            scope.contextOptions = [];
                        }
                    };
                },
                controller: function($scope, liveProfileID) {
                    var firstBuildAvatar = true;
                    $scope.displayMemberCount = $scope.displayMemberCount || false;
                    $scope.liveProfileID = liveProfileID;
                    $scope.$watch('primary', function(newValue, oldValue) {
                        if ($scope.primary && newValue !== oldValue) {
                            if (!firstBuildAvatar)
                                buildAvatar();
                            if ($scope.contextOptions.length > 0) {
                                $scope.contextOptions = [
                                    ["Open user's profile", function() {
                                        if ($scope.users && $scope.users.length > 0) {
                                            window.location.href = 'sys_user.do?sys_id=' + $scope.users[0].userID || $scope.users[0].userID;
                                        }
                                    }]
                                ];
                                var gUser = null;
                                try {
                                    gUser = g_user;
                                } catch (err) {}
                                if ((!gUser && !liveProfileID) || ($scope.users && $scope.users.length === 1 && $scope.users[0])) {
                                    if ((gUser && $scope.users[0].userID && $scope.users[0].userID !== gUser.userID) ||
                                        ($scope.liveProfileID && $scope.users[0] && $scope.users[0].sysID !== $scope.liveProfileID)) {
                                        $scope.contextOptions.push(["Open a new chat", function() {
                                            snConnectService.openWithProfile($scope.users[0]);
                                        }]);
                                    }
                                }
                            }
                        }
                    });
                    $scope.$watch('members', function() {
                        if ($scope.members && !firstBuildAvatar)
                            buildAvatar();
                    });
                    $scope.avatarType = function() {
                        var result = [];
                        if ($scope.groupAvatar || !$scope.users)
                            return result;
                        if ($scope.users.length > 1)
                            result.push("group");
                        if ($scope.users.length === 2)
                            result.push("avatar-duo");
                        if ($scope.users.length === 3)
                            result.push("avatar-trio");
                        if ($scope.users.length >= 4)
                            result.push("avatar-quad");
                        return result;
                    };
                    $scope.getBackgroundStyle = function(user) {
                        var avatar = (user ? user.avatar : '');
                        if ($scope.groupAvatar)
                            avatar = $scope.groupAvatar;
                        if (avatar && avatar !== '')
                            return {
                                'background-image': 'url(' + avatar + ')'
                            };
                        if (user && user.name)
                            return '';
                        return void(0);
                    };
                    $scope.maxStringWidth = function() {
                        var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
                        return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
                    };

                    function buildInitials(name) {
                        if (!name)
                            return "--";
                        var initials = name.split(" ").map(function(word) {
                            return word.toUpperCase();
                        }).filter(function(word) {
                            return word.match(/^[A-ZÀ-Ÿ]/);
                        }).map(function(word) {
                            return word.substring(0, 1);
                        }).join("");
                        return (initials.length > 3) ?
                            initials.substr(0, 3) :
                            initials;
                    }
                    $scope.avatartooltip = function() {
                        if (!$scope.enableTooltip) {
                            return '';
                        }
                        if (!$scope.users) {
                            return '';
                        }
                        var names = [];
                        $scope.users.forEach(function(user) {
                            if (!user) {
                                return;
                            }
                            names.push(user.name);
                        });
                        return names.join(', ');
                    };

                    function setPresence() {
                        $scope.presenceEnabled = $scope.showPresence && !$scope.isDocument && $scope.users.length === 1;
                        return $scope.presenceEnabled;
                    }

                    function buildAvatar() {
                        if (firstBuildAvatar)
                            firstBuildAvatar = false;
                        if (typeof $scope.primary === 'string') {
                            return $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
                                $scope.users = [{
                                    userID: $scope.primary,
                                    name: response.data.result.name,
                                    initials: buildInitials(response.data.result.name),
                                    avatar: response.data.result.avatar
                                }];
                                return setPresence();
                            });
                        }
                        if ($scope.primary) {
                            if ($scope.primary.userImage)
                                $scope.primary.avatar = $scope.primary.userImage;
                            if (!$scope.primary.userID && $scope.primary.sys_id)
                                $scope.primary.userID = $scope.primary.sys_id;
                        }
                        $scope.isDocument = $scope.primary && $scope.primary.table && $scope.primary.table !== "sys_user" && $scope.primary.table !== "chat_queue_entry";
                        $scope.users = [$scope.primary];
                        if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
                            $scope.users = [$scope.primary];
                        } else if ($scope.members && $scope.members.length > 0) {
                            $scope.users = buildCompositeAvatar($scope.members);
                        }
                        return $q.when(setPresence());
                    }

                    function buildCompositeAvatar(members) {
                        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
                        var users = angular.isArray(members) ? members.slice() : [members];
                        users = users.sort(function(a, b) {
                            var aID = a.userID || a.document;
                            var bID = b.userID || b.document;
                            if (a.table === "chat_queue_entry")
                                return 1;
                            if (aID === currentUser)
                                return 1;
                            else if (bID === currentUser)
                                return -1;
                            return 0;
                        });
                        if (users.length === 2)
                            users = [users[0]];
                        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
                            var index = -1;
                            angular.forEach(users, function(user, i) {
                                if (user.sys_id === $scope.primary.sys_id) {
                                    index = i;
                                }
                            });
                            if (index > -1) {
                                users.splice(index, 1);
                            }
                            users.splice(1, 0, $scope.primary);
                        }
                        return users;
                    }
                    buildAvatar();
                }
            }
        }
    })
    .directive('snAvatar', function(snAvatarFactory) {
        var directive = snAvatarFactory();
        directive.templateUrl = 'snAvatar.tpl';
        return directive;
    })
    .directive('snAvatarOnce', function(snAvatarFactory) {
        var directive = snAvatarFactory();
        directive.templateUrl = 'snAvatarSingleBinding.tpl';
        return directive;
    });;