function getRecordProducerParent() {
	if (typeof parent === 'undefined' || parent == null) {
		if (current) {
			var parentGr = current.cat_item.getRefRecord();
			if (parentGr && parentGr.instanceOf('sc_cat_item_producer'))
				return parentGr.table_name;
		}
		return "";
	} else
		return parent.table_name;
}