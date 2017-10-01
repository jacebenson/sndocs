/*! RESOURCE: /scripts/classes/ui/Point.js */
var Point = Class.create();
Point.prototype = {
    initialize: function(x, y) {
        this.x = x;
        this.y = y;
    },
    getX: function() {
        return this.x;
    },
    getY: function() {
        return this.y;
    }
};