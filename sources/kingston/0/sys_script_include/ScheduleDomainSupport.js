var ScheduleDomainSupport = Class.create();

ScheduleDomainSupport.prototype = {

	CMN_SCHEDULE: "cmn_schedule",
	CMN_SCHEDULE_SPAN: "cmn_schedule_span",
	CMN_OTHER_SCHEDULE: "cmn_other_schedule",
	CMN_TIMELINE_PAGE: "cmn_timeline_page",
	CMN_TIMELINE_PAGE_STYLE: "cmn_timeline_page_style",
	CMN_TIMELINE_SUB_ITEM: "cmn_timeline_sub_item",
	SCHEDULE: "schedule",
	PLUGIN_ID: "com.glide.schedules",
	SCHEDULE_LEVEL: "com.glide.schedules.log.level",

	initialize: function() {
		this.domainStructureUtil = new ScheduleDomainStructureUtil(this.SCHEDULE_LEVEL);
		this.log = new GSLog(this.SCHEDULE_LEVEL, this.type);
    },

	fixDomainSupport: function() {
		// Update cmn_schedule_span table to use domain_master
		this.domainStructureUtil.makeDomainMasterCompliant(this.CMN_SCHEDULE_SPAN, this.CMN_SCHEDULE, this.SCHEDULE, this.PLUGIN_ID, "update.domain_cmn_schedule_span");

		// Update cmn_other_schedule table to use domain_master
		this.domainStructureUtil.makeDomainMasterCompliant(this.CMN_OTHER_SCHEDULE, this.CMN_SCHEDULE, this.SCHEDULE, this.PLUGIN_ID, "update.domain_cmn_other_schedule");

		// Update cmn_timeline_page_style table to use domain_master
		this.domainStructureUtil.makeDomainMasterCompliant(this.CMN_TIMELINE_PAGE_STYLE, this.CMN_TIMELINE_PAGE, "timeline_page", this.PLUGIN_ID, "update.domain_cmn_timeline_page_style");

		// Update cmn_timeline_sub_item table to use domain_master
		this.domainStructureUtil.makeDomainMasterCompliant(this.CMN_TIMELINE_SUB_ITEM, this.CMN_TIMELINE_PAGE, "parent", this.PLUGIN_ID, "update.domain_cmn_timeline_sub_item");
	},

    type: 'ScheduleDomainSupport'
};