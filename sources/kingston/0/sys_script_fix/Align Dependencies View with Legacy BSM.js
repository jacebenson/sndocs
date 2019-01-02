gs.log("**********************************************************************************");
gs.log("Start Indicators Migration started: updating bsm_indicator table tooltip,icon,label columns fields ");
gs.log("**********************************************************************************");
processTable('bsm_indicator');
gs.log("**********************************************************************************");
gs.log("End Indicators");
gs.log("**********************************************************************************");

function processTable(tableName) {
	if (isTableExist(tableName)) {
		populateNewTableData(tableName);
	}else{
		gs.log('Verification if table exists failed -' + tableName);
	}
}

//This boolean function checks if given table exists in DB
function isTableExist(tableName) {
	var gr = new GlideRecord(tableName);
	return gr.isValid();
}


//This boolean function checks if given table exists in DB
function populateNewTableData(tableName) {
	var name		        = "";
	var label		        = "";
	var tooltip_label		= "";
	var tooltip_info		= "";
	var description_field	= "";
	
	var gr = new GlideRecord(tableName);
	gr.query();

	gs.log('bsm_indicator records count: ' + gr.getRowCount());
	gs.log('Set tooltip_info to description_field:');
	while (gr.next()){
		name		        = gr.getValue('name');
		label		        = gr.getValue('label');
		tooltip_label		= gr.getValue('tooltip_label');
		tooltip_info		= gr.getValue('tooltip_info');
		description_field	= gr.getValue('description_field');
		
		gs.log('Current-> '+label+'['+label+'], name['+name+']');

		//In case the customer choosed already another field to be used as tooltip
		//Then use the same field also in the new way of presenting tooltips
		if (description_field!==tooltip_info){
			gs.log('Set '+label+' ['+tooltip_info+'] -> ['+description_field+']');
			gr.setValue('tooltip_info', description_field);
			gr.update();
		}

		switch (name) {
		  case "outages_current":
		  	setIcon(gr,'images/app.ngbsm/indicators/outages-current.svg');
		  	setLabel(gr, 'Outages - current');
		    break;
		  case "outages_planned":
		  	setIcon(gr,'images/app.ngbsm/indicators/outages-planned.svg');
		  	setLabel(gr, 'Outages - planned');
		    break;
		  case "incident":
		  	setIcon(gr,'images/app.ngbsm/indicators/incident.svg');
		  	setLabel(gr, 'Incident');
		    break;
		  case "problem":
		  	setIcon(gr,'images/app.ngbsm/indicators/problem.svg');
		  	setLabel(gr, 'Problem');
		    break;
		  case "outages_past":
		  	setIcon(gr,'images/app.ngbsm/indicators/outages-past.svg');
		  	setLabel(gr, 'Outages - past');
		    break;
		  case "changes_current":
		  	setIcon(gr,'images/app.ngbsm/indicators/change.svg');
		  	setLabel(gr, 'Changes - current');
		    break;
		  case "changes_planned":
		  	setIcon(gr,'images/app.ngbsm/indicators/change-planned.svg');
		  	setLabel(gr, 'Changes - planned');
		    break;
		  case "changes_past":
		  	setIcon(gr,'images/app.ngbsm/indicators/change-past.svg');
		  	setLabel(gr, 'Changes - past');
		    break;
		  case "affected_ci_task":
		  	setIcon(gr,'images/app.ngbsm/indicators/affected.svg');
		  	setLabel(gr, "Affected CI's");
		    break;
		  default: 		   
		    gs.log("Found indicator  [" + name + "] which is not part of the OOTB indicators");
		}

	}//end-While
}//end-function

//This boolean function replace the generic icon with the one got from the input
//Return true if changed
function setIcon(gr , iconPath) {
	var icon = gr.getValue('icon');
	if (icon!==null && icon === 'images/app.ngbsm/indicators/generic-indicator.svg'){
			gs.log('Set the icon ['+iconPath+'] -> insted of ['+icon+']');
			gr.setValue('icon', iconPath);
			gr.update();	
			return true;
	} else {
		gs.log('Skip the icon ['+icon+']');
	}
	return false;
}

//This boolean function replace the empty label with the one got from the input
//Return true if changed
function setLabel(gr , newLabel) {		       
	var label = gr.getValue('label');
	if (label===null || label === '' ){
			gs.log('Set the label ['+newLabel+'] -> insted of ['+ label+']');
			gr.setValue('label', newLabel);
			gr.update();	
			return true;
	} else {
		gs.log('Skip the label ['+label+']');
	}
	return false;
}




