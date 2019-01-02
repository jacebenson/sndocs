updateIndicatorCounters();
updateWidgetCounters();

function updateIndicatorCounters() {
  var rec = new GlideRecord('pa_indicators');
  rec.query();
  while (rec.next()) {
    var ga = new GlideAggregate('pa_job_indicators');
    ga.addQuery("indicator", rec.sys_id);
    ga.addAggregate('COUNT');
    ga.query();
    var related_jobs = ga.next() ? ga.getAggregate('COUNT') : 0;
  
    ga = new GlideAggregate('pa_indicator_breakdowns');
    ga.addQuery("indicator", rec.sys_id);
    ga.addAggregate('COUNT');
    ga.query();
    var related_breakdowns = ga.next() ? ga.getAggregate('COUNT') : 0;
    
    rec.related_jobs = related_jobs;
    rec.related_breakdowns = related_breakdowns;
    rec.update();
  }
}

function updateWidgetCounters() {
  var rec = new GlideRecord('pa_widgets');
  if (!rec.isValid()) {
	  return;
  }

  rec.query();
  while (rec.next()) {
    var ga = new GlideAggregate('sys_portal_preferences');
    ga.addQuery('name', 'sys_id');
    ga.addQuery('value', rec.sys_id);
    ga.addAggregate('COUNT');
    ga.query();
    var related_dashboards = ga.next() ? ga.getAggregate('COUNT') : 0;
  
    rec.related_dashboards = related_dashboards;
    rec.update();
  }
}