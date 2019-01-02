var SAMPTXCounter = Class.create();
SAMPTXCounter.prototype = {
	initialize: function() {
		this.isSAMPremiumEnabled=false;
		if(new GlidePluginManager().isActive("com.snc.samp")){
			this.isSAMPremiumEnabled=true;
		}
	},
	
	isSAMPEnable:function(){
		return this.isSAMPremiumEnabled;
	},
	
	getReclamationTXCountForThisYear:function(){
		var thisYearTxQuery = "sys_created_onONThis year@javascript:gs.beginningOfThisYear()@javascript:gs.endOfThisYear()";
		return this.getReclamationTXCount(thisYearTxQuery);
	},
	
	getReclamationTXCountForLast12Months:function(){
		var last12MonthsQuery = "sys_created_onONLast 12 months@javascript:gs.monthsAgoStart(12)@javascript:gs.endOfThisMonth()";
		return this.getReclamationTXCount(last12MonthsQuery);
	},
	
	getReclamationTXCountForLastMonth:function(){
		var lastMonthQuery = "sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()";
		return this.getReclamationTXCount(lastMonthQuery);
	},
	
	getReclamationTXCountForLast30Days:function(){
		var last30DaysQuery = "sys_created_onBETWEENjavascript:gs.daysAgoStart(30)@javascript:gs.daysAgoEnd(1)";
		return this.getReclamationTXCount(last30DaysQuery);
	},
	
	getReclamationTXCount:function(queryString){
		var count = 0;
		if(!this.isSAMPremiumEnabled){
			return count;
		}
		
		var sampTxGr = new GlideAggregate("samp_sw_reclamation_candidate");
		sampTxGr.addAggregate("COUNT");
		sampTxGr.addEncodedQuery(queryString);
		sampTxGr.addQuery("state", "15"); //Closed Complete state
		sampTxGr.query();
		sampTxGr.next();		
		// Each reclamation triggers CSD revoke SCCM application worklfow, which contains 2 Orchestration SCCM activities
        return (sampTxGr.getAggregate("COUNT") * 2);
	},
	
	getReclamationCICount:function(trackingDays){
		var count = 0;
		if(!this.isSAMPremiumEnabled){
			return count;
		}
		var reclamationCandidate = new GlideAggregate("samp_sw_reclamation_candidate");
		if(!reclamationCandidate.isValid()){
			return count;
		}
		reclamationCandidate.setGroup(false);
		reclamationCandidate.addAggregate("count(distinct", "cmdb_ci.sys_id"); //the dot walk is required since count distinct picks up the cmdb_ci.name which is not correct
		reclamationCandidate.addQuery("state", "15"); //Closed Complete state
		reclamationCandidate.addQuery('sys_updated_on', '>=', gs.daysAgoStart(trackingDays));
		reclamationCandidate.query();
		reclamationCandidate.next();
		count = reclamationCandidate.getAggregate("count(distinct", "cmdb_ci.sys_id");
		return count;
	},
	
	type: 'SAMP_Candidate'
};