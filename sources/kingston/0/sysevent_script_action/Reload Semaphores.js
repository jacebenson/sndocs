GlideSysSemaphore.get().reload(); // cluster messages are not processed by the sender, unless specified as the recipient
GlideClusterMessage.postScript('GlideSysSemaphore.get().reload();');