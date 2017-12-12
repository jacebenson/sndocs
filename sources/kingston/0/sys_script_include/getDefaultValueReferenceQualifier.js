function getDefaultValueReferenceQualifier() {
	var isReference = current.internal_type == "reference";
	if (current.getRecordClassName() == "item_option_new")
		isReference = current.type == "8";

	if (isReference)
		return 'active=true^available_for_default=1^field_type.name=reference^table=' + current.reference;
	
	var refQual = 'active=true^available_for_default=1';
	if (typeof current.internal_type !== "undefined")
		refQual += '^field_type.name=' + current.internal_type;

	
	return refQual;
}