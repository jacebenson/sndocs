runSLACalculation();

function runSLACalculation() {
   //If the SLA has already ended, set now to the end time so the calculation doesn't get messed up
   if (!current.end_time.nil())
      SLACalculatorNG.calculateSLA(current, /* skipUpdate */ false, current.end_time);
   else
      SLACalculatorNG.calculateSLA(current, /* skupUpdate */ false);

   gs.setRedirect(current.getTableName() + ".do?sys_id=" + current.sys_id);
}