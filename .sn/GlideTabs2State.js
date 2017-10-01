/*! RESOURCE: /scripts/classes/GlideTabs2State.js */
var GlideTabs2State = Class.create({
    initialize: function(name) {
        this.name = name;
        this.cj = new CookieJar();
    },
    get: function() {
        return this.cj.get(this.name);
    },
    set: function(value) {
        this.cj.put(this.name, value);
    },
    type: 'GlideTabs2State'
});;