ArrayPolyfill;

var MIDExtensionRelatedListUtil;

(function() {

MIDExtensionRelatedListUtil = {
	getAllRelatedData: getAllRelatedData,
	getReferenceData: getReferenceData
};

/**
 * Gets all related data for the given Glide Record.
 *
 * @param gr the Glide Record to get related data
 * @param data the related data object to store
 */
function getAllRelatedData(gr, data) {
	var agg, qc, rel_gr, list_id, rel, rel_table, rel_field, m2m_rel, list_table_name, rels, rel_data;

	// get the real glide record just in case we're given a record from a base table
	gr = GlideScriptRecordUtil.get(gr).getRealRecord();
	
	// get distinct set of list entries from all UI related lists tied to the table
	// since we may have multiple views with duplicate entries
	agg = new GlideAggregate('sys_ui_related_list_entry');
	agg.addAggregate('count(distinct','related_list');

	// build up query condition to OR the list by list_id
	rel_gr = new GlideRecord('sys_ui_related_list');
	rel_gr.addQuery('name', gr.getTableName());
	rel_gr.query();
	while (rel_gr.next()) {
		list_id = rel_gr.sys_id + '';
		if (JSUtil.nil(qc))
			qc = agg.addQuery('list_id', list_id);	// add first condition to aggregate
		else
			qc.addOrCondition('list_id', list_id);	// add subsequent condition as OR condition
	}

	// if there is no query condition then there is no list to process
	if (JSUtil.nil(qc))
		return;

	// Process each distinct entry. The entry will have the format
	// <related_table>.<related_field>
	// and can be either reference or many-to-many type.
	// E.g.
	//     ecc_agent_config.ecc_agent        (reference)
	//     ecc_agent_capability_m2m.agent    (many-to-many)
	agg.query();
	while (agg.next()) {
		// split entry into related table name and field name
		rel = agg.related_list.split('.', 2);
		rel_table = rel[0];
		rel_field = rel[1];

		// Determine if type is many-to-many by attempting to get m2m relationship.
		// If returned value is null then type is reference. If type is reference,
		// use the related table name directly as the label. If type is m2m, use
		// the table at the other end of the m2m relationship.
		m2m_rel = getM2mRelationship(rel_table, rel_field);
		list_table_name = (!m2m_rel) ? rel_table : m2m_rel.table;

		// set up query to get all related records for this relationship
		rel_gr = new GlideRecord(rel_table);
		rel_gr.addQuery(rel_field, gr.sys_id);

		// if field 'order' exists, use it for sorting
		if (GlideTableDescriptor.fieldExists(rel_table, 'order'))
			rel_gr.orderBy('order');

		// query for all related records, process according to reference or m2m type,
		// and add to list
		rels = [];
		rel_gr.query();
		while (rel_gr.next()) {
			if (!m2m_rel)
				rel_data = getRelatedData(rel_gr, rel_field);
			else
				rel_data = getM2mRelatedData(rel_gr, m2m_rel);
			rels.push(rel_data);
		}

		data[list_table_name] = rels;
	}
}

/**
 * Gets the many-to-many related data.
 *
 * @param rel_gr the related Glide Record
 * @param m2m_rel the many-to-many relationship
 */
function getM2mRelatedData(rel_gr, m2m_rel) {
	// get the glide record at the other end of the m2m relationship
	var rel_ref_gr = new GlideRecord(m2m_rel.table);
	rel_ref_gr.get(rel_gr[m2m_rel.field]);

	// now get the data for this related record
	// note that since this record is not the relationship entry itself,
	// it does not have a related field
	return getRelatedData(rel_ref_gr);
}

/**
 * Gets the related data.
 *
 * @param rel_gr the related Glide Record
 * @param rel_field_name the related field name (which is to be ignored since this is what we started out with)
 */
function getRelatedData(rel_gr, rel_field_name) {
	var real_gr, fields, elem, name, value, descriptor, obj = {};

	// get the real record and process each field that is not ignored and has value
	real_gr = GlideScriptRecordUtil.get(rel_gr).getRealRecord();
	fields = real_gr.getFields();
	for (index = 0; index < fields.size(); index++) {
		// get field's name and value
		elem = fields.get(index);
		name = elem.getName() + '';
		value = elem.getElementValue(name);

		// skip if not interested
		if (isIgnoredField(name) || name == rel_field_name || JSUtil.nil(value))
			continue;

		// use descriptor to see if it's a reference field and handle accordingly
		descriptor = elem.getED();
		if (descriptor.isReference()) {
			// get reference data from the descriptor where value is the sys_id
			obj[name] = getReferenceData(descriptor, value);
		} else {
			// save field data as a simple value
			obj[name] = value + '';
		}
	}
	return obj;
}

/**
 * Gets the many-to-many relationship at the other end.
 *
 * @param table_name the m2m table name
 * @param ref_field_name the reference field name of the starting end
 */
function getM2mRelationship(table_name, ref_field_name) {
	var td, fields, has_ref_field, rel_ref, references = 0, field_name, ed;

	// Unfortunately, the platform does not store the 'mtom' attribute of the m2m relationship.
	// This attribute is loaded at table creation time to assist that process but does not persist
	// in the DB itself. So we have to come up with something more heuristic. We consider the
	// relationship many-to-many if:
	//     1. it does not have any non-reference, non-ignored fields
	//     2. it has exactly 2 reference fields
	//     3. one of the reference fields is the starting reference field
	td = GlideTableDescriptor.get(table_name);
	fields = td.getActiveFieldNames();
	for (idx = 0; idx < fields.size(); idx++) {
		field_name = fields.get(idx);
		if (isIgnoredField(field_name))
			continue;

		ed = td.getElementDescriptor(field_name);
		if (!ed.isReference())
			return;

		if (++references > 2)
			return;

		if (field_name == ref_field_name)
			has_ref_field = true;
		else
			rel_ref = { field: field_name, table: ed.getReference() };
	}

	if (has_ref_field)
		return rel_ref;

	return;
}

/**
 * Gets the data from a reference.
 *
 * @param descriptor the descriptor of the reference
 * @param sys_id the sys_id of the reference
 */
function getReferenceData(descriptor, sys_id) {
	var ref_table, ref_gr, ref, ref_name, ref_value, ref_data = {};

	ref_table = descriptor.getReference();
	ref_gr = new GlideRecord(ref_table);
	if (!ref_gr.get(sys_id))
		return ref_data;

	// look up all fields of the reference and add to parameters
	var ref_fields = ref_gr.getFields();
	for (idx = 0; idx < ref_fields.size(); idx++) {
		ref = ref_fields.get(idx);
		ref_name = ref.getName();
		ref_value = ref.getElementValue(ref_name);

		// skip ignored fields or nil value
		if (isIgnoredField(ref_name) || JSUtil.nil(ref_value))
			continue;

		ref_data[ref_name] = ref_value + '';
	}
	return ref_data;
}


/**
 * Checks to see if the field should be ignored:
 *     1. a system field (begins with 'sys_')
 *     2. 'description'
 *     3. 'short_description'
 *     4. 'order'
 * @param field_name the field name to check
 */
function isIgnoredField(field_name) {
	return field_name.indexOf('sys_') == 0 || field_name == 'description' || field_name == 'short_description' || field_name == 'order';
}

})();
