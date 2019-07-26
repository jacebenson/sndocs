/*! RESOURCE: /scripts/doctype/condition14_reporting.js */
function columnsGetWithFilter(mft, filter, nu, tableOptions) {
  queueFilters[mft] = filter;
  queueTables[mft] = mft;
  columnsGet(mft, nu, tableOptions);
}

function reconstruct(table, column) {
  if (!column)
    return column;
  if (column.indexOf("...") < 0)
    return column;
  var ngfi = column.indexOf("...");
  var ngf = column.substring(0, ngfi);
  var te = new Table(table);
  var recon = ngf + "." + te.getDisplayName(ngf);
  return recon;
}

function resetFilters() {
  var t = getThing(currentTable, 'gcond_filters');
  clearNodes(t);
};