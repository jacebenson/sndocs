var sc_BaseFactory = Class.create();
sc_BaseFactory.prototype = {
    initialize: function() {
        this._log = (new GSLog(sc_.LOG_LEVEL, this.type)).setLog4J();

        // Default Class Registrations
        this.registerClass(sc_.SCRIPTABLE_ORDER_GUIDE_FAILURE, sc_ScriptableOrderGuideFailure);
		this.registerClass(sc_.CATEGORY, sc_Category);
    },

    /**
     * Registers a class against a table name
     */
    registerClass: function(tableName, clazz) {
        this._classMap[tableName + ""] = clazz;
    },

    /**
     * Wraps the provided GlideRecord in the defined wrapper class. Also passes
     * through any other parameters
     */
    wrap: function() {
        // For this to work we need to get rid of the automatic boostrap for the object
        // clone everything else, then create the object and call the constructor manually
        var cln = function() {};
        cln.prototype = {};
        var source = this.getWrapperClass(arguments[0].getTableName());
        for (var property in source.prototype)
            cln.prototype[property] = source.prototype[property];
        var wrapped = new cln();
        wrapped.initialize.apply(wrapped, arguments);
        return wrapped;
    },

    /**
     * Manages the defererencing of wrapper classes based on table name
     */
    getWrapperClass: function(tableName) {
        tableName += "";

        var parentList = (new TableUtils(tableName)).getTables();

        for (var i = 0; i < parentList.size(); i++) {
            var clazz = this._classMap[parentList.get(i) + ""];
            if (clazz !== "undefined") {
                if (this._log.atLevel(GSLog.DEBUG))
                    this._log.debug("[getWrapperClass] Returning class " + clazz.prototype.type + " for table " + tableName);
                return clazz;
            }
        }

        this._log.error("[getWrapperClass] Unknown object type for <" + tableName + ">");
        throw new sc_FactoryException("[getWrapperClass] Unknown object type for <" + tableName + ">");
    },

    _classMap: {},

    type: 'sc_BaseFactory'
};

//Namespaced methods for wrap and getWrapperClass.
sc_BaseFactory.wrap = function() {
    var fact = new sc_BaseFactory();
    return fact.wrap.apply(fact,arguments);
};

sc_BaseFactory.getWrapperClass = function() {
    var fact = new sc_BaseFactory();
    return fact.getWrapperClass.apply(fact,arguments);
};