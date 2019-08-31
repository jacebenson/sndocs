/*! RESOURCE: /scripts/app.ng_chat/queue/factory.queueEntry.js */
angular.module('sn.connect.queue').factory('queueEntryFactory', function(profiles, userID, queues) {
  'use strict';
  var WAITING = 1;
  var WORK_IN_PROGRESS = 2;
  var CLOSED_COMPLETE = 3;
  var CLOSED_ESCALATED = 4;
  var CLOSED_BY_CLIENT = 7;
  var CLOSED_ABANDONED = 8;
  var TRANSFER_PENDING = 'pending';
  var TRANSFER_CANCELLED = 'cancelled';
  var TRANSFER_ACCEPTED = 'accepted';
  var TRANSFER_REJECTED = 'rejected';
  return {
    fromObject: function(data) {
      return {
        equals: function(rawQueueEntry) {
          return angular.equals(data, rawQueueEntry);
        },
        get averageWaitTime() {
          return data.average_wait_time;
        },
        get sysID() {
          return data.sys_id;
        },
        get queueID() {
          return data.queue;
        },
        get queue() {
          return queues.all[data.queue];
        },
        get conversationID() {
          return data.group;
        },
        get assignedTo() {
          return data.assigned_to;
        },
        get isAssignedToMe() {
          return this.assignedTo === userID;
        },
        get number() {
          return data.number;
        },
        get position() {
          return data.position;
        },
        get profile() {
          return profiles.get(data.sys_id);
        },
        get shortDescription() {
          return data.short_description;
        },
        get state() {
          return data.state;
        },
        set state(value) {
          data.state = value;
        },
        get waitTime() {
          return data.wait_time;
        },
        get workStart() {
          return data.work_start;
        },
        get workEnd() {
          return data.work_end;
        },
        get isTransferStateChanged() {
          return data.transfer_change;
        },
        clearTransferState: function() {
          data.transfer_state = undefined;
        },
        get hasTransfer() {
          return !!data.transfer_state;
        },
        get isTransferPending() {
          return data.transfer_state === TRANSFER_PENDING;
        },
        get isTransferCancelled() {
          return data.transfer_state === TRANSFER_CANCELLED;
        },
        get isTransferAccepted() {
          return data.transfer_state === TRANSFER_ACCEPTED;
        },
        get isTransferRejected() {
          return data.transfer_state === TRANSFER_REJECTED;
        },
        get openedBy() {
          return data.opened_by;
        },
        get isOpenedByMe() {
          return this.openedBy === userID;
        },
        get transferTo() {
          return data.transfer_to;
        },
        get isTransferringToMe() {
          return this.transferTo === userID;
        },
        get isTransferringFromMe() {
          return data.transfer_from === userID;
        },
        get transferShouldClose() {
          if (this.isAssignedToMe)
            return false;
          return data.transfer_should_close;
        },
        get transferUpdatedOn() {
          return new Date(data.transfer_updated_on);
        },
        get updatedOn() {
          return new Date(data.sys_updated_on);
        },
        get isActive() {
          return this.isWaiting || this.isAccepted || (!this.isOpenedByMe && this.isClosedByClient);
        },
        get isPermanentlyClosed() {
          return this.isClosedByAgent || this.isEscalated || this.isClosedByClient;
        },
        get isReOpenable() {
          return this.isAbandoned;
        },
        get isWaiting() {
          return this.state === WAITING;
        },
        get isAccepted() {
          return this.state === WORK_IN_PROGRESS;
        },
        get isEscalated() {
          return this.state === CLOSED_ESCALATED;
        },
        get isAbandoned() {
          return this.state === CLOSED_ABANDONED;
        },
        get isClosedByAgent() {
          return this.state === CLOSED_COMPLETE;
        },
        get isClosedByClient() {
          return this.state === CLOSED_BY_CLIENT;
        },
        escalate: function() {
          this.state = CLOSED_ESCALATED;
        }
      };
    }
  };
});;