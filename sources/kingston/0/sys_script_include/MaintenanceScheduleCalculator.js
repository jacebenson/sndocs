var MaintenanceScheduleCalculator = Class.create();

MaintenanceScheduleCalculator.prototype = {
   initialize : function() {
      this.noMessages = false;
      if (typeof suppressMaintenanceScheduleMessages != "undefined")
         this.noMessages = true;
   },

   setNoMessages: function(suppressMessages) {
           this.noMessages = suppressMessages;
   },

   /***
    * For a change record, determine whether the planned dates fall outside maintenance schedules for CIs.
    * If checkType is null, both primary and affected CIs are checked.
    * If checkType is "primary" then only the primary CI is checked.
    * If checkType is something other than null or "primary", it is the SYS_ID for an affected CI and that
    * affected CI is checked.
    ***/
   checkChangeAgainstSchedules: function(changeGR, checkType) {

	   var startElement = changeGR.getElement("start_date");
	   if (startElement.nil())
	      return true;
	
	   this.startGDT = startElement.getGlideObject();
	   var endElement = changeGR.getElement("end_date");
	   if (endElement.nil())
	      return true;
	
	   this.endGDT = endElement.getGlideObject();
	
	   this.startSDT = this._GDTToSDT(this.startGDT);
	   this.endSDT = this._GDTToSDT(this.endGDT);
	
	   var rv = true;

       if (!checkType  || checkType=="primary") {
	      var cmdb_ci = changeGR.cmdb_ci;
	      if (cmdb_ci) {
			  if (!this._checkSchedule("primary", cmdb_ci, changeGR))
				  rv = false;
	      }
       }

       if ((checkType && checkType!="primary") || !checkType) {	
	      var affectedGR = new GlideRecord("task_ci");
	      affectedGR.addQuery("task", changeGR.sys_id);
          if (checkType)
              affectedGR.addQuery("ci_item", checkType);
		  affectedGR.addQuery("ci_item.maintenance_schedule", "!=", null); 
	      affectedGR.query();   
		   
	      while (affectedGR.next()) {
	         if (!this._checkSchedule("affected", affectedGR.ci_item, changeGR))
				 rv = false
	      }
       }

	   return rv;
	},

	_checkSchedule: function(ciType, cmdb_ci, changeGR) {
		var scheduleID = cmdb_ci.maintenance_schedule;
		if (!scheduleID)
			return true;

		var schedule = new GlideSchedule(scheduleID);

		var scheduleMap = schedule.getTimeMap(this.startGDT, this.endGDT);

		var span = new GlideScheduleDateTimeSpan(this.startSDT, this.endSDT);
		var thisMap = new GlideScheduleTimeMap();
		thisMap.addInclude(span);
		thisMap.buildMap(gs.getSession().getTimeZoneName());
		var overlaps = scheduleMap.overlapsWith(thisMap, schedule.getTimeZone());
		if (!overlaps.isEmpty()) {
			overlaps.buildMap(gs.getSession().getTimeZoneName());
			var overlapSpan = overlaps.next();
			if (overlapSpan.getStart().equals(this.startSDT) && overlapSpan.getEnd().equals(this.endSDT))
				return true;
		}

                if (!this.noMessages) {
                   if (changeGR.outside_maintenance_schedule == false) { // only notify if status changed
		      if (ciType == "affected")
                {
                    var message = gs.getMessage("Change planned times fall outside the maintenance schedule for affected CI: {0}",cmdb_ci.getDisplayValue());
                    gs.addInfoMessage(message);
                }
		      else
                {
                    var message = gs.getMessage("Change planned times fall outside the maintenance schedule for CI: {0}",cmdb_ci.getDisplayValue());
                    gs.addInfoMessage(message);
                }
                   }
                }
   		return false;
	},

	_GDTToSDT: function(gdt) {
		var tz = gs.getSession().getTimeZoneName();
		var sdt =  new GlideScheduleDateTime(gdt);
		sdt.setTimeZone(tz);
		return sdt;
	}
}