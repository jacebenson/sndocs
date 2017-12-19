/**
 * From Helsinki forward, default board card limit has been increased.
 * This fix script is to retroactively update boards that have been previously created
 * with the old defaults.
 */
var gr = new GlideRecord('vtb_board');
gr.query();
gr.setValue('card_limit', 2000);
gr.updateMultiple();