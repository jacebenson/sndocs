/*! RESOURCE: /scripts/GwtListEditInternalType.js */
var GwtListEditInternalType = Class.create(GwtListEditSelect, {
    addOptions: function() {
        var ga = new GlideAjax('AjaxClientHelper');
        ga.addParam('sysparm_name', 'generateChoice');
        var selectedValue = this.editor.getValue();
        if (selectedValue) {
            ga.addParam('sysparm_selected_value', selectedValue);
        }
        ga.getXML(this._createOptions.bind(this));
    },
    _createOptions: function(response) {
        if (this.state != 'initialize')
            return;
        var xml = response.responseXML;
        var items = xml.getElementsByTagName("item");
        var value = this.editor.getValue();
        this.focusElement.options.length = 0;
        for (var i = 0; i < items.length; i++) {
            var v = items[i].getAttribute("value");
            var l = items[i].getAttribute("label");
            addOption(this.focusElement, v, l, this._isSelected(value, v, l));
        }
        this.createEditControlsComplete();
    },
    toString: function() {
        return "GwtListEditInternalType";
    }
});;