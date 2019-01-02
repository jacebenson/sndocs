var ChangeTaskState = Class.create();

/** States */
ChangeTaskState.PENDING =     ChangeTaskStateSNC.PENDING;
ChangeTaskState.OPEN =        ChangeTaskStateSNC.OPEN;
ChangeTaskState.IN_PROGRESS = ChangeTaskStateSNC.IN_PROGRESS;
ChangeTaskState.CLOSED =      ChangeTaskStateSNC.CLOSED;
ChangeTaskState.CANCELED =    ChangeTaskStateSNC.CANCELED;

/** Legacy States (replaced by CLOSED + Closed codes) */
ChangeTaskState.CLOSED_SUCCESSFUL = ChangeTaskStateSNC.CLOSED_SUCCESSFUL; // aka complete
ChangeTaskState.CLOSED_SUCCESSFUL_ISSUES = ChangeTaskStateSNC.CLOSED_SUCCESSFUL_ISSUES; // aka skipped
ChangeTaskState.CLOSED_UNSUCCESSFUL = ChangeTaskStateSNC.CLOSED_UNSUCCESSFUL; // aka incomplete

/** Closed codes (Applicable when state is CLOSED) */
ChangeTaskState.CLOSED_SUCCESSFUL_CODE =   ChangeTaskStateSNC.CLOSED_SUCCESSFUL_CODE;
ChangeTaskState.CLOSED_SUCCESSFUL_ISSUES_CODE = ChangeTaskStateSNC.CLOSED_SUCCESSFUL_ISSUES_CODE;
ChangeTaskState.CLOSED_UNSUCCESSFUL_CODE =    ChangeTaskStateSNC.CLOSED_UNSUCCESSFUL_CODE;

ChangeTaskState.prototype = Object.extendsObject(ChangeTaskStateSNC,{
	type: "ChangeTaskState"
});
