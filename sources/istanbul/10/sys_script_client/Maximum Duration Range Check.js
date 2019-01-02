function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '')
      return;
   
   var maxDuration = g_form.getIntValue('max_duration');
   
   if (maxDuration < 5 || maxDuration > 30 * 24 * 60 * 60) {
      g_form.showFieldMsg('max_duration', getMessage('The maximum duration must be between 5 and 2,592,000 seconds (30 days)'), 'error');
   }
}