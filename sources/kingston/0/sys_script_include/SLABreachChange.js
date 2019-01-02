var SLABreachChange = Class.create();

// Update active breached SLA records
// when Breach compatibility property is turned on (=true)
// - in_progress,has_breached==true -> breached
SLABreachChange.updateBreachedCompatOn = function() {
	var mu = new SLABreachChange().multipleUpdateSLA();
	mu.addQuery('active', 'true');
	mu.addQuery('stage', 'in_progress');
	mu.addQuery('has_breached', 'true');
	
	mu.setValue('stage', 'breached');
	mu.execute();
};

// Update active breached SLA records
// when Breach compatibility property is turned off (=false)
// - breached -> in_progress,has_breached=true
SLABreachChange.updateBreachedCompatOff = function() {
	if (!SLAProperties.isEngineVersion('2011'))
		return; // only supported in 2011
	
	var mu = new SLABreachChange().multipleUpdateSLA();
	mu.addQuery('active', 'true');
	mu.addQuery('stage', 'breached');
	
	mu.setValue('stage', 'in_progress');
	mu.setValue('has_breached', 'true');
	mu.execute();
};

// set 'has_breached', on all active SLAs with business_percentage (if schedule), or percentage >= 100
// (called when switching SLA Engine version, usually to 2011)
SLABreachChange.setBreachedFlagOnActive = function() {
	// set 'has_breached' for all SLAs that are breached
	// if breach compatibility is already disabled (from before this method existed), update the stage accordingly too
	
	// - for SLAs with schedule, business_percentage >= 100
	var mu = new SLABreachChange().multipleUpdateSLA();
	mu.addQuery('active', 'true');
	mu.addNotNullQuery('schedule');
	mu.addQuery('business_percentage', '>=', '100');
	// (just in case this has been previously disabled)
	if (SLAProperties.isBreachCompatOff() && SLAProperties.isEngineVersion('2011'))
		mu.setValue('stage', 'in_progress');
	mu.setValue('has_breached', 'true');
	mu.execute();
	
	// - for SLAs with no schedule, percentage >= 100
	mu = new SLABreachChange().multipleUpdateSLA();
	mu.addQuery('active', 'true');
	mu.addNullQuery('schedule');
	mu.addQuery('percentage', '>=', '100');
	if (SLAProperties.isBreachCompatOff() && SLAProperties.isEngineVersion('2011'))
		mu.setValue('stage', 'in_progress');
	mu.setValue('has_breached', 'true');
	mu.execute();
};

// Set 'has_breached' accordingly, for all inactive SLAs
// - Call this manually, to update the 'has_breached' flag on existing, closed, Task SLA records that had breached.
//   It will also update their stage values accordingly, to reflect current breach compatibility settings.
SLABreachChange.setBreachedFlagOnInactive = function() {
	// - for SLAs with schedule, business_percentage >= 100
	var mu = new SLABreachChange().multipleUpdateSLA();
	mu.addQuery('active', 'false');
	mu.addNotNullQuery('schedule');
	mu.addQuery('business_percentage', '>=', '100');
	if (SLAProperties.isBreachCompatOn())
		mu.setValue('stage', 'breached');
	else
		mu.setValue('stage', 'completed');
	mu.setValue('has_breached', 'true');
	mu.execute();
	
	// - for SLAs with no schedule, percentage >= 100
	mu = new SLABreachChange().multipleUpdateSLA();
	mu.addQuery('active', 'false');
	mu.addNullQuery('schedule');
	mu.addQuery('percentage', '>=', '100');
	if (SLAProperties.isBreachCompatOn())
		mu.setValue('stage', 'breached');
	else
		mu.setValue('stage', 'completed');
	mu.setValue('has_breached', 'true');
	mu.execute();
};

SLABreachChange.prototype = {
	initialize : function() {
	},
	
	multipleUpdateSLA: function() {
		return new GlideMultipleUpdate('task_sla');
	},
	
	type: 'SLABreachChange'
};