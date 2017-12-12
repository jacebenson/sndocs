var HubAjaxProcessor = Class.create();
HubAjaxProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function () {
		if (this.getType() == "compareToLocalInstance") {
			return this.compareToLocalInstance();
		}
	},
	
	compareToLocalInstance: function() {
		var sync_id = GlideGuid.generate(null);
		var sys_id = this.getParameter('sys_id');
		var record = GlideRecord("sys_update_set_source");
		record.get(sys_id);
		if (!record.isValid())
			return null;
		var instance_id = record.getValue('instance_id');
		gs.log("@##@@@@ " + instance_id);
		var worker = new GlideSyncWorker(instance_id, sync_id, 'compare');

		var name = "";
		var url = "";
		worker.setProgressName(gs.getMessage("Comparing local instance to {0} ({1})", [name, url]));
		worker.setBackground(true);
		worker.start();
		return worker.getProgressID() + "," + sync_id;

	},

    type: 'HubAjaxProcessor'
});