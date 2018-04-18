/*! RESOURCE: /scripts/app.guided_tours/dismiss_auto_launch_modal.js */
var DismissAutoLaunch = {};
DismissAutoLaunch.template = function(obj) {
  obj || (obj = {});
  var temp, result = '';
  with(obj) {
    result += '<div class="row">';
    result += '<div class="col-sm-12">';
    result += '<span><p>';
    result += obj.confirmationMessage;
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
    result += obj.applyAllTours;
    result += '</span>';
    result += '</div>';
    result += '<div class="col-sm-6">';
    result += '<button id="close_dismiss_modal" class="btn btn-default">' + obj.no + '</button>';
    result += '<button id="do_not_autolaunch" class="btn btn-primary">' + obj.yes + '</button>';
    result += '</div>';
    result += '</div>';
  }
  return result;
};;