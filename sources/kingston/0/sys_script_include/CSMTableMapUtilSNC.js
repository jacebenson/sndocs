var CSMTableMapUtilSNC = Class.create();
CSMTableMapUtilSNC.prototype = {
	/*
 	* Initialize the class with source gliderecord object
 	*/
	map_table : "csm_table_map",
	field_map_table : "csm_field_map",

	initialize: function(source) {
		this.source = source;
		this.map = [];
		this.meta = false;
	},

	/*
 	* Function to find the relevant mapping by providing the CSM table map definition sys_id
 	* @params: CSM Table Map definition sys_id
 	* @return: boolean
 	*
 	*/
	findMapByID:function(mapID){
		if(mapID){
			var map = new GlideRecord(this.map_table);
			map.addQuery("sys_id",mapID);
			map.addActiveQuery();
			map.query();

			return this._getMap(map);
		}
		return false;
	},

	/*
 	* Function to find the relevant mapping by providing the CSM table map definition api name
 	* @params: CSM Table Map definition api_name
 	* @return: boolean
 	*
 	*/
	findMapByName:function(name){
		if(name){
			var map = new GlideRecord(this.map_table);
			map.addQuery("api_name",name);
			map.addActiveQuery();
			map.query();

			return this._getMap(map);
		}
		return false;
	},

	/*
 	* Function to find the relevant mapping from the CSM table map definitions by target table name
 	* @params: Target table name
 	* @return: boolean
 	*/
	findMapByTarget:function(target,limit){

		var map = new GlideRecord(this.map_table);
		map.addActiveQuery();
		map.addQuery("source_table",this.source.getTableName());
		if(target)
			map.addQuery("target_table",target);
		map.orderByDesc("order");
		map.query();

		return this._getMap(map,limit);

	},

	/*
 	* Function to find all the mappings related to source table
 	* @return: boolean
 	*
 	*/
	findMap:function(limit){
		return this.findMapByTarget(false,limit);
	},

	/*
 	* Function to add meta data along with the output
 	*/
	addMetaData:function(){
		this.meta = true;
	},

	/*
 	* Private function to get mapping
 	* @params: CSM Table Map definition gliderecord object
 	* @return: boolean
 	*/
	_getMap:function(map,limit){
		var result = false;
		var count = 0;
		while(map.next()){
			if(this._evaluateMapConditions(map)){
				result = true;
				count++;
				if(limit && limit == count)
					break;
			}
		}

		return result;
	},

	/*
 	* Private function to evaluate mapping conditions
 	* @params: CSM Table Map definition gliderecord object
 	* @return: boolean
 	*/
	_evaluateMapConditions:function(map){
		var result = false;
		var noCondition = false;
		if(map.use_advanced_condition){
			if(!JSUtil.nil(map.advanced_condition)){
				try{
					var evaluator = new GlideScopedEvaluator();
					evaluator.putVariable("source", this.source);
					evaluator.putVariable("answer", null);
					var scriptResult = evaluator.evaluateScript(map,"advanced_condition",null);
					var answer = evaluator.getVariable("answer");

					if ((scriptResult && scriptResult == true) || (answer && answer == true)){
						this.map.push(map.sys_id+'');
						result = true;
					}
				}catch(e){
					gs.error("ERROR while evaluating advanced condition script for : "+ map.sys_id +" : "+e,"EntityTransformUtil");
				}
			}else{
				noCondition = true;
			}
		}else if(map.conditions){
			var rec = this.source;
			rec.addEncodedQuery(map.conditions);
			rec.query();
			if(rec.hasNext()){
				this.map.push(map.sys_id+'');
				result = true;
			}
		}else{
			noCondition = true;
		}

		if(noCondition){
			this.map.push(map.sys_id+'');
			result = true;
		}

		return result;
	},

	/*
 	* Function to create a direct target url for new record creation with all mappings as parameters
 	* @return: target url
 	*/
	getTargetURL : function(){
		var output = [];
		if(this.source && this.map && this.map.length){
			var map = new GlideRecord(this.map_table);
			map.addQuery('sys_id','IN',this.map.join());
			map.query();
			while(map.next()){
				var result = this._processMap(map);
				if(result){
					var targetURL = "/"+map.target_table+".do?sys_id=-1";
					var params = "";
					var notFirst = false;
					for (var item in result) {
						if(!result.hasOwnProperty(item)) continue;
						if(notFirst) params = params + '^';

						params =  params + item + "=" + encodeURIComponent(result[item]);
						notFirst = true;
					}

					if(params)
						targetURL =  targetURL + "&sysparm_query=" + params;

					if(this.meta){
						var obj = {};
						obj.data = targetURL;

						obj.meta = {};
						obj.meta.name = map.mapping_name+'';
						obj.meta.target = map.target_table+'';
						obj.meta.order = map.order+'' ? parseInt(map.order+'') : 0;

						output.push(obj);
					}else{
						output.push(targetURL);
					}
				}
			}
		}
		return output;
	},

	/*
	 * Function to create an encoded query with all mappings which can used in target URL creation
 	 * @return: mapping as encoded query
 	 */
	getTargetQuery : function(){
		var output = [];
		if(this.source && this.map && this.map.length){
			var map = new GlideRecord(this.map_table);
			map.addQuery('sys_id','IN',this.map.join());
			map.query();
			while(map.next()){
				var result = this._processMap(map);
				var targetQuery = "";
				if(result){
					for (var item in result) {
						if(!result.hasOwnProperty(item)) continue;
						if(targetQuery) targetQuery = targetQuery + '^';
						targetQuery =  targetQuery + item + "=" + result[item];
					}

					if(targetQuery){
						if(this.meta){
							var obj = {};
							obj.data = targetQuery;

							obj.meta = {};
							obj.meta.name = map.mapping_name+'';
							obj.meta.target = map.target_table+'';
							obj.meta.order = map.order+'' ? parseInt(map.order+'') : 0;

							output.push(obj);
						}else{
							output.push(targetQuery);
						}
					}
				}
			}
		}
		return output;
	},

	/*
 	 * Function to a generate JSON data with all associated mappings.
 	 * @return: target mappings as JSON
 	 */
	getTargetJSON : function(){
		var output = [];
		if(this.source && this.map && this.map.length){
			var map = new GlideRecord(this.map_table);
			map.addQuery('sys_id','IN',this.map.join());
			map.query();
			while(map.next()){
				var result = this._processMap(map);
				if(result){

					if(this.meta){
						var obj = {};
						obj.data = result;

						obj.meta = {};
						obj.meta.name = map.mapping_name+'';
						obj.meta.target = map.target_table+'';
						obj.meta.order = map.order+'' ? parseInt(map.order+'') : 0;

						output.push(obj);
					}else{
						output.push(result);
					}
				}
			}
		}

		return output;
	},

	/*
 	 * Function to process associated mappings
 	 * @params: CSM Table Map definition gliderecord object
 	 * @return: boolean
 	 */
	_processMap:function(map){
		var result = {};

		if(map && this.source){
			result = this._evaluateFieldMappings(map,result);
			if(map.advanced_field_mapping)
			result = this._evaluateAdvancedMappingScript(map,result);
		}

		return result;
	},

	/*
 	 * Function to evaluate advanced field transform script in CSM Field map.
 	 * @params: CSM Table Map definition gliderecord object, CSM Table Map definition sys_id
 	 * @return: boolean
 	 */
	_evaluateFieldMappings : function(map,result){

		var target = new GlideRecord(map.target_table);
		target.initialize();

		var fieldMap = new GlideRecord(this.field_map_table);
		fieldMap.addQuery("table_map",map.sys_id);
		fieldMap.addActiveQuery();
		fieldMap.orderBy("order");
		fieldMap.query();
		while(fieldMap.next()){
			if(target.isValidField(fieldMap.target_field)){
				try{
					if(fieldMap.advanced){
						if(!JSUtil.nil(fieldMap.transform_script)){
							var evaluator = new GlideScopedEvaluator();
							evaluator.putVariable("source", this.source);
							evaluator.putVariable("answer", "");
							var scriptResult = evaluator.evaluateScript(fieldMap,"transform_script",null);
							var answer = evaluator.getVariable("answer");

							if (!JSUtil.nil(answer) || !JSUtil.nil(scriptResult)){
								result[fieldMap.target_field+''] = answer+'' || scriptResult+'';
							}else{
								result[fieldMap.target_field+''] = "";
							}
						}
					}else if(fieldMap.source_field){
						result[fieldMap.target_field+''] = eval("this.source."+fieldMap.source_field)+'';
					}
				}catch(e){
					gs.error("ERROR while evaluating advanced field script : "+ fieldMap.sys_id +" : for map : "+ map.sys_id +" : "+e,"EntityTransformUtil");
				}
			}
		}
		return result;
	},

	/*
 	 * Function to evaluate advanced mapping script in CSM Table map definition.
 	 * @params: CSM Table Map definition gliderecord object, CSM Table Map definition target object name,
 	 * @return: boolean
 	 */
	_evaluateAdvancedMappingScript : function(map,result){
		try{
			if(!JSUtil.nil(map.mapping_script)){
				var evaluator = new GlideScopedEvaluator();
				evaluator.putVariable("source", this.source);
				evaluator.putVariable("target", result);
				evaluator.evaluateScript(map,"mapping_script",null);
				var scriptResult = evaluator.getVariable("target");

				if (!JSUtil.nil(scriptResult)){
					result = scriptResult;
				}
			}
		}catch(e){
			gs.error("ERROR while evaluating advanced mapping script for : "+ map.sys_id +" : "+e,"EntityTransformUtil");
		}
		return result;
	},

	type: 'CSMTableMapUtilSNC'
};