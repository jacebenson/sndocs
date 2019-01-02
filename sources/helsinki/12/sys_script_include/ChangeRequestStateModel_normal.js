var ChangeRequestStateModel_normal = Class.create();
ChangeRequestStateModel_normal.prototype = Object.extendsObject(ChangeRequestStateModelSNC_normal, {
    draft: {
        nextState: [ "assess" ],

        assess: {
            moving: function() {
                return this.toAssess_moving();
            },

            canMove: function() {
                return this.toAssess_canMove();
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

    assess: {
        nextState: [ "authorize" ],

        draft: {
            moving: function() {
                return this.toDraft_moving();
            },

            canMove: function() {
                return this.toDraft_canMove();
            }
        },

        authorize: {
            moving: function() {
                return this.toAuthorize_moving();
            },

            canMove: function() {
                return this.toAuthorize_canMove();
            }
        },

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

    authorize: {
        nextState: [ "scheduled" ],

        draft: {
            moving: function() {
                return this.toDraft_moving();
            },

            canMove: function() {
                return this.toDraft_canMove();
            }
        },

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

    type: "ChangeRequestStateModel_normal"
});