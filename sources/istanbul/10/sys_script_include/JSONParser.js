/**
 * Parses JSON string to javascript object
 * 
 * tom.dilatush@service-now.com
 */

var JSONParser = Class.create();

JSONParser.prototype = {
    parse: function (source) {
        if (JSUtil.nil(source))
            return;

        return new SNC.JSONParse().decode(source);
    }
};