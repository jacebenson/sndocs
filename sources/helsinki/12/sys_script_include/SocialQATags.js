var SocialQATags = Class.create();
SocialQATags.prototype = {
    initialize: function() {
		this.globalUtil = new global.GlobalKnowledgeUtil();
		this.socialQACommon = new SocialQACommon();
		this.tagTable = 'label';
		this.tagTableEntry = 'label_entry';
		this.userId = gs.getUserID();
    },
	_getTagsRecord: function(id) {
		var gr = new GlideRecord(this.tagTable);
		gr.addQuery('sys_id', id);
		gr.addActiveQuery();
		gr.query();
		return gr;
	},
	_getEntryCount: function(tagId, kb) {
		var gr = new GlideRecord(this.tagTableEntry);
		gr.addQuery('label', tagId);
		gr.addQuery('table', 'kb_social_qa_question');
		if(kb) {
			var qc = gr.addJoinQuery('kb_social_qa_question', 'table_key', 'sys_id');
			qc.addCondition('kb_knowledge_base',  'IN', kb.join(','));
		}			
		gr.query();
		return gr.getRowCount();
	},
	_getAnswerCount: function(tagId, kb) {
		var gr = new GlideRecord(this.tagTableEntry);
		gr.addQuery('label', tagId);
		gr.addQuery('table', 'kb_social_qa_question');
		if(kb) {
			var qc = gr.addJoinQuery('kb_social_qa_question', 'table_key', 'sys_id');
			qc.addCondition('kb_knowledge_base',  'IN', kb.join(','));
		}			
		gr.query();
		var questions = [];
		while(gr.next())
			questions.push(gr.getValue('table_key'));
		gr = new GlideRecord('kb_social_qa_answer');
		gr.addQuery('question', questions);
		gr.addQuery('accepted', true);
		gr.query();
		return gr.getRowCount();
	},
	_getTagId: function(tagName) {
		var sharedLabel = new GlideRecord('label_user_m2m');
		var label = new GlideRecord(this.tagTable);
		//try to get shared label from m2m first
		if (sharedLabel.isValid()) {
			sharedLabel.addQuery('user', this.userId);
			sharedLabel.addQuery('label.name', tagName);
			sharedLabel.query();
			
			if (sharedLabel.next()) {
				label.addQuery('sys_id', sharedLabel.getValue('label'));
				label.query();
				if (label.next())
					return label;
			}
		}

		label = new GlideRecord(this.tagTable);
		label.addQuery('name', tagName);
		var qc = label.addQuery('owner', this.userId);
		qc.addOrCondition('global', 'true');
		
		label.query();
		if (label.next()) {
			return label;
		}
		return null;
	},
	_createNewTag: function(tagName) {
		var gr = new GlideRecord(this.tagTable);
		gr.initialize();
		gr.setValue('name', tagName);
		if(gs.getUser().hasRole('global_tags_creator'))//Creating Private Tag if the use has no role
			gr.setValue('global', 'true');
		else
			gr.setValue('viewable_by', 'me');
		gr.setValue('type', 'standard');
		gr.setValue('owner', this.userId);
		gr.setValue("navigation", false);
		return gr.insert();
	},
	_getTableNameAndDisplayValue: function(table, sys_id) {
		var title = '';
		var grTarget = new GlideRecord(table);
		if (grTarget.get(sys_id)) {
			var className = grTarget.getDisplayValue('sys_class_name');
			if (gs.nil(className))
				className = grTarget.getLabel();
			title = className + " - " + grTarget.getDisplayValue();
		}
		return title;
	},
	_getSharedTags: function(tagName) {
		var sharedLabel = new GlideRecord('label_user_m2m');
		//try to get shared label from m2m first
		var tags = [];
		if (sharedLabel.isValid()) {
			sharedLabel.addQuery('user', this.userId);
			if(tagName)
				sharedLabel.addQuery('label.name', 'STARTSWITH', tagName);
			sharedLabel.query();
			while(sharedLabel.next()) {
				tags.push(sharedLabel.getValue('label'));
			}
		}
		return tags;
	},
	createTag: function(tagName, question) {
		var tagGR = this._getTagId(tagName);//See if the tag already exists
		var tagId = null;
		if(tagGR == null)
			tagId = this._createNewTag(tagName);//Create a fresh Tag
		else
			tagId = tagGR.getUniqueValue();
		//Assign the tag to question
		//check if the record is assigned
		var gr = new GlideRecord(this.tagTableEntry);
		gr.addQuery('label', tagId);
		gr.addQuery('table', 'kb_social_qa_question');
		gr.addQuery('table_key', question);
		gr.query();
		if(!gr.next()) {
			gr = new GlideRecord(this.tagTableEntry);
			var title = this._getTableNameAndDisplayValue('kb_social_qa_question', question);
			gr.initialize();
			gr.setValue('label', tagId);
			gr.setValue('table', 'kb_social_qa_question');
			gr.setValue('table_key', question);
			gr.setValue('title', title);
			gr.setValue('read', 'yes');
			gr.setValue('notify_always', false);
			gr.setValue("url","$social_qa.do?sysparm_view=question&sysparm_question_id="+question);
			gr.insert();
			return tagId;//Return label's sys_id after creating tag
		}
		else
			return '';
	},
	getTags: function(params) {
		var gr = new GlideRecord(this.tagTableEntry);
		if(!params.autosuggest) { //Not autosuggest
			gr.addQuery('table', 'kb_social_qa_question');
			var qc = gr.addJoinQuery('kb_social_qa_question', 'table_key', 'sys_id');
			var kbList = this.globalUtil.getCanReadKBs();
			if(kbList) {
				kbList = kbList.substr(8);
				qc.addCondition('kb_knowledge_base', 'IN', kbList);
			}
			if(params.knowledge_base)
				qc.addCondition('kb_knowledge_base',  'IN', params.knowledge_base.join(','));
		}
		if(params.question_id)
			gr.addQuery('table_key', params.question_id);
		gr.query();
		var labels = [];
		while(gr.next()) {
			labels.push(gr.getValue('label'));
		}
		gr = new GlideRecord(this.tagTable);
		gr.addActiveQuery();
		gr.addQuery('sys_id', labels);
		if(params.query) {
			gr.addQuery('name', 'STARTSWITH', params.query);
		}
		//Visibility
		var qc1 = gr.addQuery('global', true);
		var qc2 = qc1.addOrCondition('viewable_by', 'me');
		qc2.addCondition('owner', this.userId);
		qc1.addOrCondition('sys_id', 'IN', this._getSharedTags().join(','));
		gr.query();
		return gr;
	},
	getTagsJSON: function(params) {
		var gr = this.getTags(params);
		var socialQuestion = new SocialQAQuestion();
		var tags = [];
		while(gr.next()) {
			var tag = {};
			var name = gr.name.toString();
			tag.name = name;
			tag.viewable_by = gr.getValue('viewable_by');
			tag.sys_id = gr.getUniqueValue();
			tag.query = 'sys_tags.' + tag.sys_id + '=' + tag.sys_id;
			tag.bgcolor = gr.getValue('background_color');
			tag.tcolor = gr.getValue('color');
			tag.owner = this.userId == gr.getValue('owner');
			if(params.question) {
				tag.question_count = this._getEntryCount(tag.sys_id, params.knowledge_base);
				tag.answer_count = this._getAnswerCount(tag.sys_id, params.knowledge_base);
			}
			tags.push(tag);
		}
		return tags;
	},
	getTagsJSONWithAcls: function(params) {
		var tagsInfo = this.getTagsJSON(params);
		var qAcls = new SocialQAQuestion().getQuestionAcls(params.question_id);
		return {set: tagsInfo, acls: qAcls};
	},
	toJSON: function(params) {
		var tagsGR = this._getTagsRecord(params.sys_id);
		if (!tagsGR.hasNext())
			return ;
		
		tagsGR.next();
		return this.tagJSON(tagsGR);
	},
	
	tagJSON: function(tagsGR) {
		var tag = {};
		tag.tag = tagsGR.getDisplayValue();
		tag.sys_id = tagsGR.getValue('sys_id');
		tag.count = this._getEntryCount(tagsGR.getValue('sys_id'));
		tag.is_mine = this.userId == tagsGR.getValue('owner');
		return tag;
	},

    type: 'SocialQATags'
};