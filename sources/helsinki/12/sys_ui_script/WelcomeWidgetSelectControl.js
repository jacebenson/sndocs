var WelcomeWidgetSelectControl = Class.create();

WelcomeWidgetSelectControl.prototype = {

    /**
     * Pass in the id of the span 
     * The select list must be in <id>_select
     */    
    initialize: function(span_name, roles, fillFunction, changeFunction) {
	this.span = gel(span_name);
	this.select = gel(span_name + "_select");
        this.fRoles = new Object();
        var ra = roles.split(",");
        for (var i = 0; i < ra.length; i++) {
            var r = ra[i];
            this.fRoles[r] = true;
        }
        this.fillFunction = fillFunction;
        this.changeFunction = changeFunction;
        this.onlyIfChoices = false;
        this.reloadOnChange = true;
		this.fillWidget();
    
        hideObject(this.span);

        CustomEvent.observe('user.login', this.updateWidgetForLogin.bind(this));
        CustomEvent.observe('user.logout', this.updateWidgetForLogout.bind(this));
    },

    /**
     * Logout handler
     */
    updateWidgetForLogout: function(user) {
        hideObject(this.span);
    },

    /**
     * Login handler
     */
    updateWidgetForLogin: function(user) {
        var roles = user.getRoles();

        // If logged out, hide the widget
        if (roles.length == 0) {
            hideObject(this.span);
            return;
        }
        
        var hide = true;
        for (var i = 0; i < roles.length; i++) {
            var crole = roles[i];
            if (crole == 'admin' || this.fRoles[crole]) {
                hide = false;
                break;
            }
        }
  
        if (hide) {
            hideObject(this.span);
            return;
        }
    
        // Show the picker and get the current setting
        if (this.onlyIfChoices == false) {
           showObjectInline(this.span);
           showObjectInline(gel("select_toggle"));
        }

        this.fillWidget();
    },

    /**
     * Fill the select box with the available domains
     */
    fillWidget: function() {
        var ga = new GlideAjax('UIPage');
        ga.addParam('sysparm_name','fillWidget');
        ga.addParam('sysparm_function_select',this.fillFunction);
        ga.getXML(this.fillWidgetResponse.bind(this));
    },

    fillWidgetResponse: function(response) {
        var opt;
        var xml = response.responseXML;
        var e = xml.getElementsByTagName("choice_list_set")[0];
        var currentChoice = null;
        if (e) {
           currentChoice = e.getAttribute("currentDomainId"); // domain uses this attribute
           if (currentChoice == null)
              currentChoice = e.getAttribute("currentChoice"); // rest of the world uses this attribute for the current choice
        }

        // Remove any existing options
        for (var i = this.select.length - 1; i > -1; i--)
            this.select.remove(i);

        var items = xml.getElementsByTagName("choice");
        if (this.onlyIfChoices && items.length < 2) {
            hideObject(this.span);
            return;
        }

        if (items.length == 0)
            return;
    
        // loop through item elements, and add each domain
        found = false;
        
        // Do we have max characters set?
        if (GlideManager.get().hasProperty('glide.ui.nav.stripe.select.maxchars'))
          var maxChars = parseInt(GlideManager.get().getProperty('glide.ui.nav.stripe.select.maxchars'), 10);

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var selected = (item.getAttribute("value") == currentChoice);
            var orig = item.getAttribute('label');
            var label = maxChars && orig.length > maxChars ? orig.substring(0, maxChars) + ' ...' : orig;

            opt = addOption(this.select, item.getAttribute('value'), label, selected, orig);
            opt.setAttribute('data-label', orig);
            if (selected)
                found = true;
        }

        if (!found && currentChoice != null && currentChoice != '') {
            // Add the current domain at the top of the list since it does not exist
            opt = addOptionAt(this.select, currentChoice, currentChoice, 0);
            opt.setAttribute('data-label', currentChoice);
            this.select.selectedIndex = 0;
        }

        if (this.onlyIfChoices)
           showObjectInline(this.span);
    },

    changeChoice: function() {
        var o = this.select.options[this.select.selectedIndex];
        var ga = new GlideAjax('UIPage');
        ga.addParam('sysparm_name','changeChoice');
        ga.addParam('sysparm_function_select',this.changeFunction);
        ga.addParam('sysparm_value',o.value);
        ga.getXML(this.changeChoiceResponse.bind(this));
    },

    changeChoiceResponse: function(response) {
        // refresh the gsft_main page in case the choice selected changes the data displayed
        if (!this.reloadOnChange)
           return;

        var win = getMainWindow();
        reloadWindow(win);
        refreshNav();
    },

    // true means only show the widget if there are 2 or more choices
    showOnlyIfChoices: function(onlyIfChoices) {
        this.onlyIfChoices = onlyIfChoices;   
    },

    // reload main iframe when a different choice is selected
    reloadOnChoiceChange: function(reloadOnChange) {
        this.reloadOnChange = reloadOnChange;  
    }
};