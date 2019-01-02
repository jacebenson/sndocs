var cxs_WizardVarTypes = Class.create();
cxs_WizardVarTypes.prototype = {
    // WIDE_SINGLELINE_TEXT: "16"
    // MULTILINE_TEXT: "2"
    // SINGLELINE_TEXT: "6"
    _TYPE_MAP: {
        "2": true,
        "6": true,
        "16": true
    },

    _TYPE_ARRAY: [ "2", "6", "16" ],

    process: function() {
        return this._TYPE_ARRAY;
    },

    getTypeMap: function() {
        return this._TYPE_MAP;
    },

    isValid: function(variableType) {
        return this._TYPE_MAP[variableType + ""] ? true : false;
    },

    type: 'cxs_WizardVarTypes'
}