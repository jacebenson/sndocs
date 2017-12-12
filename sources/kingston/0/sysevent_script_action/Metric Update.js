// current: GlideRecord - event scheduled on behalf of (incident for example) 
// event: GlideRecord - sysevent that caused this to be invoked
metricUpdate();

function metricUpdate() {
   var fields = getChangedFields();
   var updateCount = new String(event.parm2);
   var gr = getDefinitions();

   var didRollback = false;
   while (gr.next()) {
      if (!fields.contains(gr.field))
         continue; 
      
	  if (!didRollback){
	     rollback(current, updateCount);
		 didRollback = true;
	  }
	   
      var type = gr.type;
      if (type == 'field_value_duration') 
         setDuration(gr, gr.field, current[gr.field]);
      else if (type == 'calculation' ) 
         scriptCalculation(gr);
      else 
         gs.log('>>> skipping: ' + gr.name);
   }
}

function scriptCalculation(gr) {
  definition = gr;
  eval(gr.script);
}

function setDuration(gr, field, value) {
  var mi = new MetricInstance(gr, current);
  mi.process(field);
}

// changed fields string is a serialized ArrayList [a,b,c]
function getChangedFields() {
  var fields = new String(event.parm1);
  if (fields.length > 3) {
    fields = fields.substring(1, fields.length - 1);
    fields = GlideStringUtil.split(fields, ",");
  }
  return fields;
}

function getDefinitions() {
  var gr = new GlideRecord('metric_definition');
  gr.addActiveQuery(); 
  var tables = GlideDBObjectManager.getTables(current.getTableName());
  gr.addQuery('table', tables); 
  gr.orderBy('order');
  gr.query();
  return gr; 
}

function rollback(gr, updateCount) {
   var r = new GlideRecordRollback(); 
   r.toVersion(gr, updateCount); 
}