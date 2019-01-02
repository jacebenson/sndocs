function VTBGetBoardsByUser() {
    var arrayUtil = new ArrayUtil();
    var userId = gs.getUserID();
    var boardIds = [];
    var grBoardMembers = new GlideRecord('vtb_board_member');
    grBoardMembers.addQuery('user', userId);
    grBoardMembers.query();
    while (grBoardMembers.next()) {
        boardIds.push(grBoardMembers.board.toString());
    }

    var grBoard = new GlideRecord('vtb_board');
    grBoard.addQuery('owner', userId);
    grBoard.query();
    while (grBoard.next()) {
        if(arrayUtil.indexOf(boardIds, grBoard.sys_id.toString()) < 0)
            boardIds.push(grBoard.sys_id.toString());
    }

    return boardIds;
}