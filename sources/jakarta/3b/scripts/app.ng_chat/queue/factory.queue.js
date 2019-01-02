/*! RESOURCE: /scripts/app.ng_chat/queue/factory.queue.js */
angular.module('sn.connect.queue').factory('queueFactory', function() {
  'use strict';
  return {
    fromObject: function(data) {
      return {
        get id() {
          return data.sys_id;
        },
        get name() {
          return data.name;
        },
        get question() {
          return data.question;
        },
        get waitTime() {
          return data.average_wait_time.replace(/ Minute(s?)/g, "m").replace(/ Hour(s?)/g, "h").replace(/ Second(s?)/g, "s");
        },
        get waitTimeLong() {
          return data.average_wait_time;
        },
        get waitingCount() {
          return data.waiting_count;
        },
        get available() {
          return angular.isUndefined(data.not_available);
        },
        get unavailableMessage() {
          return data.not_available;
        },
        get escalateTo() {
          return data.escalate_to;
        },
        get isAgentsQueue() {
          return data.is_agent_for;
        }
      };
    }
  };
});;