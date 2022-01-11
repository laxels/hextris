// t: current time, b: begInnIng value, c: change In value, d: duration
function easeOutCubic(t, b, c, d) {
  return c * ((t = t / d - 1) * t * t + 1) + b;
}

function renderText(x, y, fontSize, color, text, font) {
  ctx.save();
  if (!font) {
    var font = "20px Exo";
  }

  fontSize *= settings.scale;
  ctx.font = fontSize + font;
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y + fontSize / 2 - 9 * settings.scale);
  ctx.restore();
}

function drawScoreboard() {
  if (scoreOpacity < 1) {
    scoreOpacity += 0.01;
    textOpacity += 0.01;
  }
  ctx.globalAlpha = textOpacity;
  var scoreSize = 50;
  var scoreString = String(score);
  if (scoreString.length == 6) {
    scoreSize = 43;
  } else if (scoreString.length == 7) {
    scoreSize = 35;
  } else if (scoreString.length == 8) {
    scoreSize = 31;
  } else if (scoreString.length == 9) {
    scoreSize = 27;
  }
  ctx.globalAlpha = scoreOpacity;
  renderText(
    trueCanvas.width / 2 + gdx + glitchXOffset,
    trueCanvas.height / 2 + gdy + glitchYOffset,
    devilMode ? 50 : scoreSize,
    window.colors[0],
    devilMode ? 666 : score,
  );

  ctx.globalAlpha = 1;
}

let devilMode = false;
function enableDevilMode() {
  devilMode = true;
}

function clearGameBoard() {
  drawPolygon(
    trueCanvas.width / 2,
    trueCanvas.height / 2,
    6,
    trueCanvas.width / 2,
    30,
    hexagonBackgroundColor,
    0,
    "rgba(0,0,0,0)",
  );
}

function drawPolygon(
  x,
  y,
  sides,
  radius,
  theta,
  fillColor,
  lineWidth,
  lineColor,
) {
  ctx.fillStyle = fillColor;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = lineColor;

  ctx.beginPath();
  var coords = rotatePoint(0, radius, theta);
  ctx.moveTo(coords.x + x, coords.y + y);
  var oldX = coords.x;
  var oldY = coords.y;
  for (var i = 0; i < sides; i++) {
    coords = rotatePoint(oldX, oldY, 360 / sides);
    ctx.lineTo(coords.x + x, coords.y + y);
    oldX = coords.x;
    oldY = coords.y;
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0)";
}

function toggleClass(element, active) {
  if ($(element).hasClass(active)) {
    $(element).removeClass(active);
  } else {
    $(element).addClass(active);
  }
}

function showText(text) {
  var messages = {
    paused: "<div class='centeredHeader unselectable'>Game Paused</div>",
    start:
      "<div class='centeredHeader unselectable' style='line-height:80px;'>Press enter to start</div>",
  };

  if (text == "gameover") {
    //Clay('client.share.any', {text: 'Think you can beat my score of '+ score + ' in Super Cool Game?'})
    $("#gameoverscreen").fadeIn();
  }
  $(".overlay").html(messages[text]);
  $(".overlay").fadeIn("1000", "swing");
}

function setMainMenu() {
  gameState = 4;
  canRestart = false;
  setTimeout(function () {
    canRestart = "s";
  }, 500);
  $("#restartBtn").hide();
  if ($("#pauseBtn").replace(/^.*[\\\/]/, "") == "btn_pause.svg") {
    $("#pauseBtn").attr(
      "src",
      "https://deusx-hacking.herokuapp.com/images/btn_resume.svg",
    );
  } else {
    $("#pauseBtn").attr(
      "src",
      "https://deusx-hacking.herokuapp.com/images/btn_pause.svg",
    );
  }
}

function hideText() {
  $(".overlay").fadeOut(150, function () {
    $(".overlay").html("");
  });
}

function gameOverDisplay() {
  settings.ending_block = false;
  var c = document.getElementById("canvas");
  c.className = "blur";
  updateHighScores();
  if (highscores.length === 0) {
    $("#currentHighScore").text(0);
  } else {
    $("#currentHighScore").text(highscores[0]);
  }
  $("#gameoverscreen").fadeIn();
  $("#buttonCont").fadeIn();
  $("#container").fadeIn();
  $("#socialShare").fadeIn();
  $("#restart").fadeIn();
  set_score_pos();
}

function updateHighScores() {
  $("#cScore").text(score);
  $("#1place").text(highscores[0]);
  $("#2place").text(highscores[1]);
  $("#3place").text(highscores[2]);
}

var pausable = true;
function pause(o) {
  if (gameState == 0 || gameState == 2 || !pausable) {
    return;
  }

  pausable = false;
  writeHighScores();
  var message;
  if (o) {
    message = "";
  } else {
    message = "paused";
  }

  var c = document.getElementById("canvas");
  if (gameState == -1) {
    $("#fork-ribbon").fadeOut(300, "linear");
    $("#restartBtn").fadeOut(300, "linear");
    $("#buttonCont").fadeOut(300, "linear");
    if ($("#helpScreen").is(":visible")) {
      $("#helpScreen").fadeOut(300, "linear");
    }

    $("#pauseBtn").attr(
      "src",
      "https://deusx-hacking.herokuapp.com/images/btn_pause.svg",
    );
    $(".helpText").fadeOut(300, "linear");
    $("#overlay").fadeOut(300, "linear");
    hideText();
    setTimeout(function () {
      gameState = prevGameState;
      pausable = true;
    }, 400);
  } else if (gameState != -2 && gameState !== 0 && gameState !== 2) {
    $("#restartBtn").fadeIn(300, "linear");
    $("#buttonCont").fadeIn(300, "linear");
    $(".helpText").fadeIn(300, "linear");
    if (message == "paused") {
      showText(message);
    }
    $("#fork-ribbon").fadeIn(300, "linear");
    $("#pauseBtn").attr("src", "./images/btn_resume.svg");
    $("#overlay").fadeIn(300, "linear");
    prevGameState = gameState;
    setTimeout(function () {
      pausable = true;
    }, 400);
    gameState = -1;
  }
}
