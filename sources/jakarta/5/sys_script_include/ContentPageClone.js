var ContentPageClone = Class.create();

ContentPageClone.prototype = {

  prefix : 'Copy of ', 
  prefix_url : 'copy_of_', 

  initialize : function() { 
    this.copiedBlocks = {}; 
    this.copiedLayouts = {};
    this.copiedPages = {}; 
    this.copiedSections = [];
    this.copiedItems = []; 
    this.blockNameMaxLength = 40;
    var gr = new GlideRecord("content_block");
    gr.initialize();
    var ed = gr.name.getED();
    this.blockNameMaxLength = ed.getLength();
  },  

  copy : function(source) {
    this.id = this._copyPage(source);
    var url = source.sys_class_name + '.do?sys_id=' + this.id;
    action.setRedirectURL(url); 
  }, 

  copyAll : function(oldSiteID, site) { 
    this.prefix_url = ''; //no prefix needed when moving to a new site
    var pages = new GlideRecord('content_page');
    pages.addQuery('content_site', oldSiteID);
    pages.query();
    while (pages.next()) {
      var oldPage = pages.sys_id + '';  
      var newPage = this._copyPage(pages, site);

      this.copiedPages[oldPage] = newPage; 
    }

    this._resolveMenuSections(); 
    this._resolveMenuItems(); 

    //block & menu copy complete, resolve refs from headers to menus
    this._resolveHeaderMenus();    
  }, 

  _copyPage : function(source, site) {
    var oldGUID = source.sys_id + '';
    source.name = this.prefix + source.name;
    source.url_suffix = this.prefix_url + source.url_suffix;

    //page is being copied with a whole site -  
    //need to use the new content_site reference, and copy the layouts. 
    if (site) { 
      source.content_site = site.sys_id + '';
      source.layout = this.getCopiedLayout(source.layout.sys_id + ''); 
    }

    var newGUID = source.insert();
  
    var zones = new GlideRecord('sys_portal');
    zones.addQuery('page', oldGUID);
    zones.query();
    while (zones.next()) 
      this._copyZone(zones, newGUID, site);

    return newGUID;
  }, 

  getCopiedLayout : function(layoutID) {
    if (this.copiedLayouts[layoutID]) 
      return this.copiedLayouts[layoutID]; 
 
    var newLayout = this._copyLayout(layoutID);  
    this.copiedLayouts[layoutID] = newLayout; 
    return newLayout;
  }, 

  _copyLayout : function(layoutID) { 
    var layout = new GlideRecord('sys_ui_macro');
    if (layout.get(layoutID)) { 
      layout.name = this.prefix + layout.name; 
      return layout.insert();
    } 

    return layoutID; 
  },

  _copyZone : function (zones, newGUID, site) {
    var oldZone = zones.sys_id + '';
    zones.page = newGUID;
    var newZone = zones.insert();
    var prefs = new GlideRecord('sys_portal_preferences');
    prefs.addQuery('portal_section', oldZone);
    prefs.query();
    while (prefs.next()) {
      //only make a full copy of a block when accessed via site
      if (site && prefs.name == 'sys_id')
        prefs.value = this._getCopiedBlock(prefs.value);

      prefs.portal_section = newZone;
      prefs.insert();
    }

  }, 

  _getCopiedBlock : function(id) {
    if (this.copiedBlocks[id])
      return this.copiedBlocks[id]; 

    var newBlock = this._copyBlock(id);  
    this.copiedBlocks[id] = newBlock; 
    return newBlock;
  },  

  _copyBlock : function(id) {
    var block = new GlideRecord('content_block'); 
    if (block.get(id)) {  
      var ext = new GlideRecord(block.sys_class_name); 
      if (ext.get(block.sys_id)) {
        ext.name = this.prefix + ext.name; 
        if (block.get('name', ext.name))
          ext.name = this._createBlockName(block, ext.name, 1);

        var newBlock =  ext.insert();
       
        if (ext.sys_class_name == 'content_block_menu') 
           this._copyMenuSections(block.sys_id, newBlock);  
        
        return newBlock; 
      }
    }

    return id;
  },

  _createBlockName : function(block, blockName, startIndex) {
    var fullBlockName = startIndex + blockName;
    fullBlockName = fullBlockName.substr(0, this.blockNameMaxLength);
    if (block.get('name', fullBlockName))
      fullBlockName = this._createBlockName(block, blockName, ++startIndex);
    return fullBlockName;
  },

  _copyMenuSections: function(oldBlock, newBlock) { 
     var sections = new GlideRecord('menu_section'); 
     sections.addQuery('content_block_menu', oldBlock); 
     sections.query(); 
     while (sections.next()) {
        sections.name = sections.name; 
        sections.content_block_menu = newBlock; 
        var oldSection = sections.sys_id + ''; 

        var dPage = this.copiedPages[sections.detail_page];
        if(typeof dPage != 'undefined')
        	sections.detail_page = dPage;

        var newSection = sections.insert();
        this._copyMenuItem(oldSection, newSection); 
        this.copiedSections.push(newSection); 
 
     } 
  }, 

  _copyMenuItem: function(oldSection, newSection) { 
     var items = new GlideRecord('menu_item'); 
     items.addQuery('menu_section', oldSection); 
     items.query(); 
     while (items.next()) {
        items.menu_section = newSection; 
        var newDetailPage = this.copiedPages[items.detail_page];
        if(typeof newDetailPage != 'undefined')
          items.detail_page = this.copiedPages[items.detail_page];
        this.copiedItems.push(items.insert()); 
     }   
  }, 

  _resolveHeaderMenus: function() {
     var blockIds = []; 
     for (var key in this.copiedBlocks) 
        blockIds.push(this.copiedBlocks[key]); 

     var headers = new GlideRecord('content_block_header'); 
     headers.addQuery('sys_id', 'IN', blockIds.join(',')); 
     headers.query(); 

     while (headers.next()) {         
        headers.top_menu = this._getCopiedBlock(headers.top_menu); 
        headers.bottom_menu = this._getCopiedBlock(headers.bottom_menu); 
        headers.update(); 
     } 
  }, 

  _resolveMenuSections: function() {
     var sections = new GlideRecord('menu_section'); 
     sections.addQuery('sys_id', 'IN', this.copiedSections.join(',')); 
     sections.query();
     while (sections.next()) {
        
        var dPage = this.copiedPages[sections.detail_page];
        if(typeof dPage != 'undefined') {
        	sections.detail_page = dPage;
        	sections.update(); 
        }
     }
  },

  _resolveMenuItems: function() {
     var items = new GlideRecord('menu_item'); 
     items.addQuery('sys_id', 'IN', this.copiedItems.join(',')); 
     items.addQuery('type', 'content_page');
     items.query(); 

     while (items.next()) {

        var newDetailPage = this.copiedPages[items.detail_page];
        if(typeof newDetailPage != 'undefined') {
          items.detail_page = this.copiedPages[items.detail_page]; 
          items.update(); 
        }
     }
  },

  getID: function() { 
    return this.id; 
  }

};
