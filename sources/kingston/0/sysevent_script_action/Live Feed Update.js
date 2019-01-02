// current: GlideRecord - event scheduled on behalf of (incident for example) 
// event: GlideRecord - sysevent that caused this to be invoked
liveFeedUpdate();

function liveFeedUpdate() {
   var fields = getChangedFields();
   var updateCount = new String(event.parm2);
   if(current.sys_mod_count != updateCount)
   	rollback(current, updateCount);
   // pass current and changed fields
   new GlideappLiveFeedEventHandler().process(current, fields);
}

// changed fields string is a serialized ArrayList [a,b,c]
function getChangedFields() {
  var fields = new String(event.parm1);
  if (fields.length > 3) {
    fields = fields.substring(1, fields.length - 1);
    fields = GlideStringUtil.split(fields, ",");
  } else
      fields = new GlideStringList();
  return fields;
}

function rollback(gr, updateCount) {
   var r = new GlideRecordRollback(); 
   r.toVersion(gr, updateCount); 
}