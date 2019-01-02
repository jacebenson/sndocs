var converter = new EmailNotificationConverter();
converter.convertNotificationToVersion1(current);
if (! current.isActionAborted())
    action.setRedirectURL(current);

