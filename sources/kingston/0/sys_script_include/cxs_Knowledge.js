var cxs_Knowledge = Class.create();

cxs_Knowledge.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	EMBED_KB_LINK:'embed_link',
	EMBED_KB_ARTICLE:'embed_article',
    getArticleInfo: function() {
        var kbSysId = this.getParameter("sysparm_kb_sys_id");
        var response = {
            article: {
                content: "",
                id: ""
            },
            fields: []
        };

        if (kbSysId != "") {
            var article = new GlideRecord("kb_knowledge");
            if (article.get(kbSysId)) {
				
				if (!article.canRead())
					return new JSON().encode(response);
				
                response.article.id = article.getUniqueValue();
				var insertKBLink = this.getParameter('sysparam_kb_insert_as_link') == this.EMBED_KB_LINK;
                var s = gs.getMessage("Knowledge article {0}: \n", article.number);
                if (gs.getProperty("glide.ui.security.allow_codetag", "true") != "true")
                    s += article.short_description;
                else {
                    var displayValue;
					if(insertKBLink){
						s='';
						var queryParameter = 'kb_view.do?sys_kb_id=';
						var shortDesc = GlideStringUtil.escapeHTML(article.short_description);
						displayValue = "<a title='" + shortDesc + "' href='";
						displayValue += queryParameter+article.getUniqueValue() + "' >";
						displayValue += article.number + " : " + shortDesc + "</a>";
					}else
						displayValue = SNC.GlideHTMLSanitizer.sanitize(new KnowledgeHelp(article).findDisplayValue());
                    s += "[code]" + displayValue + "[/code]";
                }

                response.article.content = s;
                response.fields = gs.getProperty("glide.knowman.attach.fields", "").split(",");
            }
        }

        return new JSON().encode(response);
    },

    isKnowledgeSearchAvailable: function() {
        var searchField = "" + this.getParameter("sysparm_searchField");

        var parts = searchField.split(".");

        if (parts.length != 2)
            return false;

        var grTable = new GlideRecord(parts[0]);
        var geTarget = grTable.getElement(parts[1]);
        return geTarget.getBooleanAttribute("knowledge_search");
    },

    type: "cxs_Knowledge"
});