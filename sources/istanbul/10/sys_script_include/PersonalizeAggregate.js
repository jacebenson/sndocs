gs.include("PrototypeServer");

var PersonalizeAggregate = Class.create();

PersonalizeAggregate.prototype = {
  initialize: function() {
     this.viewName = "";
     this.parentName = "";
     this.relationship = "";
     this.entry = null;
     this.temporary = false;
  },

  getList: function(tableName, elementName) {
    this.tableName = tableName;
    this.element = elementName;
    this.getListEntry();
    if (this.entry == null)
       return;
    
    if (this.entry.isValidField('name'))
       var table = this.entry.name;
    else
       var table = this.entry.list_id.name;

    var chk = new GlideRecordSecure(table);
    chk.initialize();
    var element = chk.getElement(this.element);
    var eed = element.getED();

    var xml = new GlideXMLDocument("list_element");
    var e = xml.createElement("element_attributes", null);
    e.setAttribute("min", this.entry.min_value);
    e.setAttribute("max", this.entry.max_value);
    var isPrice = eed.getInternalType() == 'price' || eed.getInternalType() == 'currency'
    if (eed.isNumber() || eed.isDuration() || isPrice) {
       e.setAttribute("avg", this.entry.average_value);
       e.setAttribute("sum", this.entry.sum);
    } else if (eed.isDateType()) {
       e.setAttribute("avg", this.entry.average_value);
       e.setAttribute("sum", 'not_allowed'); 
    } else if (eed.isString()) {
       e.setAttribute("avg", 'not_allowed');
       e.setAttribute("sum", 'not_allowed');
    } else {
       e.setAttribute("avg", 'not_allowed');
       e.setAttribute("sum", 'not_allowed');
       e.setAttribute("min", 'not_allowed');
       e.setAttribute("max", 'not_allowed');     
    }

	if (!eed.canAvg())
       e.setAttribute("avg", 'not_allowed');
	if (!eed.canSum())
       e.setAttribute("sum", 'not_allowed');	  
	if (!eed.canMin())
       e.setAttribute("min", 'not_allowed');
	if (!eed.canMax())
       e.setAttribute("max", 'not_allowed');
	
    var document = xml.getDocument(); 
    answer = document;
    return document;
  },

  setViewName: function(viewName) {
    this.viewName = viewName;
  },

  setParent: function(parentName) {
    this.parentName = parentName;
  },
  
  setRelationship: function(relationship) {
     this.relationship = relationship;
  },
  
  update: function() {
    this.getListEntry();
    if (this.entry == null)
       return;

    this.entry.update();
    if (!this.list.isUserList() && !this.temporary) {
       var u = new GlideUpdateManager2();
       u.saveListElements(this.list);
    }
    gs.cacheFlush('syscache_realform');
  },

  setSum: function(sum) {
    this.getListEntry();
    if (this.entry == null)
       return;

    this.entry.sum = sum;
  },

  setMin: function(min) {
    this.getListEntry();
    if (this.entry == null)
       return;

    this.entry.min_value = min;
  },

  setMax: function(max) {
    this.getListEntry();
    if (this.entry == null)
       return;

    this.entry.max_value = max;
  },

  setAvg: function(avg) {
    this.getListEntry();
    if (this.entry == null)
       return;

    this.entry.average_value = avg;
  },

  setList: function(tableName) {
     this.tableName = tableName;
  },

  setElement: function(elementName) {
     this.element = elementName;
  },

  getListEntry: function() {
    if (this.entry != null)
       return;

    var sl = new GlideSysList(this.tableName); 
    sl.setViewName(this.viewName);
    if (this.viewName.startsWith('rpt-temp'))
        this.temporary = true;

    sl.setRelatedParentName(this.parentName);
    sl.setRelationshipID(this.relationship);
    this.list = sl;
    var records = sl.getRecordSet();
    while (records.next()) {
       gs.log("Checking " + records.element);
       if (records.element == this.element) {
          this.entry = records;
          gs.log("Entry found");
          return;
       }
    }
  }
};
















