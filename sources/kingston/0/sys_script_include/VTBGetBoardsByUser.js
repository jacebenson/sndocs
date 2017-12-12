function VTBGetBoardsByUser() {
    var arrayUtil = new ArrayUtil();
    var user = gs.getUser();
    var boardHash = {},
        boardIds = [];

    // Boards that user is a member of
    var grBoardMembers = new GlideRecord('vtb_board_member');
    grBoardMembers.addQuery('user', user.getID());
    grBoardMembers.query();
    while (grBoardMembers.next()) {
        boardHash[grBoardMembers.board.toString()] = 1;
    }

    // Boards that user is the owner
    var grBoard = new GlideRecord('vtb_board');
    grBoard.addQuery('owner', user.getID());
    grBoard.query();
    while (grBoard.next()) {
        boardHash[grBoard.sys_id.toString()] = 1;
    }

    for (var key in boardHash) {
        boardIds.push(key);
    }

    return boardIds;
}