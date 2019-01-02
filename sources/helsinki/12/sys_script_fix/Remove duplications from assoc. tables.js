processAssocTable('svc_ci_assoc', 'ci_id');
processAssocTable('svc_rel_assoc', 'relation_id');

function processAssocTable(tableName, keyAttr) {
	if (isTableExist(tableName)) {
		if (!isCompositeIndexExist(tableName, keyAttr)) {
			var agg = getDuplications(tableName, keyAttr);
			deleteDuplications(agg, tableName);
		}else
			gs.log('Composite unique index already exists for ' + tableName);
	}
}

//This boolean function checks if given table exists in DB
function isTableExist(tableName) {
	var gr = new GlideRecord(tableName);
	return gr.isValid();
}

//This boolean function checks if unique composite index
//with field 'service_id' and given field (either 'ci_id' or 'relation_id')
//exists in DB table
function isCompositeIndexExist(tableName, keyAttr) {
	var td = GlideTableDescriptor.get(tableName);
	var allIndexDescrMap = td.getIndexDescriptors();
	var res = 0;
	
	var indexDescriptor;
	var indexFields;
	var indexField;
	var attrCount;
	var i;
	
	for (var iter = allIndexDescrMap.values().iterator(); iter.hasNext();) {
		indexDescriptor = iter.next();
		indexFields = indexDescriptor.getFields();

		if (!indexDescriptor.isUnique() || indexFields.size() != 2)
			continue;
		
		attrCount = 0;
		for (i = 0; i < indexFields.size(); i++) {
			indexField = indexFields.get(i).toLowerCase();
			if (indexField == 'service_id' || indexField == keyAttr)
				attrCount++;
		}
		if (attrCount == 2)
			res = 1;
	}
	return res;
}

//This function obtains all duplication (i.e. same service_id and ci_id/relation_id)
//that weill prevent from applying new unique index
//It issues SQL query: select service_id, ci_id, count(*) from svc_ci_id group by (service_id, ci_id) having (count(*) > 1)
function getDuplications(tableName, keyAttr) {
	var agg = new GlideAggregate(tableName);
	agg.addAggregate('COUNT', null);
	agg.groupBy('service_id');
	agg.groupBy(keyAttr);
	agg.addHaving('COUNT', '>', '1');
	agg.query();
    return agg;
}

//This function deletes all duplication (i.e. same service_id and ci_id/relation_id)
//that weill prevent from applying new unique index
//It leaves only one of each such group
function deleteDuplications(agg, tableName) {
	var toDelete = [];
	var count = 0;
	var total = 0;
	
	var allFields;
	var gr, grToProcess;
	var limit;
	var field;
	var i,n;

	while (agg.next()){
		allFields = agg.getFields();
		gr = new GlideRecord(tableName);
		limit = parseInt(agg.getAggregate('COUNT', null))-1;
		total += limit;
		gr.setLimit(limit);
		for (i = 0; i < allFields.size(); i++) {
			field = allFields.get(i);
			if (!field.hasValue())
				continue;
			gr.addQuery(field.getName(), agg.getValue(field.getName()));
		}
		toDelete[count++] = gr;
	}

	for (n = 0; n < count; n++) {
		grToProcess = toDelete[n];
		grToProcess.query();
		grToProcess.deleteMultiple();
	}
	if (total > 0)
		gs.log(total.toString() + ' records deleted from ' + tableName);
}