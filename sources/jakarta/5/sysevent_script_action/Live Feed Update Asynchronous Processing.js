// current: GlideRecord - event scheduled on behalf of (incident for example)
// event: GlideRecord - sysevent that caused this to be invoked
liveFeedUpdate();

function liveFeedUpdate() {
   var fields = getChangedFields();
   var notificationIds = getNotificationIds();
   var updateCount = notificationIds.get(notificationIds.size()-1);
   if(current.sys_mod_count != updateCount)
        rollback(current, updateCount);
   // pass current, changed fields and condition matched notification ids
   new GlideappLiveFeedEventHandler().processAsync(current, fields, notificationIds);
}

// changed fields string is a serialized ArrayList [a,b,c]
function getChangedFields() {
  var fields = toArray(new String(event.parm1));
  return fields;
}

// notification ids serialized as ArrayList [id1,id2,...,sys_mod_count]
function getNotificationIds() {
  var notificationIds = toArray(new String(event.parm2));
  return notificationIds;
}

function toArray(arrayStr) {
  if (arrayStr.length > 3) {
    arrayStr = arrayStr.substring(1, arrayStr.length - 1);
    arrayStr = GlideStringUtil.split(arrayStr, ",");
  } else
      arrayStr = new GlideStringList();
  return arrayStr;
}

function rollback(gr, updateCount) {
   var r = new GlideRecordRollback();
   r.toVersion(gr, updateCount);
}