var KBMyKnowledgeAJAXSNC = Class.create();

KBMyKnowledgeAJAXSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getArticles: function() {
        var type = this.getParameter("sysparm_type");
        var windowStart = this.getParameter("sysparm_window_start");
		var isDoctype = this.getParameter("sysparm_is_doctype");
        var response = {};

        var myKnowledge = new KBMyKnowledge(type, windowStart);
        var articles = myKnowledge.getArticles();

        var jr = new GlideJellyRunner();
        jr.setEscaping(false);
        jr.setVariable("jvar_type", type);
		jr.setVariable("jvar_is_doctype", isDoctype);
        jr.setVariable("jvar_results", articles.results);

        response["htmlResult"] = jr.runMacro("kb_my_" + type);
        response["data"] = articles;

        return (new JSON()).encode(response);
    }
});