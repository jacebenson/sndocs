var ChangeTaskState = Class.create();

/** States */
ChangeTaskState.PENDING =     "-5";
ChangeTaskState.OPEN =        "1";
ChangeTaskState.IN_PROGRESS = "2";
ChangeTaskState.CLOSED_SUCCESSFUL = "3"; // aka complete
ChangeTaskState.CLOSED_UNSUCCESSFUL = "4"; // aka incomplete
ChangeTaskState.CLOSED_SUCCESSFUL_ISSUES = "5"; // aka skipped

ChangeTaskState.prototype = Object.extendsObject(ChangeTaskStateSNC,{
	type: "ChangeTaskState"
});
