var IndicatorTagsAjax = Class.create();
IndicatorTagsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    initialize: function(request, responseXML, gc) {
        AbstractAjaxProcessor.prototype.initialize.call(this,request, responseXML, gc);
        this._log = (new GSLog(IndicatorTags.LOG_LEVEL_PROPERTY, this.type)).setLog4J();
    },

    /**
     * getIndicatorTags(): AJAX target for retrieving indicator tags for indicatorId in sysparm_indicatorid
     *
     * Will always return a result element with value "success" or "failure".  If failure the following
     * codes will be stored in a 'reason' attribute.
     *
     */
    getIndicatorTags: function() {
        var r = this.newItem("result");
        r.setAttribute("value","failure");

        var indicatorId = this.getParameter("sysparm_indicatorid");
        if (JSUtil.nil(indicatorId)) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[getIndicatorTags] Invalid indicatorId: " + indicatorId);

            r.setAttribute("reason","missing-data");
            return;
        }

        var tags = (new IndicatorTags()).getIndicatorTags(indicatorId);

        r.setAttribute("value","success");

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[getIndicatorTags] Indicator " + indicatorId + " has " + tags.getRowCount() + " tags");

        var tagInfo = [];

        while (tags.next()) {
			if (tags.canRead()) {
            	tagInfo.push({"label": tags.tag.getDisplayValue()+"",
                          	  "sys_id": tags.sys_id+""});
			}
        }

        return (new JSON()).encode(tagInfo);
    },

    /**
     * addIndicatorTag(): Adds the Indicator Group sysparm_label to the indicator syspatm_indicatorid 
     *
     * Will always return a result element with value "success" or "failure".  If failure the following
     * codes will be stored in a 'reason' attribute.
     *
     *     * missing-data
     *     * no-indicatortag
     */
    addIndicatorTag: function() {
        var r = this.newItem("result");
        r.setAttribute("value","failure");
        var label = this.getParameter("sysparm_label");
        var indicatorId = this.getParameter("sysparm_indicatorid");

        if (JSUtil.nil(label) || JSUtil.nil(indicatorId)) {
            r.setAttribute("reason","missing-data");
            return label + ":" + indicatorId;
        }

        var indicatorTag = (new IndicatorTags()).addIndicatorTag(label,indicatorId);

        // If no indicatorTag was returned then return without anything.
        if (JSUtil.nil(indicatorTag)){
            r.setAttribute("reason","no-indicatorTagornoaccessrights");
            return label + ":" + indicatorId;
        }

        r.setAttribute("value","success");
        return (new JSON()).encode({"label": indicatorTag.tag.getDisplayValue()+"",
                                    "sys_id": indicatorTag.sys_id+""});
    },

    /**
     * removeIndicatorTag(): Removes the Indicator Group sysparm_sysid
     *
     * Will always return a result element with value "success" or "failure".  If failure the following
     * codes will be stored in a 'reason' attribute.
     *
     *     * missing-data
     */
    removeIndicatorTag: function() {
        var r = this.newItem("result");
        r.setAttribute("value","failure");

        var sysId = this.getParameter("sysparm_sysid");

        if (JSUtil.nil(sysId)) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[removeIndicatorTags] Invalid Indicator Group [" + sysId + "]");

            r.setAttribute("value", "missing-data");
            return;
        }

        if ((new IndicatorTags()).removeIndicatorTag(sysId)) {
            r.setAttribute("value", "success");
        }

        return;
    },
	
	getTagId: function() {
		var r = this.newItem("result");
        r.setAttribute("value","failure");
		
		var tagName = this.getParameter("sysparm_tagname");

        if (JSUtil.nil(tagName)) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[getTagId] Invalid Indicator Group name [" + tagName + "]");

            r.setAttribute("value", "missing-data");
            return;
        }
		
		var tag = new GlideRecord("pa_tags");
		tag.addQuery("label", tagName);
		tag.query();
		
		var tagInfo;
		
		if (tag.next()) {
			if (tag.canRead()) {
				r.setAttribute("value","success");
				tagInfo = {"label": tag.label+"", "sys_id": tag.sys_id+""};
			}
		}
		
		return (new JSON()).encode(tagInfo);
	},

    type: 'IndicatorTagsAjax'
});