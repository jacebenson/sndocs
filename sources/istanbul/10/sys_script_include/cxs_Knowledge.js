var cxs_Knowledge = Class.create();

cxs_Knowledge.prototype = Object.extendsObject(AbstractAjaxProcessor, {
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

                var s = gs.getMessage("Knowledge article") + " " + article.number + ":\n";
                if (gs.getProperty("glide.ui.security.allow_codetag", "true") != "true")
                    s += article.short_description;
                else {
                    var displayValue = SNC.GlideHTMLSanitizer.sanitize(new KnowledgeHelp(article).findDisplayValue());
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