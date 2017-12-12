
var DocumentManagementUtils = Class.create();

DocumentManagementUtils.replaceRevision = function(name,revision) {
	
	var foundRevisions = DocumentManagementUtils.getRevisionFromName(name);
	
	if(foundRevisions[0]){
		name = name.replace(foundRevisions[0],revision);
		return name;
	}
	
	return name;	
};

/**
 * This method will compare two objects by checking that their attributes are equals.
 * If the attributes array is provided, it will then check only the attributes that are in the array.
 * Otherwise, it will check all their attributes.
 * 
 * @param Object object1
 * @param Object object2
 * @param Array attributes
 * @return Boolean 
 */
DocumentManagementUtils.areObjectAttributesEqual = function(object1,object2,attributes) {
	if(!attributes) {
		var attributes = new Array();
		for(attribute in object1){
			attributes.push(attribute);
		}
	}
	
	for(var i=0; i<attributes.length; i++){
		var attribute = attributes[i];
		if(object1[attribute]!=object2[attribute])
			return false;
	}
	return true;
};


DocumentManagementUtils.getRevisionFromName = function(name) {
	
	var foundRevisions = name.match(/([0-9]\.[0-9]\.[0-9])|([0-9]\.[0-9])/g);
	
	if(foundRevisions.length>0)
		return foundRevisions;
	
	return false;
};

DocumentManagementUtils.javaStringArrayToArray = function(stringArray){
	var elements = new Array();
	if(stringArray!="[]"){
		stringArray = stringArray.toString().replace("[","");
		stringArray = stringArray.replace("]","");
		stringArray = stringArray.replace(" ","");
    	var tmpTables = stringArray.split(",");
    	for(var i=0; i<tmpTables.length; i++){
    		elements.push(tmpTables[i].toString());
    	}
	}
	
	return elements;
};
