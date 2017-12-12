var CertificationTemplateUtils = {
	isNewUI: true,
	filter: null,
	fieldName: "condition",
	dependent: "table",
	dependentTable: null,
	certTemplateTable: null,
	dependentTableRelatedLists: null,
	dependentTableRelatedListsJSON: null,
	restrictedFields: null,
	extendedOps: "",
	usageCtx: "element_conditions",
	singleRow: "true",
	sysId: null,
	isRelationship: {},
	relTypeTable: {},
	reverseRestriction: "true",
	allTables: [],
	_errorMessageShown: false,
	_editingRecordId: null,
	_editingTable: null,
	_relatedListTable: null,
	_updatedConds: {},
	_deletedConds: {},
	_newConds: {},
	_tempNewCond: null,
	_onAdds: [],
	_onDeletes: [],
	_onBeforeUnDeletes: [],
	_onUpdates: [],
	_operators: [],
	_relatedListSelectEl: null,
	_relatedListNotSelected: false,
	auditTypeTables: {
		'desired_state': [
		    'cert_attr_cond', 
		    'cert_ci_rel_cond', 
		    'cert_user_rel_cond', 
		    'cert_group_rel_cond',
			'cert_related_list_cond'
		],
		'data_cert': ['cert_attr_cond'],
		'arch_cert': ['cert_attr_cond', 'cert_related_list_cond'],
		'comp_cert': ['cert_attr_cond', 'cert_related_list_cond']
	},
	
	addCondition: function(target, condTable) {
		this.cancelFilter();
		
		var newCondId = guid();
		this._tempNewCond = condTable + "_" + newCondId;
		target.onclick = null;
		var row = target.parentNode.parentNode;
		
		var clone = row.cloneNode(true);
		this._clone = clone;
		this._observeInsert(condTable, false);
		
		var filterSpan = this._createFilterDOM(row, condTable, newCondId);
		this.editCondition(filterSpan, condTable, newCondId, true);
	},
	
	getDescriptorPrefix: function(condTable) {
		var result = '';
		switch(condTable) {
			case 'cert_user_rel_cond':
				result = 'sys_user';
				break;
			case 'cert_group_rel_cond':
				result = 'sys_user_group';
				break;
		}
		return result;
	},
	
	_getTargetTable: function(condTable) {
		var result = '';
		switch(condTable) {
			case 'cert_user_rel_cond':
				result = 'sys_user';
				break;
			case 'cert_group_rel_cond':
				result = 'sys_user_group';
				break;
			case 'cert_ci_rel_cond':
				result = 'cmdb_ci';
				break;
		}
		return result;
	},
	
	editCondition: function(target, condTable, condId, addRelatedList) {
		if(this.filter || this._relatedListNotSelected)
			this.cancelFilter();

 		// to allow Related Fields 
		filterExpanded = true;

		this._editingRecordId = condId;
		this._editingTable = condTable;
		
		var cond = target.getAttribute('data');
		
		var field = condTable + "_" + condId;
		if(field in this._deletedConds)
			return;
		
		var selectWidgetEl = null;
		if(addRelatedList && condTable == 'cert_related_list_cond') {
			selectWidgetEl = this._createRelatedListSelectWidget();
		} else if(condTable != 'cert_related_list_cond' && this.certTemplateTable != null)
			this.dependentTable = this.certTemplateTable;
		
		var content = this._createWidget(condTable, cond);
		var controls = this._createControls();
		
		target.style.display = "none";
		var filterHolderId = "cert_condition_filter_" + condTable + "_" + condId;
		var filterHolder = gel(filterHolderId);
		filterHolder.appendChild(content);
		filterHolder.style.display = "";
		
		var controlHolderId = "cert_condition_controls_" + condTable + "_" + condId;
		var controlHolder = gel(controlHolderId);
		controlHolder.appendChild(controls);
		controlHolder.style.display = "";
		
		var descriptor = target.getAttribute('descriptor');
		var prefix = this.getDescriptorPrefix(condTable);
		this._createFilter(condTable, condId, cond, descriptor, prefix);
		
		if(addRelatedList && condTable == 'cert_related_list_cond') {
			//Add widget for related lists to the filter
			var filterHolderId = "cert_condition_filter_" + this._editingTable + "_" + this._editingRecordId;
			var filterHolderEl = gel(filterHolderId); 
			var parentFilterHolderEl = filterHolderEl.parentElement != null? (filterHolderEl.parentElement.parentElement) : null;
			if (parentFilterHolderEl != null && selectWidgetEl != null) {
				var checked = target.getAttribute('checked');
				var quantifier = this._createQuantifier(condId, checked);
				parentFilterHolderEl.insertBefore(quantifier, parentFilterHolderEl.firstChild);
				parentFilterHolderEl.insertBefore(selectWidgetEl, parentFilterHolderEl.firstChild);
			}
			this._relatedListNotSelected = true;
		} 
	},
	
	_createQuantifier: function(condId, checked) {
	    var wrapper = cel('td');
	    var span = cel('span');
	    wrapper.appendChild(span);

	    var checkBox = cel('input');
	    checkBox.type = 'checkbox';
	    var id = "checkbox_" + condId;
	    checkBox.id = id; 
	    span.appendChild(checkBox);
	    // setting property must come after append due to IE8 issue
	    checkBox.checked = checked=='checked' ||
			checked==='true' || checked===true ? 'checked':'';

	    // follow UI macro styling
	    var quantifierText = 'All';
	    var text = document.createTextNode(quantifierText);
	    if (!this.isNewUI) {
	    	span.appendChild(text);
	    	checkBox.className ='show-rel-cb';
	    } else {
	    	var label = cel('label');
	    	label.className = 'checkbox-label';
	    	label.setAttribute('for', id);
	    	label.appendChild(text);

	    	span.className = 'input-group-checkbox';
	    	span.appendChild(label);
	    	checkBox.className = 'checkbox show-rel-cb';
	    }

	    this._relatedListQuantifierEl = wrapper;
	    return wrapper;
	},

	_quantifierChecked: function (checkBoxId) {
	    var quantifierCheckBox = $(checkBoxId);
	    return quantifierCheckBox && 
	        quantifierCheckBox.checked==true?'true':'false';
	},
	
	destroyQuantifierCheckBox: function() {
		if(this._relatedListQuantifierEl != null &&
				this._relatedListQuantifierEl.parentElement != null)
			this._relatedListQuantifierEl.parentElement.removeChild(this._relatedListQuantifierEl);
		
		this._relatedListQuantifierEl = null;
	},

	_createRelatedListSelectWidget: function() {
		var wrapper = cel('td');
		var selectWidget = _createFilterSelect("200", false);
		selectWidget.onchange = this._relatedListChange.bind(this);
		this._relatedListSelectEl = selectWidget;
		
		var key = null;
		var value = null;
		var obj = null;
		if(this.dependentTableRelatedListsJSON == null) {
			var jsonObject = this.dependentTableRelatedLists.evalJSON();
			this.dependentTableRelatedListsJSON = jsonObject['relatedLists'];
		}
		
		var spanId = this._editingTable + '_' + this._editingRecordId;
		var selectedFilterSpan = gel(spanId);
		var relatedListId = (selectedFilterSpan != null)? selectedFilterSpan.getAttribute('related-list-table') : '';
		this.dependentTable = (relatedListId != null && relatedListId != '')? relatedListId.split('.')[0] : '';
		// handle Relationship
		if (relatedListId != null && relatedListId.indexOf('REL:') != -1) {
			relatedListId = relatedListId.split('.')[1];
		}

		var relatedListObj;
		var relatedListLen = this.dependentTableRelatedListsJSON.length;
		addOption(selectWidget, 'CHOOSE_RELATED_LIST', getMessage('-- choose related list --'));
		for(var index=0; index < relatedListLen; index++) {
			relatedListObj = this.dependentTableRelatedListsJSON[index];
			addOption(selectWidget, relatedListObj.key, relatedListObj.label, (relatedListObj.key == relatedListId)? true : false);
		}
		
		wrapper.appendChild(selectWidget);
							
		return wrapper;
	},
	
	_relatedListChange: function() {
		var condTable = this._editingTable;
		var condId = this._editingRecordId;
		var spanId = condTable + '_' + condId;
		var selectedFilterSpan = gel(spanId);
		
		this.destroyFilter(true);
				
		var relatedListTable = (this._relatedListSelectEl != null)? this._relatedListSelectEl.options[this._relatedListSelectEl.selectedIndex].value : '';
		var targetTable = (relatedListTable != null)? relatedListTable.split('.')[0] : ''; 

		// handle Relationship
		if (relatedListTable != null && relatedListTable.indexOf('REL:') == 0) {
			targetTable = this._getRelTargetTable(relatedListTable);
		}

		this.dependentTable = targetTable;
		
		this._relatedListNotSelected = false;
		this.editCondition(selectedFilterSpan, condTable, condId, false);
	},
	
	_getRelTargetTable: function (relationship) {
		var relGr = new GlideRecord('sys_relationship');
		relGr.get(relationship.split(':')[1]);
		return relGr.basic_query_from + '';
	},
	
	cancelFilter: function(tableName) {
		tableName = tableName || null;
		if(tableName && tableName != this._editingTable)
			return;
		
		// if canceling a new row
		if(this._tempNewCond == this._editingTable + "_" + this._editingRecordId) {
			var row = gel("condition_row_" + this._editingTable + "_" + this._editingRecordId);
			var parentNode = row.parentNode;
			parentNode.removeChild(row);
			if(this._clone != null) {
				parentNode.appendChild(this._clone);
				this._observeInsert(this._editingTable, true);
			}
		}
		else {
			this.restoreDisplay();
		}
		this.destroyFilter();
		this.destroyRelatedListSelector();
		this.destroyQuantifierCheckBox();
	},
	
	_observeInsert: function(condTable, observe) {
		if (!this._clone)
			return;
			
		var _this = this;
		
		if (observe) {
			(function() {
				var _condTable = condTable;
				var cloneSpan = $(_this._clone).select('.insert-condition')[0];
				$(cloneSpan).observe('click', function(evt) {
					CertificationTemplateUtils.addCondition(evt.target, _condTable);
				});
			})();
		}
		else {
			(function() {
				var cloneSpan = $(_this._clone).select('.insert-condition')[0];
				$(cloneSpan).stopObserving('click');
			})();
		}
	},
	    
	_validateValues: function(filterValue, value) {
        if (value == '')
            return false;
            
        if (filterValue.indexOf('BETWEEN') != -1)
           if (value.substring(0,1) == '@' || value.substring(value.length-1) == '@' || value.split("@").length > 2)
			   return false;
				            
        if (filterValue.indexOf('RELATIVE') != -1)
           if (value.substring(value.length-1) == '@')
			   return false;
		
		return true;
    },
	
	saveFilter: function() {
		if (!this.filter)
			return;
		var filterValue = this.filter.getValue();
		if (filterValue.indexOf('EMPTY') == -1 && filterValue.indexOf('ANYTHING') == -1) {
			var value = this.filter.sections[0].conditions[0].actionRow.handler.getValues();
		
        	if (!this._validateValues(filterValue, value)) {
                alert(getMessage('Invalid condition'));
			    return;
            }
        }
		
		if (filterValue == null || filterValue == '') {
			this.cancelFilter();
			return;
		}
		
		// if this is a new row
		var isNew = false;
		if(this._tempNewCond == this._editingTable + "_" + this._editingRecordId) {
			isNew = true;
			// Show the delete button
			var deleteId = "cert_condition_delete_" + this._editingTable + "_" + this._editingRecordId;
			var deleteButton = gel(deleteId);
			if(deleteButton) {
				deleteButton.style.visibility = "";
			}
			
			// add the clone
			var table = gel(this._editingTable);
			if(this._clone != null) {
				var body = table.getElementsByTagName('tbody');
				if (body && body.length > 0)
					body[0].appendChild(this._clone);
				else
					table.appendChild(this._clone);
				this._observeInsert(this._editingTable, true);
			}
			this.applyStyle(this._editingTable);
			
			this._newConds[this._editingTable + "_" + this._editingRecordId] = true;
		}
		this.updateValues(isNew);
		this.restoreDisplay();
		var spanId = this._editingTable + '_' + this._editingRecordId;
		var selectedFilterSpan = gel(spanId);
		if (selectedFilterSpan != null) {
			var relatedListTable = this._relatedListSelectEl != null? this._relatedListSelectEl.options[this._relatedListSelectEl.selectedIndex].value : "";
			// handle Relationship by getting back the '<joinTable>.<joinColumn>' form
			if (relatedListTable.indexOf('REL:') == 0) {
				relatedListTable = this.dependentTable + '.' + relatedListTable;  
			}

			selectedFilterSpan.setAttribute('related-list-table', relatedListTable);
			if (relatedListTable!='') {
				var checked = this._quantifierChecked('checkbox_' + this._editingRecordId);
				selectedFilterSpan.setAttribute('checked', checked);
			}
		}
			
		if (!isNew && this._editingTable == 'cert_attr_cond')
			this._checkValid($(spanId));
		this.destroyFilter();
		this.destroyRelatedListSelector();
		this.destroyQuantifierCheckBox();
	},
	
	toggleDeleteCondition: function(target, condTable, condId) {
		var displayId = condTable + "_" + condId;
		var display = gel(displayId);
		var descriptor = display.getAttribute('descriptor');
		var targetTable = this._getTargetTable(condTable);
		if(displayId in this._newConds) {
			delete this._newConds[displayId];
			var row = gel("condition_row_" + displayId);
			row.parentNode.removeChild(row);
			this.onDelete(display.getAttribute('data'), false, condTable, descriptor, targetTable);
			this.applyStyle(condTable);
			return;
		}
		
		var state = target.getAttribute('state');
		if(state == 'delete') {
			if (!this.isNewUI)
				target.setAttribute('src', 'images/undelete_row.gifx');
			else
				target.setStyle({color: '#CFCFCF'});
			target.setAttribute('state', 'undelete');
			display.style.textDecoration = "line-through";
			if(displayId in this._updatedConds)
				delete this._updatedConds[displayId];
			this._deletedConds[displayId] = true;
			this.onDelete(display.getAttribute('data'), false, condTable, descriptor, targetTable);
		}
		else {
			var messages = this.onBeforeUnDelete(display.getAttribute('data'), condTable, descriptor, targetTable);
			if(messages.length == 0) {
				if (!this.isNewUI)
					target.setAttribute('src', 'images/delete_row.gifx');
				else
					target.setStyle({color: '#FF402C'});
				target.setAttribute('state', 'delete');
				var original = display.getAttribute('original-data');
				var data = display.getAttribute('data');
				if(original != data) {
					this._updatedConds[displayId] = true;
				}
				display.style.textDecoration = '';
				delete this._deletedConds[displayId];
				
				this.onDelete(display.getAttribute('data'), true, condTable, descriptor, targetTable);
			}
			else {
				for(var i = 0; i < messages.length; i++) {
					g_form.addErrorMessage(getMessage(messages[i]));
				}
			}
		}
		this._evaluateDirty(condTable, condId, false);
	},
	
	_evaluateDirty: function(condTable, id, isFieldEdit) {
		var field = condTable + "_" + id;
		var dirtyId = "cert_cond_dirty_" + condTable + "_" + id;
		var dirty = gel(dirtyId);
		var linkId = "cert_cond_link_" + condTable + "_" + id;
		var link = gel(linkId);
		var rowId = "condition_row_" + condTable + "_" + id;
		var row = gel(rowId);
		if(this._isDirty(field)) {
			if (!this.isNewUI)
				dirty.style.display = "";
			else if (isFieldEdit)
				$(row.getElementsByClassName('filter-td')[0]).addClassName('list_edit_dirty');

			if(link) 
				link.style.display = "none";
		}
		else {
			if (!this.isNewUI)
				dirty.style.display = "none";
			else if (isFieldEdit)
				$(row.getElementsByClassName('filter-td')[0]).removeClassName('list_edit_dirty');
			
			if(link) 
				link.style.display = "";
		}
	},
	
	updateValues: function(isNew) {
		var displayId = this._editingTable + "_" + this._editingRecordId;
		var isUpdateOfNew = this._newConds[displayId] == true;
		var display = gel(displayId);
		var originalData = display.getAttribute('original-data');
		var oldData = display.getAttribute('data');
		var filterValue = this.filter.getValue();
		var filterParts = filterValue.split(':');
		var newData = filterValue; 
		var descriptor = '';
		var relatedListLabel = this._relatedListSelectEl != null? this._relatedListSelectEl.options[this._relatedListSelectEl.selectedIndex].text : '';
		
		var checkBoxChanged = false;
		var quantifierDesc = '';
		if (relatedListLabel != null && relatedListLabel != '') {
			var originalChecked= display.getAttribute('original-checked');
			var newChecked = this._quantifierChecked('checkbox_' + this._editingRecordId);
			checkBoxChanged = originalChecked != newChecked;
			quantifierDesc = newChecked == 'true'? ' for ALL' : '';
		}

		var newDisplayValue = relatedListLabel != null && relatedListLabel != ''? relatedListLabel + ': ' + this.filter.getDisplayValue() + quantifierDesc : this.filter.getDisplayValue();
		
		if(this._editingTable != 'cert_attr_cond' && this._editingTable != 'cert_related_list_cond') {
			if(filterParts.length == 1) {
				descriptor = '';
				newData = filterParts[0];
			} else if(filterParts.length == 2) {
				descriptor = filterParts[0];
				newData = filterParts[1];
			} else if(filterParts.length == 3){
				descriptor = filterParts[0];
				newData = filterParts[2];
			}
		}
		
		display.setAttribute('data', newData);
		display.setAttribute('descriptor', descriptor);
		display.innerHTML = newDisplayValue;
		if((originalData != newData || checkBoxChanged) && !isNew && !isUpdateOfNew)
			this._updatedConds[this._editingTable + "_" + this._editingRecordId] = true;
		else
			delete this._updatedConds[this._editingTable + "_" + this._editingRecordId];
		this._evaluateDirty(this._editingTable, this._editingRecordId, true);
		
		var targetTable = this._getTargetTable(this._editingTable);
		if(isNew)
			this.onAdd(newData, this._editingTable, descriptor, targetTable);
		else
			this.onUpdate(oldData, newData, this._editingTable, descriptor, targetTable);
	},
	
	restoreDisplay: function() {
		if(this._editingTable && this._editingRecordId) {
			var displayId = this._editingTable + "_" + this._editingRecordId;
			var display = gel(displayId);
			display.style.display = "";
		}
	},
	
	destroyFilter: function(preserveRow) {
		if(this.filter)
			this.filter.destroy();
		this.filter = null;
		filterExpanded = false;
		
		if(this._editingRecordId && this._editingTable) {
			var filterHolderId = "cert_condition_filter_" + this._editingTable + "_" + this._editingRecordId;
			var filterHolder = gel(filterHolderId);
			if(filterHolder) {
				filterHolder.innerHTML = "";
				filterHolder.style.display = "none";
			}
			
			var controlHolderId = "cert_condition_controls_" + this._editingTable + "_" + this._editingRecordId;
			var controlHolder = gel(controlHolderId);
			if(controlHolder) {
				controlHolder.innerHTML = "";
				controlHolder.style.display = "none";
			}
		}
		
		this._editingRecordId = null;
		this._editingTable = null;
		
		if(!preserveRow) {
			this._tempNewCond = null;
			this._clone = null;
		}
	},
	
	destroyRelatedListSelector: function() {
		if(this._relatedListSelectEl != null && this._relatedListSelectEl.parentElement != null)
			this._relatedListSelectEl.parentElement.removeChild(this._relatedListSelectEl);
		
		this._relatedListSelectEl = null;
		this._relatedListNotSelected = false;
	},
	
	_createInput: function(wrapper, table, value) {
		var ref = table + '.' + this.fieldName;
		var hiddenInput = cel("input");
		hiddenInput.id = ref;
		hiddenInput.className = "glide_destroy_filter";
		hiddenInput.name = ref;
		hiddenInput.value = "";
		hiddenInput.setAttribute('data-dependent', this.dependent);
		hiddenInput.setAttribute('data-dependent_table', this.dependentTable);
		var restrictedFields = this.restrictedFields[table].join(',');
		hiddenInput.setAttribute('data-restricted_fields', restrictedFields);
		hiddenInput.setAttribute('data-extended_operators', this.extendedOps);
		hiddenInput.setAttribute('data-usage_context', this.usageCtx);
		hiddenInput.setAttribute('single-row', this.singleRow);
		hiddenInput.setAttribute('is-relationship', this.isRelationship[table]);
		hiddenInput.setAttribute('rel-type-table', this.relTypeTable[table]);
		hiddenInput.setAttribute('reverse-restriction', this.reverseRestriction);
		hiddenInput.setAttribute('value', value);
		hiddenInput.setAttribute('type', 'hidden');
		wrapper.appendChild(hiddenInput);
	},
	
	_createTable: function(wrapper, tableName) {
		var table = cel("table", wrapper);
		table.id = tableName +"." + this.fieldName + "filters_table";
		table.className = 'filerTable';
		var tbody = cel('tbody', table);
		tbody.id = tableName + "." + this.fieldName + "gcond_filters";
	},
	
	_createWidget: function(table, value) {
		var wrapper = cel("span");
		this._createInput(wrapper, table, value);
		this._createTable(wrapper, table);
		return wrapper;
	},
	
	_createFilter: function(conditionTable, id, value, descriptor, prefix) {
		var ref = conditionTable + '.' + this.fieldName;
		var elem = gel(ref);
		var table = resolveDependentValue(ref, elem.getAttribute('data-dependent'), elem.getAttribute('data-dependent_table'));
		var fname = ref;
		var sysId = id;
		
		if(table == null)
			return;
		
		this.filter = createCertCondFilter(table + "." + fname, value, fname, descriptor, prefix);
		
		var filterTable = gel(conditionTable + "." + this.fieldName + "filters_table");
		$(filterTable).setStyle({
			backgroundColor: 'transparent',
			borderCollapse: 'collapse'
		});
		
		var filterTableBody = gel(conditionTable + "." + this.fieldName + "gcond_filters");
		var innerTable = filterTableBody.firstChild.firstChild.firstChild;
		$(innerTable).setStyle({
			backgroundColor: 'transparent'
		});
	},
	
	_createControls: function() {
		var _this = this;
		var saveButton;
		var cancelButton;
		if (!this.isNewUI) {
			saveButton = cel('img');
			saveButton.src = 'images/workflow_approved.gifx';
			
			cancelButton = cel('img');
			cancelButton.src = 'images/workflow_approval_rejected.gifx';
		}
		else {
			saveButton = cel('a');
			saveButton.className = 'btn btn-icon icon-check-circle color-green';
			
			cancelButton = cel('a');
			cancelButton.className = 'btn btn-icon icon-cross-circle color-red';
		}
		
		saveButton.title = getMessage('Save');
		saveButton.alt = getMessage('Save');
		saveButton.style.cursor = "pointer";
		saveButton.onclick = function() {
			_this.saveFilter();
		};
		
		
		cancelButton.title = getMessage('Cancel');
		cancelButton.alt = getMessage('Cancel');
		cancelButton.style.cursor = "pointer";
		cancelButton.onclick = function() {
			_this.cancelFilter();
		};
		
		var buttonHolder = cel('span');
		buttonHolder.appendChild(saveButton);
		buttonHolder.appendChild(cancelButton);
		return buttonHolder;
	},
	
	_createFilterDOM: function(row, condTable, condId) {
		var _this = this;
		
		var deleteImg;
		if (!this.isNewUI) {
			deleteImg = cel('img');
			deleteImg.src = "images/delete_row.gifx";
			deleteImg.style.cursor = "pointer";	
		}
		else {
			deleteImg = cel('i');
			deleteImg.className = 'cond-delete-icon list_delete_row list_decoration clsshort button icon-cross btn';
			deleteImg.style.color = '#FF402C';	
		}
		
		deleteImg.style.visibility = "hidden";
		deleteImg.id = "cert_condition_delete_" + condTable + "_" + condId;
		deleteImg.title = getMessage('Delete');
		deleteImg.setAttribute('state', "delete");
		deleteImg.onclick = function(evt) {
			evt = evt || window.event;
			var target = evt.target || evt.srcElement;
			_this.toggleDeleteCondition(target, condTable, condId);
		};
		
		var dirtyImg = cel('img');
		dirtyImg.id = "cert_cond_dirty_" + condTable + "_" + condId;
		dirtyImg.width = "16";
		dirtyImg.height = "16";
		dirtyImg.style.margin = "2px 4px";
		dirtyImg.style.display = "none";
		dirtyImg.src="images/dirty.gifx";
		
		var warningImg;
		if (!this.isNewUI) {
			warningImg = cel('img');
			warningImg.src='images/warning.gifx';
		}
		else {
			warningImg = cel('i');
			warningImg.className = 'icon-alert';
			warningImg.style.color  = '#FFCA1F';
			warningImg.style.fontSize = '20px';
		}
		warningImg.title = getMessage('Field for this condition is not applicable to the filter');
		warningImg.id = 'cert_condition_warning_' + condTable + '_' + condId;
		warningImg.className += ' condition-warning';
		$(warningImg).setStyle({
			visibility: 'hidden'
		});
		
		var displaySpan = cel("span");
		displaySpan.id = condTable + "_" + condId;
		displaySpan.className = "cert-cond-display-span";
		displaySpan.setAttribute('table-name', condTable);
		displaySpan.setAttribute('sys-id', condId);
		displaySpan.setAttribute('data', '');
		displaySpan.setAttribute('descriptor', '');
		displaySpan.setAttribute('originalData', '');
		displaySpan.onclick = function(evt) {
			evt = evt || window.event;
			var target = evt.target || evt.srcElement;
			_this.editCondition(target, condTable, condId, true);
		};
		$(displaySpan).setStyle({
			'float': 'left',
			width: '100%'
		});
		
		var filterSpan = cel("span");
		filterSpan.id = "cert_condition_filter_" + condTable + "_" + condId;
		filterSpan.className = "cert-cond-filter-span";
		filterSpan.style.display = "none";
		
		var controlSpan = cel("span");
		controlSpan.id = "cert_condition_controls_" + condTable + "_" + condId;
		controlSpan.className = "cert-cond-filter-controls";
		controlSpan.style.display = "none";
		
		var tableWrapper = cel("table");
		var tableWrapperBody = cel("tbody");
		var tableTrWrapper = cel("tr");
		var tableFilterWrapper = cel("td");
		var tableControlWrapper = cel("td");
		tableWrapper.appendChild(tableWrapperBody);
		tableWrapperBody.appendChild(tableTrWrapper);
		tableTrWrapper.appendChild(tableFilterWrapper);
		tableTrWrapper.appendChild(tableControlWrapper);
		tableFilterWrapper.appendChild(filterSpan);
		tableControlWrapper.appendChild(controlSpan);
		$(tableWrapper).setStyle({
			backgroundColor: 'transparent'
		});
		
		var rowControlsTd = $(row).select('.row-controls-td');
		
		if(rowControlsTd.length > 0) {
			rowControlsTd = rowControlsTd[0];
			rowControlsTd.innerHTML = '';
			rowControlsTd.appendChild(deleteImg);
			rowControlsTd.appendChild(warningImg);
			rowControlsTd.appendChild(dirtyImg);
		}
		
		var filterTd = row.getElementsByClassName('filter-td');
		if(filterTd.length > 0) {
			filterTd = filterTd[0];
			filterTd.innerHTML = '';
			filterTd.appendChild(displaySpan);
			filterTd.appendChild(tableWrapper);
		}
		
		row.id = "condition_row_" + condTable + "_" + condId;
		return filterSpan;
	},
	
	_isDirty: function(field) {
		var result =  (field in this._updatedConds) || (field in this._newConds) || (field in this._deletedConds);
		return result;
	},
	
	_createFieldNode: function(name, modified, valueSet, dspSet, value) {
		var nodeField = document.createElement('field');
		nodeField.setAttribute('name', name);
		nodeField.setAttribute('modified', modified);
		nodeField.setAttribute('value_set', valueSet);
		nodeField.setAttribute('dsp_set', dspSet);
		var nodeValue = document.createElement('value');
		var nodeValueText = document.createTextNode(value);
		nodeValue.appendChild(nodeValueText);
		nodeField.appendChild(nodeValue);
		return nodeField;
	},
	
	_createRecordUpdateNode: function(table) {
		var node = document.createElement('record_update');
		node.setAttribute('table', table);
		node.setAttribute('field', 'cert_template');
		node.setAttribute('query', 'cert_template=' + this.sysId);
		return node;
	},
	
	_createAddNode: function(id, cond, descriptor, display, joinTable, joinField, applies_to_all) {
		var node = document.createElement('record');
		node.setAttribute('sys_id', id);
		node.setAttribute('operation', 'add');
		
		var condField = this._createFieldNode('condition',
		'true', 'true', 'false', cond);
		node.appendChild(condField);
		
		var descriptorField = this._createFieldNode('descriptor',
		'true', 'true', 'false', descriptor);
		node.appendChild(descriptorField);
		
		var displayField = this._createFieldNode('condition_display',
		'true', 'true', 'false', display);
		node.appendChild(displayField);
		
		var templateField = this._createFieldNode('cert_template',
		'true', 'true', 'false', this.sysId);
		node.appendChild(templateField);
		
		var joinTableNode = this._createFieldNode('join_table',
		'true', 'true', 'false', joinTable);
		node.appendChild(joinTableNode);
		
		var joinFieldNode = this._createFieldNode('join_column',
		'true', 'true', 'false', joinField);
		node.appendChild(joinFieldNode);
	
		if (applies_to_all) {
			var quantifierNode = this._createFieldNode('applies_to_all',
					'true', 'true', 'false', applies_to_all);
			node.appendChild(quantifierNode);
		}
		
		return node;
	},
	
	_createUpdateNode: function(id, cond, descriptor, display, joinTable, joinField, applies_to_all) {
		var node = document.createElement('record');
		node.setAttribute('sys_id', id);
		node.setAttribute('operation', 'update');
		
		var condField = this._createFieldNode('condition',
		'true', 'true', 'false', cond);
		node.appendChild(condField);
		
		var descriptorField = this._createFieldNode('descriptor',
		'true', 'true', 'false', descriptor);
		node.appendChild(descriptorField);
		
		var displayField = this._createFieldNode('condition_display',
		'true', 'true', 'false', display);
		node.appendChild(displayField);
		
		var joinTableNode = this._createFieldNode('join_table',
		'true', 'true', 'false', joinTable);
		node.appendChild(joinTableNode);
		
		var joinFieldNode = this._createFieldNode('join_column',
		'true', 'true', 'false', joinField);
		node.appendChild(joinFieldNode);
		
		if (applies_to_all) {
			var quantifierNode = this._createFieldNode('applies_to_all',
					'true', 'true', 'false', applies_to_all);
			node.appendChild(quantifierNode);
		}
		
		return node;
	},
	
	_createDeleteNode: function(id, cond, descriptor, display, joinTable, joinField, applies_to_all) {
		var node = document.createElement('record');
		node.setAttribute('sys_id', id);
		node.setAttribute('operation', 'delete');
		
		var condField = this._createFieldNode('condition',
		'false', 'false', 'false', cond);
		node.appendChild(condField);
		
		var descriptorField = this._createFieldNode('descriptor',
		'false', 'false', 'false', descriptor);
		node.appendChild(descriptorField);
		
		var displayField = this._createFieldNode('condition_display',
		'false', 'false', 'false', display);
		node.appendChild(displayField);
		
		var joinTableNode = this._createFieldNode('join_table',
		'false', 'false', 'false', joinTable);
		node.appendChild(joinTableNode);
		
		var joinFieldNode = this._createFieldNode('join_column',
		'false', 'false', 'false', joinField);
		node.appendChild(joinFieldNode);
		
		if (applies_to_all) {
			var quantifierNode = this._createFieldNode('applies_to_all',
					'false', 'false', 'false', applies_to_all);
			node.appendChild(quantifierNode);
		}

		return node;
	},
	
	_getInfo: function(span) {
		var relatedListTable = span.getAttribute('related-list-table');
		var display = span.innerHTML.replace(/&gt;/g, '>');
		var obj = {
			'tableName': span.getAttribute('table-name'),
			'id': span.getAttribute('sys-id'),
			'data': span.getAttribute('data'),
			'descriptor': span.getAttribute('descriptor'),
			'display': display
		};
		
		if(relatedListTable != null && relatedListTable != '') {
			var relatedListTableParts = relatedListTable.split('.');
			if(relatedListTableParts.length === 2) {
				obj['relatedListJoinTable'] = relatedListTableParts[0];
				obj['relatedListJoinField'] = relatedListTableParts[1];
			}

			// handle Relationship
			if (relatedListTable.indexOf('REL:') == 0) {
				obj['relatedListJoinTable'] = this._getRelTargetTable(relatedListTable);
				obj['relatedListJoinField'] = relatedListTable;
			}
			obj['checked'] = span.getAttribute('checked'); // 'true'/'false'
		} 
		
		return obj;
	},
	
	getListDisplayStatus: function() {
        var status = {};
        for(var i = 0; i < this.allTables.length; i++) {
            var list = this.allTables[i];
			var listRow = $(list + '_row');
			
			if (listRow != null) {
            	var display = listRow.getStyle('display');
            	status[list] = (display != 'none');
			} else 
				status[list] = false;
        }
		return status;
    },
    
	serialize: function() {
		var displayStatus = this.getListDisplayStatus();
        var isDisplayed = function(tName) {
            return (tName in displayStatus && displayStatus[tName]);
        };
		
		var tableXML = {};
		var updatedMembers = [
		['_newConds', '_createAddNode'],
		['_updatedConds', '_createUpdateNode'],
		['_deletedConds', '_createDeleteNode']
		];
		
		for(var i = 0; i < updatedMembers.length; i++) {
			var member = updatedMembers[i][0];
			var createFunc = updatedMembers[i][1];
			for(var key in this[member]) {
				var span = gel(key);
				var info = this._getInfo(span);
                // Only serialize visible lists
                if(!isDisplayed(info.tableName))
                    continue;
				
				if(!tableXML[info.tableName]) {
					tableXML[info.tableName] = this._createRecordUpdateNode(info.tableName);
				}
				
				var rootXML = tableXML[info.tableName];
				rootXML.appendChild(this[createFunc](info.id, info.data, info.descriptor, info.display, info.relatedListJoinTable, info.relatedListJoinField, info.checked));
			}
		}
		return tableXML;
	},
	
	serializeToForm: function(form) {
		var _toXMLStr = function(xmlNode) {
			if (typeof window.XMLSerializer != "undefined")
				return (new window.XMLSerializer()).serializeToString(xmlNode);
			else if (typeof xmlNode.xml != "undefined")
				return xmlNode.xml;
			else {
				var dummy = document.createElement('dummy');
				dummy.appendChild(xmlNode);
				return dummy.innerHTML + '';
			}
		};
		var serialization = this.serialize();
		for(var key in serialization) {
			var k = 'ni.java.com.glide.ui_list_edit.ListEditFormatterAction[' + guid() + ']';
			var v = _toXMLStr(serialization[key]);
			addHidden(form, k, v);
		}
	},
	
	addAddListener: function(f) {
		this._onAdds.push(f);
	},
	
	removeAddListener: function(f) {
		var idx = this._onAdds.indexOf(f);
		this._onAdds.splice(idx, 1);
	},
	
	addUpdateListener: function(f) {
		this._onUpdates.push(f);
	},
	
	removeUpdateListener: function(f) {
		var idx = this._onUpdates.indexOf(f);
		this._onUpdates.splice(idx, 1);
	},
	
	addDeleteListener: function(f) {
		this._onDeletes.push(f);
	},
	
	addBeforeUnDeleteListener: function(f) {
		this._onBeforeUnDeletes.push(f);
	},
	
	removeDeleteListener: function(f) {
		var idx = this._onDeletes.indexOf(f);
		this._onDeletes.splice(idx, 1);
	},
	
	onAdd: function(cond, table, descriptor, targetTable) {
		for(var i = 0; i < this._onAdds.length; i++) {
			this._onAdds[i](cond, table, descriptor, targetTable);
		}
	},
	
	onUpdate: function(oldCond, newCond, table, descriptor, targetTable) {
		for(var i = 0; i < this._onUpdates.length; i++) {
			this._onUpdates[i](oldCond, newCond, table, descriptor, targetTable);
		}
	},
	
	onDelete: function(cond, isUndelete, table, descriptor, targetTable) {
		for(var i = 0; i < this._onDeletes.length; i++) {
			this._onDeletes[i](cond, isUndelete, table, descriptor, targetTable);
		}
	},
	
	onBeforeUnDelete: function(cond, table, descriptor, targetTable) {
		var messages = [];
		for(var i = 0; i < this._onBeforeUnDeletes.length; i++) {
			var msg = this._onBeforeUnDeletes[i](cond, table, descriptor, targetTable);
			if(msg != null && msg !== undefined)
				messages.push(msg);
		}
		return messages;
	},
	
	applyStyle: function(tableName) {
		var tableNames;
		if(tableName)
			tableNames = [tableName];
		else
			tableNames = this.allTables;
		
		for(var i = 0; i < tableNames.length; i++) {
			var table = gel(tableNames[i]);
			var rows = table.getElementsByClassName('list_row_compact');
			var odd = true;
			for(var j = 0; j < rows.length; j++) {
				if(odd) {
					$(rows[j]).removeClassName('list_even');
					$(rows[j]).addClassName('list_odd');
				}
				else {
					$(rows[j]).removeClassName('list_odd');
					$(rows[j]).addClassName('list_even');
				}
				odd = !odd;
			}
		}
	},
	
	getColumn:  function(q) {
		var operators = this._operators;
		for(var i = 0; i < operators.length; i++) {
			var loc = q.indexOf(operators[i]);
			if(loc >= 0) {
				return q.substring(0, loc);
			}
		}
		return '';
	},
	
    showConditionLists: function(auditType) {
        // hide all tables
        this._setConditionVisibility(this.allTables, "none");
        if(auditType && auditType in this.auditTypeTables) {
            // show relevant tables for the audit type
            this._setConditionVisibility(this.auditTypeTables[auditType], "");
        }
	},
	
	_setConditionVisibility: function(tables, v) {
        for(var i = 0; i < tables.length; i++) {
            var fieldRow = $(tables[i] + "_row");
            $(fieldRow).setStyle({
                display: v
            });
        }
	},
	
	checkAttrCondValidity: function() {
		var attrSpans = $$('span[table-name="cert_attr_cond"]');
		var allValid = true;
		for(var i = 0; i < attrSpans.length; i++) {
			var valid = this._checkValid(attrSpans[i]);
			allValid = allValid && valid;
		}
		if(!allValid) {
			if (!this._errorMessageShown) {
				var warningMessage = 
					'Some template conditions are incompatible with ' +
					'the selected filter. Incompatible conditions ' +
					'will not be used for auditing.';
				g_form.addErrorMessage(getMessage(warningMessage));
				this._errorMessageShown = true;
			}
		}
		else {
			g_form.clearMessages();
			this._errorMessageShown = false;
		}
	},
	
	_getQueryField: function(table, query) {
		var ajax = new GlideAjax('QueryParseAjax');
		ajax.addParam('sysparm_chars', query);
		ajax.addParam('sysparm_name', table);
		ajax.addParam('sysparm_version2', 'false');
		var partsXML = ajax.getXMLWait();
		var items = partsXML.getElementsByTagName('item');
		if (items.length > 0)
			return items[0].getAttribute('field');
		else
			return '';
	},
	
	_validateField: function (tableName, field) {
		var ajax = new GlideAjax('ConditionUtilsAjax');
		ajax.addParam('sysparm_name', 'validateField');
		ajax.addParam('sysparm_table_name', tableName);
		ajax.addParam('sysparm_field', field);

		var result = ajax.getXMLWait();
		if(result && result.childNodes.length > 0) {
			result = result.getElementsByTagName('result');
			if(result.length > 0)
				result = result[0];
			else
				result = null;
			if(result) {
				return result.getAttribute('valid') == 'true';
			}
		}
		return false;
	},
	
	_checkValid: function(attrSpan) {
		var tableName = this.dependentTable;
		var tableRef = getTableReference(tableName);
		var attrData = attrSpan.getAttribute('data');
		var column = this._getQueryField(tableName, attrData);
		var warningOn = !this._validateField(tableName, column) && column != '123TEXTQUERY321';
		
		var conditionWarning = attrSpan
			.parentNode
			.parentNode
			.getElementsByClassName('vt row-controls-td')[0]
			.getElementsByClassName('condition-warning')[0];
		
		var visibility = warningOn ? '' : 'hidden';
		var fontStyle = warningOn ? 'italic': '';
		$(conditionWarning).setStyle({
			'visibility': visibility
		});
		$(attrSpan).setStyle({
			'fontStyle': fontStyle
		});
		return !warningOn;
	}
};

(function() {
	var setupListEventSubscribers = function() {
		var getUniqueValue = function(value, descriptor, targetTable) {
			var result;
			if(targetTable == '')
				result = value;
			else if(targetTable == 'cmdb_ci')
				result = descriptor + ':' + value;
			else
				result = descriptor + ':' + targetTable + ':' + value;
			return result;
		};
		
		var updateRestrictionField = function(table, value, descriptor, targetTable, operation) {
			var uniqueValue = getUniqueValue(value, descriptor, targetTable);
			
			var restrictedFields = CertificationTemplateUtils.restrictedFields[table];
            if(operation == 'delete') {
				var loc = restrictedFields.indexOf(uniqueValue);
				restrictedFields.splice(loc, 1);
            }
            else if(operation == 'add') {
				restrictedFields.push(uniqueValue);
            }
        };
        
		var onDelete = function(query, isUnDelete, table, descriptor, targetTable) {
            var value = CertificationTemplateUtils.getColumn(query);
            if(!value)
                return;
            if(isUnDelete)
				updateRestrictionField(table, value, descriptor, targetTable, 'add');
            else
				updateRestrictionField(table, value, descriptor, targetTable, 'delete');
        };
        
		var onBeforeUnDelete = function(query, table, descriptor, targetTable) {
            var value = CertificationTemplateUtils.getColumn(query);
			var uniqueValue = getUniqueValue(value, descriptor, targetTable);
			if(CertificationTemplateUtils.restrictedFields[table].indexOf(uniqueValue) >= 0) {
                var condType = 'relationship';
                if(table == 'cert_attr_cond' || table == 'cert_related_list_cond')
                    condType = 'attribute';    
                return 'Cannot undelete. The ' + condType + ' is already being used.';
            }
            return;
        };
        
		var onAdd = function(query, table, descriptor, targetTable) {
            var value = CertificationTemplateUtils.getColumn(query);
            if (value == null || value == '')
                return;
			
			updateRestrictionField(table, value, descriptor, targetTable, 'add');
        };
        
		var onUpdate = function(oldQuery, newQuery, table, descriptor, targetTable) {
            var oldValue = CertificationTemplateUtils.getColumn(oldQuery);
            var newValue = CertificationTemplateUtils.getColumn(newQuery);
            if(!oldValue || !newValue)
                return;
			updateRestrictionField(table, oldValue, descriptor, targetTable, 'delete');
			updateRestrictionField(table, newValue, descriptor, targetTable, 'add');
        };
        CertificationTemplateUtils.addAddListener(onAdd);
        CertificationTemplateUtils.addUpdateListener(onUpdate);
        CertificationTemplateUtils.addDeleteListener(onDelete);
        CertificationTemplateUtils.addBeforeUnDeleteListener(onBeforeUnDelete);
	};
	
	var setupOperators = function() {
		var operators = [];
        for(var key in opersNS.opdef) {
            if(key)
                operators.push(opersNS.opdef[key][0]);
        };
        CertificationTemplateUtils._operators = operators;
	};
	
	var setupOnSubmit = function() {
		var thisForm = gel(g_form.getTableName() + '.do');
        addOnSubmitEvent(thisForm, function() {
            var form = gel(g_form.getTableName() + '.do');
            if (!form) 
                return;
			if (CertificationTemplateUtils != null) 
            	CertificationTemplateUtils.serializeToForm(form);
        });
	};
	
	var setupClickListeners = function() {
		// Setup show relationship checkboxes. W/o proper permissions
		// these are not on the DOM
		var showRelationshipCbs = $$('.show-rel-cb');
		for(var i = 0; i < showRelationshipCbs.length; i++) {
			(function() {
				var cb = showRelationshipCbs[i];
				var cbTbl = cb.getAttribute('table-name');
				cb.onclick = function() {
					CertificationTemplateUtils.cancelFilter(cbTbl);
				};
			})();
		}
		// setup delete icons. w delete permissions, these are 
		// on the DOM
		var deleteIcons = $$('.cond-delete-icon');
		for(var i = 0; i < deleteIcons.length; i++) {
			(function() {
				var delIcon = deleteIcons[i];
				var table = delIcon.getAttribute('table-name');
				var sysId = delIcon.getAttribute('sys-id');
				delIcon.onclick = function(evt) {
					evt = evt || window.event;
					var target = evt.target || evt.srcElement;
					CertificationTemplateUtils.toggleDeleteCondition(target, table, sysId);
				};
			})();
		}
		
		// setup span edits. w/ read permissions, these are on
		// the DOM
		var activeSpans = $$('.cert-cond-display-span.active');
		for(var i = 0; i < activeSpans.length; i++) {
			(function() {
				var span = activeSpans[i];
				var table = span.getAttribute('table-name');
				var sysId = span.getAttribute('sys-id');
				span.onclick = function(evt) {
					evt = evt || window.event;
					var target = evt.target || evt.srcElement;
					CertificationTemplateUtils.editCondition(target, table, sysId, true);
				};	
			})();
		}
		
		// setup the insert rows. w/ create permissions, these are on
		// the DOM
		var inserts = $$('.insert-condition');
		for(var i = 0; i < inserts.length; i++) {
			(function() {
				var insert = inserts[i];
				var table = insert.getAttribute('table-name-insert');
				$(insert).observe('click', function(evt) {
					CertificationTemplateUtils.addCondition(evt.target, table);
				});
			})();
		}
		
	};
	
    addLoadEvent(function() {
        setupOperators();
        setupListEventSubscribers();
		setupOnSubmit();
		setupClickListeners();
    });
})();