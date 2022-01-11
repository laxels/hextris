function search(twoD, oneD) {
  // Searches a two dimensional array to see if it contains a one dimensional array. indexOf doesn't work in this case
  for (var i = 0; i < twoD.length; i++) {
    if (twoD[i][0] == oneD[0] && twoD[i][1] == oneD[1]) {
      return true;
    }
  }
  return false;
}

function floodFill(hex, side, index, deleting, undeading) {
  if (
    hex.blocks[side] === undefined ||
    hex.blocks[side][index] === undefined ||
    hex.blocks[side][index].dead
  )
    return;

  //store the block type
  const blockType = hex.blocks[side][index].blockType;
  //nested for loops for navigating the blocks
  for (var x = -1; x < 2; x++) {
    for (var y = -1; y < 2; y++) {
      //make sure the they aren't diagonals
      if (Math.abs(x) == Math.abs(y)) {
        continue;
      }
      //calculate the side were exploring using mods
      var curSide = (side + x + hex.sides) % hex.sides;
      //calculate the index
      var curIndex = index + y;
      //making sure the block exists at this side and index
      if (hex.blocks[curSide] === undefined) {
        continue;
      }
      if (hex.blocks[curSide][curIndex] !== undefined) {
        // checking equivalency of block type, if its already been explored, and if it isn't already deleted
        if (
          hex.blocks[curSide][curIndex].blockType === blockType &&
          !hex.blocks[curSide][curIndex].dead &&
          search(deleting, [curSide, curIndex]) === false &&
          hex.blocks[curSide][curIndex].deleted === 0
        ) {
          //add this to the array of already explored
          deleting.push([curSide, curIndex]);
          //recall with next block explored
          floodFill(hex, curSide, curIndex, deleting, undeading);
        } else if (
          hex.blocks[curSide][curIndex].dead &&
          search(undeading, [curSide, curIndex]) === false
        ) {
          undeading.push([curSide, curIndex]);
        }
      }
    }
  }
}

function consolidateBlocks(hex, side, index) {
  const deleting = [];
  const deletedBlocks = [];
  const undeading = [];
  //add start case
  deleting.push([side, index]);
  //fill deleting
  floodFill(hex, side, index, deleting, undeading);
  //make sure there are more than 3 blocks to be deleted
  if (deleting.length < 3) {
    return;
  }

  for (let i = 0; i < deleting.length; i++) {
    const arr = deleting[i];
    //just making sure the arrays are as they should be
    if (arr != null && arr.length == 2) {
      //mark as deleted
      hex.blocks[arr[0]][arr[1]].deleted = 1;
      deletedBlocks.push(hex.blocks[arr[0]][arr[1]]);
    }
  }
  for (let i = 0; i < undeading.length; i++) {
    const arr = undeading[i];
    //just making sure the arrays are as they should be
    if (arr != null && arr.length == 2) {
      delete hex.blocks[arr[0]][arr[1]].dead;
    }
  }

  // add scores
  var now = MainHex.ct;
  if (now - hex.lastCombo < settings.comboTime) {
    settings.comboTime =
      (1 / settings.creationSpeedModifier) * (waveone.nextGen / 16.666667) * 3;
    hex.comboMultiplier += 1;
    hex.lastCombo = now;
    var coords = findCenterOfBlocks(deletedBlocks);
    hex.texts.push(
      new Text(
        coords["x"],
        coords["y"],
        "x " + hex.comboMultiplier.toString(),
        "bold Q",
        "#fff",
        fadeUpAndOut,
      ),
    );
  } else {
    settings.comboTime = 240;
    hex.lastCombo = now;
    hex.comboMultiplier = 1;
  }
  var adder = deleting.length * deleting.length * hex.comboMultiplier;
  hex.texts.push(
    new Text(
      hex.x,
      hex.y,
      "+ " + adder.toString(),
      "bold Q ",
      deletedBlocks[0].color,
      fadeUpAndOut,
    ),
  );
  hex.lastBlockTypeScored = deletedBlocks[0].blockType;
  score += adder;

  deletedBlocks.filter((b) => b.glyph).forEach((b) => sendGlyph(b.glyph));
  clearedBlocks();
  registerScore(score);
}