var ChangeRequestStateModel_standard = Class.create();
ChangeRequestStateModel_standard.prototype = Object.extendsObject(ChangeRequestStateModelSNC_standard, {
    draft: {
        nextState: [ "scheduled" ],

        scheduled: {
            moving: function() {
                return this.toScheduled_moving();
            },

            canMove: function() {
                return this.toScheduled_canMove();
            }
        },

        canceled: {
            moving: function() {
                return this.toCanceled_moving();
            },

            canMove: function() {
                return this.toCanceled_canMove();
            }
        }
    },

    scheduled: {
        nextState: [ "implement" ],

        implement: {
            moving: function() {
                return this.toImplement_moving();
            },
            canMove: function() {
                return this.toImplement_canMove();
            }
        },

        canceled: {
            moving: function() {
                return this.toCanceled_moving();
            },

            canMove: function() {
                return this.toCanceled_canMove();
            }
        }
    },

    implement: {
        nextState: [ "review" ],

        review: {
            moving: function() {
                return this.toReview_moving();
            },

            canMove: function() {
                return this.toReview_canMove();
            }
        },

        canceled: {
            moving: function() {
                return this.toCanceled_moving();
            },

            canMove: function() {
                return this.toCanceled_canMove();
            }
        }
    },

    review: {
        nextState: [ "closed" ],

        closed: {
            moving: function() {
                return this.toClosed_moving();
            },

            canMove: function() {
                return this.toClosed_canMove();
            }
        },

        canceled: {
            moving: function() {
                return this.toCanceled_moving();
            },

            canMove: function() {
                return this.toCanceled_canMove();
            }
        }
    },

    closed: {},

    canceled: {},

    type: "ChangeRequestStateModel_standard"
});