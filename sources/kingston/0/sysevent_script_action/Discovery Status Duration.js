calc();

function calc() {
	current.duration = gs.dateDiff(current.sys_created_on.getDisplayValue(), event.sys_created_on.getDisplayValue(), false);
	current.update();
}