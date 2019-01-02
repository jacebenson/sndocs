function onLoad() {
	var tableName = g_form.getTableName();
	var templateValueColName = 'template';
	
	if (isDoctype())
		setTemplateReadOnlyDoctype();
	else
		setTemplateReadOnlyNonDoctype();
	
	function setTemplateReadOnlyDoctype() {
		var templateFieldHandler = g_form.elementHandlers[tableName + "." + templateValueColName];
		
		// override this function to include disabling elements with class "filter-reference-input
		templateFieldHandler.setReadOnly = function(disabled) {
			var parentElement = this.fDiv.parentNode;
			if (this._toggleReadOnlyAttribute)
				this._toggleReadOnlyAttribute(disabled);
			this._hideClass(parentElement, "filerTableAction", disabled);
			this._disableClass(parentElement, "filerTableSelect", disabled);
			this._disableClass(parentElement, "filerTableInput", disabled);
			this._disableClass(parentElement, "filter-reference-input", disabled);
			this.setFilterReadOnly(disabled);
			this.disabledFilter = disabled;
		};
		
		// override this function to set the field back to read only once setValue has been called
		templateFieldHandler.setValue = function(value) {
			this.setQuery(value);
			if (this.filterReadOnly)
				this.setReadOnly("true");
		};
		
		// override this function to prevent the removal of the entire template field from the form
		// when "setReadOnly" is called
		templateFieldHandler._hideClass = function(parentElement, className, hideIt) {
			var elements = $(parentElement).select("." + className);
			for (var i = 0; i < elements.length; i++) {
				if (hideIt)
					hideObject(elements[i]);
				else
					showObjectInline(elements[i]);
			}
			var placeholderRows = parentElement.select('tr.filter_row_condition[type="placeholder"]');
			if (placeholderRows && placeholderRows[0])
				placeholderRows[0].setStyle(hideIt ? "display:none" : "display:table");
		};
		
		if (g_scratchpad.is_template_readonly) {
			CustomEvent.observe('filter:GlideTemplateFilter-done', function(){
				g_form.setReadOnly(templateValueColName, true);
			});
		}
	}
	
	function setTemplateReadOnlyNonDoctype() {
		if (!g_scratchpad.is_template_readonly)
			return;
		
		var filterParentEl;
		var i = 0;
		var timedFilterCheck = setInterval(function() {
			if (GlideFilter && !filterParentEl && g_form.getValue(
				templateValueColName)) { //check for filter to be ready
				if (i > 10) {
					clearInterval(timedFilterCheck);
				}
				filterParentEl = gel(tableName + '.' + templateValueColName +
				'gcond_filters');
				
				if (filterParentEl) {
					var _hideClass = GlideFilter.prototype._hideClass;
					var _disableClass = GlideFilter.prototype._disableClass;
					var disabled = true;
					_hideClass(filterParentEl, "filerTableAction", disabled);
					_disableClass(filterParentEl, "filerTableSelect", disabled);
					_disableClass(filterParentEl, "filerTableInput", disabled);
					_disableClass(filterParentEl, "filter-reference-input", disabled);
				}
				i++;
			}
		}, 50);//end of setInterval
	}
}