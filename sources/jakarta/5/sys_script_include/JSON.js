gs.include("PrototypeServer");

var JSON = Class.create();
JSON.prototype = {
    indentFlag: false,
    indentLevel: 0,
    INDENT_SPACES: "  ",

    initialize: function() {

    },

    prettify: function() {
        this.indentFlag = true;
        this.indentLevel = 0;
    },

    startIndent: function(a) {
        if (this.indentLine(a, true))
            this.indentLevel++;
    },

    endIndent: function(a) {
        if (!this.indentFlag)
            return;

        this.indentLevel--;
        this.indentLine(a);
    },

    indentLine: function(a, skipNewLine) {
        if (!this.indentFlag)
            return false;

        if (!skipNewLine)
            a.push("\n");

        for (var i = 0; i < this.indentLevel; i++)
            a.push(this.INDENT_SPACES);

        return true;
    },

    pad: function(n) {
        return n < 10 ? "0" + n : n;
    },

    encodeString: function(s) {
        return '"' + GlideStringUtil.escapeNonPrintable(s) + '"';
    },

    encodeArray: function(o) {
        var a = [ "[" ];
        this.startIndent(a);
        var b;
        var i;
        var l = o.length;
        var v;
        for ( var i = 0; i < l; i += 1) {
            v = o[i];
            switch (typeof v) {
            case "undefined":
            case "function":
            case "unknown":
                break;
            default:
                if (b) {
                    a.push(',');
                }
                this.indentLine(a);
                a.push(v === null ? "null" : this.encode(v));
                b = true;
            }
        }
        this.endIndent(a);
        a.push("]");
        return a.join("");
    },

    getKeys: function(o) {
        var a = [];
        for ( var i in o) {
            a.push(i);
        }
        a.sort();
        return a;
    },

    encodeObject: function(o) {
        var a = [ "{" ];
        this.startIndent(a);
        var b;
        var i;
        var v;
        var keys = this.getKeys(o);
        for ( var i = 0; i < keys.length; i++) {
            if (o.hasOwnProperty(keys[i])) {
                v = o[keys[i]];

                switch (typeof v) {
                case "undefined":
                case "function":
                case "unknown":
                    break;
                default:
                    if (b) {
                        a.push(',');
                    }
                    this.indentLine(a);
                    a.push(this.encode(keys[i]), ":", v === null ? "null" : this.encode(v));
                    b = true;
                }
            }
        }

        this.endIndent(a);
        a.push("}");
        return a.join("");
    },

    encodeDate: function(o) {
        return '"' + o.getFullYear() + "-" + this.pad(o.getMonth() + 1) + "-" + this.pad(o.getDate()) + "T"
                + this.pad(o.getHours()) + ":" + this.pad(o.getMinutes()) + ":" + this.pad(o.getSeconds()) + '"';
    },

    encode: function(o) {
        if (typeof o == "undefined" || o === null) {
            return "null";
        } else if (o instanceof Array) {
            return this.encodeArray(o);
        } else if (o instanceof Date) {
            return this.encodeDate(o);
        } else if (typeof o == "string" || o instanceof String) {
            return this.encodeString(o);
        } else if (typeof o == "number" || o instanceof Number) {
            return isFinite(o) ? String(o) : "null";
        } else if (typeof o == "boolean" || o instanceof Boolean) {
            return String(o);
        } else {
            return this.encodeObject(o);
        }
    },

    decode: function(source) {
        return new SNC.JSONParse().decode(source);
    },

    type: "JSON"
};

/**
 * Proxies calls to the ES5 JSON object, named NativeJSON in the global scope.
 */
JSON.parse = function(text, reviver) {
	return NativeJSON.parse.apply(NativeJSON, arguments);
};

/**
 * Proxies calls to the ES5 JSON object, named NativeJSON in the global scope.
 */
JSON.stringify = function(value, replacer, space) {
	return NativeJSON.stringify.apply(NativeJSON, arguments);
};
