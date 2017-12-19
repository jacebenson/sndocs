var LabelIndexing = Class.create();
LabelIndexing.prototype = {
    initialize: function() {
    },

	onAssociationChange: function(association) {
		// we index only shared tags, and only based on the table indexing parameters
		var tableDescriptor = GlideTableDescriptor.get(association.table);
		if (tableDescriptor.hasTextIndex()) {
			var tagIndexLevel = tableDescriptor.getED().getAttribute('text_index_tags');
			var triggerIndex = false;
	
			if (tagIndexLevel == 'all_shared' || tagIndexLevel == 'everyone_only') {
				var label = new GlideRecord('label');
				if (label.get(association.label)) {
					if (tagIndexLevel == 'all_shared' && label.viewable_by != 'me')
						triggerIndex = true;
					else if (tagIndexLevel == 'everyone_only' && label.viewable_by == 'everyone')
						triggerIndex = true;
				}
			}
		
			if (triggerIndex)
				new GlideTextIndexEvent().update(association.table, association.table_key, 'tags');
		}
	},
	
	onLabelChange: function(newLabel, oldLabel) {
		if (newLabel.sys_id != oldLabel.sys_id)
			return;
		
		var newAudience = newLabel.viewable_by;
		var oldAudience = oldLabel.viewable_by;
		var audienceChanged = (newAudience != oldAudience);
		var nameChanged = (newLabel.name.tolowerCase() != oldLabel.name.toLowerCase());
		if (!audienceChanged && !nameChanged)
			return;
	
		var gr = new GlideRecord('label_entry');
		gr.addQuery('label', newLabel.sys_id);
		gr.orderBy('table');
		gr.query();
	
		if (gr.getRowCount() > 100) {
			// don't saturate the system with too many text index events
			gs.logWarning('Text indexes for label ' + newLabel.name + ' may be out of date');
			return;
		}		

		var table = '';
		var triggerIndex = false;
		var tagIndexLevel = '';
		while (gr.next()) {
			if (gr.table != table) {
				// retrieve the indexing settings for the new group of records
				table = gr.table.toString();
				triggerIndex = false;
				var tableDescriptor = GlideTableDescriptor.get(table);
				if (tableDescriptor.hasTextIndex()) {
					tagIndexLevel = tableDescriptor.getED().getAttribute('text_index_tags');
					if (tagIndexLevel == 'all_shared') {
						if (audienceChanged) {
							// only from private or to private require re-indexing
							if (newAudience == 'me' || oldAudience == 'me')
								triggerIndex = true;
						} else if (nameChanged) {
							// reindex all shared tags
							triggerIndex = (newAudience != 'me');
						}
					} else if (tagIndexLevel == 'everyone_only') {
						if (audienceChanged) {
							// only from or to everyone require re-indexing
							if (newAudience == 'everyone' || oldAudience == 'everyone')
								triggerIndex = true;
						} else if (nameChanged) {
							// only re-index tags viewable by everyone
							triggerIndex = (newAudience == 'everyone');
						}
					}
				}
			}

			// queue indexing event if required
			if (triggerIndex)
				new GlideTextIndexEvent().update(table, gr.table_key, 'tags');
		}
	},

    type: 'LabelIndexing'
}