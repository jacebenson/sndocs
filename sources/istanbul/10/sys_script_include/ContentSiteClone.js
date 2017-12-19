var ContentSiteClone = Class.create();

ContentSiteClone.prototype = {

  initialize : function(oldSite, name) {  
    var source = new GlideRecord('content_site'); 
    source.get(oldSite); 

    this.source = source; 
    this.newName = name; 

    this.newURL = name.replace(' ', '_');
    this.newSiteID = this._copySite(oldSite);

    this._copyTypes(oldSite, this.newSiteID); 
    this._copyMeta(oldSite, this.newSiteID); 

  }, 

  getSiteID : function() {
     return this.newSiteID;    
  },

  _copySite : function(oldSite) {
    this.source.name = this.newName; 
    this.source.url_suffix = this.newURL;
    this.source.setNewGuid();

    var pages = new ContentPageClone();
    pages.prefix = this.newName + ' - '; 
    pages.url_prefix = ''; 
    pages.copyAll(oldSite, this.source);

    this.pageMap = pages.copiedPages; 

    if (this.source.default_layout) 
      this.source.default_layout = pages.getCopiedLayout(this.source.default_layout.sys_id + '');

    if (this.source.default_theme)
      this.source.default_theme = this._copyStyles(this.source.default_theme + ''); 

    this.source.default_page = this.pageMap[this.source.default_page.sys_id + ''];
    this.source.login_page = this.pageMap[this.source.login_page.sys_id + '']; 
    this.source.gauge_page = this.pageMap[this.source.gauge_page.sys_id + ''];
    this.source.search_page = this.pageMap[this.source.search_page.sys_id + ''];

    return this.source.insert(); 
  }, 

  _copyStyles : function(themeID) {
    var newTheme = this._copyTheme(themeID);  

    var style = new GlideRecord('content_theme_css');
    style.addQuery('content_theme', themeID); 
    style.query(); 

    while (style.next()) { 
      style.content_theme = newTheme; 
      if (style.content_css.type != 'link')  
        style.content_css = this._copyCSS(style.content_css)
      style.insert(); 
    }   
 
    return newTheme;   
  }, 

  _copyCSS: function(sheetID) { 
    var css = new GlideRecord('content_css');
    if (css.get(sheetID)) {
      css.name = this.newName + ' - ' + css.name; 
      return css.insert(); 
    }

    return sheetID; 
  },

  _copyTheme : function(oldTheme) {
    var theme = new GlideRecord('content_theme'); 
    if (theme.get(oldTheme)) { 
      theme.name = this.newName + ' - ' + theme.name; 
      return theme.insert(); 
    }

    return oldTheme; 
  }, 

  _copyTypes : function(oldSite, newSite) {
    var type = new GlideRecord('content_type'); 
    type.addQuery('content_site', oldSite); 
    type.query(); 
    while (type.next()) {
      type.content_site = newSite; 
      type.detail_page = this.pageMap[type.detail_page];  
      type.gauge_page = this.pageMap[type.gauge_page]; 
      type.insert(); 
    }
  }, 

  _copyMeta : function(oldSite, newSite) { 
     var meta = new GlideRecord('content_page_meta'); 
     meta.addQuery('content_site', oldSite); 
     meta.query(); 
     while (meta.next()) { 
        meta.content_site = newSite; 
        meta.content_page = this.pageMap[meta.content_page]; 
        meta.insert(); 
     } 
  } 

}