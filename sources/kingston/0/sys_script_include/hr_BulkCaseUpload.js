var hr_BulkCaseUpload = Class.create();
hr_BulkCaseUpload.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    type: 'hr_BulkCaseUpload',
	
	uploadOperation: function(firstHeader, searchList) {
		var tracker = GlideExecutionTracker.getLastRunning();
        tracker.run();
		if (searchList.length != 0) 
			searchList = searchList.split(",");
		else 
			searchList = [];
		
		var bulkCaseRunGR = new GlideRecord("sn_hr_core_bulk_case_creation_run");
		var bulkCaseDataGR = new GlideRecord("sn_hr_core_bulk_case_creation_data");
		
		var userFound = 0;
		var userNotFound = 0;
		var foundList = [];
		// create a new record for bulk case run table
		bulkCaseRunGR.initialize();
		var bulkCaseRunSysID = bulkCaseRunGR.sys_id;
		var bulkCaseRunNumber = bulkCaseRunGR.number;
			bulkCaseRunGR.insert();
		
		var timeStartStr = this._currentDateGenerateTimeStr();
		
		//search and import uploaded data to bulk case data table
		var currentList = [];
		var totalRecords = searchList.length;
		if (firstHeader == "user_name") {
			for (var i = 0; i < totalRecords; i++) {

				if (totalRecords < 100) {
					//determine how many percent to increment for each interval
					var intervalPercentPro = Math.floor(100 / totalRecords);
					tracker.incrementPercentComplete(intervalPercentPro);
				} else {
					//determine number of things for one percent
					var onePercentIntervalPro = Math.floor(totalRecords / 100);
					if (i % onePercentIntervalPro == 0) 
						//increment one percent more
						tracker.incrementPercentComplete(1);
				}
				
				var cur = searchList[i];
				bulkCaseDataGR.initialize();
				bulkCaseDataGR.bulk_case_creation_run = bulkCaseRunSysID;
				bulkCaseDataGR.user_name = cur;
				var sysUserGR = new GlideRecord("sys_user");
				sysUserGR.addQuery("user_name", cur);
				sysUserGR.query();
				
				if (sysUserGR.next()) {
					bulkCaseDataGR.user = sysUserGR.sys_id;
					bulkCaseDataGR.email = sysUserGR.email;
					if (currentList.indexOf(cur) == -1) {
						userFound++;
						bulkCaseDataGR.query_result = "Found";
						foundList.push(sysUserGR.sys_id);
					} else 
						bulkCaseDataGR.query_result = "Found & Duplicate";
				} else {
					userNotFound++;
					bulkCaseDataGR.query_result = "Not found";
					if (currentList.indexOf(cur) != -1)
						bulkCaseDataGR.query_result = "Not found & Duplicate";
				}
				currentList.push(cur);
					bulkCaseDataGR.insert();
			}
		} else if (firstHeader == "email") {
			for (var i = 0; i < totalRecords; i++) {
		
			if (totalRecords < 100) {
				//determine how many percent to increment for each interval
				var intervalPercentPro = Math.floor(100 / totalRecords);
				tracker.incrementPercentComplete(intervalPercentPro);
			} else {
				//determine number of things for one percent
				var onePercentIntervalPro = Math.floor(totalRecords / 100);
				if (i % onePercentIntervalPro == 0) 
					//increment one percent more
					tracker.incrementPercentComplete(1);
			}

				var cur = searchList[i];
				bulkCaseDataGR.initialize();
				bulkCaseDataGR.bulk_case_creation_run = bulkCaseRunSysID;
				bulkCaseDataGR.email = cur;
				var sysUserGR = new GlideRecord("sys_user");
				sysUserGR.addQuery("email", cur);
				sysUserGR.query();
				
				if (sysUserGR.next()) {
					bulkCaseDataGR.user = sysUserGR.sys_id;
					bulkCaseDataGR.user_name = sysUserGR.user_name;
					if (currentList.indexOf(cur) == -1) {
						userFound++;
						bulkCaseDataGR.query_result = "Found";
						foundList.push(sysUserGR.sys_id);
					} else 
						bulkCaseDataGR.query_result = "Found & Duplicate";
				} else {
					userNotFound++;
					bulkCaseDataGR.query_result = "Not found";
					if (currentList.indexOf(cur) != -1)
						bulkCaseDataGR.query_result = "Not found & Duplicate";
				}
				currentList.push(cur);
					bulkCaseDataGR.insert();
			}
		}
	
		var timeEndStr = this._currentDateGenerateTimeStr();
		
		bulkCaseRunGR.addQuery("sys_id", bulkCaseRunSysID);
		bulkCaseRunGR.query();
		if (bulkCaseRunGR.next()) {
			bulkCaseRunGR.total_records = totalRecords;
			bulkCaseRunGR.user_found = userFound;
			bulkCaseRunGR.user_not_found = userNotFound;
		}
			bulkCaseRunGR.update();
		
		var url = "/sn_hr_core_bulk_case_creation_data" + "_list?sysparm_query=sys_created_on>="+timeStartStr+"^sys_created_by="+gs.getUserName()+"^sys_created_on<="+timeEndStr+"&sysparm_domain_restore=false&sysparm_stack=no";
		
		var encodedQuery = "";
		for (var i = 0; i < foundList.length; i++) {
			if (i == foundList.length - 1)
				encodedQuery += "sys_id=" + foundList[i] + "^EQ";
			else 
				encodedQuery += "sys_id=" + foundList[i] + "^OR";
		}
		
        tracker.updateResult({
            recordCount: totalRecords,
			bulkCaseRunID: bulkCaseRunSysID,
            url: url,
			userFound: userFound,
			userNotFound: userNotFound,
			encodedQuery: encodedQuery
        });
    },
	
	//Used in encoded query generation for time comparison
	_currentDateGenerateTimeStr: function(){
		var currentTime = new GlideDateTime();
		currentTime= currentTime.getDisplayValueInternal().toString();
		currentTime= currentTime.split(" ");
		var date = currentTime[0];
		var time = currentTime[1];
		return "javascript:gs.dateGenerate('"+date+"','"+time+"')";
	}

});