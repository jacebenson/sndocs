	//
    // THIS CODE IS USED WITHIN THE INDICATOR FORMS TO
    // SELECT TAGS aka INDICATOR GROUPS
    //

    var IndicatorTagControl = Class.create({
    initialize: function(container,indicatorId) {
        this.container = container;
        this.indicatorId = indicatorId;

        var fldCol = document.createElement("div");
        fldCol.className = "input-group-transparent";

        var searchIcon = document.createElement("span");
		Element.extend(searchIcon);
        searchIcon.addClassName("input-group-addon-transparent");
        searchIcon.addClassName("icon-search");

        var refComp = document.createElement("input");
        Element.extend(refComp);
		refComp.setAttribute("type", "search");
 		refComp.setAttribute("data-ref-dynamic", "true");
        refComp.addClassName("indicatortag_complete");
        refComp.addClassName("form-control");
        refComp.addClassName("form-control-search");
        refComp.id="indicatortag_complete";
        refComp.autocomplete="off";
        refComp.maxlength="40";
        refComp.placeholder = IndicatorTagControl.FLD_MSG;
        refComp.tabindex="-1";

        this.refComp = refComp;

        var refCompHid = document.createElement("input");
        Element.extend(refCompHid);
        refCompHid.type = "hidden";
        refCompHid.id = refComp.id+"_hidden";

        fldCol.appendChild(refComp);
        fldCol.appendChild(searchIcon);
        fldCol.appendChild(refCompHid);

        //Keep a reference to the container for the tags
        this.tagCol = document.createElement("div");
        this.tagCol.className = "indicatortag_tags";
        
        var tagClear = document.createElement("div");
        tagClear.className = "indicatortag_clear";

        // Build the top Indicator Group bar
        this.container.appendChild(fldCol);
        this.container.appendChild(this.tagCol);
        this.container.appendChild(tagClear);
        
        // Add the AJAX completer to the element.  Do this after it's in the DOM
        var completer = new AJAXReferenceCompleter(refComp, refComp.id+'_hidden', 'null', '', 'pa_tags');
        completer.enterSubmits = false;
        refComp.ac.enterSubmits = false;

        // Unregister old event handlers
        refComp.stopObserving("keypress");
        refComp.stopObserving("keydown");
		refComp.stopObserving("focus");
        refComp.stopObserving("blur");
       
        // Register new event handlers
        refComp.observe("keypress",this._keyPress.bind(this));
        refComp.observe("keydown",this._keyDown.bind(this));
		refComp.observe("focus", this._focus.bind(this));
        refComp.observe("blur", this._blur.bind(this));

        this._loadTags();
    },
    
    // Wrapper for keydown event handler
    _keyDown: function(event) {
        acReferenceKeyDown(this.refComp, event);
    },

    // Wrapper for keypress event handler
    _keyPress: function(event) {

        // Ref completer handler first
        acReferenceKeyPress(this.refComp, event);
        
        if (event.keyCode == Event.KEY_RETURN) {
            if (this._addTag()) {
                this.refComp.clear();
				this.refComp.placeholder = '';
                this.refComp.ac.clearKeyValue();
            }

            Event.stop(event);
        }
    },

    _focus: function(event) {
        if (this.refComp._cleared)
            return;
		
        this.refComp.clear();
		this.refComp.placeholder = '';
        this.refComp._cleared = true;
    },
    _blur: function(event) {
        this.refComp.placeholder = IndicatorTagControl.FLD_MSG;
        this.refComp._cleared = false;
        Event.stop(event);
    },

    _loadTags: function() {
        var tagAjax = new GlideAjax("IndicatorTagsAjax");
        tagAjax.addParam("sysparm_name", "getIndicatorTags");
        tagAjax.addParam("sysparm_indicatorid", this.indicatorId);
        
        tagAjax.getXML(this._loadTagsCallback.bind(this));
    },

    _loadTagsCallback: function(response) {
        var resp = response.responseXML.getElementsByTagName("result");

        if (resp[0].getAttribute("value") != "success")
            return;

        var jsonStr = response.responseXML.documentElement.getAttribute("answer");
        var tagData = jsonStr.evalJSON();

        for (var i = 0; i < tagData.length; i++) {
            this.tagCol.appendChild((new IndicatorTag(tagData[i].label,tagData[i].sys_id)).getTagElement());
        }
    },

    _addTag: function() {
        var label = this.refComp.value;

        //Check we have a reasonable value
        if (label.length < 2) {
            alert("Indicator Groups must be 2 or more characters");
            return false;
        }

        //Send of the AJAX to see if it can add the Indicator Group
        var tagsAjax = new GlideAjax("IndicatorTagsAjax");
        tagsAjax.addParam("sysparm_name", "addIndicatorTag");
        tagsAjax.addParam("sysparm_indicatorid", this.indicatorId);
        tagsAjax.addParam("sysparm_label", label);
        
        tagsAjax.getXML(this._addTagCallback.bind(this));
        return true;
    },

    _addTagCallback: function(response) {
        var resp = response.responseXML.getElementsByTagName("result");

        if (resp[0].getAttribute("value") != "success")
            return;

        var jsonStr = response.responseXML.documentElement.getAttribute("answer");
        var tagData = jsonStr.evalJSON();

        this.tagCol.appendChild((new IndicatorTag(tagData.label,tagData.sys_id)).getTagElement());
    },

    type: "IndicatorTagControl"
});

IndicatorTagControl.FLD_MSG="Add Indicator Groups";

/**
 * IndicatorTag
 * Represents a Indicator Group that has been assigned to the record
 *
 * Handles it's own deletion but not creation as Indicator Group creation is handled via the above class.
 */
var IndicatorTag = Class.create({
    initialize: function(label, sys_id) {
        this.sys_id = sys_id;
        this.label = label;
    },

    /**
     * removeTag(event): AJAX handler for removing this Indicator Group
     */
    removeTag: function(event) {
       // Create AJAX request that removes the Indicator Group.
       var tagAjax = new GlideAjax("IndicatorTagsAjax");
       tagAjax.addParam("sysparm_name","removeIndicatorTag");
       tagAjax.addParam("sysparm_sysid",this.sys_id);
       tagAjax.getXML(this.removeTagCallback.bind(this));
    },

    /**
     *removeTagCallback(response): AJAX calback method for removing this Indicator Group
     */
    removeTagCallback: function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var resp = response.responseXML.getElementsByTagName("result");
        if (resp[0].getAttribute("value") != "success") {
            alert("Failed to remove Indicator Group. Already Removed?");
            return;
        }

        this._tagEl.remove();
    },

    /**
     * getTagElememt(): Returns a configured dom element for the Indicator Group
     */
    getTagElement: function() {
        var tagEl = document.createElement("div");
        Element.extend(tagEl);
        tagEl.addClassName("indicatortag_control_tag");
        tagEl.id = "tag:" + this.sys_id;

        var tagLabel = document.createElement("span");
        Element.extend(tagLabel);
        tagLabel.addClassName("indicatortag_tag_name");
        tagLabel.appendChild(document.createTextNode(this.label));
        
        tagEl.appendChild(tagLabel);

        var tagRm = document.createElement("a");
        Element.extend(tagRm);
        tagRm.addClassName("indicatortag_delete_button");
        tagRm.appendChild(document.createTextNode('x'));
        
        // Bind this object to a click on the X remove Indicator Group
        tagRm.observe("click", this.removeTag.bind(this));
        tagEl.appendChild(tagRm);

        // Cleaner than assigning at the beginning.
        this._tagEl = tagEl;
        return this._tagEl;
    },

    type: "IndicatorTag"
});