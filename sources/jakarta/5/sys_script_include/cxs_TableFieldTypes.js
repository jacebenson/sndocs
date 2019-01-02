var cxs_TableFieldTypes = Class.create();
cxs_TableFieldTypes.prototype = {
    _FIELD_TYPE_ARRAY: [ "string" ],
    _FIELD_TYPE_MAP: {
        "string": true
    },

    process: function() {
        return this._FIELD_TYPE_ARRAY;
    },

    isValid: function(fieldType) {
        return this._FIELD_TYPE_MAP[fieldType + ""] ? true : false;
    },

    type: 'cxs_TableFieldTypes'
}