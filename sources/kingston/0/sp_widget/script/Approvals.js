//we get only a max number of elements to avoid to have a big list of it
var maxNumberOfItemsInTheList = options.max_number_of_elements_shown_on_the_list;
//set 10 if maxnumber is undefined, empty or negative value
maxNumberOfItemsInTheList = maxNumberOfItemsInTheList>0 ? maxNumberOfItemsInTheList : 10; 

var initRow = 0;
var lastRow = maxNumberOfItemsInTheList;
var currentPage = 0; //0 is the first page
if (input) {
	// update pagination
	currentPage = input.pagination.currentPage;
	initRow = (currentPage * maxNumberOfItemsInTheList);
	lastRow = initRow + maxNumberOfItemsInTheList;
	
	if (input.op == 'approved' || input.op == 'rejected') {
		var app = new GlideRecord("sysapproval_approver");
		if (app.get(input.target)) {
			app.state = input.op;
			app.update();
		}
	}
}

data.ViewApprovalPageMsg = gs.getMessage("View approval page");
data.esignature = {
	username:  gs.getUserName(),
	userSysId: gs.getUserID(),
	e_sig_required: GlidePluginManager.isRegistered('com.glide.e_signature_approvals')
};

var esigRequiredMap = {};
if (data.esignature.e_sig_required) {
	var esigRegistryGR = new GlideRecord("e_signature_registry");
	esigRegistryGR.addQuery("enabled", "true");
	esigRegistryGR.query();
	while(esigRegistryGR.next()) {
		esigRequiredMap[esigRegistryGR.getValue("table_name")] = true;
	}
}

var gr = new GlideRecord('sysapproval_approver');
gr.chooseWindow(initRow, lastRow);
var qc1 = gr.addQuery("state", "requested");
//if (input)
//  qc1.addOrCondition("sys_id", "IN", input.ids);
data.myApprovals = getMyApprovals();
gr.addQuery("approver", data.myApprovals);
gr.orderBy("sys_created_on");
gr.query();
var rowCount = gr.getRowCount();
var approvals = [];
var ids = [];
var source_tables = [];

while (gr.next()) {
  var task = getRecordBeingApproved(gr);
	if (!task.isValidRecord())
		continue;

  ids.push(gr.getUniqueValue());
  var t = {};
  t.number = task.getDisplayValue();
  t.short_description = task.short_description.toString();
  if (gr.getValue("approver") != gs.getUserID())
	  t.approver = gr.approver.getDisplayValue();
  if (task.isValidField("opened_by") && !task.opened_by.nil())
	  t.opened_by = task.opened_by.getDisplayValue();

  // requestor >> opener
  if (task.isValidField("requested_by") && !task.requested_by.nil())
	  t.opened_by = task.requested_by.getDisplayValue();

  t.start_date = task.start_date.getDisplayValue();
  t.end_date = task.end_date.getDisplayValue();
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
	j.approval_source_table = gr.getValue("source_table");
	j.requireEsigApproval = esigRequiredMap[j.approval_source_table];
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

// for pagination
data.pagination = {};
data.pagination.hasNext = (approvals.length == (parseInt(lastRow) - parseInt(initRow)) && lastRow < rowCount);
data.pagination.hasPrevious = parseInt(initRow) > 0;
data.pagination.from = parseInt(initRow + 1);
data.pagination.to = parseInt(lastRow) < parseInt(rowCount) ? parseInt(lastRow) : parseInt(rowCount);
data.pagination.of = parseInt(rowCount);
data.pagination.showPagination = data.pagination.hasPrevious || data.pagination.hasNext;
data.pagination.currentPage = data.pagination.from > data.pagination.to ? currentPage -1 : currentPage;

function getRecordBeingApproved(gr) {
  if (!gr.sysapproval.nil())
    return gr.sysapproval.getRefRecord();

  return gr.document_id.getRefRecord();
}