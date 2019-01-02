var ThemeChangerAjax = Class.create();

ThemeChangerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    process: function() {
        if (this.getType() == "setTheme")
            this.setTheme(this.getName());
    },
 
    setTheme: function(theme) {
        gs.getSession().putProperty('glide.css.theme', theme);
        u = gs.getUser();
        u.setPreference('glide.css.theme', theme);
        u.savePreferences();
    },

    type: "ThemeChangerAjax"
});