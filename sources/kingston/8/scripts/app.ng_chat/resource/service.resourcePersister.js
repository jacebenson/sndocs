/*! RESOURCE: /scripts/app.ng_chat/resource/service.resourcePersister.js */
angular.module('sn.connect.resource').service('resourcePersister', function(
  $q, snHttp, liveLinkFactory, attachmentFactory, $timeout, isLoggedIn) {
  "use strict";
  var CONVERSATION_PATH = isLoggedIn ? "/api/now/connect/conversations/" : "/api/now/connect/support/anonymous/conversations/";
  var FETCH_THRESHOLD = 25;
  var conversations = {};
  var limit = FETCH_THRESHOLD;

  function addLink(conversationID, link) {
    var field = (link.isRecord) ? "records" : "links";
    addToArray(conversationID, field, link, linkEquals);
  }

  function linkEquals(link1, link2) {
    return link1.url === link2.url;
  }

  function addAttachment(conversationID, attachment) {
    addToArray(conversationID, "attachments", attachment, attachmentEquals);
  }

  function attachmentEquals(attachment1, attachment2) {
    function cmp(field) {
      var field1 = attachment1[field];
      var field2 = attachment2[field];
      return !!field1 && field1 === field2;
    }
    return attachment1.isImage &&
      cmp("sizeInBytes") &&
      cmp("compressSize") &&
      cmp("contentType") &&
      cmp("height") &&
      cmp("width") &&
      cmp("averageColor");
  }

  function addToArray(conversationID, field, element, equalsFn) {
    var resources = conversations[conversationID];
    if (!resources) {
      conversations[conversationID] = newResource();
      conversations[conversationID][field] = [element];
      return;
    }
    var array = resources[field];
    for (var i = 0; i < array.length; i += 1) {
      var item = array[i];
      if (item.sysID === element.sysID) {
        array[i] = element;
        return;
      }
      if (equalsFn(item, element)) {
        if (item.timestamp > element.timestamp)
          return;
        array.splice(i, 1);
        break;
      }
    }
    for (i = 0; i < array.length; ++i) {
      if (array[i].timestamp <= element.timestamp) {
        array.splice(i, 0, element);
        return;
      }
    }
    array.push(element);
  }

  function newResource() {
    return {
      links: [],
      records: [],
      attachments: []
    };
  }

  function retrieve(conversationID) {
    var resources = conversations[conversationID];
    if (resources && (resources.loading || resources.retrieved))
      return;
    if (!resources) {
      resources = conversations[conversationID] = newResource();
    }
    resources.loading = true;
    $timeout(function() {
      snHttp.get(CONVERSATION_PATH + conversationID + "/resources?sysparm_limit=" + limit).then(function(response) {
        delete conversations[conversationID].loading;
        conversations[conversationID].retrieved = true;
        limit = limit + FETCH_THRESHOLD;
        var result = response.data.result;
        result.links.forEach(function(rawLink) {
          addLink(conversationID, liveLinkFactory.fromObject(rawLink));
        });
        result.attachments.forEach(function(rawAttachment) {
          addAttachment(conversationID, attachmentFactory.fromObject(rawAttachment));
        });
        resources.retrieved = true;
      });
    })
  }
  return {
    get: function(conversationID) {
      retrieve(conversationID);
      return conversations[conversationID];
    },
    addLink: addLink,
    addAttachment: addAttachment
  };
});;