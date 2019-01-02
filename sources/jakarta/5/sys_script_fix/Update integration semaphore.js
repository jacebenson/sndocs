
if (!pm.isZboot()) {
	GlideSystemSemaphore.get().reload();
	GlideClusterMessage.post("script", "GlideSysSemaphore.get().reload();");
}
