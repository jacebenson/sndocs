var returnUrl = current;
var url = action.getValues().get('sysparm_referring_url');
if(url)
	returnUrl = url;

// start the url
var url = 'sys_ui_module.do?sys_id=-1&sysparm_query_override=';

// get the menu
if(!current.application.nil()) {
	var menu = current.application.title;
	var mobileMenuRecord = new GlideRecord('sys_ui_application');
	if(mobileMenuRecord.get('name', menu))
		menu = mobileMenuRecord.sys_id;
	
	url += 'application=' + menu.toString() + '^';
}

// if it has a table then account for filter and new types
var table = current.name;
var type = current.link_type.toString();
var addMsg = table.nil();
if(!table.nil()) {
	url += 'table=' + table.toString() + '^';
	if(type == 'FILTER')
		url += 'path=list_filter/' + table.toString() + '/create^';
	else if(type == 'NEW')
		url += 'path=form/' + table.toString() + '/-1^';
	else
	  addMsg = type != 'LIST';
}

var filter = current.filter;
if(!filter.nil())
	url += 'filter=' + GlideElementConditions.encodeFilter(filter.toString()) + '^';

var active = !current.active.nil() ? current.active.toString() : 0;
url += 'active=' + active + '^';

var name = current.title;
if(!name.nil())
	url += 'name=' + name.toString();

// if add message is true then indicate to user a direct mapping to mobile is not clear
if(addMsg) {
	// get the readable type value
	var choice = new GlideRecord('sys_choice');
	choice.addQuery('name', 'sys_app_module');
	choice.addQuery('element', 'link_type');
	choice.addQuery('value', type);
	choice.query();
	var typeLabel = choice.next() && !choice.label.nil() ? choice.label.toString() : type;
	
	var msg;
	if(GlideStringUtil.notNil(typeLabel))
		msg = gs.getMessage("Consult the product wiki to create a '{0}' mobile module", typeLabel);
	else
		msg = gs.getMessage("Consult the product wiki to create an 'unspecified' mobile module");
	
	gs.addInfoMessage(msg);
}

gs.setRedirect(url);
action.setReturnURL(returnUrl);
