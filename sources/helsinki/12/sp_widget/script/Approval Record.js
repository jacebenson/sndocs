var gr = $sp.getRecord();
var task = getRecordBeingApproved(gr);
var t = {};
t = $sp.getFieldsObject(task, 'number,short_description,opened_by,requested_by,start_date,end_date,price,recurring_price,recurring_frequency');
t.table = task.getLabel();

var items = [];
var idx = 0;
var itemsGR = new GlideRecord("sc_req_item");
itemsGR.addQuery("request", task.sys_id);
itemsGR.query();
while (itemsGR.next()) {
  var item = {};
  item.short_description = itemsGR.short_description.toString();
  if (itemsGR.getValue("price") > 0)
	  item.price = itemsGR.getDisplayValue("price");
  
  if (itemsGR.getValue("recurring_price") > 0) {
	  item.recurring_price = itemsGR.getDisplayValue("recurring_price");
		item.recurring_frequency = itemsGR.getDisplayValue("recurring_frequency");
  }
  
  if (itemsGR)
	  item.variables = $sp.getRecordVariablesArray(itemsGR);
  
  items[idx] = item;
  idx++;
}

data.items = items;
data.sys_id = gr.getUniqueValue();
data.task = t;
if (task)
  data.variables = $sp.getRecordVariablesArray(task);

function getRecordBeingApproved(gr) {
  if (!gr.sysapproval.nil())
    return gr.sysapproval.getRefRecord();

  return gr.document_id.getRefRecord();
}

var ticketConversationOptions = {
	sys_id: task.getUniqueValue(),
	table: task.getTableName(),
	title: gs.getMessage("Activity Stream"),
	placeholder: gs.getMessage("Type your message here..."),
	placeholderNoEntries: gs.getMessage("Start a conversation..."),
	btnLabel: gs.getMessage("Send")
};

data.ticketConversation = $sp.getWidget('widget-ticket-conversation', ticketConversationOptions);