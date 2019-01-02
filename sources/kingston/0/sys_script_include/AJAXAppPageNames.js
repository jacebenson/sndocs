var AJAXAppPageNames = Class.create();
AJAXAppPageNames.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	getAppPageNames : function(){
		 var pages = {
			 tables : []
		 };		
	     var gr = new GlideRecord('sys_db_object');
		     gr.orderBy('name');
		     gr.query();
	     var i = 0; 
		 if(gr.canRead()){
			 while(gr.next()){
				 pages.tables[i++] = gr.name.toString();
			 }
		 }
		var allPages =  new global.JSON().encode(pages);
		return allPages;
	},
    type: 'AJAXAppPageNames'
});