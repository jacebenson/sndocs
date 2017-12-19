var LiveFeedCommon = Class.create();
LiveFeedCommon.prototype = {
	// columns
	NAME: "name",
	SYS_DOMAIN: "sys_domain",
	SYS_CREATED_ON: "sys_created_on",
	SYS_ID: "sys_id",
	SYS_UPDATED_ON: "sys_updated_on",
	STATUS: "status",
	
	// operators
	CONTAINS: "CONTAINS",
	EQUALS: "=",
	IN: "IN",
	
	// constants
	DEFAULT_QUERY_LIMIT: 25,
	MAX_QUERY_LIMIT: 200,
	
	// other
	COUNT: "COUNT",
	DESC: 'desc',
	ORDER_BY: "order__by",
	QUERY_LIMIT: "query__limit",
	TEXTQUERY: "term",
	
	//DEFAULT_PROFILE_USER: "images/profile/buddy_default.pngx",
	LIVE_PROFILE: "live_profile",
	IMAGE: "image",
	PHOTO: "photo",
	PROFILE_MODE_BASIC: "BASIC",
	PROFILE_MODE_STATS: "STATS",
	PROFILE_MODE_FULL: "FULL",
	
	
	OPERATOR_EXPRESSION: [
			{wildcardExp: /^\*(.*)/, operator: 'CONTAINS', toExpression: function(filter){ return (filter === '*' ? filter : '*' + filter); }},
			{wildcardExp: /^\.(.*)/, operator: 'CONTAINS', toExpression: function(filter){ return '.' + filter; }},
			{wildcardExp: /^%(.*)/, operator: 'ENDSWITH', toExpression: function(filter){ return (filter === '%' ? filter : '%' + filter); }},
			{wildcardExp: /(.*)%$/, operator: 'STARTSWITH', toExpression: function(filter){ return filter + '%'; }},
			{wildcardExp: /^=(.*)/, operator: '=', toExpression: function(filter){ return (filter === '=' ? filter : '=' + filter); }},
			{wildcardExp: /^!=(.*)/, operator: '!=', toExpression: function(filter){ return (filter === '!=' || filter === '!' ? filter : '!=' + filter); }},
			{wildcardExp: /^!\*(.*)/, operator: 'DOES NOT CONTAIN', toExpression: function(filter){ return (filter === '!*' || filter === '!' ? filter : '!*' + filter); }},
			{wildcardExp: /(.*)/, operator: 'STARTSWITH', toExpression: function(filter){ return filter; }}
		],
	
	initialize: function() {
	},
	
	addQueryParam: function(gr, field, param) {
		if(!param)
			return;
		gr.addQuery(field, param);
	},
	
	addBooleanQueryParam: function(gr, field, param) {
		if(typeof param === 'undefined')
			return;
		gr.addQuery(field,param);
	},
	
	setOrderBy: function(gr,params,defaultOrder) {
		var orderBy = defaultOrder;
		if(this.ORDER_BY in params) {
			if("string" == typeof params[this.ORDER_BY])
				orderBy = [params[this.ORDER_BY]];
			else
				orderBy = params[this.ORDER_BY];
		}
		for(var i=0;i<orderBy.length;i++) {
			var order = orderBy[i];
			if("string" == typeof order)
				gr.orderBy(order);
			else {
				if(order[1] == this.DESC)
					gr.orderByDesc(order[0]);
				else
					gr.orderBy(order[0]);
			}
		}
	},
	
	defaultQueryLimit: function(params) {
		if(typeof params[this.QUERY_LIMIT] == 'undefined')
			params[this.QUERY_LIMIT] = this.DEFAULT_QUERY_LIMIT;
	},
	
	setLimit: function(gr, params) {
		if(!params[this.QUERY_LIMIT])
			return;
		if(params[this.QUERY_LIMIT] > this.MAX_QUERY_LIMIT)
			params[this.QUERY_LIMIT] = this.MAX_QUERY_LIMIT;
		gr.setLimit(params[this.QUERY_LIMIT]+1);
	},
	
	listJSON: function(gr, elementJSONF, params) {
		var json = [];
		for(var i=0;i<params[this.QUERY_LIMIT] && gr.next();i++) {
			var eJSON = elementJSONF(gr);
			json.push(eJSON);
		}
		return json;
	},
	
	listToHashJSON: function(ljson) {
		var hjson = {};
		for(var i=0;i<ljson.length;i++) {
			hjson[ljson[i].sys_id] = ljson[i];
		}
		return hjson;
	},
	
	idvalue: function(gr, field) {
		return { id: gr.getValue(field) , name : gr.getDisplayValue(field) };
	},
	
	choicevalue: function(gr, field) {
		var ge = gr.getElement(field);
		return { id: ge.toString(), name: gr.getDisplayValue(field) };
	},

	getImages: function(profiles) {
		var images = {};
		var liveFeedApi = new SNC.LiveFeedApi();
		for(var i=0; i<profiles.length; i++) {
			var user = liveFeedApi.getProfileDetails(profiles[i], this.PROFILE_MODE_BASIC);
			user = new JSON().decode(user);
			images[profiles[i]] = user.user_image;
		}
		return images;
	},

	getMemberDetails: function(profiles) {
		var gr = new GlideRecord(this.LIVE_PROFILE);
		this.addQueryParam(gr, this.SYS_ID, profiles);
		gr.queryNoDomain();
		var details = {};
		var liveFeedApi = new SNC.LiveFeedApi();
		while(gr.next()) {
			var user = liveFeedApi.getProfileDetails(gr.sys_id,this.PROFILE_MODE_BASIC);
			user = new JSON().decode(user);
			if(!user.cross_domain_data && (gr.sys_id == user.sys_id)) {
				details[gr.sys_id] = {
					name: gr.getValue(this.NAME),
					status: gr.getValue(this.STATUS),
					image: user.user_image
				};
			}
			else {
				//User is out of domain
				details[gr.sys_id]= {
					name: gr.getValue(this.NAME),
					status: "",
					image: ""
				};
			}
		}
		return details;
	},

	toBoolean: function(value) {
		if(value === 'true')
			return true;
		if(value === 'false')
			return false;
		if(value === 1)
			return true;
		if(value === 0)
			return false;
		return value == true;
	},

	parseTerm: function(val, defaultOperator) {
		var parsedValue = {filterText: val, operator: ""};

		parsedValue.operator = defaultOperator || "STARTSWITH";

		for (var i = 0; i < this.OPERATOR_EXPRESSION.length; i++) {
			var operatorItem = this.OPERATOR_EXPRESSION[i];
			var match = val.match(operatorItem.wildcardExp);
			if (match && match[1] !== ""){
				parsedValue.operator = operatorItem.operator;
				parsedValue.filterText = match[1];
				break;
			}
		}

		return parsedValue;
	},
	
	addExpressionQuery: function(gr, field, params) {
		var filteredExpression = '';
		if(params.search_mode)
			filteredExpression = this.parseTerm('*' + params[this.TEXTQUERY]);
		else
			filteredExpression = this.parseTerm(params[this.TEXTQUERY]);
		return gr.addQuery(field, filteredExpression.operator, filteredExpression.filterText);
	},
	
	addExpressionOrCondition: function(qc, field, params) {
		var filteredExpression = '';
		if(params.search_mode)
			filteredExpression = this.parseTerm('*' + params[this.TEXTQUERY]);
		else
			filteredExpression = this.parseTerm(params[this.TEXTQUERY]);
		return qc.addOrCondition(field, filteredExpression.operator, filteredExpression.filterText);
	},
	
	addExpressionCondition: function(qc, field, params) {
		var filteredExpression = '';
		if(params.search_mode)
			filteredExpression = this.parseTerm('*' + params[this.TEXTQUERY]);
		else
			filteredExpression = this.parseTerm(params[this.TEXTQUERY]);
		return qc.addCondition(field, filteredExpression.operator, filteredExpression.filterText);
	},

	addCondition: function(qc, field, param) {
		if(typeof param === 'undefined')
			return;
		if (param instanceof Array)
			qc.addCondition(field, this.IN, param.join());
		else
			qc.addCondition(field, param);
	},

	type: 'LiveFeedCommon'
};