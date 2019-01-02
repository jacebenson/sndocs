var ChangeTaskStateSNC = Class.create();

/** States */
ChangeTaskStateSNC.PENDING =     "-5";
ChangeTaskStateSNC.OPEN =        "1";
ChangeTaskStateSNC.IN_PROGRESS = "2";
ChangeTaskStateSNC.CLOSED =      "3";
ChangeTaskStateSNC.CANCELED =    "4";

/** Legacy States (replaced by CLOSED + Closed codes) */
ChangeTaskStateSNC.CLOSED_SUCCESSFUL = ChangeTaskStateSNC.CLOSED; // aka complete
ChangeTaskStateSNC.CLOSED_SUCCESSFUL_ISSUES = ChangeTaskStateSNC.CLOSED; // aka skipped
ChangeTaskStateSNC.CLOSED_UNSUCCESSFUL = ChangeTaskStateSNC.CLOSED; // aka incomplete

/** Closed codes (Applicable when state is CLOSED) */
ChangeTaskStateSNC.CLOSED_SUCCESSFUL_CODE =   "1";
ChangeTaskStateSNC.CLOSED_SUCCESSFUL_ISSUES_CODE = "2";
ChangeTaskStateSNC.CLOSED_UNSUCCESSFUL_CODE =    "3";

ChangeTaskStateSNC.prototype = {
	type: "ChangeTaskStateSNC"
};
