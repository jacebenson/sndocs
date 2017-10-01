/*! RESOURCE: /scripts/classes/TextAreaElement.js */
var TextAreaElement = Class.create({
    initialize: function(name) {
        this.name = name;
    },
    setReadOnly: function(disabled) {
        var d = gel(this.name);
        if (disabled) {
            d.readOnly = "readonly";
            addClassName(d, "readonly");
        } else {
            d.readOnly = "";
            removeClassName(d, "readonly");
        }
    },
    setValue: function(newValue) {
        if (newValue == 'XXmultiChangeXX') {
            newValue = '';
        }
        var d = gel(this.name + ".ta");
        if (d)
            d.value = newValue;
        d = gel(this.name);
        d.value = newValue;
        onChange(this.name);
        if (window.jQuery)
            $j(d).trigger("autosize.resize");
        d = gel("sys_original." + this.name);
        if (d) {
            d.value = "XXmultiChangeXX";
        }
    }
});;