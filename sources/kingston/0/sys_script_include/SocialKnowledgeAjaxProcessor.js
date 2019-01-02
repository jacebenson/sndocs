var SocialKnowledgeAjaxProcessor = Class.create();
SocialKnowledgeAjaxProcessor.prototype = {
	SYSPARM_ARGS: 'sysparm_args',
	SYSPARM_DATA: 'sysparm_data',
	SYSPARM_ACTION : 'sysparm_action',
	ACTION_GET: 'GET',
	ACTION_INSERT: 'INSERT',
	ACTION_UPDATE: 'UPDATE',
	ACTION_DELETE: 'DELETE',
	
	INVALID_INTENTION: 'Invalid intention',
	INVALID_TASK: 'Invalid task',
	LAST_FETCHED_TIME: 'last_fetched_time',
	UI_NOTIFICATION: '$$uiNotification',
	LIVE_PROFILE: 'live_profile',
	DOCUMENT: 'document',
	
	// tasks
	TASK_BASIC: 'BASIC',
	TASK_REMOVE: 'REMOVE',
	TASK_TAG_DELETE: 'TAG_DELETE',
	TASK_TAG_ADD: 'TAG_ADD',
	TASK_RENAME_TAG: 'RENAME_TAG',
	TASK_UPVOTE: 'UP_VOTE',
	TASK_DOWNVOTE: 'DOWN_VOTE',
	TASK_VIEW: 'VIEW',
	TASK_QUESTION: 'QUESTION',

	initialize: function(request, response, processor) {
		this.request = request;
        this.response = response;
        this.processor = processor;
        this.action = request.getParameter(this.SYSPARM_ACTION);
		
		var payload = request.getParameter(this.SYSPARM_ARGS);
		if(!payload)
			payload = {};
		this.args = new global.JSON().decode(payload);
		this.isBatchMode = (this.request.getHeader('X-Mode') + '') === 'batch';
		this.contexts = {};
		this.globalUtil = new global.GlobalKnowledgeUtil();
	},
	
	addServerContext: function(key, value) {
		this.contexts[key] = value;
	},

	hasUiNotifications: function() {
		return gs.getErrorMessages().size() > 0 || 
				gs.getInfoMessages().size() > 0  || 
				gs.getTrivialMessages().size() > 0;
	},

	flattenSearchPayload: function(args) {
		if (args.search) {
			for (var key in args.search)
				args[key] = args.search[key];
			args.search_mode = true;
		}
		return args;
	},
	
	_processStateSearch: function(args) {
		if (args.search && args.search.state && args.state) {
			// Unlike other params which act as filters and restrict the results,
			// state param acts as enabler. Every additional value in it actually
			// includes more results. So, when this is provided in search we should
			// take an intersection of two sets - state and search.state (always a single string).
			var arrUtil = new ArrayUtil();
			var searchState = args.search.state;
			var intersect = true;
			if (args.state instanceof Array) {
				if (arrUtil.indexOf(args.state, searchState) === -1)
					intersect = false;
			} else if (args.state !== searchState) { // The args.state is string
				intersect = false;
			}
			return !intersect; // They do not intersect so no use is querying, return no results.
		}
		return false;
	},
	action_SessionProfile: function() {
		if(this.args.intention === this.ACTION_GET) {
			var util = new global.GlobalKnowledgeUtil();
			var profileId = util.getSessionProfile();
			var json = util.getProfileDetails(profileId);
			return json;
		}
		throw this.INVALID_INTENTION;
	},

	action_Question: function() {
		var question = new SocialQAQuestion();
		if(this.args.intention === this.ACTION_GET) {
			return question.toJSON(this.args);
		}
		else if(this.args.intention === this.ACTION_INSERT) {
			return question.createQuestion(this.data);
		}
		else if(this.args.intention === this.ACTION_UPDATE) {
			if(this.args.task == this.TASK_QUESTION)
				question.updateQuestion(this.data);
		}
		else if(this.args.intention === this.ACTION_DELETE) {
			question.deleteQuestion(this.args.sys_id);
		}
		else
			throw this.INVALID_INTENTION;
	},
	
	action_Tags: function() {
		var tags = new SocialQATags();
		if (this.args.intention == this.ACTION_GET) {
			if(this.args.getAcls)
				return tags.getTagsJSONWithAcls(this.args);
			return tags.getTagsJSON(this.args);
		}
		else
			throw this.INVALID_INTENTION;
	},

	action_Comment: function() {
		var comment = new SocialQAComment();
		if (this.args.intention == this.ACTION_GET) {
			var result = comment.getCommentsJSON(this.args.refName, this.args.refId, this.args.withoutLimit);
			return result;
		}
		else
			throw this.INVALID_INTENTION;
	},

	action_KnowledgeBaselist: function() {
		if(this.args.intention == this.ACTION_GET) {
			var kbListQuery = this.globalUtil.getCanReadKBs();
			var kbList = [];
			var gr = new GlideRecord('kb_knowledge_base');
			gr.addEncodedQuery(kbListQuery);
			gr.query();
			while(gr.next()){
				kbList.push({
					title: gr.getValue('title'), 
					sys_id: gr.getValue('sys_id')
				});
			}
			return kbList;
		}
		else
			throw this.INVALID_INTENTION;
	},
	action_Category: function() {
		if(this.args.intention == this.ACTION_GET) {
			var util = new global.GlobalKnowledgeUtil();
			var categories = util.getJSONCategories(this.args.sys_id);
			return categories;
		}
		else
			throw this.INVALID_INTENTION;
	},
	process: function() {
		
		var fjson = [], payload = [], error = false;
		
		if (this.isBatchMode) {
			var body = this.request.getParameter(this.SYSPARM_DATA);
			if (body)
				payload = new global.JSON().decode(body);
		} else{
			var data = this.request.getParameter(this.SYSPARM_DATA);
			if (data)
				data = new global.JSON().decode(data);
			payload.push({action: this.action +  '', args: this.args, data: data});
		}
		
		var canFetchUiNotifications = false;
		for (var i = 0; i < payload.length; i++) {
			var d = payload[i], json = {}, f;
			this.args = d.args;
			this.data = d.data;
			this.contexts = {};
			f = this['action_' + d.action];
			if (f) {
				try {
					var response = f.call(this); //Call the corresponding action
					if(d.action == "Question"  && this.args.intention === this.ACTION_INSERT && !response.id)
						error = true;
					if (this.args._isModelCall) {
						json = {answer: {response: response}};
						json.answer.contexts = this.contexts;
						if (!this.args._isPollingCall)
							canFetchUiNotifications = true;
					} else {
						json = {answer: response};
						canFetchUiNotifications = true;
					}
				} catch (err) {
					json = {action: d.action, error: err};
					if (!this.args._isPollingCall)
						canFetchUiNotifications = true;
				}
			}
			else
				json = {error: 'No Action Found'};
			json.action = d.action;
			fjson.push(json);
		}
		var resp;
		var uiNotification = {};
		if (canFetchUiNotifications)
			uiNotification = new global.JSON().decode(this.globalUtil.getUiNotifications());
		if (this.isBatchMode) {
			resp = fjson;
			if (uiNotification[this.UI_NOTIFICATION])
				resp.push(uiNotification);
		} else {
			resp = fjson[0];
			if (uiNotification[this.UI_NOTIFICATION])
				resp[this.UI_NOTIFICATION] = uiNotification[this.UI_NOTIFICATION];
		}
		
		if(error)
			this.response.setStatus(403);
		
		resp = new global.JSON().encode(resp);
		

		this.response.setContentType("application/json");
		this.processor.writeOutput(resp);
		return resp;
	},
	
	type: 'SocialKnowledgeAjaxProcessor'
};