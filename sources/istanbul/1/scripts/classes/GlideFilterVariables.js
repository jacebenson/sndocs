/*! RESOURCE: /scripts/classes/GlideFilterVariables.js */
var GlideFilterVariables = Class.create(GlideFilterHandler, {
      _setup: function(values) {
        this.maxValues = 1;
        this.id = this.tr.tableField + "." + guid();
        this.catID = "item_option_new.cat_item." + guid();
        this.listenForOperChange = true;
        this.rightOperand = values;
      },
      _initValues: function(values) {
        this.values = [];
        this.varValue = '';
        if (values) {
          this.values[0] = values.substring(0, 32);
          this.refQuery = values.substring(32);
          var query = new GlideEncodedQuery(this.tableName, "IO:" + this.values[0] + this.refQuery, null);
          query.parse();
          var terms = query.getTerms();
          var term = terms[0];
          this.varOp = term.getOperator();
          this.varValue = term.getValue();
        }
      },
      _build: function() {
        this.queryID = this.tr.tdValue.queryID;
        clearNodes(this.tr.tdValue);
        this.inputCnt = 0;
        if (this._isEmptyOper())
          return;
        this._hideOperators();
        var input = this._addTextInput("hidden");
        input.id = this.id;
        input = this._addTextInput();
        input.id = "sys_display." + this.id;
        input.onfocus = this._onFocus.bind(this);
        input.onRefPick = this._onFocus.bind(this);
        input.onkeydown = this._onKeyDown.bindAsEventListener(this);
        input.onkeypress = this._onKeyPress.bindAsEventListener(this);
        input.onkeyup = this._onKeyUp.bindAsEventListener(this);
        input.autocomplete = "off";
        input.data_completer = "AJAXTableCompleter";
        input.ac_columns = "cat_item;category";
        input.ac_order_by = "";
        input.placeholder = getMessage("Select Variable");
        setAttributeValue(input, 'autocomplete', 'off');
        var displayValue = gel('fancy.' + this.values[0]);
        if (displayValue && displayValue.value != '')
          this.inputs[1].value = displayValue.value;
        else if (this.values) {
          this.inputs[1].value = this.values;
          this._resolveReference();
        }
        if (document.documentElement.getAttribute('data-doctype') == 'true') {
          var btn = cel("button");
          btn.setAttribute("class", "icon-search btn btn-default filerTableAction");
          btn.onclick = this._refListOpen.bindAsEventListener(this);
          this.tr.tdValue.appendChild(btn);
        } else {
          var image = createImage("images/reference_list.gifx", "Lookup using list", this, this._refListOpen);
          image.setAttribute("class", "filerTableAction")
          this.tr.tdValue.appendChild(image);
        }
        this._buildCatItemReference();
        this._makeCatItemFirst();
        if (!this.values[0])
          return;
        this._getVariableType(this.values[0]);
      },
      _buildCatItemReference: function() {
        var queryID = this.queryID;
        td = this.tr.conditionRow.addTD(this.tr, queryID);
        td.nowrap = true;
        this.tr.catTD = td;
        var input = this._addTextInput("hidden", td);
        input.id = this.catID;
        input = this._addTextInput("", td);
        input.id = "sys_display." + this.catID;
        input.onfocus = this._onFocusCat.bind(this);
        input.onRefPick = this._onFocusCat.bind(this);
        input.onkeydown = this._onKeyDownCat.bindAsEventListener(this);
        input.onkeypress = this._onKeyPressCat.bindAsEventListener(this);
        input.onkeyup = this._onKeyUpCat.bindAsEventListener(this);
        input.autocomplete = "off";
        input.data_completer = "AJAXTableCompleter";
        input.ac_columns = "cat_item;category";
        input.ac_order_by = "";
        input.placeholder = getMessage("Select Item");
        setAttributeValue(input, 'autocomplete', 'off');
        if (document.documentElement.getAttribute('data-doctype') == 'true') {
          var btn = cel("button");
          btn.setAttribute("class", "icon-search btn btn-default filerTableAction");
          btn.onclick = this._refListOpenCat.bindAsEventListener(this);
          td.addClassName("form-inline");
          td.appendChild(btn);
        } else {
          var image = createImage("images/reference_list.gifx", "Lookup using list", this, this._refListOpenCat);
          image.setAttribute("class", "filerTableAction");
          td.appendChild(image);
        }
      },
      destroy: function() {
        this.inputCnt = 0;
        if (this.tr) {
          this.tr.tdValue.innerHTML = "";
          if (this.tr.variableID) {
            this.tr.removeChild(this.tr.variableID);
            this.tr.variableID = null;
          }
          if (this.tr.catTD) {
            this.tr.removeChild(this.tr.catTD);
            this.tr.catTD = null;
          }
          var td = this.tr.tdOper;
          if (td)
            td.style.display = "inline";
        }
        GlideFilterHandler.prototype.destroy.call(this);
      },
      setOriginalTable: function(tableName) {
        this.originalTableName = tableName;
      },
      _hideOperators: function() {
        if (this.tr.tdOper)
          this.tr.tdOper.style.display = "none";
      },
      _refListOpen: function() {
        if (this.values[2])
          reflistOpen(this.id, this.item.getName(), this.item.getReference(), "", false, "", "cat_item=" + this.variableRefQual);
        else
          reflistOpen(this.id, this.item.getName(), this.item.getReference());
        return false;
      },
      _refListOpenCat: function() {
        reflistOpen(this.catID, "cat_item", "sc_cat_item");
        return false;
      },
      getValues: function() {
        this._clearValues();
        if (this._isMappingEnabled)
          return this.getMappingValue();
        var oper = this._getOperator();
        var input = this.inputs[0];
        if (input) {
          return input.value;
        } else
          return '';
      },
      getFilterText: function(oper) {
        if (!this.variableFilter)
          return '';
        return "variables." + this.getValues() + oper + this.variableFilter.getValues();
      },
      _useDisplayValue: function(oper) {
        return this.item.getType() != 'glide_list' && oper != '=' && oper != '!=' && oper != "CHANGESFROM" && oper != "CHANGESTO";
      },
      _resolveReference: function() {
        if (this.values[0]) {
          var ajax = new GlideAjax("ResolveRef");
          ajax.addParam("sysparm_name", this.tr.tableField);
          ajax.addParam("sysparm_value", this.values[0]);
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
          if (items && items.length > 0 && items[0] && this.inputs[1])
            this.inputs[1].value = items[0].getAttribute("label");
        }
      },
      _resolveReferenceCat: function() {
        if (this.values[2]) {
          var ajax = new GlideAjax("ResolveRef");
          ajax.addParam("sysparm_name", "item_option_new.cat_item");
          ajax.addParam("sysparm_value", this.values[2]);
          ajax.getXML(this._resolveReferenceResponseCat.bind(this));
        }
      },
      _resolveReferenceResponseCat: function(request) {
        if (!request)
          return;
        var xml = request.responseXML;
        if (!xml)
          return;
        if (xml) {
          var items = xml.getElementsByTagName("item");
          if (items && items.length > 0 && items[0]) {
            this.inputs[3].value = items[0].getAttribute("label");
            this.values[3] = this.inputs[3].value;
          }
        }
      },
      _onFocus: function(evt) {
        if (!this.inputs[1].ac) {
          this.inputs[1].ac = new AJAXTableCompleter(this.inputs[1], this.id, '');
          this.inputs[1].ac.setFilterCallBack(this._refValueChange.bind(this));
          this.inputs[1].ac.elementName = this.tr.tableField;
          this.inputs[1].ac.setAdditionalValue("ac_columns", "cat_item;category");
          if (this.values[2])
            this.inputs[1].ac.setAdditionalValue("sysparm_ref_qual", "cat_item=" + this.variableRefQual);
          else
            this.inputs[1].ac.setAdditionalValue("sysparm_ref_qual", "");
          this.inputs[1].ac.clearDerivedFields = true;
        }
      },
      _refValueChange: function() {
        var ref = this.inputs[1].ac;
        var e = ref.getKeyElement();
        var id = e.value;
        this._clearQuery();
        this.values[0] = id;
        if (id)
          this._getVariableType(id);
      },
      _catValueSet: function(catValue) {
        if (this.values[2] == catValue)
          return;
        this.values[2] = catValue;
        this.variableRefQual = catValue;
        this.values[3] = catValue;
        this._resolveReferenceCat();
        this._setQualifier(this.inputs[1].ac, this.values[2]);
      },
      _refValueChangeCat: function() {
        var ref = this.inputs[3].ac;
        var e = ref.getKeyElement();
        var id = e.value;
        this.values[2] = id;
        this.variableRefQual = id;
        this._clearVariable();
        this._hideOperators();
        this._clearHandler();
        this._filterVariableReference();
      },
      _clearVariable: function() {
        var e = gel(this.id);
        if (e)
          e.value = '';
        e = gel("sys_display." + this.id);
        if (e)
          e.value = '';
      },
      _clearHandler: function() {
        if (!this.vType)
          return;
        this.variableFilter = this._getHandler();
        var conditionRow = this.tr.conditionRow;
        var td = this.tr.tdOper;
        if (td)
          this.tr.removeChild(td);
        this.tr.tdOper = null;
        if (this.tr.tdValue && this.tr.variableID) {
          this.tr.removeChild(this.tr.tdValue);
          this.tr.tdValue = null;
        }
      },
      _filterVariableReference: function() {
        this._onFocus();
        if (this.values[2])
          this._setQualifier(this.inputs[1].ac, this.values[2]);
        else
          this.inputs[1].ac.setAdditionalValue("sysparm_ref_qual", "");
        this._clearQuery();
      },
      _setQualifier: function(ac, catItem) {
        if (ac)
          ac.setAdditionalValue("sysparm_ref_qual", "cat_item=" + catItem);
        this._addVariableSets(ac, catItem);
      },
      _addVariableSets: function(ac, catItem) {
        var sets = new GlideRecord('io_set_item');
        var callback = this._getSetResponse.bind(this, ac, catItem, sets)
        var fn = function(gr) {
          callback(ac, catItem, sets);
        };
        sets.query('sc_cat_item', catItem, fn);
      },
      _getSetResponse: function(ac, catItem, sets) {
          if (!sets.hasNext())
            return;
          var setList = new Array();
          while (sets.next())
            setList.push(sets.variable_set + '');
          this.variabl