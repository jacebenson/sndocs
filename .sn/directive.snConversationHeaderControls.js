/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationHeaderControls.js */
angular.module('sn.connect').directive('snConversationHeaderControls', function(getTemplateUrl, i18n) {
    'use strict';
    var knowledgeBaseTitle = "";
    var documentTitle = "";
    i18n.getMessages(["Knowledge Base", "Document"], function(results) {
        knowledgeBaseTitle = results["Knowledge Base"];
        documentTitle = results["Document"];
    });
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('snConversationHeaderControls.xml'),
        replace: true,
        scope: {
            conversation: '=',
            collapsible: '@'
        },
        link: function(scope, element, attrs) {
            attrs.$observe('collapsible', function(value) {
                scope.collapsible = scope.$eval(value || 'true');
            });
        },
        controller: function($scope, $element, $animate, snConversationAsideHistory, $timeout) {
            $scope.expandDirection = "left";
            $scope.activeAside = "";
            $scope.buttons = $element.find('#conversationAsideButtons');
            var activeAsideButton;
            var helpDeskAsides = ["knowledge", "record", "pending_record"];
            var pendingRecordKeys = {};
            var defaultAsideScope = $scope.$new();
            var asideViews = {
                members: {
                    template: "<sn-aside-member-list></sn-aside-member-list>",
                    scope: defaultAsideScope
                },
                info: {
                    template: "<sn-aside-info></sn-aside-info>",
                    scope: defaultAsideScope
                },
                attachments: {
                    template: "<sn-aside-attachments></sn-aside-attachments>",
                    scope: defaultAsideScope
                },
                notifications: {
                    template: "<sn-aside-notifications></sn-aside-notifications>",
                    scope: defaultAsideScope
                },
                knowledge: {
                    template: function() {
                        return "<sn-aside-frame name='knowledge' url=\"/$knowledge.do\" title='" + knowledgeBaseTitle + "'></sn-aside-frame>";
                    },
                    width: "50%",
                    cacheKey: function() {
                        return $scope.conversation.sysID + ".knowledgeBase";
                    }
                },
                record: {
                    template: function() {
                        return "<sn-aside-frame name='record' url=\"/" + $scope.conversation.table + ".do?sys_id=" + $scope.conversation.document + "\" title=\"" + documentTitle + "\"></sn-aside-frame>";
                    },
                    width: "50%",
                    cacheKey: function() {
                        return $scope.conversation.sysID + ".record";
                    }
                },
                pending_record: {
                    template: "",
                    width: "50%",
                    cacheKey: function() {
                        return pendingRecordKeys[$scope.conversation.sysID] ? pendingRecordKeys[$scope.conversation.sysID] : $scope.conversation.sysID + ".pending_record";
                    }
                }
            };
            $scope.isShowInfo = function() {
                return !$scope.conversation.isHelpDesk && ($scope.conversation.document || $scope.conversation.resources.links.length > 0 || $scope.conversation.resources.records.length > 0);
            };
            $scope.isShowRecord = function() {
                return $scope.conversation.isHelpDesk && $scope.conversation.document && $scope.conversation.table != 'chat_queue_entry'
            };

            function stringFunction(stringOrFunction) {
                if (angular.isFunction(stringOrFunction))
                    return stringOrFunction();
                return stringOrFunction;
            }
            $scope.$on("sn.aside.open", function(e, view) {
                var cacheKey = stringFunction(view.cacheKey);
                if (cacheKey && cacheKey.indexOf("pending_record") > -1) {
                    pendingRecordKeys[$scope.conversation.sysID] = cacheKey;
                }
            });
            $scope.$watch("conversation.sysID", function() {
                var historicalAside = snConversationAsideHistory.getHistory($scope.conversation.sysID);
                if ($scope.conversation.restricted) {
                    $scope.$emit("sn.aside.close");
                    return;
                }
                var historicalAsideScopeValid = (historicalAside && historicalAside.scope && historicalAside.scope.$parent && !historicalAside.scope.$parent["$$destroyed"]);
                if (historicalAside && historicalAsideScopeValid) {
                    $scope.$evalAsync(function() {
                        $scope.$emit("sn.aside.open", historicalAside);
                    });
                    return;
                }
                if (!$scope.activeAside)
                    return;
                if (!$scope.showInfo && $scope.activeAside === "info") {
                    $scope.$emit("sn.aside.close");
                    return;
                }
                if (helpDeskAsides.indexOf($scope.activeAside) >= 0 && !$scope.conversation.isHelpDesk) {
                    $scope.$emit("sn.aside.close");
                    return;
                }
                if ($scope.activeAside === "record" && $scope.conversation.table === "chat_queue_entry") {
                    $scope.$emit("sn.aside.close");
                    return;
                }
                if ($scope.activeAside === "pending_record" && !$scope.conversation.pendingRecord) {
                    $scope.$emit("sn.aside.close");
                    return;
                }
                $scope.$emit("sn.aside.open", asideViews[$scope.activeAside], asideWidth($scope.activeAside));
            });

            function asideWidth(view) {
                return asideViews[view].width || $scope.buttons.width();
            }
            $scope.$on("sn.aside.trigger_control", function(e, view) {
                if (!asideViews.hasOwnProperty(view))
                    return;
                if ($scope.activeAside === view) {
                    if ($scope.collapsible)
                        $scope.$emit("sn.aside.close");
                    return;
                }
                $scope.activeAside = view;
                $timeout(function() {
                    $scope.$emit("sn.aside.open", asideViews[view], asideWidth(view));
                }, 0, false);
            });
            $scope.openAside = function(view) {
                $scope.$emit("sn.aside.trigger_control", view);
            };
            $scope.$on("sn.aside.controls.active", function(e, data) {
                activeAsideButton = $element.find('[aside-view-name="' + data + '"]');
                $scope.activeAside = data;
            });
            $scope.$on("sn.aside.close", function() {
                if (activeAsideButton) {
                    activeAsideButton.focus();
                }
                $scope.activeAside = void(0);
                activeAsideButton = void(0);
            });

            function resizeAside(unused, phase) {
                if (phase === "close" && $scope.activeAside && asideViews[$scope.activeAside]) {
                    $scope.$emit("sn.aside.resize", asideWidth($scope.activeAside));
                }
            }
            $animate.on('addClass', $scope.buttons, resizeAside);
            $animate.on('removeClass', $scope.buttons, resizeAside);
            $scope.close = function(evt) {
                if (evt.keyCode === 9)
                    return;
                $scope.$emit("sn.aside.close");
            }
        }
    };
});;