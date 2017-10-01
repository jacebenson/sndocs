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
});;