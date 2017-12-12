var ChangeRequestStateHandler = Class.create();

// All references to statehandler constants should be through this class ChangeRequestStateHandler
ChangeRequestStateHandler.DRAFT = ChangeRequestStateHandlerSNC.DRAFT;
ChangeRequestStateHandler.ASSESS = ChangeRequestStateHandlerSNC.ASSESS;
ChangeRequestStateHandler.AUTHORIZE = ChangeRequestStateHandlerSNC.AUTHORIZE;
ChangeRequestStateHandler.SCHEDULED = ChangeRequestStateHandlerSNC.SCHEDULED;
ChangeRequestStateHandler.IMPLEMENT = ChangeRequestStateHandlerSNC.IMPLEMENT;
ChangeRequestStateHandler.REVIEW = ChangeRequestStateHandlerSNC.REVIEW;
ChangeRequestStateHandler.CLOSED = ChangeRequestStateHandlerSNC.CLOSED;
ChangeRequestStateHandler.CANCELED = ChangeRequestStateHandlerSNC.CANCELED;

ChangeRequestStateHandler.prototype = Object.extendsObject(ChangeRequestStateHandlerSNC, {
    initialize: function(changeRequestGr) {
        ChangeRequestStateHandlerSNC.prototype.initialize.call(this, changeRequestGr);
    },

    type: "ChangeRequestStateHandler"
});