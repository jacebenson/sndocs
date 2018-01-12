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