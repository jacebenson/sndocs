var priorityGenerator = new UpgradeHistoryLogPriority();
var tables = ["sys_ui_form_section", "sys_ui_related_list", "sys_choice_set"];
for (var i = 0; i < tables.length; i++) {
	priorityGenerator.setTablePriority(tables[i], '4');
}
priorityGenerator.generate('html','3');
priorityGenerator.generate('script','2');
priorityGenerator.generate('script_plain','2');
priorityGenerator.generate('xml','1');