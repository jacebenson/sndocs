(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.classname = ''
	if(input && input.sys_id){
	var task = new GlideRecord('task');
		if(task.get(input.sys_id)){
			data.classname = task.getValue('sys_class_name');
			data.url = '?id=ticket&table=' + data.classname;
			data.url += '&sys_id=' + input.sys_id
		}
	}
})();