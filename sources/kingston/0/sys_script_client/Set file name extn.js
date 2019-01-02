function onLoad() {

	var name = g_form.getControl('name');
	name.addEventListener('change', setFileName);
	
	var format = g_form.getControl('format');
	format.addEventListener('change', setFileExtnAndMaxRow);
		
	//On load always set the correct max row for the selected format
	setMaxRowDefaultValue();

	//Don't build the filename unless it is missing
	var fName = g_form.getControl('file_name');
	if (fName.value === ''){
		setFileName();
	}
	
}

function setFileExtnAndMaxRow() {
	setMaxRowDefaultValue();
	setFileExtn();
}

function setFileName() {
	var name = g_form.getControl('name');
	var fName = g_form.getControl('file_name');
	var format = g_form.getControl('format');
	
	if (name.value === "") {
		fName.value = "";
		return;
	}
	
	var fileName = name.value.toLowerCase();
	fileName = getNormalizeFileName(fileName);
	fName.value = fileName;
	
	setFileExtn();
}

function setMaxRowDefaultValue() {
	var max = g_form.getControl('max_rows');
	var format = g_form.getControl('format');
	
	var esajax = new GlideAjax('ExportSetHelper');
	var propertyName = 'glide.' + format.value.toLowerCase() + '.export.limit';
	esajax.addParam('sysparm_name', 'getMaxRowProperty');
	esajax.addParam('sysparm_propertyName', propertyName);
	esajax.getXML(function(resp) {
		var rootNode = resp.responseXML.getElementsByTagName('xml');
		var maxValue = rootNode[0].getAttribute('answer').replace(',', '');
		max.placeholder = maxValue;
		if (max.value == "0") //Allow the placeholder to be visible
			max.value = "";
	});
}

function setFileExtn() {
	var format = g_form.getControl('format');
	var fName = g_form.getControl('file_name');
	var fNameValueNoExtn = getFileNameNoExtn(fName.value);
	
	if (format.value == "XML")
		fNameValueNoExtn += ".xml";
	else if (format.value == "Excel")
		fNameValueNoExtn += ".xls";
	else if (format.value == "XLSX")
		fNameValueNoExtn += ".xlsx";
	else if (format.value == "CSV")
		fNameValueNoExtn += ".csv";
	else if (format.value == "JSON")
		fNameValueNoExtn += ".json";
	fName.value = fNameValueNoExtn;
}

function getNormalizeFileName(name) {
	var fNameNoExtn = getFileNameNoExtn(name);
	
	fNameNoExtn = fNameNoExtn.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
	if (fNameNoExtn.length > 36) {
		fNameNoExtn = fNameNoExtn.substring(0, 36);
	}
	return fNameNoExtn;
}

function getFileNameNoExtn(fName) {
	var fNameNoExtn = fName;
	if (fNameNoExtn.indexOf('.') != -1) {
		fNameNoExtn = fNameNoExtn.substring(0, fNameNoExtn.indexOf('.'));
	}
	return fNameNoExtn;
}
