var updateAttributesLinkGenerator = Class.create();
updateAttributesLinkGenerator.prototype = {
    initialize: function () {},
    addAttributesTofield: function (col, table, parentTables, baseTable) {
    	baseTable = baseTable.trim();
        var fields = this._getTableWhereColumnIsPresent(col, table);
        var fieldBelongstoTheTable = SNC.TableEditor.getAncestorTableNameWhoOwnsField(table, col);
        var isIndependentField = fieldBelongstoTheTable == fields.prevRef ? true : false;

        if (isIndependentField) {
            this.addAttributesinSysDictionary(fields.columnLabel, fields.prevRef);
            return;
        }
        if (!isIndependentField) {
            var notPresent = true;
            for (var i = 0; i < parentTables.length; i++) {
                var isPresent = this._isDictionaryOverridePresent(col, parentTables[i], baseTable);
                if (isPresent) {
                    notPresent = false;
                    var att = this._addAttr(col, table, parentTables[i], baseTable);
                }
            }
            if (notPresent) {
                var rec = this._getAttributes(col, baseTable);
                this._addAttributesinSysDictionaryOverrides(col, table, baseTable, rec.attributes.toString());
            }
        }
    },
    _getTableWhereColumnIsPresent: function (col, table) {
        var retElementHTML = {};
        var elementLabel = '';
        var fieldName = col;
        var fieldTable = table;
        var fieldArray = fieldName.split('.');
        var fieldLength = fieldArray.length;
        var jsonAssignToInfo = {};
        for (var i = 0; i < fieldLength; i++) {
            jsonAssignToInfo = this._getColumnLabel(fieldTable, fieldArray[i]);
            fieldTable = jsonAssignToInfo.columnRef;
        }
        return jsonAssignToInfo;
    },

    _getColumnLabel: function (tableName, fieldName) {
        var retColumnInfo = {
            columnLabel: '',
            columnRef: '',
            prevRef: ''
        };
        var grTab = new GlideRecord(tableName);
        grTab.initialize();
        if (grTab.isValid()) {
            var ele = grTab.getElement(fieldName);
            retColumnInfo.columnLabel = fieldName;
            if (ele.getED().getInternalType() == "reference") {
                retColumnInfo.prevRef = tableName;
                retColumnInfo.columnRef = ele.getReferenceTable();
            } else {
                retColumnInfo.prevRef = tableName;
                retColumnInfo.columnRef = tableName;
            }
        }
        return retColumnInfo;
    },

    _isDictionaryOverridePresent: function (col, table, baseTable) {
        var fieldPresent = new GlideRecord('sys_dictionary_override');
        fieldPresent.addQuery("base_table", baseTable);
        fieldPresent.addQuery("name", table);
        fieldPresent.addQuery("element", col);
        fieldPresent.query();
        if (fieldPresent.next() && fieldPresent.attributes_override == true) return true;
        return false;
    },

    _checkfieldIsCurrentTable: function (col, table) {
        var fieldPresent = new GlideRecord('sys_dictionary');
        fieldPresent.addQuery("name", table.toString());
        fieldPresent.addQuery("element", col.toString());
        fieldPresent.query();
        if (fieldPresent.next()) return true;
        return false;
    },

    _addAttr: function (col, table, currentTable, baseTable) {
        if (table == currentTable) {
            var rec = this._getAttributesFromSysDictionaryOverrides(col, currentTable, baseTable);
            this._updateSysDictionaryOverrideRecord(rec);
        }
        if (table != currentTable) {
            var rec = this._getAttributesFromSysDictionaryOverrides(col, currentTable, baseTable);
            this._addAttributesinSysDictionaryOverrides(col, table, baseTable, rec.attributes);
        }
    },
    _getAttributesFromSysDictionaryOverrides: function (col, table, baseTable) {
        var sysDictionary = new GlideRecord('sys_dictionary_override');
        sysDictionary.addQuery('name', table.toString());
        sysDictionary.addQuery('element', col.toString());
        sysDictionary.addQuery('base_table', baseTable.toString());
        sysDictionary.query();
        if (sysDictionary.next()) {
            return sysDictionary;
        }
        return null;
    },
    _updateSysDictionaryOverrideRecord: function (sysDictionaryOverride) {
        var attributes = sysDictionaryOverride.attributes.toString();
        var att = this._formatedAttributes(attributes);
        sysDictionaryOverride.attributes_override = "true";
        sysDictionaryOverride.attributes = att.toString();
        sysDictionaryOverride.update();
        return;
    },
    updateRecord: function (sysDictionary) {

        var attributes = sysDictionary.attributes.toString();
        var att = this._formatedAttributes(attributes);
        sysDictionary.attributes = att.toString();
        sysDictionary.attributes_override = "true";
        sysDictionary.update();
        return;
    },

    _addAttributesinSysDictionaryOverrides: function (col, table, baseTable, attributes) {

        var att = this._formatedAttributes(attributes);
        var scope = this._getScope(table);

        var gr = new GlideRecord('sys_dictionary_override');
        gr.initialize();
        gr.sys_package = scope;
        gr.sys_scope = scope;
        gr.base_table = baseTable.toString();
        gr.attributes_override = "true";
        gr.name = table.toString();
        gr.element = col.toString();
        gr.attributes = att; // format and find where to add attributes
        gr.insert();
    },

    _getScope: function (table) {
        var gScope = new GlideRecord('sys_db_object');
        if (gScope.get('name', table)) {
            return gScope.sys_scope.sys_id;
        }
    },

    addAttributesinSysDictionary: function (col, table) {
        var fields = this._getTableWhereColumnIsPresent(col, table);

        var sysDictionary = new GlideRecord('sys_dictionary');
        sysDictionary.addQuery('name', fields.prevRef);
        sysDictionary.addQuery('element', fields.columnLabel);
        sysDictionary.query();

        if (sysDictionary.next()) {
            var attributes = sysDictionary.attributes.toString();
            var att = this._formatedAttributes(attributes);
            sysDictionary.attributes = att;
            sysDictionary.update();
            return;
        }
        return null;
    },

    _getAttributes: function (col, table) {
        var sysDictionary = new GlideRecord('sys_dictionary');
        sysDictionary.addQuery('name', table.trim());
        sysDictionary.addQuery('element', col.trim());
        sysDictionary.query();
        if (sysDictionary.next()) {
            return sysDictionary;
        }
        return null;
    },

    _formatedAttributes: function (attributes) {

        if (attributes.indexOf("linkGeneratorBtn") != -1 ){
			return attributes;
		}
		
        if (attributes == "" || !attributes) {
            attributes = "ref_contributions=linkGeneratorBtn";
            return attributes;
        }
		
        if (attributes.indexOf("ref_contributions") != -1 && attributes.indexOf("linkGeneratorBtn") == -1 )  {
            var att = attributes.split("ref_contributions=");
            attributes = att[0] + "ref_contributions=linkGeneratorBtn;" + att[1];
            return attributes;
        }
		
        attributes += ",ref_contributions=linkGeneratorBtn";
        return attributes;
    },
    type: 'updateAttributesLinkGenerator'
};