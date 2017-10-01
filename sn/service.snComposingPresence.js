/*! RESOURCE: /scripts/sn/common/presence/service.snComposingPresence.js */
angular.module('sn.common.presence').service('snComposingPresence', function(i18n) {
    "use strict";
    var viewing = {};
    var typing = {};
    var allStrings = {};
    var shortStrings = {};
    var typing1 = "{0} is typing",
        typing2 = "{0} and {1} are typing",
        typingMore = "{0}, {1}, and {2} more are typing",
        viewing1 = "{0} is viewing",
        viewing2 = "{0} and {1} are viewing",
        viewingMore = "{0}, {1}, and {2} more are viewing";
    i18n.getMessages(
        [
            typing1,
            typing2,
            typingMore,
            viewing1,
            viewing2,
            viewingMore
        ],
        function(results) {
            typing1 = results[typing1];
            typing2 = results[typing2];
            typingMore = results[typingMore];
            viewing1 = results[viewing1];
            viewing2 = results[viewing2];
            viewingMore = results[viewingMore];
        });

    function set(conversationID, newPresenceValues) {
        if (newPresenceValues.viewing)
            viewing[conversationID] = newPresenceValues.viewing;
        if (newPresenceValues.typing)
            typing[conversationID] = newPresenceValues.typing;
        generateAllString(conversationID, {
            viewing: viewing[conversationID],
            typing: typing[conversationID]
        });
        generateShortString(conversationID, {
            viewing: viewing[conversationID],
            typing: typing[conversationID]
        });
        return {
            viewing: viewing[conversationID],
            typing: typing[conversationID]
        }
    }

    function get(conversationID) {
        return {
            viewing: viewing[conversationID] || [],
            typing: typing[conversationID] || []
        }
    }

    function generateAllString(conversationID, members) {
        var result = "";
        var typingLength = members.typing.length;
        var viewingLength = members.viewing.length;
        if (typingLength < 4 && viewingLength < 4)
            return "";
        switch (typingLength) {
            case 0:
                break;
            case 1:
                result += i18n.format(typing1, members.typing[0].name);
                break;
            case 2:
                result += i18n.format(typing2, members.typing[0].name, members.typing[1].name);
                break;
            default:
                var allButLastTyper = "";
                for (var i = 0; i < typingLength; i++) {
                    if (i < typingLength - 2)
                        allButLastTyper += members.typing[i].name + ", ";
                    else if (i === typingLength - 2)
                        allButLastTyper += members.typing[i].name + ",";
                    else
                        result += i18n.format(typing2, allButLastTyper, members.typing[i].name);
                }
        }
        if (viewingLength > 0 && typingLength > 0)
            result += "\n\n";
        switch (viewingLength) {
            case 0:
                break;
            case 1:
                result += i18n.format(viewing1, members.viewing[0].name);
                break;
            case 2:
                result += i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
                break;
            default:
                var allButLastViewer = "";
                for (var i = 0; i < viewingLength; i++) {
                    if (i < viewingLength - 2)
                        allButLastViewer += members.viewing[i].name + ", ";
                    else if (i === viewingLength - 2)
                        allButLastViewer += members.viewing[i].name + ",";
                    else
                        result += i18n.format(viewing2, allButLastViewer, members.viewing[i].name);
                }
        }
        allStrings[conversationID] = result;
    }

    function generateShortString(conversationID, members) {
        var typingLength = members.typing.length;
        var viewingLength = members.viewing.length;
        var typingString = "",
            viewingString = "";
        var inBetween = " ";
        switch (typingLength) {
            case 0:
                break;
            case 1:
                typingString = i18n.format(typing1, members.typing[0].name);
                break;
            case 2:
                typingString = i18n.format(typing2, members.typing[0].name, members.typing[1].name);
                break;
            case 3:
                typingString = i18n.format(typing2, members.typing[0].name + ", " + members.typing[1].name + ",", members.typing[2].name);
                break;
            default:
                typingString = i18n.format(typingMore, members.typing[0].name, members.typing[1].name, (typingLength - 2));
        }
        if (viewingLength > 0 && typingLength > 0)
            inBetween = ". ";
        switch (viewingLength) {
            case 0:
                break;
            case 1:
                viewingString = i18n.format(viewing1, members.viewing[0].name);
                break;
            case 2:
                viewingString = i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
                break;
            case 3:
                viewingString = i18n.format(viewing2, members.viewing[0].name + ", " + members.viewing[1].name + ",", members.viewing[2].name);
                break;
            default:
                viewingString = i18n.format(viewingMore, members.viewing[0].name, members.viewing[1].name, (viewingLength - 2));
        }
        shortStrings[conversationID] = typingString + inBetween + viewingString;
    }

    function getAllString(conversationID) {
        if ((viewing[conversationID] && viewing[conversationID].length > 3) ||
            (typing[conversationID] && typing[conversationID].length > 3))
            return allStrings[conversationID];
        return "";
    }

    function getShortString(conversationID) {
        return shortStrings[conversationID];
    }

    function remove(conversationID) {
        delete viewing[conversationID];
    }
    return {
        set: set,
        get: get,
        generateAllString: generateAllString,
        getAllString: getAllString,
        generateShortString: generateShortString,
        getShortString: getShortString,
        remove: remove
    }
});;