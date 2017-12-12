			var ColumnDetails = Class.create();

			// A utility class for storing details of a column from a database table
			ColumnDetails.prototype = {
				setValues: function (reference, internalName, name, table, internalType, typeName, isBaseColumn, referenceName, sysID) {
					this.reference = reference;
					this.internalName = internalName;
					this.name = name;
					this.table = table;
					this.internalType = internalType;
					this.typeName = typeName;
					this.isBaseColumn = isBaseColumn;
					this.referenceName = referenceName;
					this.sysID = sysID;
				},

				serialize: function () {
					return this.reference + "|" + this.internalName + "|" +
							this.name + "|" + this.table + "|" +
							this.internalType + "|" + this.typeName + "|" +
							this.isBaseColumn + "|" + this.referenceName + "|" +
							this.sysID;
				},

				clone: function (isBaseColumn) {
					var clone = new ColumnDetails();
					clone.setValues(this.reference, this.internalName, this.name, this.table, this.internalType,
							this.typeName, isBaseColumn, this.referenceName, this.sysID);
					return clone;
				}
			};

			// The AJAX processor itself
			var ERDProcessor = Class.create();

			// Some constants for paramaters, data, relationships and colors
			ERDProcessor.TABLE_PARAM = "table";
			ERDProcessor.TABLE_HISTORY_PARAM = "table_history";
			ERDProcessor.SHOW_INTERNAL_PARAM = "show_internal";
			ERDProcessor.SHOW_REFERENCED_PARAM = "show_referenced";
			ERDProcessor.SHOW_REFERENCED_BY_PARAM = "show_referenced_by";
			ERDProcessor.SHOW_EXTENDED_PARAM = "show_extended";
			ERDProcessor.SHOW_EXTENDED_BY_PARAM = "show_extended_by";
			ERDProcessor.PRINT_VIEW_PARAM = "print_view";
			ERDProcessor.COLOR_DATA = "color";
			ERDProcessor.TABLE_EXPANSION_PARAM = "table_expansion";
			ERDProcessor.TABLE_NAME_DATA = "table_name";
			ERDProcessor.TABLE_DISPLAY_NAME_DATA = "table_display_name";
			ERDProcessor.COLUMN_DATA_TABLE_PREFIX = "columns_table_";
			ERDProcessor.COLUMN_DATA_TABLE_NAME_PREFIX = "columns_table_name_";
			ERDProcessor.COLUMN_DATA_PREFIX = "columns_";
			ERDProcessor.CAN_EXPAND_DATA = "can_expand";
			ERDProcessor.CAN_COLLAPSE_DATA = "can_collapse";
			ERDProcessor.REL_EXPANDED_EXTENDS = "expanded_extends";
			ERDProcessor.REL_EXPANDED_EXTENDED_BY = "expanded_extended_by";
			ERDProcessor.SOURCE_ATTR = "source";
			ERDProcessor.TARGET_ATTR = "target";
			ERDProcessor.REL_EXTENDS = "extends";
			ERDProcessor.REL_EXTENDEDBY = "extendedby";
			ERDProcessor.REL_REFERENCES = "references";
			ERDProcessor.REL_REFERENCEDBY = "referencedby";
			ERDProcessor.COLOR_TABLE = "lightblue";
			ERDProcessor.COLOR_TABLE_SELECTED = "gold";
			ERDProcessor.COLOR_COLUMN_LOCAL = "black";
			ERDProcessor.COLOR_COLUMN_INHERITED = "green";

			ERDProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
				// Initializes the graphml object
				_initialize: function () {
					this.graphml = new GlideDiagram();

				},

				// Returns the table display name for the specified table identifier.
				_getTableName: function (table) {
					if (this.tableNameMap[table] == null) {
						var td = GlideTableDescriptor.get(table);
						this.tableNameMap[table] = td.getLabel();
					}
					return this.tableNameMap[table];
				},

				// Returns the column display name for the specified table and column identifier.
				_getColumnName: function (table, column) {
					var td = GlideTableDescriptor.get(table);
					return td.getElementDescriptor(column).getLabel();
				},

				// Returns the base table for the specified table (the table that the specified table extends).
				// Returns an empty string if there is no base table.
				_getBaseTable: function (table) {
					if (this.baseTableMap[table] == null) {
						this.baseTableMap[table] = "";
						var baseTable = GlideDBObjectManager.get().getBase(table);
						if (baseTable != null && baseTable != table) {
							this.baseTableMap[table] = baseTable;
						}
					}
					return this.baseTableMap[table];
				},

				// Recursive function that starts from the specified table and works upwards through base tables (each
				// table the specified table extends) to retrieve the details of all columns and inherited columns.
				// The columnsByTable map is populated using each table identifier as a key.
				// Each entry if the columnsByTable map is a map where the columns for that table are stored using the column identifier as a key.
				// The tableOrder array stores the table names in their inheritance order. The columns map stores all the columns found and insures that
				// no duplicate columns are returned (for example sys_id is contained in all tables).
				_getColumnDetails: function (table, columns, columnsByTable, tableOrder, isBaseColumn) {
					if (!table || table == null) {
						return;
					}
					tableOrder.push(table);
					var baseTable = this._getBaseTable(table);
					if (baseTable != "") {
						this._getColumnDetails(baseTable, columns, columnsByTable, tableOrder, true);
					}
					if (this.columnStore[table] == null) {
						this.columnStore[table] = {};
						var td = GlideTableDescriptor.get(table);
						var iterator = td.getSchemaList().iterator();
						while (iterator.hasNext()) {
							var current = iterator.next();
							var internalName = '' + current.getName();
							var internalType = '' + current.getInternalType();
							if (this.columnStore[table][internalName] == null) {
								var column = new ColumnDetails();
								var referenceName = '';
								if (internalType == "reference") {
									referenceName = this._getTableName('' + current.getReference());
								}
								column.setValues('' + current.getReference(),
										internalName,
										current.getLabel(),
										table,
										internalType,
										this._getTypeName(internalType),
										false,
										referenceName,
										current.getUniqueID());
								this.columnStore[table][internalName] = column;
							}
						}
					}
					for (var internalName in this.columnStore[table]) {
						if (columns[internalName] == null) {
							if (columnsByTable[table] == null) {
								columnsByTable[table] = {};
							}
							columns[internalName] = this.columnStore[table][internalName].clone(isBaseColumn);
							columnsByTable[table][internalName] = columns[internalName];
						}
					}
				},

				// Returns an array of the tables that extend the specified table. Returns an empty array if none are found.
				_getChildTables: function (table) {
					var childTables = [];
					var iterator = GlideDBObjectManager.get().getTableExtensions(table).iterator();
					while (iterator.hasNext()) {
						var current = iterator.next();
						if (this._getBaseTable(current) == table) {
							childTables.push(current);
						}
					}
					return childTables;
				},

				// Returns the display name for a column type. If no display name is found it will return the internal type.
				//TODO: There is no way to get this information from the helper classes - perhaps some method could be added in future.
				_getTypeName: function (internalType) {
					if (this.typeNameMap[internalType] == null) {
						var gr = new GlideRecord("sys_glide_object");
						gr.addQuery('name', internalType);
						gr.query();
						if (gr.next() && gr.label != null && typeof gr.label != "undefined" && gr.label != "") {
							this.typeNameMap[internalType] = gr.label;
						}
						else {
							this.typeNameMap[internalType] = internalType;
						}
					}
					return this.typeNameMap[internalType];
				},

				// Returns an array of the tables that contain a column that references the specified table. Returns an empty array if none are found.
				// TODO: There seems to be no way of using the helper classes to get this information quickly - perhaps some method could be added in future.
				_getReferencingTables: function (table) {
					var referencingTables = [];
					var gr = new GlideAggregate('sys_dictionary');
					gr.addQuery('reference', table);
					gr.addAggregate('count');
					gr.orderByAggregate('count');
					gr.groupBy('name');
					gr.query();
					while (gr.next()) {
						referencingTables.push('' + gr.name);
					}
					return referencingTables;
				},

				// Iterates through the specified columns, sorting alphabetically if specified, and generates the markup.
				_getColumnsMarkup: function (columns) {
					var markup = "";
					var columnNames = [];
					var columnsByNameMap = {};
					for (var internalName in columns) {
						var currentColumn = columns[internalName];
						var columnName = currentColumn.name;
						columnNames.push(columnName);
						if (columnsByNameMap[columnName] == null) {
							columnsByNameMap[columnName] = [];
						}
						columnsByNameMap[columnName].push(currentColumn);
					}
					columnNames.sort();
					for (var i = 0; i < columnNames.length; i++) {
						var currentColumns = columnsByNameMap[columnNames[i]];
						for (var j = 0; j < currentColumns.length; j++) {
							markup += this._getColumnMarkup(currentColumns[j]);
						}
					}
					return markup;
				},

				_getColumnMarkup: function (column) {
					var color = ERDProcessor.COLOR_COLUMN_LOCAL;
					if (column.isBaseColumn) {
						color = ERDProcessor.COLOR_COLUMN_INHERITED;
					}
					var extraMarkup = "<tr><td colspan='2' class='splitCell'><div class='split'></div></td></tr>";
					if (column.internalType == "reference") {
						return extraMarkup +
								"<tr><td class='dCell' dID='" + column.sysID + "' style='color: " + color + ";'>" +
								column.name + ": " +
								"</td><td class='rCell' rTable='" + column.reference + "'>reference to " +
								column.referenceName +
								"</td></tr>";
					}
					else {
						return extraMarkup +
								"<tr style='color: " + color + ";'><td class='dCell' dID='" + column.sysID + "'>" +
								column.name +
								": </td><td class='tCell'>" + column.typeName + "</td></tr>";
					}
				},

				_getRelationshipDescription: function (relationship, parentNode, node) {
					var colSource;
					var colDest;
					if (relationship == ERDProcessor.REL_REFERENCES ||
							relationship == ERDProcessor.REL_EXTENDS ||
							relationship == ERDProcessor.REL_EXPANDED_EXTENDS) {
						colSource = parentNode;
						colDest = node;
					}
					if (relationship == ERDProcessor.REL_REFERENCEDBY ||
							relationship == ERDProcessor.REL_EXTENDEDBY ||
							relationship == ERDProcessor.REL_EXPANDED_EXTENDED_BY) {
						colSource = node;
						colDest = parentNode;
					}
					var markup = "";
					var colSourceTableName = colSource.getData(ERDProcessor.TABLE_NAME_DATA)
					var colDestTableName = colDest.getData(ERDProcessor.TABLE_NAME_DATA)
					var colMap = this.columnStore[colSourceTableName];
					var columns = [];
					if (colMap && (colSourceTableName == this.tableName || colDestTableName == this.tableName)) {
						for (var key in colMap) {
							var col = colMap[key];
							if (col.internalType == "reference" && col.reference == colDestTableName) {
								columns[columns.length] = col.name;
							}
						}
					}
					if (columns.length > 0) {
						var parts = [this._getTableName(colSourceTableName), colSourceTableName];
						for (var j = 0; j < parts.length; j++) {
							if (j == 0) {
								markup += "<span class='relBHL'>" + parts[j] + "</span><br/>";
							}
							else if (j == 1) {
								var table = this._getTableNameFromParts(parts, j);
								markup += "<span class='relBHS'>(" + table + ")</span><br/>";
							}
						}
						for (var j = 0; j < columns.length; j++) {
							markup += "<span class='relRef'>" + columns[j] + "</span><br/>";
						}
						markup += "<br/>";
					}
					if (relationship == ERDProcessor.REL_EXTENDS ||
							relationship == ERDProcessor.REL_EXTENDEDBY ||
							relationship == ERDProcessor.REL_EXPANDED_EXTENDS ||
							relationship == ERDProcessor.REL_EXPANDED_EXTENDED_BY) {
						var parts = [this._getTableName(colSourceTableName),
							colSourceTableName,
							this._getTableName(colDestTableName),
							colDestTableName];
						var tableA = this._getTableNameFromParts(parts, 1);
						var tableB = this._getTableNameFromParts(parts, 3);
						markup += "<span class='relBHL'>" + parts[0] + "</span><br/>" +
								"<span class='relBHS'>(" + tableA + ")</span><br/>" +
								"<span class='relBs'>" + gs.getMessage("extends") + "</span><br/>" +
								"<span class='relBHL'>" + parts[2] + "</span><br/>" +
								"<span class='relBHS'>(" + tableB + ")</span><br/>";
					}
					return markup;
				},

				_getTableNameFromParts: function (parts, index) {
					var table = parts[index];
					if (table.startsWith("var__m_")) {
						table = parts[index - 1];
					}
					return table;
				},

				// Creates a diagram edge to indicate a relationship between two table nodes.
				// If a relationship between the two tables exists then a new one is not created.
				// Each table node is updated with the type relationship that it has.
				_createNodeRelationship: function (relationship, parentNode, node) {
					var nodeTableName = node.getData(ERDProcessor.TABLE_NAME_DATA);
					var parentNodeTableName = parentNode.getData(ERDProcessor.TABLE_NAME_DATA);
					node.setData(relationship, "true");
					if (nodeTableName == parentNodeTableName) {
						return;
					}
					var description = this._getRelationshipDescription(relationship, parentNode, node);
					if (this.relationshipMap[nodeTableName] != null && this.relationshipMap[nodeTableName][parentNodeTableName] != null) {
						if (description.length > 0) {
							var nameData = this.relationshipMap[nodeTableName][parentNodeTableName].getData("name");
							if (nameData) {
								if (nameData.indexOf(description) == -1) {
									this.relationshipMap[nodeTableName][parentNodeTableName].setData("name", nameData + description);
								}
							} else {
								this.relationshipMap[nodeTableName][parentNodeTableName].setData("name", description);
							}
						}
						return;
					}
					var edge;
					if (relationship == ERDProcessor.REL_EXPANDED_EXTENDED_BY ||
							relationship == ERDProcessor.REL_EXTENDEDBY ||
							relationship == ERDProcessor.REL_REFERENCEDBY) {
						edge = this._newEdge(node, parentNode);
					}
					else {
						edge = this._newEdge(parentNode, node);
					}
					edge.setData("name", description);
					this._addToRelationshipMap(nodeTableName, parentNodeTableName, edge);
					this._addToRelationshipMap(parentNodeTableName, nodeTableName, edge);
				},

				_addToRelationshipMap: function (nameA, nameB, edge) {
					if (this.relationshipMap[nameA] == null) {
						this.relationshipMap[nameA] = {};
					}
					this.relationshipMap[nameA][nameB] = edge;
				},

				// Creates a table node. Retrieves the column details. Generates the display markup. And generates the relationship diagram edge.
				_createTableNode: function (name, table, parentNode, relationship, tableColor) {
					var description = "";
					var columns = {};
					var columnsByTable = {};
					var tableOrder = [];
					var newNode = this._newNode(table, name, '', tableColor);
					newNode.setData(ERDProcessor.TABLE_NAME_DATA, table);
					newNode.setData(ERDProcessor.TABLE_DISPLAY_NAME_DATA, name);
					this._getColumnDetails(table, columns, columnsByTable, tableOrder, false);
					var columnData = "";
					var counter = 0;
					for (var i = 0; i < tableOrder.length; i++) {
						var currentTable = tableOrder[i];
						var columnsMarkup = this._getColumnsMarkup(columnsByTable[currentTable]);
						if (columnsMarkup.length > 0) {
							newNode.setData(ERDProcessor.COLUMN_DATA_TABLE_PREFIX + counter, currentTable);
							newNode.setData(ERDProcessor.COLUMN_DATA_TABLE_NAME_PREFIX + counter, this._getTableName(currentTable));
							newNode.setData(ERDProcessor.COLUMN_DATA_PREFIX + counter, columnsMarkup);
							counter++;
						}
					}
					this.nodeMap[table] = newNode;
					newNode.setData(ERDProcessor.CAN_COLLAPSE_DATA, "false");
					newNode.setData(ERDProcessor.CAN_EXPAND_DATA, "false");
					return columns;
				},

				// Generates the diagram for the selected table, and optionally (as specified by url parameters) will follow inheritance and references.
				_processTable: function (table, currentLevel, parentNode, relationship, tableColor, isSelectedHierearchy) {
					if (!table || table == null) {
						return;
					}
					var td = GlideTableDescriptor.get(table);
					if (td != null && td.canRead()) {
						var name = this._getTableName(table);
						var cont = false;
						var columns;
						if (!this.nodeMap[table] || this.nodeMap[table] == null) {
							columns = this._createTableNode(name, table, parentNode, relationship, tableColor);
							cont = true;
						}
						if (parentNode != null) {
							var rel = relationship;
							if (rel == ERDProcessor.REL_EXTENDS && !isSelectedHierearchy) {
								rel = ERDProcessor.REL_EXPANDED_EXTENDS;
							}
							if (rel == ERDProcessor.REL_EXTENDEDBY && !isSelectedHierearchy) {
								rel = ERDProcessor.REL_EXPANDED_EXTENDED_BY;
							}
							this._createNodeRelationship(rel, parentNode, this.nodeMap[table]);
						}
						var newNode = this.nodeMap[table];
						var baseTable = this._getBaseTable(table);
						var childTables = this._getChildTables(table);
						if (this.tableName != table) {
							if (this.tableExpansion.indexOf("|" + table + "|") > -1) {
								newNode.setData(ERDProcessor.CAN_COLLAPSE_DATA, "true");
							}
							else if ((baseTable != "" && !isSelectedHierearchy) || childTables.length > 0) {
								newNode.setData(ERDProcessor.CAN_EXPAND_DATA, "true");
							}
						}

						if (!cont) {
							return;
						}
						var expandOK = (currentLevel == 1 || this.tableExpansion.indexOf("|" + table + "|") > -1);
						if ((expandOK || relationship == ERDProcessor.REL_EXTENDS) &&
								baseTable != "" && this.tableName != baseTable &&
								this.showExtended == "true") {
							this._processTable(baseTable,
									currentLevel + 1,
									newNode,
									ERDProcessor.REL_EXTENDS,
									ERDProcessor.COLOR_TABLE, isSelectedHierearchy);
						}
						if (expandOK &&
								this.showExtendedBy == "true") {
							for (var i = 0; i < childTables.length; i++) {
								if (this.tableName != childTables[i]) {
									this._processTable(childTables[i],
											currentLevel + 1,
											newNode,
											ERDProcessor.REL_EXTENDEDBY,
											ERDProcessor.COLOR_TABLE, currentLevel == 1);
								}
							}
						}
						if (currentLevel == 1) {
							if (this.showReferencedBy == "true") {
								var referencingTables = this._getReferencingTables(table);
								for (var i = 0; i < referencingTables.length; i++) {
									this._processTable(referencingTables[i],
											currentLevel + 1,
											newNode,
											ERDProcessor.REL_REFERENCEDBY,
											ERDProcessor.COLOR_TABLE, false);
								}
							}
							if (this.showReferenced == "true") {
								for (var internalName in columns) {
									var currentColumn = columns[internalName];
									if (currentColumn.internalType == "reference" &&
											currentColumn.reference != null &&
											currentColumn.reference.length > 0) {
										this._processTable(currentColumn.reference,
												currentLevel + 1,
												newNode,
												ERDProcessor.REL_REFERENCES,
												ERDProcessor.COLOR_TABLE, false);
									}
								}
							}
						}
					}
				},

				// The entry point. Initialises variables and parses url parameters for diagram generation. Generates the diagram.
				// Creates diagram actions. Returns the GraphML markup.
				process: function () {
					this.typeNameMap = {};
					this.columnStore = {};
					this.baseTableMap = {};
					this.tableNameMap = {};
					this.nodeMap = {};
					this.relationshipMap = {};
					this._initialize();
					this._getParams();
					if (this.tableName)
					// Secure at the outset.  Use personalize_dictionary role for simplicity
					{
						if (!gs.hasRole('personalize_dictionary')) {
							return;
						}
					}

					this._processTable(this.tableName,
							1,
							null,
							"",
							ERDProcessor.COLOR_TABLE_SELECTED, true);
					this.graphml.saveToXml(this.getDocument(), this.getRootElement());
				},

				// Retrieves any passed url parameters.
				_getParams: function () {
					this.tableName = this.getParameter(ERDProcessor.TABLE_PARAM);
					this.tableHistory = this.getParameter(ERDProcessor.TABLE_HISTORY_PARAM);
					this.tableExpansion = this.getParameter(ERDProcessor.TABLE_EXPANSION_PARAM);
					this.showInternal = this.getParameter(ERDProcessor.SHOW_INTERNAL_PARAM);
					this.showReferenced = this.getParameter(ERDProcessor.SHOW_REFERENCED_PARAM);
					this.showReferencedBy = this.getParameter(ERDProcessor.SHOW_REFERENCED_BY_PARAM);
					this.showExtended = this.getParameter(ERDProcessor.SHOW_EXTENDED_PARAM);
					this.showExtendedBy = this.getParameter(ERDProcessor.SHOW_EXTENDED_BY_PARAM);
					this.printView = this.getParameter(ERDProcessor.PRINT_VIEW_PARAM);
					var graph = this.graphml.getGraph();
					graph.setData("name", this.tableName);
					graph.setID(this.tableName);
					if (this.tableHistory) {
						this.tableHistory = this.tableHistory + "|" + this.tableName;
					}
					else {
						this.tableHistory = this.tableName;
					}
					if (!this.showInternal || this.showInternal == "") {
						this.showInternal = "false";
					}
				},

				// Constructs a diagram node.
				_newNode: function (table, name, description, color) {
					var node = this.graphml.getNode(table);
					if (node == null) {
						node = new GlideDiagramNode();
						node.setID(table);
						node.setName(name);
						node.setDescription(description);
						node.setColor(color);
						this.graphml.addNode(node);
					}
					return node;
				},

				// Constructs a diagram edge.
				_newEdge: function (source, target) {
					var edge = new GlideDiagramEdge();
					edge.setID(source.getID() + "__to__" + target.getID());
					edge.setAttribute(ERDProcessor.SOURCE_ATTR, source.getID());
					edge.setAttribute(ERDProcessor.TARGET_ATTR, target.getID());
					this.graphml.addEdge(edge);
					return edge;
				},

				// Constructs a diagram action.
				_addAction: function (id, name, order, type, icon, condition, script) {
					var action = new GlideDiagramAction();
					action.setID(id);
					action.setName(name);
					action.setAttribute("order", order);
					action.setType(type);
					action.setIcon(icon);
					action.setCondition(condition);
					if (script) {
						action.setScript(script);
					}
					this.graphml.addAction(action);
				},

				// Constructs a diagram error node.
				_errorNode: function (message) {
					var node = new GlideDiagramNode();
					node.setID("ERROR_NODE");
					node.setName("Error");
					node.setDescription(message);
					node.setData(ERDProcessor.COLOR_DATA, "tomato");
					this.graphml.addNode(node);
					this.graphml.saveToXml(this.getDocument(), this.getRootElement());
				},

				type: 'ERDProcessor'
			});
			