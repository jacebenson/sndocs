function addCatalogItem() {
    var prequest = gel("sys_uniqueValue").value;
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var gDialog = new dialogClass("dialog_add_item");	
    gDialog.setPreference('prequest', prequest);
    gDialog.setPreference('table', 'add_catalog_item');
    gDialog.setTitle('Add Catalog Item');
    gDialog.render();
}

function validateNewItem() {
    var item = $("item_ref_field");
    var quantity = gel("myquantity");
    var problem = false;
    if (item.value == "") {
        highlightRow("itemrow", true);
        problem = true;
    } else
        highlightRow("itemrow", false);

    if (quantity.value == "") {
        highlightRow("quantityrow", true);
        problem = true;
    } else
        highlightRow("quantityrow", false);

    if (problem)
        return false;

    hideRow("itemrow", true);
    hideRow("quantityrow", true);
    hideRow("dialogbuttons", true);
    hideRow("poll_img", false);
    return true;
}

function highlightRow(rowName, doHighlight) {
    var row = gel(rowName);
    if (doHighlight)
        row.style.backgroundColor = '#FFFACD';
    else
        row.style.backgroundColor = '';
}

function hideRow(rowName, doHide) {
    var row = gel(rowName);
    if (doHide)
        row.style.display = "none";
    else
        row.style.display = "block";
}