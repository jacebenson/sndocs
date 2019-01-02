function setDownloadButton(e) {
	var downloadButton = gel("downloadButton");
	var selectedSysIdsElement = gel("selected_sys_ids");
	var selectedSysIds = [];
	var selectedString = selectedSysIdsElement.value;
	if (selectedString)
		selectedSysIds = selectedString.split(";");

	var thisId = e.name;
	if (e.checked) {
		downloadButton.removeAttribute('disabled');
		selectedSysIds.push(thisId);
	} else {
		var index = selectedSysIds.indexOf(thisId);
		selectedSysIds.splice(index, 1);

		var inputs = document.getElementsByTagName("input");
		var nonechecked = true;
		var i = 0;
		while (i < inputs.length && nonechecked) {
			if (inputs[i].type === "checkbox" && inputs[i].checked)
				nonechecked = false;

			i++;
		}
		if (nonechecked)
			downloadButton.setAttribute('disabled', 'true');

	}
	selectedSysIds = selectedSysIds.join(";");
	selectedSysIdsElement.value = selectedSysIds;
}

function selectAll(master) {
	var downloadButton = gel("downloadButton");
	var checkboxes = document.getElementsByClassName("systemID");
	var selectedSysIdsElement = gel("selected_sys_ids");
	var selectedArray = [];
	for (var i = 0; i < checkboxes.length; i++) {
		document.getElementById(checkboxes[i].id).checked = master.checked;
		selectedArray.push(checkboxes[i].value);
	}
	if (master.checked) {
		selectedSysIdsElement.value=selectedArray.join(';');
		downloadButton.removeAttribute('disabled');
	} else {
		selectedSysIdsElement.value="";
		downloadButton.setAttribute('disabled', 'true');
	}
}

function selectDateRange() {
	var dateRangeTab = gel("dateRangeTab");
	dateRangeTab.setAttribute('class', 'active');
	var oneDayTab = gel("oneDayTab");
	oneDayTab.setAttribute('class', 'deactive');
	var dateRangeTable = gel("dateRangeTable");
	dateRangeTable.setAttribute('class', 'show');
	var oneDayTable = gel("oneDayTable");
	oneDayTable.setAttribute('class', 'hidden');
}

function selectOneDay() {
	var dateRangeTab = gel("dateRangeTab");
	dateRangeTab.setAttribute('class', 'deactive');
	var oneDayTab = gel("oneDayTab");
	oneDayTab.setAttribute('class', 'active');
	var dateRangeTable = gel("dateRangeTable");
	dateRangeTable.setAttribute('class', 'hidden');
	var oneDayTable = gel("oneDayTable");
	oneDayTable.setAttribute('class', 'show');
}

function checkStartDate() {
	var currentDate = new Date();
	var startDate = new Date(gel('startDate').value);
	var dateRange = gel('date_range').value;
	if (OutOfDateRange(currentDate, startDate, dateRange)) {
		alert(new GwtMessage().getMessage("Please select a date within " + dateRange + " days"));
		gel('startDate').value = new Date().toJSON().slice(0,10);
	}
	if (currentDate < startDate) {
		alert(new GwtMessage().getMessage("Please select a date no later than today"));
		gel('startDate').value = new Date().toJSON().slice(0,10);
	}
	gel('date').value=gel('startDate').value;
}

function checkEndDate() {
	var currentDate = new Date();
	var startDate = new Date(gel('startDate').value);
	var endDate = new Date(gel('endDate').value);
	if (endDate < startDate) {
		alert(new GwtMessage().getMessage("Please select a date after start date"));
		gel('endDate').value = new Date().toJSON().slice(0,10);
	}
	if (currentDate < endDate) {
		alert(new GwtMessage().getMessage("Please select a date no later than today"));
		gel('endDate').value = new Date().toJSON().slice(0,10);
	}
	gel('date').value=gel('endDate').value;
}

function checkDate() {
	var currentDate = new Date();
	var date = new Date(gel('date').value);
	var dateRange = gel('date_range').value;
	if (OutOfDateRange(currentDate, date, dateRange)) {
		alert(new GwtMessage().getMessage("Please select a date within " + dateRange + " days"));
		gel('date').value = new Date().toJSON().slice(0,10);
	}
	if (currentDate < date) {
		alert(new GwtMessage().getMessage("Please select a date no later than today"));
		gel('date').value = new Date().toJSON().slice(0,10);
	}
	gel('startDate').value=gel('date').value;
	gel('endDate').value=gel('date').value;
}

//check whether the select date is within the date range that defined in GlideProperty
function OutOfDateRange(currentDate, date, dateRange) {
	return currentDate - date > (dateRange * 24 * 60 * 60 * 1000);
}

function scheduleCreation() {
	var select = getNotification();
	if (select === 'email') {
		var email = gel('emailAddress').value;
		if (!email) {
			alert(new GwtMessage().getMessage("Please specify an email address"));
			return false;
		}
	} else
		gel('emailAddress').value = '';

	if (downloadingInProcess())
		alert(new GwtMessage().getMessage("Another similar download is already in progress, please try later."));
	else
		schedule();

	return false;
}

function getNotification() {
	var notification = document.getElementsByName('notify');
	for (var i=0; i < notification.length; i++)
		if (notification[i].checked)
			return notification[i].value;

}

function downloadingInProcess() {
	var gr = new GlideRecord('sys_execution_tracker');
	gr.addQuery('name', 'Uploading Logs from Selected Nodes');
	gr.orderByDesc('sys_created_on');
	gr.setLimit(1);
	gr.query();
	if (!gr.next())
		return false;

	return gr.getValue('state') === '1';
}

function schedule() {
	var ga = new GlideAjax('ScheduleNodesLogsDownload');
	ga.addParam('sysparm_name','schedule');
	ga.addParam('sysparm_selected_sys_ids', getSelectedNode());
	ga.addParam('sysparm_email', gel('emailAddress').value);
	ga.addParam('sysparm_protocol', window.location.protocol);
	ga.addParam('sysparm_host', window.location.host);

	var dateRange = getDateRange(gel('startDate').value, gel('endDate').value);
	ga.addParam('sysparm_date_range', dateRange);

	if (gel('emailAddress').value === '')
		ga.getXML(redirect);

	else {
		ga.getXML();
		alert(new GwtMessage().getMessage(formatMessage('An email will be sent to {0} upon completion.', gel('emailAddress').value)));
		GlideModal.get().destroy();
	}
}

function getDateRange(startDate, endDate){
	var dateArray = [];
	var currentDate = startDate;
	while (currentDate <= endDate) {
		dateArray.push(currentDate);
		var oneDayAfter = new Date(new Date(currentDate).getTime() + 24*60*60*1000);
		currentDate = oneDayAfter.toJSON().slice(0,10);
	}
	return dateArray.join(';');
}

function redirect(response) {
	var tableSysID = response.responseXML.documentElement.getAttribute("answer");
	if (tableSysID === undefined)
		return;

	window.location.href = window.location.protocol + "//" + window.location.host + '/node_log_download_info.do?sys_id=' + tableSysID;
}
	