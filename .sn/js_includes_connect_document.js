/*! RESOURCE: /scripts/app.ng_chat/document/js_includes_connect_document.js */
/*! RESOURCE: /scripts/app.ng_chat/document/_module.js */
angular.module("sn.connect.document", []);;
/*! RESOURCE: /scripts/app.ng_chat/document/directive.snLinkCardList.js */
angular.module('sn.connect.document').directive('snLinkCardList', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: getTemplateUrl('snLinkCardList.xml'),
        scope: {
            links: '='
        },
        controller: function($scope) {}
    }
});;
/*! RESOURCE: /scripts/app.ng_chat/document/service.documentLinkMatcher.js */
angular.module('sn.connect.document').service('documentLinkMatcher', function() {
    "use strict";

    function match(str) {
        if (str.match) {
            return str.match(/([\w_]+).do\?sys_id=(\w{32})/);
        }
        return null;
    }
    return {
        isLink: function(href) {
            return match(href) !== null;
        },
        getRecordData: function(href) {
            var linkMatch = match(href);
            if (!linkMatch)
                return {}
            return {
                table: linkMatch[1],
                sysID: linkMatch[2]
            }
        }
    }
});
/*! RESOURCE: /scripts/app.ng_chat/document/service.documents.js */
angular.module('sn.connect.document').service('documentsService', function(
    $rootScope, $q, nowServer, snHttp, snCustomEvent, documentFactory, snConversationAsideHistory, inFrameSet) {
    'use strict';
    var documents = {};

    function getDocument(documentsSysID) {
        return documents[documentsSysID];
    }

    function retrieve(table, sysId) {
        if (!table || !sysId) {
            var deferred = $q.defer();
            deferred.reject("Invalid document parameters -- table: " + table + " sysId: " + sysId);
            return deferred.promise
        }
        var src = nowServer.getURL('record_data', 'table=' + table + '&sys_id=' + sysId);
        return snHttp.get(src).then(function(response) {
            var data = response.data;
            if (!data.sys_id)
                return;
            return documents[data.sys_id] = documentFactory.fromObject(data);
        });
    }

    function show(table, sysID) {
        if (!inFrameSet) {
            $rootScope.$broadcast("sn.aside.trigger_control", "record");
        } else {
            var url = (table === 'vtb_board') ?
                '/$vtb.do?sysparm_board=' + sysID :
                '/' + table + '.do?sys_id=' + sysID;
            snCustomEvent.fire('glide:nav_open_url', {
                url: url,
                openInForm: true
            });
        }
    }

    function create(conversation, data) {
        conversation.pendingRecord = true;
        var redirectUrl = encodeURIComponent('/$connect_record_created.do?sysparm_conversation=' + conversation.sysID +
            '&sysparm_table=' + data.table +
            '&sysparm_sys_id=$sys_id' +
            '&sysparm_nostack=yes');
        var url = data.table + '.do?sys_id=-1';
        if (data.view)
            url += ('&sysparm_view=' + data.view);
        url += ('&sysparm_goto_url=' + redirectUrl + '&sysparm_query=' + data.query + "&sysparm_clear_stack=true");
        if (inFrameSet) {
            snCustomEvent.fire('glide:nav_open_url', {
                url: url,
                openInForm: true
            })
        } else {
            var view = {
                template: '<sn-aside-frame name="pending_record" url="/' + url + '" title="New Record"></sn-aside-frame>',
                width: '50%',
                cacheKey: conversation.sysID + '.pending_record.' + data.table
            };
            $rootScope.$broadcast('sn.aside.open', view, "50%");
            snConversationAsideHistory.saveHistory(conversation.sysID, view);
        }
    }
    return {
        getDocument: getDocument,
        retrieve: retrieve,
        show: show,
        create: create
    };
});;
/*! RESOURCE: /scripts/app.ng_chat/document/factory.Document.js */
angular.module('sn.connect.document').factory('documentFactory', function(liveLinkFactory) {
    "use strict";

    function getFieldByName(fields, name) {
        for (var i = 0; i < fields.length; i++)
            if (fields[i].name == name)
                return fields[i];
        return {};
    }

    function fromObject(data) {
        var fields = data.fields || [];
        var sysID = data.sys_id;
        var table = data.table;
        var number = getFieldByName(fields, 'number').displayValue;
        var url = (data.table === "vtb_board") ?
            '/' + "$vtb" + '.do?sysparm_board=' + data.sys_id :
            '/' + data.table + '.do?sys_id=' + data.sys_id + '&sysparm_nameofstack=' + data.sys_id;
        var link = liveLinkFactory.linkObject(url);
        return {
            get table() {
                return table;
            },
            get sysID() {
                return sysID;
            },
            get fields() {
                return fields;
            },
            get number() {
                return number;
            },
            get link() {
                return link;
            }
        };
    }
    return {
        fromObject: fromObject
    }
});;;