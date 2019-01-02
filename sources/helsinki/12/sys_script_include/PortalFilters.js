var PortalFilters = (function() {
	var pub = {};

	function join(table, element, value) {
		var joinedRecords = new GlideRecord(table);
		joinedRecords.addQuery(element, value);
		return joinedRecords;
	}
	
	pub.getJoinFilter = function(table, element, value, reference_element, sub_query) {
		if (gs.nil(reference_element)) {
			reference_element='sys_id';
		}
		var ids = [];
		ids.push('0');
		var joinedRecords = join(table, element, value)
		//joinedRecords.addEncodedQuery(sub_query);
		joinedRecords.query();
		while (joinedRecords.next())
			ids.push(joinedRecords.getValue(reference_element).toString());
		return ids;
	}

	pub.myApprovals = function(approver_id) {
		return pub.getJoinFilter('sysapproval_approver', 'approver', approver_id, 'sysapproval', '');
	}
	
	pub.myContracts = function() {
		return pub.getJoinFilter('clm_m2m_contract_user', 'user', gs.getUserID(), 'contract', 'added<'+gs.daysAgoStart(0) + '^removed>' + gs.daysAgoEnd(0));
	}
	
	pub.myOperatorGroups = function(elName) {
		var parentGroup = 'ca95510737253000f5bf1f23dfbe5d87';	//Virtual Provisioning Cloud Operators
		var gr = join('sys_user_grmember', 'user', gs.getUserID());
		gr.addQuery('group.parent', parentGroup);
		gr.query();
		var myGroups = [];
		while (gr.next()) {
			myGroups.push(gr.group[elName]);
		}
		return myGroups;
	}
		
	pub.myGroupSLAs = function(elName) {
		var parentGroup = 'ca95510737253000f5bf1f23dfbe5d87';	//Virtual Provisioning Cloud Operators
		var gr = new GlideRecord('sys_user_grmember');
        gr.addQuery('user', gs.getUserID());
		gr.addQuery('group.parent', parentGroup);
		gr.query();
		var myGroups = [];
		while (gr.next())
			myGroups.push('assignment_group=' + gr.group['sys_id'] + '^EQ');

		var mySLAGroups = [];
		var slaGr = new GlideRecord('contract_sla');
		slaGr.addQuery('start_condition', 'IN', myGroups);
		slaGr.query();
		
		while (slaGr.next())
			mySLAGroups.push(''+ slaGr[elName]);
		
		return mySLAGroups;
	}

	pub.countDaysUntilRefresh = function(assetType) {
	    var MS_PER_DAY = 1000 * 60 * 60 * 24;
	    var asset = new GlideRecord('alm_asset');
	    asset.addQuery('assigned_to', gs.getUserID());
	    asset.addQuery('install_status', 'NOT IN', '7,8' );
	    asset.addQuery('model_category.name', 'CONTAINS', assetType == 'pc' ? 'Computer' : 'Phone');
	    asset.query();
	    return getRefreshDays( asset );
	  
	
	    function getRefreshDays(asset) {
	        var MAX_CNT = 999999;
	        var days = MAX_CNT;
	        while (asset.next()) {
	            var dat = asset.retirement_date;
	            if (gs.nil(dat)) 
	                 continue;
	            
	            var dayCount = computeDays(dat);
	            if (dayCount < days)
	                days = dayCount;
	        }
	        return days === MAX_CNT ? 0 : days+'';
	    }
	
	    function computeDays(dat) {
	        dat = new GlideDateTime(dat + ' 23:59:59');
	        var ofs = dat.getNumericValue();
	        var now = new GlideDateTime(new GlideDate()+' 00:00:00').getNumericValue();
	        var days = ofs - now;
	        days = (days++) / MS_PER_DAY;
	        return days < 0 ? 0 : Math.round(days);
	    }
	}
	
	
	pub.needsMyApproval = function(item) {
		var approvals = new GlideRecord('sysapproval_approver');
		approvals.addQuery('sysapproval', item.sys_id);
		approvals.addQuery('approver', gs.getUserID());
		approvals.addQuery('state', 'requested');
		approvals.query();
		return approvals.next();
	}
	
	return pub;
}());