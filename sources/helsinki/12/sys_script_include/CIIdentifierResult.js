// CI Identification class
/**
 * Result returned by an identifier.  Instances of this class contain the following properties:
 * 
 * matched:   array of sys_ids of matching CIs; may have any number of entries including zero.
 * matchable: true if identifier had sufficient data to match
 * terminatedChain: true if the identifier chain should stop processing filters, false to continue
 * 
 * Tom Dilatush
 */
var CIIdentifierResult = Class.create();

CIIdentifierResult.TERMINATE_CHAIN = true;
CIIdentifierResult.CONTINUE_CHAIN = false;

CIIdentifierResult.prototype = {
    /*
     * Initializes a new instance of this class.
     * 
     * matched:   array of sys_ids of matching CIs; may have any number of entries including zero.
     * matchable: true if identifier had sufficient data to match
     * terminatedChain: true if the identifier chain should stop processing filters, false to continue
     */
    initialize: function(matched, matchable, terminatedChain) {
        this.matched = matched;
        this.matchable = matchable;
        this.terminatedChain = terminatedChain ? true : false;
    },

    type: 'CIIdentifierResult'
}
