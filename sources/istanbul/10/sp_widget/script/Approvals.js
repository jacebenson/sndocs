if (input && input.op) {
  var app = new GlideRecord("sysapproval_approver");
  if (app.get(input.target)) {
    app.state = input.op;
    app.update();
  }
}

data.ViewApprovalPageMsg = gs.getMessage("View approval page");

var gr = new GlideRecord('sysapproval_approver');
gr.setLimit(50);
var qc1 = gr.addQuery("state", "requested");
if (input)
  qc1.addOrCondition("sys_id", "IN", input.ids);

gr.addQuery("approver", gs.getUserID());
gr.orderBy("sys_created_on");
gr.query();

var approvals = [];
var ids = [];
while (gr.next()) {
  var task = getRecordBeingApproved(gr);
	if (!task.isValidRecord())
		continue;

  ids.push(gr.getUniqueValue());
  var t = {};
  t.number = task.getDisplayValue();
  t.short_description = task.short_description.toString();
  if (task.isValidField("opened_by") && !task.opened_by.nil())
	  t.opened_by = task.opened_by.getDisplayValue();

  // requestor >> opener
  if (task.isValidField("requested_by") && !task.requested_by.nil())
	  t.opened_by = task.requested_by.getDisplayValue();

  t.start_date = task.start_date.toString();
  t.end_date = task.end_date.toString();
  t.table = task.getLabel();
  if (task.getValue("price") > 0)
	  t.price = task.getDisplayValue("price");

  if (task.getValue("recurring_price") > 0)
	  t.recurring_price = task.getDisplayValue("recurring_price");

  t.recurring_frequency = task.getDisplayValue("recurring_frequency");

  var items = [];
  var idx = 0;
  var itemsGR = new GlideRecord("sc_req_item");
  itemsGR.addQuery("request", task.sys_id);
  itemsGR.query();
  if (itemsGR.getRowCount() > 1)
    t.short_description = itemsGR.getRowCount() + " requested items";

  while (itemsGR.next()) {
    var item = {};
    item.short_description = itemsGR.short_description.toString();
    if (itemsGR.getValue("price") > 0)
      item.price = itemsGR.getDisplayValue("price");
    if (itemsGR.getValue("recurring_price") > 0) {
      item.recurring_price = itemsGR.getDisplayValue("recurring_price");
      item.recurring_frequency = itemsGR.getDisplayValue("recurring_frequency");
    }
    if (itemsGR.getRowCount() == 1) {
      item.variables = $sp.getRecordVariablesArray(itemsGR);
      t.short_description = itemsGR.short_description.toString();
    }

    items[idx] = item;
    idx++;
  }

  var j = {};
  j.sys_id = gr.getUniqueValue();
  j.table = gr.getRecordClassName();
  j.task = t;
  if (task)
    j.variables = $sp.getRecordVariablesArray(task);

  j.items = items;
  j.state = gr.getValue("state");
  j.stateLabel = gr.state.getDisplayValue();
  approvals.push(j);
}
data.ids = ids;
data.approvals = approvals;

function getRecordBeingApproved(gr) {
  if (!gr.sysapproval.nil())
    return gr.sysapproval.getRefRecord();

  return gr.document_id.getRefRecord();
}