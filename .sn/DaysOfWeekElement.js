/*! RESOURCE: /scripts/classes/DaysOfWeekElement.js */
var DaysOfWeekElement = Class.create({
    initialize: function(name) {
        this.name = name;
    },
    setReadOnly: function(disabled) {
        var e = gel(this.name);
        if (e) {
            var checkedDays = e.value;
            for (var i = 1; i != 8; i++) {
                var cb = gel('ni.' + this.name + '.' + i);
                if (cb) {
                    cb.disabled = disabled;
                }
            }
        }
    },
    isDisabled: function() {
        var cb = $('ni.' + this.name + '.1');
        if (cb && !cb.disabled)
            return false;
        return true;
    }
});;