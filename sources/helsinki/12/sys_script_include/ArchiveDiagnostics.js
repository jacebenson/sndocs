var ArchiveDiagnostics = Class.create();

ArchiveDiagnostics.prototype = {
  initialize : function() {
  },

  getRuleCount: function() {
	 var xx = new GlideAggregate('sys_archive');
	 xx.addAggregate('COUNT');
	 xx.addQuery('active', true);
	 xx.query();
	 xx.next();
	 return xx.getAggregate('COUNT');
  },

  getLastRun: function() {
	 var xx = new GlideRecord('sys_status');
	 xx.addQuery('name', 'glide.db.archiver');
	 xx.query();
	 if (xx.next() && xx.value.startsWith('active'))
		return 'Running';
	 
	 var xx = new GlideAggregate('sys_archive');
	 xx.addAggregate('MAX', 'last_run_date');
	 xx.setGroup(false);
	 xx.query();
	 xx.next();
	 return new GlideDateTime(xx.getAggregate('MAX', 'last_run_date')).getDisplayValue();
  },

  getTotalRecords: function() {
	 var xx = new GlideAggregate('sys_archive');
	 xx.addAggregate('SUM', 'total');
	 xx.setGroup(false);
	 xx.query();
	 xx.next();
	 return xx.getAggregate('SUM', 'total');
  },
   
  getActiveRecords: function() {
	 var xx = new GlideRecord('sys_archive');
	 xx.addQuery('active', true);
	 xx.query();
	 return xx;
  },

  type: "ArchiveDiagnostics"
}