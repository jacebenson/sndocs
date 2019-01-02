var ChangeTask = Class.create();

ChangeTask.CHANGE_TASK = "change_task";

/** State given to change tasks when they are created */
ChangeTask.DEFAULT_STATE = ChangeTaskState.OPEN;

ChangeTask.prototype = Object.extendsObject(ChangeTaskSNC, {
	type: "ChangeTask"
});

ChangeTask.newChangeTask = ChangeTaskSNC.newChangeTask;
ChangeTask.bySysId = ChangeTaskSNC.bySysId;
ChangeTask.hasOnHoldField = ChangeTaskSNC.hasOnHoldField;

