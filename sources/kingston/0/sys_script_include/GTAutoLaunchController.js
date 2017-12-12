var GTAutoLaunchController = Class.create();
GTAutoLaunchController.prototype = {
    initialize: function() {
    },
	messages: {
		done : gs.getMessage('ok')
	},

    type: 'GTAutoLaunchController'
};
GTAutoLaunchController.prototype.tableNames = {
	tours: 'sys_embedded_tour_guide',
	userOverrides: 'sys_guided_tour_user_overrides'
};

GTAutoLaunchController.prototype.searchPagesByName = function(options) {
	var gr = new GlideAggregate(this.tableNames.tours);
	var data = [];
	var name = options.name.toString();
	var sort = options.sort.toString();

	gr.addAggregate('COUNT', 'context');
	gr.addAggregate('MAX', 'sys_updated_on');
	gr.addQuery('active', '=','true');
	if (name.length >= 2) {
		gr.addQuery('context', 'CONTAINS', unescape(name));
	}
	gr.groupBy('context');
	if (sort === 'by-name') {
 		gr.orderBy('context');
 	} else {
 		gr.orderByAggregate('MAX', 'sys_updated_on');
 	}
	gr.query();

	while(gr.next()) {
		var elem ={ name: gr.context.toString(), 
			value: gr.getAggregate('COUNT', 'context').toString(),
			updated: gr.getAggregate('MAX', 'sys_updated_on').toString()
		}; 
		data.push(elem);
	}
	return data;
};

GTAutoLaunchController.prototype.getToursForPage = function(name) {
  var gr = new GlideRecord(this.tableNames.tours);
  var data = [];
  gr.addQuery('context', '=', unescape(name));
  gr.addQuery('active','=', true );
  gr.query();
  while(gr.next()) {
	  var elem = {id: '' + gr.sys_id, name: ''+gr.name, order: parseInt(gr.autolaunch_order) || 0, roles: ''+gr.roles, date: ''+gr.sys_updated_on};
	  data.push(elem);
  }
  return data;
};

GTAutoLaunchController.prototype.updateToursForPage = function(data) {
	if (data.autolaunchOff.length) {
		var rec = new GlideRecord(this.tableNames.tours);
		var ids = data.autolaunchOff.join(',');
		rec.addQuery('sys_id', 'IN', ids);
		rec.query();
		var count = 0;
		while(rec.next()) {
			rec.autolaunch_order = 0;
			rec.update();
		}
	} 
	if (data.autolaunchOn.length) {
		var self = this;
		data.autolaunchOn.forEach(function(id, index) {
			var rec = new GlideRecord(self.tableNames.tours);
			rec.addQuery('sys_id', '=', id);
			rec.query();
			if (rec.next()) {
				rec.autolaunch_order = index + 1;
				rec.update();
			}
		});
	}
	if(data.resetUserPreferences && data.page) {
		this._removeOverrides(data.page, null);
	}
	return {msg: this.messages.done};
	
};

GTAutoLaunchController.prototype._insertOverride = function(tourId, userId) {
	var rec = new GlideRecord(this.tableNames.userOverrides);
	rec.initialize();
	rec.tour = tourId;
	rec.user = userId;
	rec.disable_autolaunch = true;
	rec.insert();
};

GTAutoLaunchController.prototype._removeOverrides = function(page, userId) {
	var self = this;
	var pages = this.getToursForPage(page);
	var ids = pages
				.map(function(d) { return d.id; })
	;
	if (ids.length) {
		var rec = new GlideRecord(self.tableNames.userOverrides);
		if (userId) {
			rec.addQuery('user', '=', userId);
		}
		rec.addQuery('tour', 'IN', ids.join(','));
		rec.deleteMultiple();
		return {ids: ids};
	} else {
		return null;
	}
};

GTAutoLaunchController.prototype.overrideTourForUser = function(tourId) {
	var currentUser = gs.getUser();
	var rec = new GlideRecord(this.tableNames.userOverrides);
	rec.addQuery('user', '=', currentUser.getID());
	rec.addQuery('tour', '=', tourId);
	rec.query();
	var exists = rec.next();
	var tourRecord = new GlideAggregate(this.tableNames.tours);
	tourRecord.addQuery('sys_id', '=', tourId);
	tourRecord.query();
	if(tourRecord.next() && !exists) {
		this._insertOverride(tourId, currentUser.getID());
		return {msg: this.messages.done};
	} else {
		return null;
	}
};

GTAutoLaunchController.prototype.overrideAllToursForUserInPage = function(page) {
	var self = this;
	var currentUser = gs.getUser();
	var userId = currentUser.getID();
	var res = this._removeOverrides(page, userId);
	if (res) {
		res.ids.forEach(function(id) {
		  self._insertOverride(id, userId);
		});
		return {msg: self.messages.done};
	} else {
		return null;
	}
};

GTAutoLaunchController.prototype._getOverriddenToursForUser = function(userId) {
  var gr = new GlideRecord(this.tableNames.userOverrides);
  var data = [];
  gr.addQuery('user', userId);
  gr.addQuery('disable_autolaunch',true);
  gr.query();
  while(gr.next()) {
	  var elem = {tourId: '' + gr.tour};
	  data.push(elem);
  }
  return data;
};

GTAutoLaunchController.prototype.getAutoLaunchTour = function(page) {
	var tours = this.getToursForPage(page);
	
	var oTours = this._getOverriddenToursForUser(gs.getUserID());
	var i;
	var data = [];
	
	if(oTours.length>0)
		for(i in oTours)
			data.push(oTours[i].tourId);
		
	var overriddenTours = data.join(',');
	
	data = [];
	data = new TourBuilderUtility().getRolesForUser(gs.getUserID());
	var userRoles = data.join(',');
	
	var autoLaunchTour = '';
	var autoLaunchOrder = 0;
	var autoLaunchTourName = '';
	var tour;
	
	if(tours.length>0){
		for(tour in tours){
			var currentTourId = tours[tour].id;
			var currentTourOrder = parseInt(tours[tour].order);	   	
			var currentTourName = tours[tour].name;	   	
			if((overriddenTours == '' || overriddenTours.indexOf(currentTourId)==-1) && currentTourOrder > 0){
				if(userRoles.indexOf("maint")>-1 || tours[tour].roles.toString() == ''){
					if(autoLaunchOrder == 0 || currentTourOrder < autoLaunchOrder){
						autoLaunchTour = currentTourId;
						autoLaunchOrder = currentTourOrder;
						autoLaunchTourName = currentTourName;
					}
				}else{
					var tourRoles = tours[tour].roles.split(",");
					var role;
					for(role in tourRoles){
						if(userRoles.indexOf(tourRoles[role])>-1){
							if(autoLaunchOrder == 0 || currentTourOrder < autoLaunchOrder){
								autoLaunchTour = currentTourId;
								autoLaunchOrder = currentTourOrder;
								autoLaunchTourName = currentTourName;
							}
							break;
						}
					}
				}
			}
		}
		
		if(autoLaunchOrder > 0)
			return {tourId: autoLaunchTour,name:autoLaunchTourName};
		else
			return {tourId: null};
	}
	
	return {tourId: null};
};