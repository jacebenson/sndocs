/*! RESOURCE: /scripts/app.ng_chat/controller.chat.js */
angular.module('sn.connect').controller('chat', function(
    $scope, $rootScope, $location, $window, $q, $element, $timeout, conversations, userPreferences, profiles, queues,
    liveProfileID, snTabActivity, snPresence, snConversationAsideHistory, activeConversation, snNotification,
    screenWidth, messageNotifier, snCustomEvent, audioNotifier, connectDropTargetService) {
    'use strict';
    $scope.dropTargetService = connectDropTargetService;
    snTabActivity.setAppName("sn.connect");
    messageNotifier.registerMessageServiceWatch(shouldSendNotification);
    audioNotifier.registerMessageServiceWatch(activeConversation, shouldSendNotification);

    function shouldSendNotification(message) {
        if (snTabActivity.isVisible && activeConversation.sysID !== message.conversationID) {
            return true;
        }
        return !snTabActivity.isVisible;
    }
    $scope.activeConversation = activeConversation;
    $scope.isTopWindow = true;
    $scope.hasQueues = queues.hasQueues;
    $timeout(function() {
        conversations.loaded.then(function() {
            $element.removeClass("loading");
        })
    }, 1000, false);
    try {
        $scope.isTopWindow = window.top == window.self;
        if (!$scope.isTopWindow) {
            $timeout(function() {
                window.top.location = "/$c.do"
            }, 3000)
        }
    } catch (IGNORED) {
        $scope.isTopWindow = false;
    }
    $scope.redirectFrame = function() {
        window.location = "/home.do";
    };
    $rootScope.$on('http-error.retry', function() {
        location.reload();
    });
    $scope.$on("connect.conversation.attachment_errors", function(evt, data) {
        if (!activeConversation.isActive(data.conversation))
            return;
        $scope.attachmentErrors = data.errors;
        angular.forEach(data.errors, function(error) {
            snNotification.show("error", error)
        })
    });
    var loadPromises = [];
    loadPromises.push(conversations.refreshAll());
    var pageLoadPromise = $q.all(loadPromises).then(function() {
        profiles.getAsync(liveProfileID).then(function(profile) {
            $scope.currentUser = profile;
            snPresence.init();
        });
        $scope.resourcesWidth = 285;
        $scope.resourcesWidthHelpDesk = '49%';
    });
    $scope.$on('pane.collapsed', function(event, position, collapsed) {
        userPreferences.setPreference('collaboration.' + position + '.collapsed', collapsed.toString());
    });
    var initialLocationHandled = false;
    $scope.$on('$locationChangeSuccess', function() {
        pageLoadPromise.then(function() {
            initialLocationHandled = true;
            var location = activeConversation.location;
            activeConversation.tab = location.tab || activeConversation.tab;
            $rootScope.$broadcast("connect.conversation.select", activeConversation.tab, location.conversationID);
            if (activeConversation.isEmpty)
                $scope.$broadcast("sn.aside.close", true);
            else
                $scope.$broadcast('connect.pane.close');
            if (location.profileID) {
                profiles.openConversation(location.profileID);
                changeLocation();
            }
        });
    });
    $scope.$watch(function() {
        return activeConversation.sysID;
    }, function(sysID, old) {
        if (sysID === old)
            return;
        if (!initialLocationHandled)
            return;
        changeLocation();
    });

    function changeLocation() {
        var path = activeConversation.tab;
        if (!activeConversation.isEmpty)
            path += '/' + activeConversation.sysID;
        $location.path(path);
    }
    $scope.$watch(function() {
        return activeConversation.tab;
    }, function(tab, old) {
        if (tab === old)
            return;
        if (!initialLocationHandled)
            return;
        if (!activeConversation.isEmpty)
            return;
        $location.path(activeConversation.tab);
    });
    CustomEvent.observe("glide:nav_open_url", function(data) {
        $window.open(data.url, "_blank");
    });
    CustomEvent.observe("connect:open_group", function(data) {
        conversations.followDocumentConversation(data).then(function(conversation) {
            activeConversation.conversation = conversation;
        })
    });
    CustomEvent.observe("connect:follow_document", conversations.followDocumentConversation);
    CustomEvent.observe("connect:unfollow_document", conversations.unfollowDocumentConversation);

    function passAlongAsideEventInfo(e, view, widthOverride) {
        if (angular.equals(e.targetScope, $scope))
            return;
        $scope.$broadcast(e.name, view, widthOverride);
        if (view && !view.isChild && e.name === "sn.aside.open") {
            snConversationAsideHistory.saveHistory(activeConversation.sysID, view);
        } else if (e.name === "sn.aside.close")
            snConversationAsideHistory.clearHistory(activeConversation.sysID);
    }
    $scope.$on("sn.aside.open", passAlongAsideEventInfo);
    $scope.$on("sn.aside.close", passAlongAsideEventInfo);
    $scope.$on("sn.aside.resize", passAlongAsideEventInfo);
    $scope.$on("sn.aside.historyBack", passAlongAsideEventInfo);
    $scope.$on("sn.aside.controls.active", function(e, data) {
        if (!angular.equals(e.targetScope, $scope))
            $scope.$broadcast("sn.aside.controls.active", data);
    });
    $scope.isWideEnough = function() {
        return screenWidth.isAbove(800);
    };
    screenWidth.threshold(800, function(above) {
        if (above)
            $scope.$broadcast('connect.pane.close');
    });
});;