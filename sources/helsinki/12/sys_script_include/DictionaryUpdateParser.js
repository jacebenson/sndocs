/**
 * var parser = new DictionaryUpdateParser("stateINloaded,previewed");
 * var dictionary = parser.parse(true);
 */
var DictionaryUpdateParser = Class.create();

DictionaryUpdateParser.prototype = {
	fQuery:"",
	
	/**
 	* Create a new DictionaryUpdateParser
 	* @param remoteUpdateSetQuery optional query against sys_remote_update_set.  Defaults to "state=previewed".
 	*/
	initialize:function (remoteUpdateSetQuery) {
		this.fQuery = remoteUpdateSetQuery;
		gs.print("Loading from update sets matching " + this.fQuery);
	},
	
	/**
 	* Read and parse payloads from relevant update sets and return a map of table objects of the form:
 	* {table1:
 	* 		{name: 'table1', parent: parenttable, columns: {'col1', 'col2'}, children: {child1: table, child2: table...}},
 	* 		...
 	* 	}
 	* @param dump if true, print out the contents of the dictionary object
 	* @return {*} parsed dictionary object
 	*/
	parse:function (dump) {
		var setIds = this.fetchRemoteUpdateSetIds();
		var dictionary = this.loadFromUpdates(setIds);
		
		if (dump) {
			for (var key in dictionary) {
				var t = dictionary[key];
				this.dumpTable(t, "Table ");
			}
		}
		
		return dictionary;
	},
	
	dumpTable:function (table, prefix) {
		if (table == undefined) {
			return;
		}
		
		if (prefix == undefined) {
			prefix = "";
		}
		
		gs.print(prefix + table.name);
		if (table.parent != undefined) {
			gs.print("with columns " + this.dumpKeys(table.columns));
			this.dumpTable(table.parent, "extends ");
		} else {
			gs.print("with columns " + this.dumpKeys(table.columns) + "\n");
		}
	},
	
	fetchRemoteUpdateSetIds:function () {
		var gr = new GlideRecord("sys_remote_update_set");
		gr.addEncodedQuery(this.fQuery);
		gr.query();
		var ids = [];
		while (gr.next()) {
			ids.push(gr.getUniqueValue());
		}
		return ids;
	},
	
	loadFromUpdates:function (setIds) {
		var tableMap = {};
		
		var update = new GlideRecord('sys_update_xml');
		update.initialize();
		if (setIds != null) {
			update.addQuery("remote_update_set", "IN", setIds);
		}
		update.addQuery("type", ["Dictionary", "Database field(s)", "Table"]);
		update.query();
		
		while (update.next()) {
			var type = update.type;
			var payload = update.payload;
			var table;
			if (type == "Dictionary") {
				var tableName = this.parseAttribute(payload, "table");
				var columnName = this.parseAttribute(payload, "element");
				table = tableMap[tableName];
				if (table == null) {
					// Found a new table
					table = this.createTable(tableName);
					tableMap[table.name] = table;
				}
				// Add found column to the table if a field update
				if(GlideStringUtil.notNil(columnName)) {
					table.columns[columnName] = {name: columnName, remoteUpdateSet: update.remote_update_set.toString(), updateId: update.sys_id.toString()};
				}
			} else if (type == "Table") {
				var tableName = this.parseElement(payload, "name");
				table = tableMap[tableName];
				if (table == null) {
					// Found a new table
					table = this.createTable(tableName);
					tableMap[table.name] = table;
				}
				
				// Find/create the parent table as well.
				var parentName = this.parseElementAttribute(payload, "super_class", "name");
				if (parentName != null) {
					var parent = tableMap[parentName];
					if (parent == null) {
						parent = this.createTable(parentName);
						tableMap[parent.name] = parent;
					}
					
					//Set parent in table
					table.parent = parent;
					//Add table to parent's children as well
					parent.children[table.name] = table;
				}
			} else if (type == "Database field(s)") {
				var parsedTable = this.parseTable(payload);
				table = tableMap[parsedTable.name];
				if (table == null) {
					// Found a new table
					table = parsedTable;
					tableMap[table.name] = table;
				} else {
					// Add/merge parsed columns to existing table
					for (col in parsedTable.columns) {
						table.columns[col] = {name: col, remoteUpdateSet: update.remote_update_set.toString(), updateId: update.sys_id.toString()};
					}
				}
				
				// Find/create the parent table as well.
				var parentName = this.parseAttribute(payload, "extends");
				if (parentName != null) {
					var parent = tableMap[parentName];
					if (parent == null) {
						parent = this.createTable(parentName);
						tableMap[parent.name] = parent;
					}
					
					//Set parent in table
					table.parent = parent;
					//Add table to parent's children as well
					parent.children[table.name] = table;
				}
			}
		}
		
		return tableMap;
	},
	
	dumpKeys:function (obj) {
		var str = "";
		for (key in obj) {
			if (str != "") {
				str += ", ";
			}
			
			str += key;
		}
		
		return str;
	},
	
	parseAttribute:function (payload, name) {
		var token = name + "=\"";
		var n = payload.indexOf(token);
		if (n === -1) {
			return null;
		}
		
		var m = payload.indexOf("\"", n + token.length);
		var value = payload.substring(n + token.length, m);
		return value;
	},
	
	parseElement:function (payload, elementName) {
		var token = "</" + elementName + ">";
		var n = payload.indexOf(token);
		if (n === -1) {
			return null;
		}
		
		var prefix = payload.substring(0, n);
		var start = prefix.lastIndexOf(">");
		if(start === -1) {
			return null;
		}
		var value = payload.substring(start + 1, n);
		return value;
	},
	
	parseElementAttribute:function (payload, elementName, attrName) {
		var token = "</" + elementName + ">";
		var n = payload.indexOf(token);
		if (n === -1) {
			return null;
		}
		
		var prefix = payload.substring(0, n);
		token = "<" + elementName;
		var start = prefix.indexOf(token);
		if(start === -1) {
			return null;
		}
		var p = payload.substring(start, n);
		return this.parseAttribute(p, attrName);
	},	
	
	createTable:function (tableName) {
		return {name:tableName, children:{}, columns:{}};
	},
	
	parseTable:function (payload) {
		var token = "name=\"";
		
		// Find table name first.
		var n = payload.indexOf(token);
		if (n == -1) {
			// Should never happen.  Means a corrupt payload.
			return null;
		}
		
		var m = payload.indexOf("\"", n + token.length);
		var tableName = payload.substring(n + token.length, m);
		
		var table = this.createTable(tableName);
		
		// Now grab the elements (columns)
		while (n != -1) {
			n = payload.indexOf(token, m);
			if (n == -1) {
				break;
			}
			
			var m = payload.indexOf("\"", n + token.length);
			var value = payload.substring(n + token.length, m);
			table.columns[value] = value;
		}
		
		return table;
	},
	
	
	type:"DictionaryUpdateParser"
};