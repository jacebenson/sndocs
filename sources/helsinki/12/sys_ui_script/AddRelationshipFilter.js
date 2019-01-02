MESSAGES_CONDITION_RELATED_FILES.push('-- choose relationship --');
RELATIONSHIP_OPERATORS = [["=", "is"], ["!=", "is not"], ["ISEMPTY", "is empty"], ["ISNOTEMPTY", "is not empty"], ["IN", "is one of"], ["NOT IN", "is not one of"]];
var CertificationGlideFilter = Class.create(GlideFilter, {
    initialize: function(name, options, callback) {
        this.singleRow = false;
        this.isRelationship = false;
        this.relTypeTable = null;
		this.descriptor = options.descriptor;
		this.prefix = options.prefix;
		
        GlideFilter.prototype.initialize.call(this, name, callback);
    },
    
    setOptionsFromParmsElement: function(name) {
        var p = name.split(".");
		var elem = gel(p[1] + "." + p[2]);
        var singleRow = elem.getAttribute("single-row");
		if(singleRow)
			this.singleRow = singleRow != 'false' ? true : false;
		
		var isRelationship = elem.getAttribute("is-relationship");
		if(isRelationship)
			this.isRelationship = isRelationship != 'false' ? true : false
					
		var relTypeTable = elem.getAttribute("rel-type-table");
		if(relTypeTable)
			this.relTypeTable = relTypeTable;
		this.updateRestrictedFields();
		GlideFilter.prototype.setOptionsFromParmsElement.apply(this, arguments);
    },
	
	updateRestrictedFields: function() {
		var filterObj = this;
		try {
			delete filterObj['onlyRestrictedFields'];
			Object.defineProperty(filterObj, 'onlyRestrictedFields', {
				get: function() {
					// thisObj.onlyRestricted fields is true if...
					// 1) The dependent table is not set OR
					// 2) We have already used the keywords field
					// If one of those two conditions are true, the "Keywords"
					// field will not be displayed
					var tableEmpty = 
							this.tableName.startsWith('CHOOSE_RELATED_LIST') ||
							this.tableName.startsWith('null');
					if (tableEmpty || (this.restrictedFields && this.restrictedFields[TEXTQUERY]))
						return true;
					else
						return false;
				},
				set: function() {
					// DO NOTHING
				}
			});
		} catch(e) {
			filterObj.onlyRestrictedFields = false;
		}
	},
    
    setQuery: function(query) {
        jslog("setQuery Synchronously:  " + query);
		this.glideQuery = new CertificationGlideEncodedQuery(this, this.tableName, query, this.isRelationship);
		this.glideQuery.parse();
		this.reset();
		this.build();
    },
    
    setQueryAsync: function(query) {
		jslog("setQuery Asynchronously:  " + query);
		this.glideQuery = new CertificationGlideEncodedQuery(this, this.tableName, query, this.isRelationship, this.setQueryCallback.bind(this));
		this.glideQuery.parse();
		this.queryProcessed = true;
	},
	
	// Add a new sort condition to the query
	addSortRow: function(field, oper) {
		if (this.sortSection == null)
			this.sortSection = new CertificationGlideSortSection(this, this.singleRow);
		this.sortSection.addField(field, oper);
		this.addRunButton();
	},
	
	//
	// Add a new query section.  Each section represents a new set of query conditions
	//
	addSection: function() {
        var section = new CertificationGlideFilterSection(this, this.singleRow, this.isRelationship);
    	queryID = section._setup(this.sortSection == null, this.sections.length == 0);
    	this.sections[this.sections.length] = section;
    	if (this.sections.length == 1)
    		section.setFirst();
    		
    	if (this.sortSection != null) {
			var sortRow = this.sortSection.getSection().getRow();
    		this.fDiv.insertBefore(section.getRow(), sortRow);
    	}
		this.addRunButton();
    	return section;
	},
	
	getDisplayValue: function() {
		return !this.isRelationship ? 
				getFilterDisplay(this.tableName) : 
				getRelationshipFilterDisplay(this.tableName, this.relTypeTable);
	},
	
	filterFields: function(item) {
		if (!this.restrictedFields)
			return true;
		
		var name = item.getName();
		if (name.indexOf(".")  >-1 )  
			return false;
		
		if (!this.restrictedFields[name])
			return true;
		
		return false;
	}
});

var CertificationGlideEncodedQuery = Class.create(GlideEncodedQuery, {
    initialize: function(filter, name, query, isRelationship, callback) {
        this.isRelationship = isRelationship;
        GlideEncodedQuery.prototype.initialize.apply(this, [name, query, callback]);
    },
    
    getEncodedParts: function() {
		if (typeof g_filter_description !='undefined' && this.tableName == g_filter_description.getName() && 
				this.encodedQuery == g_filter_description.getFilter()) {
			this.partsXML = loadXML(g_filter_description.getParsedQuery());
			this.parseXML();
			return;
		}
		
		var ajaxProcessor = !this.isRelationship ? 'QueryParseAjax' : 'RelationshipQueryParseAjax'; 
		var ajax = new GlideAjax(ajaxProcessor);
		ajax.addParam('sysparm_chars', this.encodedQuery);
		ajax.addParam('sysparm_name', this.tableName);
		
		if (this.callback)
			ajax.getXML(this.getEncodedPartsResponse.bind(this));
		else {
			this.partsXML = ajax.getXMLWait();
			this.parseXML();
		}
	}
});

var CertificationGlideSortSection = Class.create(GlideSortSection, {
    initialize: function(filter, singleRow) {
        this.singleRow = singleRow || false;
        GlideSortSection.prototype.initialize.apply(this, arguments);
    },
    
    locateSection: function() {
		this.section = null;
		this.rowTable = null;
    	var divRows = this.filter.getDiv().getElementsByTagName("tr");
    	for (var i = 0; i < divRows.length; i++ ) {
      		var rowTR = divRows[i];
      		if (rowTR.sortRow == 'true') {
      			this.section = rowTR.rowObject;
      			this.rowTable = this.section.getFilterTable();
      			this.queryID = this.section.getQueryID();
      			break;
      		}
    	}
    	if (!this.section) {
    		section = new CertificationGlideFilterSection(this.filter, this.singleRow);
    		section.setSort(true);
    		this.queryID = section._setup(true);
    		this.section = section;
    		this.rowTable = section.getFilterTable();
    		this.section.getRow().sortRow = 'true';
    	}
	}
});

var CertificationGlideFilterSection = Class.create(GlideFilterSection, {
    initialize: function(filter, singleRow, isRelationship) {
        GlideFilterSection.prototype.initialize.apply(this, arguments);
        this.singleRow = singleRow || false;
		this.isRelationship = isRelationship || false;
    },
    
    addSortCondition: function() {
    	var condition = new CertificationGlideSectionCondition(this, this.queryID, this.singleRow, this.isRelationship);
		this.conditions[this.conditions.length] = condition;
		condition.setOrWanted(false);
		if (this.runRow == null)
			condition.build(this.tbody);
		else {
			condition.build(null);
            this.tbody.insertBefore(condition.getRow(), this.runRow);
		}
		return condition;
	},
	
	//
	// Add a row at the bottom of the section for the 
	// user to fill in if a new condition is wanted
	//
	addPlaceHolder: function(wantOR) {
		// WARNING: wantOR is not used
		this.placeHolderCondition = new CertificationGlideSectionCondition(this, this.queryID, this.singleRow, this.isRelationship);
		this.conditions[this.conditions.length] = this.placeHolderCondition;
		this.placeHolderCondition.setPlaceHolder(true);
		this.placeHolderCondition.setOrWanted(true);
		if (this.runRow == null)
			this.placeHolderCondition.buildRow(this.tbody, this.PLACE_HOLDER_FIELD);
		else {
			this.placeHolderCondition.buildRow(null, this.PLACE_HOLDER_FIELD);
            this.tbody.insertBefore(this.placeHolderCondition.getRow(), this.runRow);
		}
	},
	
	//
	// Add a field=value type condition to the section
	//
	addCondition: function(wantOR, field, oper, value) {
		if (this.filter.getMaintainPlaceHolder())
			return this.addConditionWithPlaceHolder(wantOR, field, oper, value);
		
		if (this.placeHolderCondition == null) {
			if (typeof field == "undefined" || field == '') {
				this.newPlaceHolder();
				return null;
			}
		}
		
		if (typeof field == "undefined")
			return null;
		var condition = new CertificationGlideSectionCondition(this, this.queryID, this.singleRow, this.isRelationship);
		this.conditions[this.conditions.length] = condition;
		condition.setOrWanted(wantOR);
		if (this.runRow == null)
			condition.buildRow(this.tbody, field, oper, value);
		else {
			condition.buildRow(null, field, oper, value);
            this.tbody.insertBefore(condition.getRow(), this.runRow);
		}
		return condition;
	},
	
	addConditionWithPlaceHolder: function (wantOR, field, oper, value) {
		if (this.placeHolderCondition == null) {
			this.newPlaceHolder();
			if (typeof field == "undefined")
				return null;
		}
		
		if (typeof field == "undefined")
			return null;
		var condition = new CertificationGlideSectionCondition(this, this.queryID, this.singleRow, this.isRelationship);
		this.conditions[this.conditions.length-1] = condition;
		this.conditions[this.conditions.length] = this.placeHolderCondition;
		condition.setOrWanted(wantOR);
		condition.buildRow(null, field, oper, value);
        this.tbody.insertBefore(condition.getRow(), this.placeHolderCondition.getRow());
		return condition;
	},
	
	addRunButton: function() {
		if (this.runRow != null)
			return;
		this.runCondition = new CertificationGlideSectionCondition(this, this.queryID, this.singleRow, this.isRelationship);
		this.runCondition.build(this.tbody);
		this.runRow = this.runCondition.getRow();
		this.runRow.basePart = '';
		this.runCondition.setAsRunRow(this.PLACE_HOLDER_FIELD);
	},
	
	//
	// build all HTML necessary for the row
	//
	build: function(parent) {
		trNew = celQuery('tr', parent, this.queryID);
		this.row = trNew;
		trNew.className = "filter_row";
		trNew.basePart = 'true';
		trNew.conditionObject = this;
		
		var td = celQuery('td', trNew, this.queryID);
    	td.style.width = "100%";
	
		var table = celQuery('table', td, this.queryID);		
    	table.cellSpacing = "0px";
    	table.cellPadding = "1px";
    	table.border = DEFAULT_BORDER;
		if (!this.filter.getConditionsWanted())
    		table.className = "wide";
	
		this.tbody = celQuery('TBODY', table, this.queryID);
		this.tbody.conditionObject = this;
		var first = this.section.firstCondition(this) && !this.isPlaceHolder();
	    this.conditionRow = 
	    	!this.isRelationship ?
	    			new CertificationGlideConditionRow(this, this.queryID, this.wantOR, first, this.singleRow) :
	    			new CertificationGlideRelationshipConditionRow(this, this.queryID, this.wantOR, first, this.singleRow);
		var tr = this.conditionRow.getRow();
		this.tbody.appendChild(tr);
		this.actionRow = tr;
		tr.conditionObject = this;	
	},
	
	//
	// Add a new or condition 
	//
	addNewSubCondition: function(field, oper, value) {
		if (field == null || typeof(field) == "undefined") {
			field = this.conditionRow.getField();
			oper = this.conditionRow.getOper();
		}
		var sub = new CertificationGlideSubCondition(this, this.queryID, this.isRelationship, this.singleRow);
		sub.buildRow(this.tbody, field, oper, value);
		this.subConditions[this.subConditions.length] = sub;
		var select = sub.getFieldSelect();
		select.style.marginLeft = "10px";	
	}
});

var CertificationGlideSectionCondition = Class.create(GlideSectionCondition, {
    initialize: function(section, queryID, singleRow, isRelationship) {
        this.singleRow = singleRow || false;
		this.isRelationship = isRelationship || false;
		GlideSectionCondition.prototype.initialize.apply(this, arguments);
    },
    
    //
    // build all HTML necessary for the row
    //
    build: function(parent) {
        trNew = celQuery('tr', parent, this.queryID);
        this.row = trNew;
        trNew.className = "filter_row";
        trNew.basePart = 'true';
        trNew.conditionObject = this;
        
        var td = celQuery('td', trNew, this.queryID);
        td.style.width = "100%";
    
        var table = celQuery('table', td, this.queryID);		
        table.cellSpacing = "0px";
        table.cellPadding = "1px";
        table.border = DEFAULT_BORDER;
        if (!this.filter.getConditionsWanted())
            table.className = "wide";
    
        this.tbody = celQuery('TBODY', table, this.queryID);
        this.tbody.conditionObject = this;
        var first = this.section.firstCondition(this) && !this.isPlaceHolder();
        this.conditionRow = 
            !this.isRelationship ?
                    new CertificationGlideConditionRow(this, this.queryID, this.wantOR, first, this.singleRow) :
                    new CertificationGlideRelationshipConditionRow(this, this.queryID, this.wantOR, first, this.singleRow);
        var tr = this.conditionRow.getRow();
        this.tbody.appendChild(tr);
        this.actionRow = tr;
        tr.conditionObject = this;	
    }
});

var CertificationGlideConditionRow = Class.create(GlideConditionRow, {
    initialize: function(condition, queryID, wantOr, first, singleRow) {
        this.singleRow = singleRow || false;
        GlideConditionRow.prototype.initialize.apply(this, arguments);
    },
    
    addLeftButtons: function() {
   	    if (this.wantOr && !this.singleRow) {
    		tdAddOr = this.tdOrButton;
			var fDiv = this.filter.getDiv().id.split("gcond_filters", 1);
			var andOnClick = "addConditionSpec('" + this.tableName + "','" + this.queryID + "','','','','" + fDiv + "')";
			var orOnClick = "newSubRow(this)";
       		tdAddOr.innerHTML = this.getAndButtonHTML(andOnClick) + this.getOrButtonHTML(orOnClick);
	    	if (this.condition.isPlaceHolder())
	    		tdAddOr.style.visibility = 'hidden';
		}
		
        var td = this.tdRemoveButton;    
		var tdMessage = this.tdAndOrText;
		if (this.wantOr) {
	    	if (this.first || this.condition.isPlaceHolder()) {
	    		tdMessage.innerHTML = this.answer['and'];
	    		tdMessage.style.color = tdMessage.style.backgroundColor;
	        	tdMessage.style.visibility = 'hidden';
			} else
				tdMessage.innerHTML = this.answer['and']; 
		} else if (td.parentNode.sortSpec != true)
			tdMessage.innerHTML = this.answer['or']; 
		else
	    	tdMessage.style.display = 'none';

		tdMessage.style.width = DEFAULT_WIDTH;
        
        // delete filter
 		td.style.width = DEFAULT_WIDTH;
    	var id = 'r' + guid();
    	td.id = id;
        var deleteOnClick = "deleteFilterByID('" + this.getName() +"','" +id+ "');"
    	td.innerHTML = this.getDeleteButtonHTML(id, deleteOnClick);
        
        td.childNodes[0].childNodes[0].onmouseover = swapImage("img_" + id, this.DELETE_HOVER_IMAGE);
        td.childNodes[0].childNodes[0].onmouseout = swapImage("img_" + id, this.DELETE_IMAGE);
        
        if (!this.condition.isPlaceHolder())
        	return;
        
        if (!this.filter.defaultPlaceHolder)
        	return;
        	
        if (this.filter.getMaintainPlaceHolder() || this.filter.singleCondition())
    		td.style.visibility = 'hidden';
	}
});

var CertificationGlideRelationshipConditionRow = Class.create(CertificationGlideConditionRow, {
    build: function(field, oper, value) {
		this.field = field;
		this.oper = oper;
		this.value = value;
		var tableName = this.getName();
		var tds = this.row.getElementsByTagName("td");

		// populate field pull down
		this.fieldSelect = _createFilterSelect();
		this.fieldSelect.onchange = this.fieldOnChange.bind(this);
		
		var parts = tableName.split(".");
		var sname = parts[0];
		if (this.field != null)
	   		sname = sname + "." + field;
		
		var tableDef = null;
		if(parts.length == 2)
			tableDef = getTableReference(parts[0]);
		else if(parts.length == 3)
			tableDef = getTableReference(parts[1]);
		
		if(tableDef)
			this.fieldSelect.relationshipTable = tableDef.elements['condition'].getNamedAttribute('rel_type_table');
		
		this.filter.setFieldUsed(field);
		var descriptor = this.filter.descriptor;
		var prefix = this.filter.prefix;
		addRelationships(this.fieldSelect, sname, field, this.filter.filterFields.bind(this.filter), tableDef, descriptor, prefix);
		this.tdName.appendChild(this.fieldSelect);

		// populate condition and value

		updateRelationshipOperators(tableName, this.fieldSelect, oper, value);
 		if (this.filter.isProtectedField(field))
 			this._setReadOnly();

		// populate the remove button
		currentTable = tableName;
		this.addLeftButtons();
		if (window.seeIfItHasFilters)
			seeIfItHasFilters(tableName);
 		
		return tds;
	},
	
	//
	// Gets called when the selected relationship is changed
	//
	fieldOnChange: function() {
		this.filter.setFieldUsed(this.getField());
		this.filter.clearFieldUsed(this.field, this.condition);
		this.field = this.getField();
		var b = this.condition.isPlaceHolder();
		this.condition.setPlaceHolder(false);
		updateRelationshipOperators(this.getName(), this.fieldSelect, null, null);
		if (b) {
			this.condition.setPlaceHolder(false);
			this.showFields();
			this.condition.clearPlaceHolder();
			if (this.condition.isFirst())
				this.makeFirst();
		}
		//TODO: What does this do?
		//this.filter.refreshSelectList();
	}
});

var CertificationGlideSubCondition = Class.create(GlideSubCondition, {
    initialize: function(condition, queryID, isRelationship, singleRow) {
		this.isRelationship = isRelationship || false;
		this.singleRow = singleRow || false;
		GlideSubCondition.prototype.initialize.apply(this, arguments);
	},
	
	buildRow: function(parent, field, oper, value) {
		this.field = field;
		this.oper = oper;
	    if (value)
			this.value = value.replace(/${AMP}amp;amp;/g,'${AMP}amp;');
		else
			this.value = value;
		this.row =
			!this.isRelationship ? 
					new CertificationGlideConditionRow(this.condition, queryID, false, false, this.singleRow) :
					new CertificationGlideRelationshipConditionRow(this.condition, queryID, false, false, this.singleRow);
		var tr = this.row.getRow();
		parent.appendChild(tr);
		tr.conditionObject = this;
		this.row.build(field, oper, this.value);
	}
});

var GlideFilterList = Class.create(GlideFilterReference, {
	_build: function() {
		clearNodes(this.tr.tdValue);
		this.inputCnt = 0;
		if (this._isEmptyOper())
            return;	
		
		var op = this._getOperator();	
		if(this._renderRightOperandAsFieldList(op)) {
			// populate the right operand with fields of the same type as the left one.
			this._addSameAsLabels(this, op);
			this._populateRightOperandChoices();
			
		} else {
			this._buildWidget();
		}
	},
	
	_buildWidget: function() { 
		var _this = this;
		var hInput = this._addTextInput("hidden");
		hInput.id = this.id;
		var enclosingSpan = $j('<span>');
		$j(this.tr.tdValue).append(enclosingSpan);
		
		var table = $j('<div>')
			.css('display', 'table')
			.attr('cellspacing', '1')
			.attr('cellpadding', '1')
			.attr('border', '0');
		
		var topTr = $j('<div>')
			.css('display', 'table-row');
			
		var selectTd = $j('<span>')
			.css({
				display: 'table-cell',
				padding: '1px'
			});
			
		var select = $j('<select>')
			.attr('id', 'select_0' + this.id)			
			.attr('size', '4')
			.attr('minwidth', '160')
			.attr('fixedwidth', '')
			.attr('multiple', 'yes')
			.attr('name', 'select_0' + this.id)
			.change(function() {
				toggleGlideListIcons(_this.id, false);
			})
			.css('width', '160px');
			
		this._select = select[0];
		selectTd.append(select);
		topTr.append(selectTd);
		
		var iconTd = $j('<span>')
			.css({
				display: 'table-cell',
				padding: '1px',
				verticalAlign: 'top'
			})
			.attr('class', 'bodySmall')
			.attr('width', '20px');
		
		var iconTable = $j('<span>')
			.css('display', 'table')
			.attr('cellspacing', '0')
			.attr('cellpadding', '0')
			.attr('border', '0');
		
		var iconRemoveTr = $j('<span>')
			.css('display', 'table-row');

		var iconRemoveTd = $j('<span>')
			.css({
				display: 'table-cell',
				padding: '1px'
			});
		
		var iconRemove = $j('<a>')
			.attr('data-ref', this.id)
			.attr('data-type', 'glide_list_remove');
			
		var iconRemoveImg = $j('<img>')
			.attr('id', 'remove.' + this.id)
			.attr('width', '16')
			.attr('height', '16')
			.attr('title', getMessage('Remove selected item'))
			.attr('src', 'images/delete_edit_off.gifx')
			.attr('alt', getMessage('Remove selected item'))
			.attr('border', 0);
			
		iconRemove.append(iconRemoveImg);
		iconRemoveTd.append(iconRemove);
		iconRemoveTr.append(iconRemoveTd);
		iconTable.append(iconRemoveTr);	

		var iconRefTr = $j('<span>')
			.css('display', 'table-row');
			
		var iconRefTd = $j('<span>')
			.css({
				display: 'table-cell',
				padding: '1px'
			});
			
		var iconRef = $j('<a>')
			.attr('id', 'view2link.' + this.id)
			.click(this._referenceRedirect.bind(this));

		var iconRefImg = $j('<img>')
			.attr('id', 'view2.' + this.id)
			.attr('name', 'view2.' + this.id)
			.attr('src', 'images/icons/hover_icon_small2_off.gifx')
			.attr('border', '0')
			.attr('alt', getMessage('View selected Item'))
			.attr('title', getMessage('View selected item'))
			.attr('width', '16')
			.attr('height', '16')
			.css({
				//align: 'left',
				//display: 'block'
			});
			
		iconRef.append(iconRefImg);
		iconRefTd.append(iconRef);
		iconRefTr.append(iconRefTd);
		iconTable.append(iconRefTr);
		iconTd.append(iconTable);
		
		topTr.append(iconTd);
		
		var bottomTr = $j('<span>')
			.css('display', 'table-row');
			
		var refTd = $j('<span>')
			.css({
				display: 'table-cell',
				padding: '1px'
			});
			
		var refInput = this._addTextInput();
		refInput.parentNode.removeChild(refInput);
		
		refInput = $j(refInput);
		refInput
			.attr('id', 'sys_display.' + this.id)
			.attr('name', 'sys_display.' + this.id)
			.attr('isList', "true")
			.attr('title', getMessage('Select target record'))
			.attr('ac_columns', '')
			.attr('ac_order_by', '')
			.attr('autocomplete','off')
			.attr('function', 'addGlideListReference("' + this.id + '")')
			.val('')
			.css({
				width: '160px',
				verticalAlign: 'top'
			})
			.focus(this._onFocus.bindAsEventListener(this))
			.keydown(this._onKeyDown.bindAsEventListener(this))
			.keypress(this._onKeyPress.bindAsEventListener(this))
			.keyup(this._onKeyUp.bindAsEventListener(this));
			
		refTd.append(refInput);
		
		var refIconTd = $j('<span>')
			.css({
				display: 'table-cell',
				padding: '1px'
			});
		var image = createImage("images/reference_list.gifx", "Lookup using list", this, this._refListOpen);
		image.setAttribute("class", "filerTableAction");
		refIconTd.append($j(image));
		bottomTr.append(refTd);
		bottomTr.append(refIconTd);
		
		table.append(topTr);
		table.append(bottomTr);
		
		enclosingSpan.append(table);
		
		if(this.values)
			this._resolveReference();
	},
	
	_resolveReference: function() {
		if (this.values && this.values.length > 0) {
			var ajax = new GlideAjax("ResolveRefMulti");
			ajax.addParam("sysparm_name", this.tr.tableField);
			ajax.addParam("sysparm_value", this.values);
			ajax.getXML(this._resolveReferenceResponse.bind(this));
		}
	},
	
	_resolveReferenceResponse: function(request) {
		if (!request)
			return;
		
		var xml = request.responseXML;
		if (!xml)
			return;
			
		if (xml) {
		    var items = xml.getElementsByTagName("item");
		    if (items && items.length > 0) {
		    	for (var i=0; i < items.length; i++) {
		    		var it = items[i];
		    		var opt = cel('option');
		    		opt.innerHTML = it.getAttribute('label');
		    		opt.value = it.getAttribute('name');
		    		this._select.appendChild(opt);
		    	}
		    }
		}
	},
	
	_onFocus: function() {
		if (!this.inputs[1].ac) {
			var partialSearchFilterTypes = ',STARTSWITH,ENDSWITH,LIKE,NOT LIKE,';
			var tdOper = this.tr.tdOper;
			//ie doesn't like firstElementChild so check both
			var currentFilterType = (tdOper.firstElementChild || tdOper.children[0] || {}).value;
			if (partialSearchFilterTypes.indexOf(','+currentFilterType+',') > -1)
				this.inputs[1].setAttribute('is_filter_using_contains', 'true');
			
			this.inputs[1].ac = new AJAXReferenceCompleter(this.inputs[1], this.id, '');
			// since the key field name does not match the table name in this case, 
			// set the table/field name for the completer
			//
			// the id we use for the key element included a guid since we allow the same
			// element to appear multiple times in a filter
			this.inputs[1].ac.elementName = this.tr.tableField;
			
			// do not clear any derived fields when building filters
			this.inputs[1].ac.clearDerivedFields = true;
		}
	},
	
	_useDisplayValue: function(oper) {
		return false; 
	},
	
	_referenceRedirect: function() {
		var tableField = this.tr.tableField;
		var parts = tableField.split('.');
		var table = parts[0];
		var field = parts[1];
		
		var tRef = getTableReference(table);
		
		var element = tRef.getElement(field);
		if(!element) return;
		
		var referenceTable = element.getReference();
		if(!referenceTable) return;
		
		var currentTable = g_form.getTableName();
		glideListViewSelection(this.id, currentTable, referenceTable);
	}
});

//Handler for reference type that can be multiple or single (depending on the
//operator). Extends GlideFilterList to handle multiple references. 
//Behaves as a multiple reference if the operator is 'IN' or 'NOT IN', otherwise
//behaves as a single reference. 
var GlideFilterRelationshipReference = Class.create(GlideFilterList, {
	_build: function() {
		this._updateBehavior();
		this.behavior.prototype._build.apply(this, arguments);
	},
	
	_getAdditionalQual: function() {
	    var targetTables = this.originalTableName.split(',');
        var refQuals = [];
        for(var i = 0; i < targetTables.length; i++) {
            refQuals.push('sys_class_nameINSTANCEOF' + targetTables[i]);
        }
        var refQual = refQuals.join('^OR');
		return refQual;
	},
	
	_onFocus: function() {
		this.behavior.prototype._onFocus.apply(this, arguments);
		//set the ref qual if original table name is provided
		if(this.originalTableName) {
		    var refQual = this._getAdditionalQual();
			this.inputs[1].ac.refQual = refQual;
		}
	},
	
	_resolveReference: function() {
		this.behavior.prototype._resolveReference.apply(this, arguments);
	},
	
	_resolveReferenceResponse: function() {
		this.behavior.prototype._resolveReferenceResponse.apply(this, arguments);
	},
	
	_initValues: function(values) {
		this._updateBehavior();
		return this.behavior.prototype._initValues.apply(this, arguments);
	},
	
	_updateBehavior: function() {
		var oldBehavior = this.behavior;
		var op = this._getOperator();
		if(op == 'IN' || op == 'NOT IN') {
			this.behavior = GlideFilterList;
			this.maxValues = 20;
		}
		else {
			this.behavior = GlideFilterReference;
			this.maxValues = 1;
		}
		if(oldBehavior != this.behavior)
			this._clearValues();
	},
	
	getValues: function() {
		return this.behavior.prototype.getValues.apply(this, arguments);
	},
	
	_refListOpen: function() {
	    var refQual = null;
	    var originalTableName = this.originalTableName;
	    if(originalTableName != null && originalTableName.indexOf(',') > 0) {
	        originalTableName = 'cmdb_ci';
	        refQual = this._getAdditionalQual();
	    }
        reflistOpen(this.id, "", originalTableName, null, null, null, refQual);
        return false;
    }
});

function addRelationships(s, target, fValue, filterMethod, tableDefinition, descriptor, prefix) {
    filterMethod = filterMethod === undefined ? null : filterMethod;
    
    // If there is no relationship table, or if the relationship table is invalid
    // return automatically
    if (!(s.relationshipTable &&
        (s.relationshipTable == 'cmdb_rel_type' || 
         s.relationshipTable == 'cmdb_rel_user_type' ||
         s.relationshipTable == 'cmdb_rel_group_type')))
        return s;
	
    var relationshipTable = s.relationshipTable;
    var messages = getMessages(MESSAGES_CONDITION_RELATED_FILES);
    var parts = target.split(".");
    if (parts.length > 1 && parts[1] != null && parts[1] != '' && parts[1] == PLACEHOLDERFIELD) {
    	addOption(s, PLACEHOLDER, messages['-- choose relationship --'], true);
    }

	var tableName = parts[0];
	var ajax = new GlideAjax("AddRelationshipAjax");
	ajax.addParam("sysparm_type", "getRelationships");
	ajax.addParam("sysparm_table_name", tableName);
	var response = ajax.getXMLWait();
	this.getRelationshipsResponse(s, fValue, filterMethod, tableDefinition, response, descriptor, prefix);
	//ajax.getXML(this.getRelationshipsResponse.bind(this, s, fValue, filterMethod, tableDefinition));

	
    return s;
}

function getRelationshipsResponse(fieldSelect, fieldId, filterMethod, tableDefinition, response, descriptor, prefix) {
    var PseudoElement = Class.create();
    PseudoElement.prototype = {
        initialize: function(name) {
            this.name = name;
        },
        getName: function() {
            return this.name;
        }
    };

    var items = response.getElementsByTagName("item");
    
    if (items.length == 0)
        return;
    
    var select = fieldSelect;
    if (!select)
        return;
    
    this.original = new Array();
	
	var fullFieldId = descriptor + ':';
	if(prefix != '')
		fullFieldId += prefix + ':' + fieldId;
	else
		fullFieldId += fieldId;
	
	var showAllCheckbox = $(tableDefinition.tableName + '_show_all_relationships');
    var showAllRelationships = showAllCheckbox.checked;
	
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var v = item.getAttribute('value');
		var valueParts = v.split(':');
		var filterItem = new PseudoElement(v);
        if(!filterMethod || (filterMethod && filterMethod(filterItem)) || fullFieldId == filterItem.name) {
			if((tableDefinition.tableName == 'cert_ci_rel_cond' && valueParts[1] != 'sys_user' && valueParts[1] != 'sys_user_group') ||
			   (tableDefinition.tableName == 'cert_user_rel_cond' && valueParts[1] == 'sys_user') ||
			   (tableDefinition.tableName == 'cert_group_rel_cond' && valueParts[1] == 'sys_user_group')) {
				var label = item.getAttribute('label');
				var suggested = item.getAttribute('suggested');
				
				var o = addOption(select, v, label, fullFieldId == v);
				o.setAttribute('gsft_label', item.getAttribute('label'));
				o.setAttribute('gsft_suggested', suggested);
				o.table = select.relationshipTable;
				// Set the target table here
				// The auto complete and lookup will be limited
				// to records in this table
				o.targetTable = item.getAttribute('dependent_class');
			
				this.original.push(o);
                 // show the relationship if it is suggested or if
                 // the show all relationships checkbox is selected
                 // for this table
				if (! (suggested == 'true' || showAllRelationships))
					select.options.length = select.options.length -1;
			}
        }
    }
}

function updateRelationshipOperators(name, select, fOper, fValue) {
    var row = select.parentNode.parentNode;
    var operatorCell = row.tdOper;
    operatorCell.innerHTML = '';
    var operatorSelect = _createFilterSelect();
    operatorCell.appendChild(operatorSelect);
    row.operSel = operatorSelect;
    var operators;
    var isPlaceholder = select.selectedIndex < 0 || select.options[select.selectedIndex].value == PLACEHOLDER;
    if(isPlaceholder) {
        operators = sysopers['placeholder'];
        operatorSelect.disabled = true;
    }
    else
        operators = RELATIONSHIP_OPERATORS;
    var numOps = operators.length;
    var selectedIndex = -1;
    for(var i = 0; i < numOps; i++) {
        var option = document.createElement('option');
        var operator = operators[i];
        option.value = operator[0];
        if(option.value == fOper)
            selectedIndex = i;
        option.innerHTML = getMessage(operator[1]);
        operatorSelect.appendChild(option);
    }
        
    if(row.handler) {
        row.handler.destroy();
        row.tdValue.innerHTML = '';
    }
    
    if(selectedIndex >= 0) {
        operatorSelect.selectedIndex = selectedIndex;
    }
    
    var relationshipSelectedIndex = select.selectedIndex;
    var selectedOption = select.options[relationshipSelectedIndex];
    if(relationshipSelectedIndex >= 0 && selectedOption.value != PLACEHOLDER) {
        if(selectedOption.table) {
            var relationshipTable = null;
            var targetTable = selectedOption.targetTable || null;
            var elementName = null;
            switch(selectedOption.table) {
                case 'cmdb_rel_user_type':
                    relationshipTable = 'cmdb_rel_person';
                    targetTable = 'sys_user';
                    elementName = 'user';
                    break;
                case 'cmdb_rel_group_type':
                    relationshipTable = 'cmdb_rel_group';
                    targetTable = 'sys_user_group';
                    elementName = 'group'
                    break;
                case 'cmdb_rel_type':
                    relationshipTable = 'cmdb_rel_ci';
                    targetTable = targetTable || 'cmdb_ci';
                    elementName = 'child';
                    break;
                    
            }
            if(relationshipTable != null && targetTable != null && elementName != null) {
                row.tableField = relationshipTable + "." + elementName;
                row.handler = new GlideFilterRelationshipReference(relationshipTable, getTableReference(relationshipTable).elements[elementName]);
                row.handler.setOriginalTable(targetTable);
                row.handler.create(row, fValue);
            }
        }
    }
    else {
        row.handler = new GlideFilterString('cmdb_rel_ci', null);
    }
}

function getQueryDisplay(tableName, query) {
    var ajax = new GlideAjax('ConditionUtilsAjax');
    ajax.addParam('sysparm_name', 'getQueryDisplay');
    ajax.addParam('sysparm_table_name', tableName);
    ajax.addParam('sysparm_query', query);

    var result = ajax.getXMLWait();
    if(result && result.childNodes.length > 0) {
        result = result.getElementsByTagName('result');
        if(result.length > 0)
            result = result[0];
        else
            result = null;
        if(result) {
            return result.getAttribute('queryDisplay');
        }
    }
    return '';
}

function getRelationshipQueryDisplay(relationshipTypeTable, query) {
    var relationshipTargetTable;
    switch(relationshipTypeTable) {
        case 'cmdb_rel_type':
            relationshipTargetTable = 'cmdb_ci';
            break;
        case 'cmdb_rel_user_type':
            relationshipTargetTable = 'sys_user';
            break;
        case 'cmdb_rel_group_type':
            relationshipTargetTable = 'sys_user_group';
    }
    
    var ajax = new GlideAjax('ConditionUtilsAjax');
    ajax.addParam('sysparm_name', 'getRelationshipQueryDisplay');
    ajax.addParam('sysparm_rel_type_table', relationshipTypeTable);
    ajax.addParam('sysparm_rel_target_table', relationshipTargetTable);
    ajax.addParam('sysparm_query', query);
    
    var result = ajax.getXMLWait();
    if(result && result.childNodes.length > 0) {
        result = result.getElementsByTagName('result');
        if(result.length > 0)
            result = result[0];
        else
            result = null;
        if(result) {
            return result.getAttribute('queryDisplay');
        }
    }
    return '';
}

function getRelationshipFilterDisplay(name, relationshipTypeTable) {
    var value = getFilter(name, false);
    return getRelationshipQueryDisplay(relationshipTypeTable, value);
}

function getFilterDisplay(name) {
    var value = getFilter(name, false);
    var tableName = name.split('.')[0];
    return getQueryDisplay(tableName, value);
}

function createCertCondFilter (tname, query, fieldName, descriptor, prefix) {
    if(!('CertificationGlideFilter' in window))
        defineCertificationGlideFilter();
    noOps = false;
    noSort = false;
    noGroup = true;
    noConditionals = false;
    useTextareas = false;
	
	var callback = function(filterObj) {
		filterObj.getDiv().initialQuery = query;
		filterObj.setQuery(query);
		if(fieldName != null && fieldName !== undefined)
			g_form.registerHandler(fieldName, filterObj);
	};
	
	var filterObj;
	if ('init2' in GlideFilter.prototype) {
		// New UI (2014) may build asynchronously
		filterObj = new CertificationGlideFilter(tname, {
			descriptor: descriptor,
			prefix: prefix
		}, callback);
	}
	else {
		// Legacy UI builds synchronously
		filterObj = new CertificationGlideFilter(tname, {
			descriptor: descriptor,
			prefix: prefix
		});
	    callback(filterObj);
	}
	return filterObj;
};

(function() {
    addUnloadEvent(function() {
        var elems = $$('input.glide_destroy_cert_filter');
        elems.each(function(elem, index) {
            var ref = elem.id;
            if (ref) {
                var filterObj = getFilterForCondition(ref);
                if (filterObj)
                    filterObj.destroy();
            }
        });	
    });	
})();

(function() {
    addLoadEvent(function() {
        
        var numericTypes = {
            "auto_increment": true,
            "decimal": true,
            "domain_number": true,
            "float": true,
            "integer": true
	    };
        
        GlideFilterString.prototype._initValues = function(values) {
            this.values = [];
            if (values)
               this.values = values.split('@');
        };
        
        GlideFilterCurrency.prototype._parseValue = function() {
            if (this.inputs.length == 0)
			    return;
			
			var sel = null;
			
            var __parseValue = function(v) {
                var sa = v.split(';');
                var first = sa[0].split('\'');
                var currency = first[first.length - 1];
                var price = sa[sa.length - 1];
                var i = price.indexOf('\'');
                price = price.substring(0, i);
                
                return {'price': price, 'currency': currency};
            };
            
            for(var i = 0; i < this.inputs.length; i++) {
                var v = this.inputs[i].value;
                if(!v || v.indexOf('javascript') < 0)
                    break;
                    
                var parseResult = __parseValue(v);
                this.inputs[i].value = parseResult.price;
                
                if(!sel) {
                    sel = new Select(this.currency_widget);
                    sel.selectValue(parseResult.currency);
                }
            }
        };
        
        GlideFilterCurrency.prototype.getValues = function() {
            this._clearValues();
            
            if (this.inputCnt == 0)
                return "";
                
            for(var j = 0; j < this.inputs.length; j++) {
                var input = this.inputs[j];
                if(input.tagName.toLowerCase() != 'input')
                    break;
                this.values[j] = input.value;
            }
            
            var tn = this.item.table.tableName;
            var fn = this.item.name;
            var _this = this;
            var formatCurrency = function(v) {
                return 'javascript:getCurrencyFilter(\'' + tn + '\',\'' + fn +
                    '\', \'' + _this.currency_widget.value + ';' + v + '\')';
            };
            var results = [];
            for(var i = 0; i < this.values.length; i++) {
                results.push(formatCurrency(this.values[i]));
            }
            return results.join('@');
        };
    });
})();


(function() {
    addLoadEvent(function() {
        var elems = $$('input.glide_destroy_cert_filter');
        elems.each(function(elem, index) {
            var ref = elem.id;
            if (ref) {
                filterExpanded = true;		
                var table = resolveDependentValue(ref, elem.getAttribute('data-dependent'), elem.getAttribute('data-dependent_table'));
                if (table != null) {
                    var fname = ref;
                    var hinput = $(fname);
                    var xfilter = unescape(hinput.value);
                    createCertCondFilter(table + "." + fname, xfilter, fname, elem); 
                }
                addOnSubmitEvent(findParentByTag($(ref), "FORM"),
                    function() {
                        var hinput = $(ref);
                        var cfilter = getFilter(ref);
                        hinput.value = unescape(cfilter);
                });
            }
        });	
    });	
})();