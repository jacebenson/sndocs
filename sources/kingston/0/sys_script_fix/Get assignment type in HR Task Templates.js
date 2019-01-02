populateAssignmentType();
function populateAssignmentType() {
	var grTemplate = new GlideRecord('sn_hr_core_template');
	grTemplate.addQuery('table', 'sn_hr_core_task');
	grTemplate.query();
	
	while(grTemplate._next()) {
		
		var grTemplateInfo = grTemplate.template.toString();
		var assignedToIdx = grTemplateInfo.indexOf("assigned_to=");
		var skillIdx = grTemplateInfo.indexOf("skills=");
		var assignmentGroupIdx = grTemplateInfo.indexOf("assignment_group=");
		
		if(grTemplate.assignment_type ==''){
			grTemplate.assignment_type = 'employee';
			if(assignedToIdx > -1)
				grTemplate.assignment_option = 'named_user';
			else if(skillIdx > -1 || assignmentGroupIdx > -1){
				grTemplate.assignment_type='fulfiller';
				grTemplate.assignment_option = 'skills_group';
			}else if(grTemplate.assign_to == 'assigned_to')
				grTemplate.assignment_type = 'fulfiller';
		}else if(assignedToIdx > -1 && grTemplate.assignment_type !='fulfiller'){
			grTemplate.assignment_option = 'named_user';
			grTemplate.assignment_type = 'employee';
		}else if(grTemplate.assignment_type !='employee' && assignedToIdx > -1){
			grTemplate.assignment_type = 'fulfiller';
			grTemplate.assignment_option = 'named_user';
		}else if(skillIdx > -1 || assignmentGroupIdx > -1){
			grTemplate.assignment_option = 'skills_group';
			grTemplate.assignment_type='fulfiller';
		}else if(grTemplate.assign_to == 'assigned_to'){
			grTemplate.assignment_type = 'fulfiller';
			if(assignedToIdx > -1)
				grTemplate.assignment_option = 'named_user';
			else if(skillIdx > -1 || assignmentGroupIdx > -1)
				grTemplate.assignment_option = 'skills_group';
		}else if(grTemplate.assign_to =='subject_person' || grTemplate.assign_to == 'opened_for'){
			grTemplate.assignment_type ='employee';
		}else if(grTemplate.assign_to !='' && grTemplate.assignment_type !='fulfiller'){
			grTemplate.assignment_type = 'employee';
		}
		
		grTemplate.setWorkflow(false);
		grTemplate.update();
	}
}