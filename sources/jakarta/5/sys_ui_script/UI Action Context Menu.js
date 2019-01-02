function showUIActionContext(event) {
   if (!g_user.hasRole("ui_action_admin"))
      return;

   var element = Event.element(event);
   if (element.tagName.toLowerCase() == "span")
      element = element.parentNode;
   var id = element.getAttribute("gsft_id");
   var mcm = new GwtContextMenu('context_menu_action_' + id);
   mcm.clear();
   mcm.addURL(getMessage('Edit UI Action'), "sys_ui_action.do?sys_id=" + id, "gsft_main");
   contextShow(event, mcm.getID(), 500, 0, 0);
   Event.stop(event);
}

addLoadEvent(function() {
   document.on('contextmenu', '.action_context', function (evt, element) {
      showUIActionContext(evt);
   });
});