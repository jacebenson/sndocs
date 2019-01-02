var kirtesh = Class.create();
kirtesh.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	updateIncident: function(){
		var sys_id = this.getParameter('sys_id');
		var work_notes = this.getParameter('work_notes');
		var incident = new GlideRecord('incident');
		if(incident.get(sys_id)){
			incident.work_notes = work_notes;
			incident.update();
			return "incident updated ";
		} else {
			return "couldn't find incident";
		}
	},
    type: 'kirtesh'
});