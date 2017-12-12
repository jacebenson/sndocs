var NoteTemplate = Class.create();
NoteTemplate.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	setTemplateVariables: function () {
		var template = this.getParameter("sysparm_template");
		var tableName = this.getParameter("sysparm_table_name");
		var tableSysId = this.getParameter("sysparm_table_sys_id");
		var matched = template.match(/\${([^}]*)}/g);
		var gr = new GlideRecord(tableName);

		if (gr.get(tableSysId)) {
			for (var i in matched) {
				var element = gr;
				var field;
				var str = matched[i].match(/\${(.*)}/).pop();
				str = str.trim();
				if (!str)
					continue;
				var references = str.split(/[\.]+/g);
				for (var j = 0; j < references.length; j++) {
					field = references[j];
					if (j == references.length - 1)
						break;
					if (element != null && element.isValidField(field)) {
						if (element.getElement(field).canRead())
							element = element.getElement(field).getRefRecord();
						else {
							template = template.replace(matched[i], "<font color='#ff0000'>"+matched[i]+"</font>");
							break;
						}
					}
					else
						break;
				}
				if (element != null && element.isValidField(field)) {
					if (element.getElement(field).canRead())
						template = template.replace(matched[i], element.getDisplayValue(field));
					else
						template = template.replace(matched[i], "<font color='#ff0000'>"+matched[i]+"</font>");

				}
				else if (field == "Date") {
					var currentTime = new GlideDateTime();
					currentTime= currentTime.getDisplayValue().toString();
					currentTime= currentTime.split(" ");
					var currentDate = currentTime[0];

					template = template.replace(matched[i], currentDate);
				}
				else
					template = template.replace(matched[i], "<font color='#ff0000'>"+matched[i]+"</font>");

			}

		}

		return template;
	},

	validateTemplate: function(parsedBody, tableName){
		var unEvaluatedVariable = [];
		var inaccessibleVariable = [];

		if (!tableName)
		  return parsedBody;
		else {
			parsedBody = this.resetErroredSpanInDocument(parsedBody);
			var regex = /\${([^}]*)}/g;
			var matched = parsedBody.match(regex);
			var gr = new GlideRecord(tableName);
			gr.initialize();
			if (gr) {
				for (var i in matched) {
					if (unEvaluatedVariable.indexOf(matched[i]) > -1  || inaccessibleVariable.indexOf(matched[i]) > -1 || matched[i] == "${Date}")
						continue;
					var element = gr;
					var field;

					var str = matched[i].match(/\${(.*)}/).pop();
					str = str.trim();

					if (!str)
						continue;
					var references = str.split(/[\.]+/g);
					for (var j=0; j< references.length;j++) {
						field = references[j];
						if ( j == references.length-1)
							break;
						if (element.isValidField(field)) {
							if (element.getElement(field).canRead())
								element = element.getElement(field).getRefRecord();

							else {
								parsedBody = parsedBody.replace(matched[i], '<span class="errored-field" style="color:#ff0000;">'+matched[i]+'</span>');
								inaccessibleVariable.push(matched[i]);
								break;
							}
						}
						else
							break;
					}
					if (element.isValidField(field)) {
						if (!element.getElement(field).canRead()) {
							parsedBody = parsedBody.replace(matched[i], '<span class="errored-field" style="color:#ff0000;">'+matched[i]+'</span>');
							inaccessibleVariable.push(matched[i]);
						}
					}
					else {
						if (field == "Date")
							continue;

						parsedBody = parsedBody.replace(matched[i], '<span class="errored-field" style="color:#ff0000;">' + matched[i] + '</span>');
						unEvaluatedVariable.push(matched[i]);
					}
				}
			}
			var result = [];
			result.push(parsedBody);
			result.push(unEvaluatedVariable);
			result.push(inaccessibleVariable);
			return result;

		}
	},

	resetErroredSpanInDocument : function(documentBody) {
		//regular expression that matches all the span pairs in the documentBody with class as errored-field
		var spanRegex = /<\s*span\s*class="errored-field".*?>/g;
		var matchedSpanTags = documentBody.match(spanRegex);
		for (var i in matchedSpanTags) {
			documentBody = documentBody.replace(matchedSpanTags[i],"<span>");
		}
		return documentBody;
	},

	 type: 'NoteTemplate'
});