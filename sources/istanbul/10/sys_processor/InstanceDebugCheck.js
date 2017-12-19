if (gs.getProperty("glide.instance.debug") == "true")
   gs.addErrorMessage(gs.getMessage("Schedulers are disabled: Instance is in DEBUG mode - glide.instance.debug property is true"));

g_response.sendRedirect("sys_trigger_list.do");