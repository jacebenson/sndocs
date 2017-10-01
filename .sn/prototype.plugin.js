/*! RESOURCE: /scripts/lib/glide_updates/prototype.plugin.js */
var Plugin = (function() {
    function create(name) {
        var args = $A(arguments);
        args.shift();
        var klass = function(argumentArray) {
            this.initialize.apply(this, argumentArray);
        };
        Object.extend(klass, Class.Methods);
        Object.extend(klass.prototype, args[0] || {});
        if (!klass.prototype.initialize)
            klass.prototype.initialize = Prototype.emptyFunction;
        klass.prototype.constructor = klass;
        var methods = {};
        methods[name] = function(elem) {
            new klass(arguments);
            return elem;
        }.bind(this);
        Element.addMethods(methods);
    };
    return {
        create: create
    };
})();;