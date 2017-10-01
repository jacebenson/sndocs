/*! RESOURCE: /scripts/section.js */
function expandCollapseAllSections(expandFlag) {
    var spans = document.getElementsByTagName('span');
    for (var i = 0; i < spans.length; i++) {
        if (spans[i].id.substr(0, 8) != "section.")
            continue;
        var id = spans[i].id.substring(8);
        var state = collapsedState(id);
        if (state == expandFlag)
            toggleSectionDisplay(id);
    }
    CustomEvent.fire('toggle.sections', expandFlag);
}

function collapsedState(sectionName) {
    var el = $(sectionName);
    if (el)
        return (el.style.display == "none");
}

function setCollapseAllIcons(action, sectionID) {
    var exp = gel('img.' + sectionID + '_expandall');
    var col = gel('img.' + sectionID + '_collapseall');
    if (!exp || !col)
        return;
    if (action == "expand") {
        exp.style.display = "none";
        col.style.display = "inline";
        return;
    }
    exp.style.display = "inline";
    col.style.display = "none";
}

function toggleSectionDisplay(id, imagePrefix, sectionID) {
    var collapsed = collapsedState(id);
    setPreference("collapse.section." + id, !collapsed, null);
    hideReveal(id, imagePrefix);
    toggleDivDisplay(id + '_spacer');
    if (collapsed) {
        CustomEvent.fire("section.expanded", id);
        setCollapseAllIcons("expand", sectionID);
    }
};