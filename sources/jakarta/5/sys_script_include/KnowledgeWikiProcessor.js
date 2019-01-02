var KnowledgeWikiProcessor = Class.create();

KnowledgeWikiProcessor.prototype = Object.extendsObject(WikiProcessor, {	

    processWikiPage: function() {
        var kb = new GlideRecordSecure('kb_knowledge');
		var title = this.getPageName();
		var titleWithSpaces = title.replaceAll('_',' ');
		// match for short description containing spaces OR underscores
		kb.addEncodedQuery('short_description='+title+'^ORshort_description='+titleWithSpaces);
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