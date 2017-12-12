var KnowledgeWikiProcessor = Class.create();

KnowledgeWikiProcessor.prototype = Object.extendsObject(WikiProcessor, {	

    processWikiPage: function() {
        //Fetch the dependent field setup for linking to other Knowledge Articles
        //By default it is short_description
        var depField = 'short_description';
		
        var dicEnt = new GlideRecord('sys_dictionary');
        dicEnt.addQuery('name', 'kb_knowledge');
        dicEnt.addQuery('element', 'wiki');
        dicEnt.query();
        if(dicEnt.next() && !gs.nil(dicEnt.dependent))
            depField = dicEnt.dependent;
			
        var kb = new GlideRecordSecure('kb_knowledge');
		var title = this.getPageName();
		var titleWithSpaces = title.replaceAll('_',' ');
		// match for dependent field containing the supplied link text
		kb.addEncodedQuery(depField + '='+title+'^OR' + depField + '='+titleWithSpaces);
        kb.query();
        if (kb.next()) {
           g_processor.redirect("kb_view.do?sys_kb_id=" + kb.sys_id);
        } else {
           gs.addInfoMessage(gs.getMessage('The selected wiki page does not yet exist.'));
           g_processor.redirect(this.getTable() + ".do?sys_id=-1&sysparm_query=article_type=wiki^" + this.getDependentField() + "=" + this.getPageName() + "^short_description=" + this.getPageName());
        }
    },

    type: 'KnowledgeWikiProcessor'
});