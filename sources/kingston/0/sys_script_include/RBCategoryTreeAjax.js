var RBCategoryTreeAjax = Class.create();

RBCategoryTreeAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  process: function() {
    var method = this.getParameter("method");
    this.data = this.getParameter("data");

    if (this.data)
        this.xmlDocument = new XMLDocument(this.data);

    this.setFormTable(this.xmlDocument.getDocumentElement().getAttribute("name_field"));
    this.categoryId = this.xmlDocument.getDocumentElement().getAttribute("id");

    if (method == "getRunbooks")
        this.getRunbooks();
    else if (method == "getCategories")
        this.getCategoryList();
    else if (method == "startRunbook")
        this.startRunbook();
  },

  getRunbooks: function() {
    var categoryItems = this.getCategoryItemsById(this.categoryId);
    for(var i = 0; i < categoryItems.length; i++) {
      var categoryItem = categoryItems[i];

      var newElement = this.newItem("node");
      newElement.setAttribute("name", categoryItem.name);
      newElement.setAttribute("id", categoryItem.sys_id);
      newElement.setAttribute("name_field", this.formTable);
      newElement.setAttribute("method", "nothing");
      newElement.setAttribute("children", "0");
      newElement.setAttribute("click_url", "javascript:chooseRunbook('" + categoryItem.id + "', '" + categoryItem.hasVariables + "')");
    }
  },

  getCategoryList: function() {
      var categories = this.getCategories();

      for(var i = 0; i < categories.length; i++) {
          var category = categories[i];

          var newElement = this.newItem("node");
          newElement.setAttribute("name", category.name);
          newElement.setAttribute("id", category.id);
          newElement.setAttribute("method", "getRunbooks");
          newElement.setAttribute("expanded", "true");
      }
  },

  startRunbook: function() {
      var runbookId = this.getParameter("sysparm_runbook");
      var tableName = this.getParameter("sysparm_table");
      var sysId = this.getParameter("sysparm_id");

      var wfVersion = new Workflow().getVersion(runbookId);

      var gr = new GlideRecord('wf_context');
      gr.workflow = runbookId;
      gr.workflow_version = wfVersion.sys_id;
      gr.auto_start = true;
      gr.table = tableName;
      gr.id = sysId;
      var newId = gr.insert();

      this.setAnswer(newId);
  },

  getCategories: function(source) {
      var categories = new Array();

      var gr = new GlideRecord('rb_category');
      if (source)
          gr.addQuery('name', source);
      gr.query();
      while (gr.next()) {
          if (!this.hasCategoryItems(gr.sys_id))
              continue;

          var category = { id: new String(gr.sys_id), name: new String(gr.name) };
          categories.push(category);
      }

      return categories;
  },

  hasCategories: function(source) {
      return this.getCategories(source).length > 0;
  },

  getCategoryItemsById: function(categoryId) {
      var categories = new Array();

      var gr = new GlideRecord('rb_category_m2m');
      gr.addQuery('category', categoryId);
      gr.query();
      while (gr.next()) {
          var workflowVersionGR = new Workflow().getVersion(gr.runbook.sys_id);
          var runbookTable = (workflowVersionGR ? workflowVersionGR.table : null);
          var hasVariables = (workflowVersionGR ? workflowVersionGR.workflow.vars.hasVariables() : false);

          if (gs.nil(runbookTable) || !this.formGR.instanceOf(runbookTable))
              continue;
 
          var category = { 
              id: new String(gr.runbook.sys_id),
              name: new String(gr.runbook.name), 
              category: new String(gr.category.name),
              hasVariables: hasVariables
          };

          categories.push(category);
      }

      return categories;
  },

  hasCategoryItems: function(categoryId) {
      return this.getCategoryItemsById(categoryId).length > 0;
  },

  setFormTable: function(formTable) {
    this.formTable = formTable;
    this.formGR = new GlideRecord(formTable);
  },

  type: "RBCategoryTreeAjax"
});

RBCategoryTreeAjax.hasCategories = function(tableName) {
    var rbacta = new RBCategoryTreeAjax();
    rbacta.setFormTable(tableName);
    return rbacta.hasCategories();
};