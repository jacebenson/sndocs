var mutex = new GlideMutex('EventTransfer', 'EventTransfer');
mutex.setSpinWait(1);
mutex.setMaxSpins(1);
mutex.setMutexExpires(1000 * 60 * 60);
if (mutex.get()) {
    transferEvents();
    mutex.release();
}

function transferEvents() {
  var xx = new GlideRecord(event.parm1);
  xx.addEncodedQuery('state=ready^ORstate=encore-ready');
  addDateRange(xx);
  xx.orderBy('sys_created_on'); //transfer events in order	
  xx.query();
  while (xx.next()) {
    var yy = new GlideRecord('sysevent');
    var fields = xx.getFields();
    for (var i = 0; i < fields.size(); i++) {
       var ge = fields.get(i);
       yy[ge.getName()] = ge;
    }

    yy.insert();
    xx.state = 'transferred';
    xx.update();
  }
}

function addDateRange(er) {
	if (er.getTableName() != 'sysevent')
		return;
	
	var xx = new GlideRecord('sys_table_rotation_schedule');
	xx.addQuery('table_name', 'sysevent');
	xx.query();
	if (!xx.next())
		return;

	er.addQuery('sys_created_on', '>=', xx.valid_from);
	er.addQuery('sys_created_on', '<', xx.valid_to);
	return;
}
		