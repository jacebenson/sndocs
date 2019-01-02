var matching_rules = new GlideRecord("matching_rule");
matching_rules.query();

while(matching_rules.next()){
	if(JSUtil.nil(matching_rules.resource_type_table)) {
		matching_rules.resource_type_table = "sys_user";
		matching_rules.update();
	}
}