var CABAgendaItem = Class.create();

CABAgendaItem.TASK_FIELDS_FOR_ATTENDEES = ["assigned_to", "cab_delegate"];

CABAgendaItem.prototype = Object.extendsObject(sn_change_cab.CABAgendaItemSNC, {
    type: 'CABAgendaItem'
});

// Bindings for namespaced code
CABAgendaItem.newAgendaItem = CABAgendaItemSNC.newAgendaItem;