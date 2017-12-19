function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

   //If the user enter any percentage other than zero, the amount field should set to 0
   if (newValue != 0)
	    g_form.setValue('cost_adjustment', 0); 
}