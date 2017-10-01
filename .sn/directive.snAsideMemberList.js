/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideMemberList.js */
angular.module('sn.connect.resource').directive('snAsideMemberList', function(
    getTemplateUrl, $timeout, activeConversation) {
    'use strict';
    return {
        replace: true,
        restrict: 'E',
        templateUrl: getTemplateUrl('snAsideMemberList.xml'),
        link: function(scope, element) {
            scope.$on("sn.aside.open", function() {
                $timeout(function() {
                    if (element.is(":visible"))
                        scope.$emit("sn.aside.controls.active", "members");
                }, 0, false);
            });
            scope.changeMode = function(evt, mode) {
                if (!scope.conversation.amMember || evt.keyCode === 9)
                    return;
                scope.mode = mode;
                if (mode == 'add') {
                    $timeout(function() {
                        element.find('.form-control-search.tt-input').focus();
                    }, 200);
                }
            };
        },
        controller: function($scope, conversations, liveProfileID, supportAddMembers) {
            $scope.mode = 'view';
            $scope.$emit("sn.aside.controls.active", "members");
            $scope.viewProfile = function(evt, member) {
                if (evt.keyCode === 9)
                    return;
                $scope.$emit("sn.aside.open", {
                    templateUrl: getTemplateUrl("snAsideMemberList_profile.xml"),
                    isChild: true,
                    scope: {
                        profile: member,
                        showDirectMessage: !$scope.conversation.isDirectMessage && !$scope.conversation.isHelpDesk
                    }
                });
            };
            $scope.isAddUserButtonVisible = function() {
                if ($scope.mode !== 'view')
                    return false;
                return isButtonVisible(function() {
                    return true;
                });
            };
            $scope.isLeaveButtonVisible = function() {
                var queueEntryCheckFn = function(queueEntry) {
                    return !queueEntry.isAssignedToMe;
                };
                return isButtonVisible(queueEntryCheckFn);
            };
            $scope.isRemoveUserButtonVisible = function(userID) {
                var queueEntryCheckFn = function(queueEntry) {
                    return queueEntry.openedBy !== userID &&
                        queueEntry.assignedTo !== userID;
                };
                return isButtonVisible(queueEntryCheckFn);
            };

            function isButtonVisible(queueEntryCheckFn) {
                var conversation = $scope.conversation;
                if (!conversation.isHelpDesk)
                    return conversation.isGroup;
                var queueEntry = conversation.queueEntry;
                return supportAddMembers &&
                    queueEntryCheckFn(queueEntry) &&
                    queueEntry.isActive;
            }
            $scope.user = false;
            $scope.findUser = function() {
                for (var i = 0; i < $scope.conversation.members.length; i++) {
                    if ($scope.conversation.members[i].sysID === liveProfileID) {
                        $scope.user = $scope.conversation.members[i];
                        return;
                    }
                }
                $scope.user = false;
            };
            $scope.findUser();
            $scope.$watch('conversation.sysID', function() {
                $scope.findUser();
            });
            $scope.addMember = function(memberID) {
                conversations.addUser($scope.conversation.sysID, memberID);
                $scope.mode = 'view';
                if (!$scope.user)
                    $scope.findUser();
            };
            $scope.showRemoveMember = function() {
                return $scope.conversation.amMember && $scope.conversation.isGroup;
            };
            $scope.removeMember = function($event, memberID) {
                if ($event && $event.keyCode === 9)
                    return;
                $event.stopPropagation();
                conversations.removeUser($scope.conversation.sysID, memberID);
                if (memberID === liveProfileID) {
                    activeConversation.clear($scope.conversation);
                    $scope.user = null;
                }
            };
            $scope.showAddMembers = function() {
                return !$scope.conversation.isHelpDesk && $scope.conversation.isGroup && $scope.mode == 'view'
            };
            $scope.showUser = function() {
                return user && $scope.memberFilterText && user.name.indexOf($scope.memberFilterText) > -1;
            }
        }
    }
});;