updateStats();


function updateStats() { 
   var gl = new GSLog("com.glide.report", "report-stats"); 
	
   //get properties
   var maxUsersXProperty = gs.getProperty('glide.report.log.max_user_executions_x_report', 10);
   gl.logDebug('glide.report.log.max_user_executions_x_report = ' + maxUsersXProperty);
   var recentNumberOfExecutions = gs.getProperty('glide.report.recent_executions_number', 25);
   gl.logDebug('glide.report.recent_executions_number = ' + recentNumberOfExecutions);
   
   var reportSysId = event.instance;
   var userSysId = event.user_id;
   var executionTimestamp = event.sys_created_on;
   var executionDuration = event.parm1;
	
   // homepage and widget sys id are passed in parm2 as <homepage>/<widget>	
   var parm2 = (event.parm2) ? event.parm2.split('/') : [];
   var homepageSysId = (parm2.length > 0) ? parm2[0] : null;   
   var widgetSysId = (parm2.length > 1) ? parm2[1] : null;
   var isReportStat = (widgetSysId == null || widgetSysId.toString().length == 0);
	
   gl.logDebug('reportSysId = ' + reportSysId);
   gl.logDebug('widgetSysId = ' + widgetSysId);
   gl.logDebug('isReportStat = ' + isReportStat);
   gl.logDebug('homepageSysId = ' + homepageSysId);
   gl.logDebug('userSysId = ' + userSysId);
   gl.logDebug('executionDuration = ' + executionDuration);   
   gl.logDebug('executionTimestamp = ' + executionTimestamp);   

	//check that widget_sys_id exists and if not and we are trying to save statistics for a widget then exit
	var widgetFieldExistStats = GlideTableDescriptor.fieldExists('report_stats','widget_sys_id');
	var widgetFieldExistStatsExecutions = GlideTableDescriptor.fieldExists('report_stats_executions','widget_sys_id');
	gl.logDebug('widgetFieldExistStats = ' + widgetFieldExistStats);   
	gl.logDebug('widgetFieldExistStatsExecutions = ' + widgetFieldExistStatsExecutions);   
	
	if (!isReportStat && (!widgetFieldExistStats || !widgetFieldExistStatsExecutions))
		return; //we don't log the execution for a pa widget as we still don't have the column in the db

   var grReportStat = new GlideRecord("report_stats");
   if (isReportStat)
	   grReportStat.addQuery('report_sys_id', reportSysId);
   else
	   grReportStat.addQuery('widget_sys_id', widgetSysId);
   grReportStat.query();
	
   if (grReportStat.next()) {
	   
	   gl.logDebug('stats exists... lets check if execution exists.');
	   
	   if (isReportStat) {
		   var grExecution = new GlideRecord("report_executions");
		   grExecution.addQuery('report_sys_id', reportSysId);
		   grExecution.addQuery('user_sys_id', userSysId);
		   grExecution.query();
		   if (grExecution.next()) {
			   grExecution.setValue('homepage_sys_id', homepageSysId);
			   grExecution.setValue('execution_duration', executionDuration);
			   grExecution.execution_timestamp = executionTimestamp;
			   grExecution.update();
		   } else {
			   gl.logDebug('execution doesn\'t exists');
			   // check that we haven't reach the max num of users and delete if necessary
			   checkAndDeleteRows(reportSysId, widgetSysId, isReportStat, maxUsersXProperty, "report_executions");

			   // create new report execution
			   createNewReportExecution(reportSysId, userSysId, homepageSysId, executionDuration, executionTimestamp);
		   }
	   }
	   
	   gl.logDebug('... now lets update average execution duration');
	   
	   var totalDuration = parseInt(grReportStat.getValue('total_executions_duration')) + parseInt(executionDuration);
	   gl.logDebug('new totalDuration = ' + totalDuration);
	   
	   var totalNumberOfExecutions = parseInt(grReportStat.getValue('number_executions_total')) + 1;	   
	   gl.logDebug('new totalNumberOfExecutions = ' + totalNumberOfExecutions);
	   
	   var averageExecutionDuration = totalDuration / totalNumberOfExecutions;
	   gl.logDebug('new averageExecutionDuration = ' + averageExecutionDuration);
	   
	   grReportStat.setValue('number_executions_total', totalNumberOfExecutions);
	  
	   //recent execution stats
	   gl.logDebug('Recent execution stats');
	   //check that we haven't reach the recent exec counter and delete if necessary
	   checkAndDeleteRows(reportSysId, widgetSysId, isReportStat, recentNumberOfExecutions, "report_stats_executions");     
	   //create new report execution
	   createNewReportStatsExecution(reportSysId, widgetSysId, isReportStat, homepageSysId, executionDuration, executionTimestamp);
	    
	   var recentExecutionDuration = 0;
	   var recentExecutionsCounter = 0;	   
	   var recentAverageExecutionDuration = 0;
	   
	   var grExecutionStats= new GlideAggregate("report_stats_executions");
       if (isReportStat)
	       grExecutionStats.addQuery('report_sys_id', reportSysId);
       else
	       grExecutionStats.addQuery('widget_sys_id', widgetSysId);
	   grExecutionStats.addAggregate("SUM","execution_duration");
	   grExecutionStats.addAggregate("COUNT",null);
	   grExecutionStats.setGroup(false);
	   grExecutionStats.query();
	    
	   if (grExecutionStats.next()) {
		   recentExecutionDuration = grExecutionStats.getAggregate("SUM", "execution_duration");
		   recentExecutionsCounter = grExecutionStats.getAggregate("COUNT",null);
		   gl.logDebug('recentExecutionDuration = ' + recentExecutionDuration);
		   gl.logDebug('recentExecutionsCounter = ' + recentExecutionsCounter);
	   }
	   
	   grReportStat.setValue('recent_number_executions', recentExecutionsCounter);
	   recentAverageExecutionDuration = recentExecutionDuration/recentExecutionsCounter; 	
	   gl.logDebug('new recentAverageExecutionDuration = ' + recentAverageExecutionDuration);
	  
	   if (homepageSysId!=null && String(homepageSysId).length>0){
	       var homepageNumberOfExecutions = parseInt(grReportStat.getValue('number_executions_homepage')) + 1;	   
	       grReportStat.setValue('number_executions_homepage', homepageNumberOfExecutions);
	       gl.logDebug('new homepageNumberOfExecutions = ' + homepageNumberOfExecutions);
	   }
	   grReportStat.setValue('total_executions_duration', totalDuration);	   
	   grReportStat.setValue('average_execution_duration', averageExecutionDuration);   
	   grReportStat.setValue('recent_avg_execution_duration', recentAverageExecutionDuration);
	   grReportStat.update();
	   
	   gl.logDebug('... stats record updated');
	   
   } else {
	   if (isReportStat)
		   createNewReportExecution(reportSysId, userSysId, homepageSysId, executionDuration, executionTimestamp);
	   createNewReportStatsExecution(reportSysId, widgetSysId, isReportStat, homepageSysId, executionDuration, executionTimestamp);
	   
       if (isReportStat)
	       grReportStat.setValue('report_sys_id', reportSysId);
       else
	       grReportStat.setValue('widget_sys_id', widgetSysId);
	   grReportStat.setValue('number_executions_total', 1);
	   grReportStat.setValue('recent_number_executions', 1);
	   if (homepageSysId!=null && String(homepageSysId).length>0)
	  	   grReportStat.setValue('number_executions_homepage', 1);
	   else
		   grReportStat.setValue('number_executions_homepage', 0);
	   grReportStat.setValue('total_executions_duration', executionDuration);	   
	   grReportStat.setValue('average_execution_duration', executionDuration);
	   grReportStat.setValue('recent_avg_execution_duration', executionDuration);
	   grReportStat.insert();
	   
	   gl.logDebug('... stats record created.with values: report_sys_id='+reportSysId );
	   
   }
}

function checkAndDeleteRows(reportSysId, widgetSysId, isReportStat, maxUsersXProperty, table) {
	var gl = new GSLog("com.glide.report", "checkAndDeleteRows"); 
	gl.logDebug('checkAndDeleteRows. ReportSysId = ' + reportSysId + '. WidgetSysId = ' + widgetSysId + ' , maxUsersXProperty = ' + maxUsersXProperty);
	var grExecutionCheck = new GlideAggregate(table);
	if (isReportStat)
	   grExecutionCheck.addQuery('report_sys_id', reportSysId);
	else
	   grExecutionCheck.addQuery('widget_sys_id', widgetSysId);
	grExecutionCheck.addAggregate('COUNT');
    grExecutionCheck.query();
    var cont = 0;
	//read the actual num of rows
	if (grExecutionCheck.next()) 
		cont = grExecutionCheck.getAggregate('COUNT');
	   
	if (cont >= maxUsersXProperty) {
		//delete oldest rows
		var rowsToDelete = parseInt(cont)- parseInt(maxUsersXProperty) + 1;
		gl.logDebug('--- rowsToDelete=' + rowsToDelete + ',cont=' + cont);
		var grDelete = new GlideRecord(table);
		if (isReportStat)
		   grDelete.addQuery('report_sys_id', reportSysId);
		else
		   grDelete.addQuery('widget_sys_id', widgetSysId);
		grDelete.orderBy('sys_updated_on');
		grDelete.query();
		var contDelete = 0;
		//read the actual num of rows
		while (grDelete.next() && contDelete<rowsToDelete){
			grDelete.deleteRecord();	
			contDelete++;
		}
			
		gl.logDebug('--- Rows deleted=' + contDelete);
	}	   
}

function createNewReportExecution(reportSysId, userSysId, homepageSysId, executionDuration, executionTimestamp) {
   var gl = new GSLog("com.glide.report", "report-stats"); 
	
   var grExecution = new GlideRecord('report_executions');
   grExecution.setValue('report_sys_id', reportSysId);
   grExecution.setValue('user_sys_id', userSysId);
   grExecution.setValue('homepage_sys_id', homepageSysId);	   
   grExecution.setValue('execution_duration', executionDuration);
   grExecution.setValue('execution_timestamp', '' + executionTimestamp);
   grExecution.insert();
   gl.logDebug('... execution record created');
}

function createNewReportStatsExecution(reportSysId, widgetSysId, isReportStat, homepageSysId, executionDuration, executionTimestamp) {
   var gl = new GSLog("com.glide.report", "report-stats-execution"); 
	
   var grExecution = new GlideRecord('report_stats_executions');
   if (isReportStat)
       grExecution.setValue('report_sys_id', reportSysId);
   else
	   grExecution.setValue('widget_sys_id', widgetSysId);
   grExecution.setValue('homepage_sys_id', homepageSysId);	   
   grExecution.setValue('execution_duration', executionDuration);
   grExecution.setValue('execution_timestamp', '' + executionTimestamp);
   grExecution.insert();
   gl.logDebug('... execution record report_stats_execution created');
}
