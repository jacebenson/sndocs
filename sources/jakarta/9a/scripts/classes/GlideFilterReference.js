/*! RESOURCE: /scripts/classes/GlideFilterReference.js */
var GlideFilterReference = Class.create(GlideFilterHandler, {
      _setup: function(values) {
        this.maxValues = 1;
        this.tableField = this.tr.tableField;
        this.id = this.tableField + "." + guid();
        this.listenForOperChange = true;
        this.rightOperand = values;
      },
      _initValues: function(values) {
        this.values = [];
        if (values)
          this.values[0] = values;
      },
      _build: function() {
        clearNodes(this.tr.tdValue);
        var inDoctypeMode = (document.documentElement.getAttribute('data-doctype') == 'true');
        this.inputCnt = 0;
        if (this._isEmptyOper()) {
          this._addInvisibleTextInput();
          return;
        }
        var op = this._getOperator();
        var input = this._addTextInput("hidden");
        input.id = this.id;
        if (this._renderRightOperandAsFieldList(op)) {
          this._addSameAsLabels(this, op);
          this._populateRightOperandChoices();
          return;
        }
        if (this._renderDynamicOperandInput(op))
          return;
        input = this._addTextInput();
        input.id = "sys_display." + this.id;
        input.onfocus = this._onFocus.bind(this);
        input.onkeydown = this._onKeyDown.bindAsEventListener(this);
        input.onkeypress = this._onKeyPress.bindAsEventListener(this);
        input.onkeyup = this._onKeyUp.bindAsEventListener(this);
        input.autocomplete = "off";
        input.ac_columns = "";
        input.ac_order_by = "";
        if (inDoctypeMode) {
          input.setAttribute("class", "pull-left form-control filter-reference-input");
        }
        setAttributeValue(input, 'autocomplete', 'off');
        var displayValue = gel('fancy.' + this.values[0]);
        if (displayValue && displayValue.value != '')
          this.inputs[1].value = displayValue.value;
        else if (this.values) {
          this.inputs[1].value = this.values;
          this._resolveReference();
        }
        var view = $$("[name='sysparm_view']")[0];
        if (view && (view.value == "sys_ref_list"))
          return;
        if (inDoctypeMode) {
          var btn = cel("button");
          btn.setAttribute("class", "icon-search btn btn-default filerTableAction");
          btn.setAttribute("style", "margin-left: 2px");
          btn.onclick = this._refListOpen.bindAsEventListener(this);
          this.tr.tdValue.style.minWidth = "200px";
          this.tr.tdValue.appendChild(btn);
        } else {
          var image = createImage("images/reference_list.gifx", "Lookup using list", this, this._refListOpen);
          image.setAttribute("class", "filerTableAction");
          this.tr.tdValue.appendChild(image);
        }
      },
      _refListOpen: function() {
        var target = this.id;
        if (target.indexOf("IO:") > -1)
          target = target.substring(target.indexOf("IO:"), target.length);
        reflistOpen(target, this.item.getName(), this.item.getReference());
        return false;
      },
      getValues: function() {
          this._clearValues();
          if (this._isMappingEnabled)
            return this.getMappingValue();
          if (this._isEmptyOper())
            return '';
          var oper = this._getOperator();