makeChoices();

		function makeChoices() {
			if (getChoices())
				gs.addInfoMessage("Choices already exist for this field");
			else
				createChoices();

			action.setRedirectURL(current);
		}

		function getChoices() {
			var gr = new GlideRecord('sys_choice');
			gr.addQuery('name', current.name);
			gr.addQuery('element', current.element);
			gr.query();
			if (gr.next())
				return true;

			return false;
		}


		function createChoices() {
			if (current.dependent.isNil())
				createStandAlone();
			else
				createDependent();

			unloadChoices();
		}

		function createStandAlone() {
			var choicesCreated = 0;
			var gr = new GlideAggregate(current.name);
			gr.addAggregate("COUNT", current.element);
			gr.query();
			while (gr.next()) {
				var c = gr.getAggregate("COUNT", current.element);
				var v = gr.getValue(current.element);
				if (createChoice(v, ""))
					choicesCreated++;
			}
			if (choicesCreated == 0)
				createDefaultChoice();
		}


		function createDependent() {
			var choicesCreated = 0;
			var gr = new GlideAggregate(current.name);
			gr.addAggregate("COUNT", current.element);
			gr.groupBy(current.dependent);
			gr.groupBy(current.element);
			gr.query();
			while (gr.next()) {
				var c = gr.getAggregate("COUNT", current.element);
				var v = gr.getValue(current.element);
				var d = gr.getValue(current.dependent);
				if (createChoice(v, d))
					choicesCreated++;
			}
			if (choicesCreated == 0)
				createDefaultChoice();
		}

		function createChoice(v, d) {
			if ( v == '')
				return false;
			var gr = new GlideRecord('sys_choice');
			gr.name = current.name;
			gr.element = current.element;
			gr.label = v;
			gr.value = v;
			gr.dependent_value = d;
			gr.language = "en";
			gr.setWorkflow(false);
			gr.insert();
			return true;
		}


		function createDefaultChoice() {
			var v = gs.getMessage("-- New choice --");
			var ctype = current.internal_type;
			if (isNumberType(ctype))

				v = "0";

			var d = "";
			if (!current.dependent.isNil()) {
				var sysDic = new GlideRecord('sys_dictionary');
				sysDic.addQuery('name', current.name);
				sysDic.addQuery('element', current.dependent);
				sysDic.query();
				d = gs.getMessage("-- Edit this --");
				if (sysDic.next()) {
					var dtype = sysDic.getValue('internal_type');
					if (isNumberType(dtype)) {
						d = "0";
					}
				}
			}

			var gr = new GlideRecord('sys_choice');
			gr.name = current.name;
			gr.element = current.element;
			gr.label = gs.getMessage("-- New choice --");
			gr.value = v;
			gr.dependent_value = d;
			gr.language = "en";
			gr.setWorkflow(false);
			gr.insert();
		}


		function isNumberType(t) {
			if (t.nil())
				return false;
			if (t == 'integer' || t == 'decimal' || t == 'float' || t == 'currency' || t == 'price' || t == 'duration' || t == 'numeric')

				return true;
			else
				return false;
		}


		function unloadChoices() {
			gs.unloadChoices(current.name, current.element);
		}
