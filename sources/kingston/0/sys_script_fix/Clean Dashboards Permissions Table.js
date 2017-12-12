/* Delete dashboard permissions records that have no referenced dashboard */
var grDashboardPermissions = new GlideRecord("pa_dashboards_permissions");
grDashboardPermissions.addNullQuery("dashboard");
grDashboardPermissions.query();
while(grDashboardPermissions.next()) {
  grDashboardPermissions.deleteRecord();
}