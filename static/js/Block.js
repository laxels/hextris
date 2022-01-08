function Block(fallingLane, blockType, iter, distFromHex, settled, dead) {
  // whether or not a block is rested on the center hex or another block
  this.settled = settled === undefined ? 0 : 1;
  this.height = settings.blockHeight;
  //the lane which the block was shot from
  this.fallingLane = fallingLane;

  this.checked = 0;
  //the angle at which the block falls
  this.angle = 90 - (30 + 60 * fallingLane);
  //for calculating the rotation of blocks attached to the center hex
  this.angularVelocity = 0;
  this.targetAngle = this.angle;
  this.blockType = blockType;
  this.color = colors[0];
  //blocks that are slated to be deleted after a valid score has happened
  this.deleted = 0;
  //blocks slated to be removed from falling and added to the hex
  this.removed = 0;
  //value for the opacity of the white blcok drawn over falling block to give it the glow as it attaches to the hex
  this.tint = 0;
  //value used for deletion animation
  this.opacity = 1;
  //boolean for when the block is expanding
  this.initializing = 1;
  this.ict = MainHex.ct;
  //speed of block
  this.iter = iter;
  //number of iterations before starting to drop
  this.initLen = settings.creationDt;
  //side which block is attached too
  this.attachedLane = 0;
  //distance from center hex
  this.distFromHex = distFromHex || settings.startDist * settings.scale;

  this.dead = dead;
  if (deadBlocksEnabled && Math.random() < 0.25) {
    this.dead = true;
  }

  if (uniformBlocksLeft > 0) {
    this.blockType = `empty`;
    uniformBlocksLeft--;
  }
  this.glyph = "";
  if (glyphsEnabled && this.blockType === "empty") {
    this.glyph = getRandomGlyph();
    if (!glyphDialogPresented) {
      presentDialog(`glyphs`);
      glyphDialogPresented = true;
    }
  }

  this.incrementOpacity = function () {
    if (this.deleted) {
      //add shakes
      if (this.opacity >= 0.925) {
        var tLane = this.attachedLane - MainHex.position;
        tLane = MainHex.sides - tLane;
        while (tLane < 0) {
          tLane += MainHex.sides;
        }

        tLane %= MainHex.sides;
        MainHex.shakes.push({
          lane: tLane,
          magnitude:
            3 *
            (window.devicePixelRatio ? window.devicePixelRatio : 1) *
            settings.scale,
        });
      }
      //fade out the opacity
      this.opacity = this.opacity - 0.075 * MainHex.dt;
      if (this.opacity <= 0) {
        //slate for final deletion
        this.opacity = 0;
        this.deleted = 2;
        if (gameState == 1 || gameState == 0) {
          localStorage.setItem("saveState", exportSaveState());
        }
      }
    }
  };

  this.getIndex = function () {
    //get the index of the block in its stack
    var parentArr = MainHex.blocks[this.attachedLane];
    for (var i = 0; i < parentArr.length; i++) {
      if (parentArr[i] == this) {
        return i;
      }
    }
  };

  this.draw = function (attached, index) {
    const lineWidth = 2 * settings.scale;

    this.height = settings.blockHeight;
    if (Math.abs(settings.scale - settings.prevScale) > 0.000000001) {
      this.distFromHex *= settings.scale / settings.prevScale;
    }

    this.incrementOpacity();
    if (attached === undefined) attached = false;

    if (this.angle > this.targetAngle) {
      this.angularVelocity -= angularVelocityConst * MainHex.dt;
    } else if (this.angle < this.targetAngle) {
      this.angularVelocity += angularVelocityConst * MainHex.dt;
    }

    if (
      Math.abs(this.angle - this.targetAngle + this.angularVelocity) <=
      Math.abs(this.angularVelocity)
    ) {
      //do better soon
      this.angle = this.targetAngle;
      this.angularVelocity = 0;
    } else {
      this.angle += this.angularVelocity;
    }

    const drawHeight = this.height - lineWidth;
    this.width = (2 * this.distFromHex) / Math.sqrt(3) - lineWidth;
    this.widthWide =
      (2 * (this.distFromHex + drawHeight)) / Math.sqrt(3) - lineWidth;
    var p1;
    var p2;
    var p3;
    var p4;
    let p1w;
    let p2w;
    if (this.initializing) {
      var rat = (MainHex.ct - this.ict) / this.initLen;
      if (rat > 1) {
        rat = 1;
      }
      p1 = rotatePoint((-this.width / 2) * rat, drawHeight / 2, this.angle);
      p2 = rotatePoint((this.width / 2) * rat, drawHeight / 2, this.angle);
      p3 = rotatePoint((this.widthWide / 2) * rat, -drawHeight / 2, this.angle);
      p4 = rotatePoint(
        (-this.widthWide / 2) * rat,
        -drawHeight / 2,
        this.angle,
      );
      p1w = rotatePoint(
        (-this.widthWide / 2) * rat,
        drawHeight / 2,
        this.angle,
      );
      p2w = rotatePoint((this.widthWide / 2) * rat, drawHeight / 2, this.angle);
      if (MainHex.ct - this.ict >= this.initLen) {
        this.initializing = 0;
      }
    } else {
      p1 = rotatePoint(-this.width / 2, drawHeight / 2, this.angle);
      p2 = rotatePoint(this.width / 2, drawHeight / 2, this.angle);
      p3 = rotatePoint(this.widthWide / 2, -drawHeight / 2, this.angle);
      p4 = rotatePoint(-this.widthWide / 2, -drawHeight / 2, this.angle);
      p1w = rotatePoint(-this.widthWide / 2, drawHeight / 2, this.angle);
      p2w = rotatePoint(this.widthWide / 2, drawHeight / 2, this.angle);
    }

    let drawColor = getBlockColor(this.color, this.dead);
    ctx.fillStyle = getBlockColor(this.color, this.dead);
    if (this.deleted) {
      drawColor = "#FFF";
      ctx.fillStyle = "#FFF";
    } else if (gameState === 0) {
      if (this.color.charAt(0) == "r") {
        drawColor = rgbColorsToTintedColors[this.color];
        ctx.fillStyle = rgbColorsToTintedColors[this.color];
      } else {
        drawColor = hexColorsToTintedColors[this.color];
        ctx.fillStyle = hexColorsToTintedColors[this.color];
      }
    }

    ctx.globalAlpha = this.opacity;
    var baseX =
      trueCanvas.width / 2 +
      Math.sin(this.angle * (Math.PI / 180)) *
        (this.distFromHex + drawHeight / 2) +
      gdx +
      glitchXOffset;
    var baseY =
      trueCanvas.height / 2 -
      Math.cos(this.angle * (Math.PI / 180)) *
        (this.distFromHex + drawHeight / 2) +
      gdy +
      glitchYOffset;
    ctx.beginPath();
    ctx.moveTo(baseX + p1.x, baseY + p1.y);
    ctx.lineTo(baseX + p2.x, baseY + p2.y);
    ctx.lineTo(baseX + p3.x, baseY + p3.y);
    ctx.lineTo(baseX + p4.x, baseY + p4.y);
    ctx.closePath();

    if (this.blockType === "solid") {
      ctx.fill();
    }
    const prevLineWidth = ctx.lineWidth;
    const prevStrokeStyle = ctx.strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = drawColor;
    ctx.stroke();

    if (this.blockType === "lined") {
      ctx.lineWidth = 1;

      const segments = 40;
      const wideVertex1 = { x: baseX + p4.x, y: baseY + p4.y };
      const wideVertex2 = { x: baseX + p3.x, y: baseY + p3.y };
      const narrowVertex1 = { x: baseX + p1w.x, y: baseY + p1w.y };
      const narrowVertex2 = { x: baseX + p2w.x, y: baseY + p2w.y };
      const delta = {
        x: (wideVertex2.x - wideVertex1.x) / segments,
        y: (wideVertex2.y - wideVertex1.y) / segments,
      };
      const dist = getDistanceBetween2Points(p1, p1w);

      let x1 = wideVertex1.x + delta.x;
      let y1 = wideVertex1.y + delta.y;
      let x2 = narrowVertex1.x + delta.x;
      let y2 = narrowVertex1.y + delta.y;
      for (let i = 0; i < segments - 1; i++) {
        const d1 = getDistanceBetween2Points({ x: x2, y: y2 }, narrowVertex1);
        const d2 = getDistanceBetween2Points({ x: x2, y: y2 }, narrowVertex2);
        const percentLength = Math.min(d1 / dist, d2 / dist, 1);
        const truncatedPoint = getPointAlongLine(
          { x: x1, y: y1 },
          { x: x2, y: y2 },
          percentLength,
        );

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(truncatedPoint.x, truncatedPoint.y);
        ctx.save();
        ctx.strokeStyle = getBlockColor(this.color, dead);
        ctx.stroke();
        ctx.restore();

        x1 += delta.x;
        y1 += delta.y;
        x2 += delta.x;
        y2 += delta.y;
      }
    }

    if (this.glyph) {
      ctx.save();
      const offset = rotatePoint(-4, 6, this.angle);
      ctx.translate(baseX + offset.x, baseY + offset.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      ctx.font = ctx.font.replace(/\d+px/, `16px`);
      ctx.fillText(this.glyph, 0, 0);
      ctx.restore();
    }

    ctx.lineWidth = prevLineWidth;
    ctx.strokeStyle = prevStrokeStyle;

    if (this.tint) {
      if (this.opacity < 1) {
        if (gameState == 1 || gameState == 0) {
          localStorage.setItem("saveState", exportSaveState());
        }

        this.iter = 2.25;
        this.tint = 0;
      }

      ctx.fillStyle = "#FFF";
      ctx.globalAlpha = this.tint;
      ctx.beginPath();
      ctx.moveTo(baseX + p1.x, baseY + p1.y);
      ctx.lineTo(baseX + p2.x, baseY + p2.y);
      ctx.lineTo(baseX + p3.x, baseY + p3.y);
      ctx.lineTo(baseX + p4.x, baseY + p4.y);
      ctx.lineTo(baseX + p1.x, baseY + p1.y);
      ctx.closePath();
      ctx.fill();
      this.tint -= 0.02 * MainHex.dt;
      if (this.tint < 0) {
        this.tint = 0;
      }
    }

    ctx.globalAlpha = 1;
  };
}

function findCenterOfBlocks(arr) {
  var avgDFH = 0;
  var avgAngle = 0;
  for (var i = 0; i < arr.length; i++) {
    avgDFH += arr[i].distFromHex;
    var ang = arr[i].angle;
    while (ang < 0) {
      ang += 360;
    }

    avgAngle += ang % 360;
  }

  avgDFH /= arr.length;
  avgAngle /= arr.length;

  return {
    x: trueCanvas.width / 2 + Math.cos(avgAngle * (Math.PI / 180)) * avgDFH,
    y: trueCanvas.height / 2 + Math.sin(avgAngle * (Math.PI / 180)) * avgDFH,
  };
}

function getDistanceBetween2Points(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPointAlongLine(p1, p2, percentLength) {
  const x = p1.x + (p2.x - p1.x) * percentLength;
  const y = p1.y + (p2.y - p1.y) * percentLength;
  return { x, y };
}

let glyphDialogPresented = false;
let glyphsEnabled = false;
function enableGlyphs() {
  glyphsEnabled = true;
}

let uniformBlocksLeft = 0;
function activateUniformBlocks(n) {
  uniformBlocksLeft = n;
}

let deadBlocksEnabled = false;
function enableDeadBlocks() {
  deadBlocksEnabled = true;
}

let invertedColorsEnabled = false;
function enableInvertedColorGlitch() {
  invertedColorsEnabled = true;
}

function getBlockColor(blockColor, dead) {
  if (dead) {
    return useInvertedColors() ? window.invertedDeadColor : window.deadColor;
  }
  return useInvertedColors() ? window.invertedColor : blockColor;
}

function useInvertedColors() {
  if (!invertedColorsEnabled) {
    return false;
  }
  return Math.random() < 0.5;
}

let drawLocationGlitchEnabled = false;
function enableDrawLocationGlitch() {
  drawLocationGlitchEnabled = true;
  refreshGlitchOffset();
}

let glitchXOffset = 0;
let glitchYOffset = 0;
function refreshGlitchOffset() {
  if (!drawLocationGlitchEnabled) {
    return;
  }
  glitchXOffset = Math.round(Math.random() * 300) - 100;
  glitchYOffset = Math.round(Math.random() * 300) - 100;
  setTimeout(refreshGlitchOffset, Math.round(Math.random() * 3000));
}
