var sc_ic_SectionAJAX = Class.create();
sc_ic_SectionAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getNextPosition : function() {		
		var itemStagingSysId = this.getParameter("sysparm_sc_ic_item_staging");

		return sc_ic_Factory.getWrapperClass(sc_ic.SECTION).getNextPosition(itemStagingSysId, /* Display value */ true);		
	},

	getNextQuestionOrderNumber : function() {		
		var sectionSysId = this.getParameter("sysparm_sc_ic_section");
		if (JSUtil.nil(sectionSysId))
			return 1;
		
		var sectionGr = new GlideRecord(sc_ic.SECTION);
		if (!sectionGr.get(sectionSysId))
			return 1;

		return sc_ic_Factory.wrap(sectionGr).getNextQuestionOrderNumber();		
	},

	isPublic: function() {
		return false;
	},

    type: 'sc_ic_SectionAJAX'
});