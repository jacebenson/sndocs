var AJAXCanonicalizationWorker = Class.create();
AJAXCanonicalizationWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	download: function() {
		var worker = new GlideScriptedHierarchicalWorker();
		worker.setProgressName(gs.getMessage("Normalization Data Service"));
		worker.setScriptIncludeName("CanonicalRepo");
		worker.setScriptIncludeMethod("syncDataWithRepository");
		worker.setBackground(true);
		worker.start();
		return worker.getProgressID();
	},
	update: function() {
		var l = new GlideStringList();
		l.add("cmdb_ci");
		var worker = new CanonicalUpdaterWorker(l);
		worker.setProgressName(gs.getMessage("Normalization Data Service"));
		worker.setBackground(true);
		worker.start();
		return worker.getProgressID();
	},
	updateCmdbModel: function() {
		var l = new GlideStringList();
		l.add("cmdb_model");
		var worker = new CanonicalUpdaterWorker(l);
		worker.setProgressName(gs.getMessage("Normalization Data Service"));
		worker.setBackground(true);
		worker.start();
		return worker.getProgressID();
	},
	updateSAM: function() {
		var l = new GlideStringList();
		l.add("cmdb_sam_sw_install");
		l.add("cmdb_sam_sw_usage");
		l.add("cmdb_sam_sw_discovery_model");
		
		var worker = new CanonicalUpdaterWorker(l);
		worker.setProgressName(gs.getMessage("Normalization Data Service"));
		worker.setPublisher(true);
		worker.setBackground(true);
		worker.start();
		return worker.getProgressID();
	},
	
	// This canonicalization work is fast enough that it does not warrant being run inside a background progress worker
	updateRefQual: function() {
		var canonicalRefQualUpdater = new SNC.CanonicalRefQualUpdater();
		return canonicalRefQualUpdater.process();
	},
	
	type: 'AJAXCanonicalizationWorker'
});