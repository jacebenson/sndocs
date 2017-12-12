var IndicatorTags = Class.create();
IndicatorTags.prototype = {
    initialize: function() {
		this._log = (new GSLog(IndicatorTags.LOG_LEVEL_PROPERTY, this.type)).setLog4J();
    },

	/**
     * getTag(label): Returns a GlideRecord representation of the appropriate Indicator Group.
     *
     * Searches for and creates if required.
     */
    getTag: function(label) {
        // Should this also update the usage counts?
        var tag = new GlideRecord("pa_tags");
        tag.addQuery("label", label);
        tag.query();

        if (!tag.next()) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[getTag] Creating new Indicator Group: " + label);

            tag.initialize();
            tag.label = label;
			if (!tag.canCreate()) {
				if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[getTag] Insufficient access to read Indicator Group: " + label);
				return null;
			}
            tag.insert();
        } else if (!tag.canRead()) {
			if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[getTag] Insufficient access to read Indicator Group: " + label);
			return null;
		}

        return tag;
    },

    /**
     * getIndicatorTags(indicatorId): Returns a GlideRecord containing all of the indicator Indicator Group
     *                          references for the given indicator.
     */
    getIndicatorTags: function(indicatorId) {

        var tags = new GlideRecord("pa_m2m_indicator_tags");
        tags.addQuery("indicator", indicatorId);
        tags.orderBy("sys_created_on");
        tags.query();

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[getIndicatorTags] Found: " + tags.getRowCount() + " tags");

        return tags;
    },

    /**
     * addIndicatorTag(label,indicatorId): Adds a Indicator Group to a indicator and returns a GlideRecord containing,
     *                              and set to, the indicator Indicator Group added.
     */
    addIndicatorTag: function(label, indicatorId) {
        label = label + "";
        if (label.length < 2)
            return null;

        var tag = this.getTag(label);
		
		if (JSUtil.nil(tag))
			return null;

        var indicatorTag = new GlideRecord("pa_m2m_indicator_tags");
        indicatorTag.addQuery("indicator", indicatorId);
        indicatorTag.addQuery("tag", tag.sys_id);
        indicatorTag.query();

        if (!indicatorTag.next()) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[addIndicatorTag] Adding Indicator Group " + label + " to " + indicatorId);

            indicatorTag.newRecord();
            indicatorTag.indicator = indicatorId;
            indicatorTag.tag = tag.sys_id;
			
			if (!indicatorTag.canCreate()) {
				if (this._log.atLevel(GSLog.DEBUG))
                	this._log.debug("[addIndicatorTag] Insufficient access to Add Indicator Groups " + label + " to " + indicatorId);
				return null;
			}
			
            indicatorTag.insert();
            return indicatorTag;
        }

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[addIndicatorTag] Duplicate Indicator Group "+ label +" found for indicator " + indicatorId + " Ignoring.");
        return null;
    },


    /**
     * removeIndicatorTag(sysId): Removed the indicator Indicator Group association represented by sysId
     */
    removeIndicatorTag:function(sysId) {
        if (JSUtil.nil(sysId)) {
            this._log.debug("[removeIndicatorTag] No sysid provided");
            return false;
        }

        var tags = new GlideRecord("pa_m2m_indicator_tags");
        if (!tags.get(sysId)) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[removeIndicatorTag] Indicator Group relationship [" + sysId + "] not found");
            
        } else if (!tags.canDelete()) {
			if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[removeIndicatorTag] insufficient access to delete Indicator Group relationship [" + sysId + "]");
			return false;
		}

        tags.deleteRecord();
        return true;
    },

	
    type: 'IndicatorTags'
};
	
IndicatorTags.LOG_LEVEL_PROPERTY = "com.snc.pa.indicator_tags.log";