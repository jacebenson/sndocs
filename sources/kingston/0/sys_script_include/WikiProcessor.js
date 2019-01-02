var WikiProcessor = Class.create();

WikiProcessor.prototype = Object.extendsObject(AbstractScriptProcessor, {	
    process: function() {
        this.view();
    },

    view: function() {
        var nameSpace = this.getNamespace();
        if (nameSpace.toLowerCase() == "image") {
           this.processImage();
        } else {
            this.processWikiPage();
        }
    },

    processImage: function() {
        var gf = new GlideForm(g_processor.getController(), 'wiki_image', 0);
        gf.putParameter("jvar_image_name", this.getPageName());
        gf.putParameter("jvar_table_name", this.getTable());
        gf.putParameter("jvar_field_name", this.getFieldName());
        
        var depField = this.getDependentField();
        if (depField != null) {
           gf.putParameter("jvar_dependent_field", depField);
           gf.putParameter("jvar_image_refs", this.displayImagesRefs());
        }

        g_processor.writeOutput("text/html", gf.getRenderedPage());
    },

    processWikiPage: function() {
        var table = this.getTable();
        //TODO: Remove the hard-coded redirect to knowledge base articles
        if (this.getTable() == "kb_knowledge") {
            g_processor.redirect("kb_wiki_view.do?title=" + this.getPageName() + "&sysparm_field=" + g_request.getParameter("sysparm_field") + "");
            return;
        }

        var depField = this.getDependentField();
        if (depField == null) {
           g_processor.redirect("wiki_link_error.do?sysparm_table=" + table + "&sysparm_field=" + this.getFieldName());
           return;
        }

        var wp = new GlideRecord(table);
        wp.addQuery(depField, this.getShortDescription());
        wp.query();
        if (wp.next()) {
           g_processor.redirect(table + ".do?sys_id=" + wp.sys_id);
        } else {
           gs.addInfoMessage('The selected page does not yet exist.');
           g_processor.redirect(table + ".do?sys_id=-1&sysparm_query=" + depField + "=" + this.getShortDescription());
        }
    },

    getNamespace: function() {
        var pageName = g_request.getParameter("title");

        if (pageName.indexOf(":") > -1)
            return pageName.substring(0, pageName.indexOf(":"));

        return "";
    },

    getShortDescription: function() {
        var wikiTitle = this.getPageName();
        wikiTitle = wikiTitle.replace("_"," ");
        return wikiTitle;
    },

    getPageName: function() {
        var pageName = g_request.getParameter("title");

        if (pageName.indexOf(":") > -1)
            pageName = pageName.substring(pageName.indexOf(":") + 1);

        return pageName;
    },

    getTable: function() {
        var parm = g_request.getParameter("sysparm_field") + "";
        var tfArr = parm.split(".");
        return tfArr[0];
    },

    getFieldName: function() {
        var parm = g_request.getParameter("sysparm_field") + "";
        var tfArr = parm.split(".");
        return tfArr[1];
    },

    getDependentField: function() {
        var td = new GlideTableDescriptor(this.getTable());
        var ed = td.getElementDescriptor(this.getFieldName());
        return ed.getDependent();
    },

    displayImagesRefs: function() {
    	var td = new GlideTableDescriptor(this.getTable());
        var ed = td.getElementDescriptor(this.getFieldName());
        return ed.getBooleanAttribute("image_refs");
    },
    
    type: 'WikiProcessor'
});
