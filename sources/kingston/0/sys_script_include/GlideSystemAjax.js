var GlideSystemAjax = Class.create();
GlideSystemAjax.PROPERTY_NAME='sysparm_property';

GlideSystemAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    isPublic: function() {
        return true;
    },

    process: function() {      
        if (this[this.getName()])
            return this[this.getName()]();
    },

    newGuid: function() {
        return gs.generateGUID('');
    },

    cacheFlush: function() {
        if ( gs.hasRole("admin") )
            gs.cacheFlush();
    },

    isLoggedIn: function() {
        return gs.isLoggedIn();
    },
  
    type: "GlideSystemAjax"
});