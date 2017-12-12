var VTBTaskSecurity = (function() {
	function checkAccess(accessCheckFnName) {
		return function(taskSysId) {

			if(!taskSysId || taskSysId == '' || current.isNewRecord()) {
				return true;
			}

			// Currently, vtb_task.* ACL all lead to the same board member check
			// With that in mind, just cache the result for all accessCheck functions based
			// on task.sys_id
			var gc = GlideController,
				hash = [taskSysId].join(':');

			if(gc.exists(hash)) {
				return !!(gc.getGlobal(hash));
			}

			var gr = new GlideRecord('vtb_card');
			var accessCheckResult = false;
			gr.addQuery('task', taskSysId);
			gr.query();

			// Card does not exist yet, permit access if user is owner.
            if (gr.getRowCount() === 0) {
				if (current.getTableName() == 'vtb_task') {
					accessCheckResult = current.owner == gs.getUserID();
				} else {
					accessCheckResult = true;
				}
			}

            while (gr.next()) {
                accessCheckResult = gr[accessCheckFnName]();
                if (accessCheckResult) {
                    break;
                }
            }

            gc.putGlobal(hash, accessCheckResult);
            return accessCheckResult;
		};
	}

	return {
		canWrite  : checkAccess('canWrite'),
		canRead   : checkAccess('canRead'),
		canDelete : checkAccess('canDelete'),
		canCreate : checkAccess('canCreate')
	};
})();