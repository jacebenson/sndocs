/*! RESOURCE: /scripts/app.ng_chat/search/directive.liveSearchControl.js */
angular.module('sn.connect').directive('liveSearchControl', function(
    $compile, $timeout, getTemplateUrl, snHttp, userJID, $rootScope, i18n) {
    'use strict';
    var MINIMUM_TYPING_WAIT = 250;
    var CACHE_TIME_LIMIT = 15 * 60 * 1000;
    var liveSearchTranslatedStrings;
    i18n.getMessages([
        'People', 'No matching people',
        'Groups', 'No matching groups',
        'Messages', 'No matching messages'
    ], function(result) {
        liveSearchTranslatedStrings = result;
    });
    return {
        restrict: 'E',
        templateUrl: function(tElement, tAttrs) {
            if (tAttrs.templateUrl)
                return getTemplateUrl(tAttrs.templateUrl);
            else
                return getTemplateUrl('liveSearchControl.xml');
        },
        replace: true,
        scope: {
            type: '@',
            limit: '@',
            placeholder: '@',
            expandDirection: '@',
            onSelect: '&',
            templateOverride: '=?',
            ignoreBlur: '@',
            onBlur: "&?",
            ignoreList: "="
        },
        link: function(scope, element) {
            scope.triggerCreateConversation = function() {
                $rootScope.$broadcast("connect.show_create_conversation_screen");
                $rootScope.$broadcast('connect.pane.close');
                $rootScope.$broadcast("sn.aside.close", true);
            };
            var suggestionScopes = [];
            var limit = scope.limit || 5;
            var searchURL = '/api/now/connect/search/' + scope.type + '?keywords={query}&limit=' + limit;
            if (!scope.onBlur)
                scope.onBlur = function() {};

            function Search(table) {
                Search.promises = Search.promises || {};
                var that = this;
                this.table = table;
                return function(query, sync, async) {
                    that.debounce(function() {
                        suggestionScopes.forEach(function(suggestionScope) {
                            suggestionScope.$destroy();
                        });
                        that.getPromise(query).then(function(response) {
                            if (response.data.result) {
                                angular.forEach(response.data.result, function(result) {
                                    if (that.table !== result.table)
                                        return;
                                    async(result.searchResults);
                                });
                            } else {
                                async();
                            }
                            return response;
                        });
                    });
                };
            }
            Search.prototype.debounce = function(func) {
                $timeout.cancel(this.timeout);
                this.timeout = $timeout(func, MINIMUM_TYPING_WAIT);
            };
            Search.prototype.removeStaleEntries = function() {
                var now = new Date();
                for (var key in Search.promises) {
                    if (!Search.promises.hasOwnProperty(key))
                        continue;
                    var elapsed = now - Search.promises[key].time;
                    if (elapsed > CACHE_TIME_LIMIT) {
                        delete Search.promises[key];
                    }
                }
            };
            Search.prototype.getPromise = function(query) {
                this.removeStaleEntries();
                var url = searchURL.replace("{query}", query);
                if (scope.ignoreList)
                    url += "&ignore=" + scope.ignoreList;
                var data = Search.promises[url];
                if (!data) {
                    data = Search.promises[url] = {
                        promise: snHttp.get(url),
                        time: new Date()
                    };
                }
                return data.promise;
            };
            var templates = {
                sys_user: '<div class="sn-widget-list_v2"><div class="suggestion-user sn-widget-list-item"><div class="sn-widget-list-content sn-widget-list-content_static"><sn-avatar primary="::profile" class="avatar-small" nopopover="true"></sn-avatar></div><div class="sn-widget-list-content"><span class="name sn-widget-list-title">{{::profile.name}}</span><span class="suggestion-detail sn-widget-list-subtitle">{{::profile.email}}</span></div></div></div>',
                live_message: '<div class="sn-widget-list_v2"><div class="suggestion-message sn-widget-list-item"><div class="sn-widget-list-content sn-widget-list-content_static"><sn-avatar primary="::profile" class="avatar-small" nopopover="true"></sn-avatar></div><div class="details sn-widget-list-content"><span class="body sn-widget-list-title">{{::suggestion.formattedBody}}</span><span class="name sn-widget-list-subtitle">{{::profile.name}}</span></div></div></div>',
                live_group_profile: '<div class="sn-widget-list_v2"><div class="suggestion-group sn-widget-list-item"><div class="sn-widget-list-content sn-widget-list-content_static"><sn-avatar primary="::profile" members="::members" class="avatar-small" nopopover="true"></sn-avatar></div><div class="sn-widget-list-content"><span class="name sn-widget-list-title">{{::suggestion.name}}</span></div></div></div>'
            };
            if (scope.templateOverride)
                angular.extend(templates, scope.templateOverride);
            var buildInitials = function(name) {
                if (!name)
                    return "--";
                var initials = name.split(" ").map(function(word) {
                    return word.toUpperCase();
                }).filter(function(word) {
                    return word.match(/^[A-Z]/);
                }).map(function(word) {
                    return word.substring(0, 1);
                }).join("");
                return initials.substr(0, 3);
            };
            var isMember = function(member) {
                return (member && member.jid === userJID);
            };
            var dataSet = function(table, displayKey, header, emptySuggestion) {
                return {
                    name: table,
                    limit: scope.limit,
                    displayKey: displayKey,
                    source: new Search(table),
                    templates: {
                        header: '<div class="header sn-aside-group-title">' + header + '</div>',
                        empty: '<div class="empty-suggestion sn-wiget sn-widget-textblock sn-widget-textblock_center">' + emptySuggestion + '</div>',
                        suggestion: function(suggestion) {
                            var suggestionScope = scope.$new();
                            suggestionScopes.push(suggestionScope);
                            suggestionScope.suggestion = suggestion;
                            if (!isMember(suggestion.from) &&
                                !isMember(suggestion.to) &&
                                suggestion.to &&
                                suggestion.from) {
                                suggestionScope.profile = {
                                    avatar: suggestion.from.avatarID,
                                    initials: buildInitials(suggestion.from.name),
                                    name: 'From: ' + suggestion.from.name
                                };
                            } else if (isMember(suggestion.from) &&
                                suggestion.to &&
                                suggestion.to.name) {
                                suggestionScope.profile = {
                                    avatar: suggestion.from.avatarID,
                                    initials: buildInitials(suggestion.from.name),
                                    name: 'To: ' + suggestion.to.name
                                };
                            } else if (isMember(suggestion.to) &&
                                suggestion.from &&
                                suggestion.from.name) {
                                suggestionScope.profile = {
                                    avatar: suggestion.from.avatarID,
                                    initials: buildInitials(suggestion.from.name),
                                    name: 'From: ' + suggestion.from.name
                                };
                            } else {
                                suggestionScope.profile = {
                                    avatar: suggestion.avatarID,
                                    initials: buildInitials(suggestion.name),
                                    name: suggestion.name,
                                    email: suggestion.email
                                };
                            }
                            if (suggestion.members) {
                                suggestionScope.members = [];
                                angular.forEach(suggestion.members, function(member) {
                                    suggestionScope.members.push({
                                        avatar: member.avatarID,
                                        initials: buildInitials(suggestion.name),
                                        name: name
                                    });
                                });
                            }
                            if (suggestion.body) {
                                suggestion.formattedBody = suggestion.body.replace(/@\[[a-z0-9]{32}:([^\]]+?)\]/gi, "@$1");
                            }
                            return $compile(templates[table])(suggestionScope);
                        }
                    }
                };
            };
            var selected = function(event, suggestion) {
                var id = '';
                if (suggestion.jid.indexOf('live_message') === 0) {
                    if (!isMember(suggestion.from) &&
                        !isMember(suggestion.to) &&
                        suggestion.to &&
                        suggestion.from) {
                        id = suggestion.to.jid;
                    } else if (isMember(suggestion.from) && suggestion.to) {
                        id = suggestion.to.jid;
                    } else if (isMember(suggestion.to) && suggestion.from) {
                        id = suggestion.from.jid;
                    }
                } else {
                    id = suggestion.jid;
                }
                scope.onSelect({
                    id: id,
                    suggestion: suggestion
                });
                scope.$apply();
                var target = angular.element(event.target);
                target.typeahead('close');
                target.typeahead('val', '');
            };
            var options = [{
                    autoselect: 'first',
                    hint: true,
                    highlight: false,
                    minLength: 2
                },
                dataSet('sys_user', 'name', liveSearchTranslatedStrings['People'], liveSearchTranslatedStrings['No matching people'])
            ];
            if (scope.type !== 'user') {
                options.push(dataSet('live_message', 'body', liveSearchTranslatedStrings['Messages'], liveSearchTranslatedStrings['No matching messages']));
                options.push(dataSet('live_group_profile', 'body', liveSearchTranslatedStrings['Groups'], liveSearchTranslatedStrings['No matching groups']));
            }
            $timeout(function() {
                var input = element.find("input");
                input.on("keydown", function(e) {
                    if (input.val() !== "")
                        return;
                    if (e.keyCode === 8)
                        scope.$emit("connect.search_control_key", "backspace");
                    else if (e.keyCode === 13)
                        scope.$emit("connect.search_control_key", "enter");
                    else if (e.keyCode === 27)
                        scope.$emit("connect.search_control_key", "escape");
                });
                input.typeahead.apply(input, options);
                input.on('typeahead:selected', selected);
                input.on('typeahead:autocomplete', selected);
                input.on('keydown', function(e) {
                    if (e.keyCode === 13) {
                        var newEvent = angular.element.Event("keydown");
                        newEvent.keyCode = 9;
                        input.trigger(newEvent);
                    }
                });
                scope.$emit("live.search.control.ready", input);
                if (scope.ignoreBlur) {
                    var api = input.data('ttTypeahead');
                    api.input.off("blurred");
                    api._onBlurred = function() {
                        this.isActivated = false;
                    };
                    api.input.onSync("blurred", api._onBlurred, api);
                }
            });
        }
    };
});;