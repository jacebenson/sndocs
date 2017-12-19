var MigrateNotificationItemField = Class.create();
MigrateNotificationItemField.prototype = {
    initialize: function() {
    },

	/**
	 * Migrates the sysevent_email_action's (notification) item field to the
	 * affected_field_on_event field (on the same notification) instead. This
	 * pulls off the 'event.' portion in the item table (typically leaving just
	 * 'parm1').
	 */
	migrate_notifications_from_item_to_affected_field_on_event: function() {
		// Go through every notification
		var notification = new GlideRecord("sysevent_email_action");
		notification.query();
		while (notification.next()) {
			// Ignore notifications where item or item_table are not filled out
			if (notification.item == "" || notification.item_table == "")
				continue;
			else if (notification.item != "event.parm1") {
				if (notification.item.substring(0, 6) != "event.") {
					gs.warn("While migrating a notification's (" +
							notification.sys_id + ") item column to " +
							"affected_field_on_event, unexpectedly a value " +
							"in item was '" + notification.item + "' and did " +
							"not start with 'event.'");
				}

				var field = notification.item.substring(6);
				if (field != "") {
					// Add the choice if it exists
					if (!this._doesChoiceExist(field)) {
						this._insertChoice(field);
					}

					notification.affected_field_on_event = field;
					notification.update();
				}
			} else {
				notification.affected_field_on_event = "parm1";
				notification.update();
			}
		}
	},

	/**
	 * Determines if this particular field is already in the choice list.
	 *
	 * @param field The field value that is being checked
	 * @return true if it is in the choice list, false otherwise
	 */
	_doesChoiceExist: function(field) {
		var choices = new GlideRecord("sys_choice");
		choices.addQuery("name", "sysevent_email_action");
		choices.addQuery("element", "affected_field_on_event");
		choices.addQuery("value", field);
		choices.query();
		return choices.next();
	},

	/**
	 * Inserts the choice field to the choice list.
	 *
	 * @param field The field value that is being inserted
	 */
	_insertChoice: function(field) {
		var choices = new GlideRecord("sys_choice");
		choices.setValue("name", "sysevent_email_action");
		choices.setValue("element", "affected_field_on_event");
		choices.setValue("label", field);
		choices.setValue("value", field);
		choices.insert();
	},

    type: 'MigrateNotificationItemField'
};