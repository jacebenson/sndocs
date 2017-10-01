/*! RESOURCE: /scripts/app.guided_tours/dismiss_auto_launch_modal.js */
var DismissAutoLaunch = {};
DismissAutoLaunch.template = function(obj) {
    obj || (obj = {});
    var temp, result = '';
    var gsft = document.getElementById("gsft_main");
    var win = gsft.contentWindow;
    var gwt = new win.GwtMessage();
    with(obj) {
        result += '<div class="row">';
        result += '<div class="col-sm-12">';
        result += '<span><p>';
        result += gwt.getMessage('Do you want to stop this tour from auto launching again?');
        result += '</p></span>';
        result += '</div>';
        result += '</div>';
        result += '</div>';
        result += '<div class="modal-footer">';
        result += '<div class="row">';
        result += '<div class="col-sm-6" style="text-align: left;padding: 7px;">';
        result += '<input id="apply_to_all" type="checkbox" style="margin: 0px;" name="apply_to_all" value="all_tours"/>';
        result += '&nbsp';
        result += '&nbsp';
        result += '<span>';
        result += gwt.getMessage('Apply for all tours on this page');
        result += '</span>';
        result += '</div>';
        result += '<div class="col-sm-6">';
        result += '<button id="close_dismiss_modal" class="btn btn-default">' + gwt.getMessage('No') + '</button>';
        result += '<button id="do_not_autolaunch" class="btn btn-primary">' + gwt.getMessage('Yes') + '</button>';
        result += '</div>';
        result += '</div>';
    }
    return result;
};;