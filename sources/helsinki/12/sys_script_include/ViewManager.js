gs.include("PrototypeServer");

var ViewManager = Class.create();

ViewManager.prototype = {
  initialize: function(table, formType) {
     this.table = table;
     this.formType = formType;
     this.collection = null;
  },

  getViews: function() {
    var sl = new GlideScriptViewManager(this.view); 
    sl.setTarget(this.formType);
    sl.setTargetID(this.table);
    var cl = sl.getList();
    var xml = new GlideXMLDocument('Views');
    cl.toXML(xml);
    answer =  xml.getDocument();
    return answer;
  },

  setView: function(view) {
    this.view = view;
  },

  setTitle: function(title) {
    this.title = title;
  },

  setCollection: function(collection) {
    this.collection = collection;
  },

  createView: function() {
    var sl = new GlideScriptViewManager(this.view);
    sl.setTitle(this.title);
    var vid = sl.makeView();
    var view = sl.getViewRecord(vid);
    sl.addView(view);
  },

  createSection: function(sectionCaption) {
    var id = this.table;
    var cl = this._getSectionListForDomain();
    var sf = new GlideSysForms(this.table); 
    sf.setView(this.view);
    if (cl.size() == 0)
        sf.createForm(id);

    var ss = new GlideSysSection(this.table);
    ss.setViewName(this.view);
    var id = ss.createSection(sectionCaption);
    sf.addSection(id);
    sf.save();
    this.table = id;
    return this.getSections();
  },

  save: function(avail, selected) {
    var sf = new GlideSysForm(this.table, this.view);
    sf.setAvailable(avail);
    sf.setSelected(selected);
    sf.setForm(this.formType);
    sf.setName(this.table);
    sf.setCollection(this.collection);
    sf.save();
  },

  getSelected: function() {
     if (this.formType == 'list')
        return this._listSelected();

     if (this.formType == 'related_list')
        return this._relatedListSelected();

     return this._sectionSelected();
  },

  _listSelected: function() {
    var sl = new GlideSysList(this.table);
    sl.setViewName(this.view);
    sl.setRelatedParentName(this.collection);
    sl.setReconcileList(false);
    sl.setUserApplies(false); // do not want user personalization
    var ll = new GlideListLabel();
    sl.setIncludeFormatting(ll.determineFormatting(this.view));
    var cls = sl.getListSet();
    answer = cls.toXML();
    return answer;
  },

  _relatedListSelected: function() {
    var cls = new GlideChoiceListSet();
    cls.setColumns(new GlideSysForm.getRelatedTables(this.table));
    var rel = new GlideRelationshipUtil();
    rel.addChoices(this.table, cls);
    cls.sortColumns(); 
		
    var sf = new GlideSysRelatedList(this.table);
    sf.setViewName(this.view);
    cls.setSelected(sf.getRelatedListBucket(false));
    answer = cls.toXML();
    return answer;
  },

  _sectionSelected: function() {
    var cl = this._getSectionList();
    if (cl.size() != 0) {
       var c = cl.get(0);
       this.table = c.getValue();
    } else {
       var ss = new GlideSysSection(this.table);
       ss.setViewName(this.view);
       var section = ss.getSections();
       section.next();
       this.table = section.sys_id.toString();
    }
    return this.getSection();
  },

  getSection: function() {
    var cls = new GlideChoiceListSet();
    var ss = new GlideSysSection(null, this.table);
    //PRB594840: make sure the previously selected embedded lists can be added to the Selected bucket
    ss.setReturnAllLists(true);
    cls.setColumns(ss.getTableColumns());
    cls.setSelected(ss.getSectionColumns());
    answer = cls.toXML();
    var e = answer.getDocumentElement();
    e.setAttribute("section_id", this.table);
    return this._setAttributes(answer);
  },

  _setAttributes: function(answer) {
    var x = GlideXMLUtil;
    var sel = x.getElementByTagName(answer, "selected");
    var choices = x.getChildrenByTagName(sel, "choice");
    var sec = new GlideRecord("sys_ui_section");
    sec.get(this.table);
    var tablename = sec.name;
    for (var i = 0;i < choices.size();i++) {
         var choice = choices.get(i);
         var choiceValue = x.getAttribute(choice, "value");
         var title = this._getFieldTitle(tablename, choiceValue);
         // add 'required' and 'title' attributes as needed to selected choices
         if (this._isRequired(tablename, choiceValue)) {
             choice.setAttribute("required", "true");
             var reqmsg = gs.getMessage("Required on form");
             if (title == null || title == "")
                 title = reqmsg;
             else
                 title = title + " - " + reqmsg;
         }
         var idx = choiceValue.indexOf(".annotation");
         if (idx == 0) {
             var choiceLabel = x.getAttribute(choice, "label");
             var annotationID = choiceValue.substring(12);
             var annotation = this._getAnnotation(annotationID);
             choice.setAttribute("showannotation", "true");
             choice.setAttribute("annotationtext", annotation.text.toString());
	           choice.setAttribute("annotationisplaintext", annotation.is_plain_text.toString());
             choice.setAttribute("annotationtype", annotation.type.toString());
             choice.setAttribute("annotationid", annotation.sys_id.toString());
             choice.setAttribute("label", choiceLabel + " (" + annotation.type.getDisplayValue() + ")");
             choice.setAttribute("value", choiceValue + "." + annotation.type.toString() + "." + annotation.text.toString());
         }
		
		var idx = choiceValue.indexOf(".chart");
        if (idx == 0) {
             var choiceLabel = x.getAttribute(choice, "label");
             var chartID = choiceValue.substring(7);
             var chart = this._getChart(chartID);
             choice.setAttribute("showchart", "true");
             choice.setAttribute("chartlabel", chart.label.toString());
             choice.setAttribute("chartid", chart.sys_id.toString());
             choice.setAttribute("label", choiceLabel);
             choice.setAttribute("value", choiceValue + "." + chart.text.toString());
         }
         choice.setAttribute("title", title);
    }
    return answer;
  },

  _getAnnotation: function(id) {
    var gr = new GlideRecord("sys_ui_annotation");
    gr.get(id);
    return gr;
  },
	
  _getChart: function(id) {
    var gr = new GlideRecord("sys_ui_chart");
    gr.get(id);
    return gr;
  },

  _getFieldTitle: function(tablename, fieldname) {
    var ed = GlideTableDescriptor.get(tablename).getElementDescriptor(fieldname);
    if (ed != null)
       return ed.getHint();
    return "";
  },

  _isRequired: function(tablename, fieldname) {
    if (gs.getProperty("glide.ui.form.enforce_required_fields","false") == "true") {
        var tables = GlideDBObjectManager.getTables(tablename);
        for (var i = 0;i < tables.size();i++) {
             var requiredFields = new GlideRecord("sys_ui_element_required");
             requiredFields.addQuery("table",tables.get(i));
             requiredFields.addQuery("field",fieldname);
             requiredFields.query();
             if (requiredFields.next())
                 return requiredFields.required;
        }
    }
    return false;
  },

  getSections: function() {
    var id = this.table;
    var xml = new GlideXMLDocument('Sections');
    answer = xml.getDocument();
    var cl = this._getSectionList();
    if (cl.size() == 0) {
       var ss = new GlideSysSection(null, id);
	   cl = ss.getSection();	
    }

    var c = cl.getChoice(id);
    if (c)
       c.setSelected(true);
    cl.toXML(xml);
    return answer;
  },

  _getSectionList: function() {
    this._getSectionTable();
    var sf = new GlideSysForms(this.table); 
    sf.setView(this.view);
    return sf.getFormSections();
  },

  _getSectionListForDomain: function() {
    this._getSectionTable();
    var sf = new GlideSysForms(this.table); 
    sf.setView(this.view);
    return sf.getOrCreateFormSectionsForDomain();
  },

  _getSectionTable: function() {
    var ss = new GlideSysSection(null, this.table);
    this.table = ss.getTableName();
  }

};
