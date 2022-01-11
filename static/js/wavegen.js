function blockDestroyed() {
  if (waveone.nextGen > 1350) {
    waveone.nextGen -= 30 * settings.creationSpeedModifier;
  } else if (waveone.nextGen > 600) {
    waveone.nextGen -= 8 * settings.creationSpeedModifier;
  } else {
    waveone.nextGen = 600;
  }

  if (waveone.difficulty < 35) {
    waveone.difficulty += 0.085 * settings.speedModifier;
  } else {
    waveone.difficulty = 35;
  }
}

function rampUpDifficulty() {
  waveone.nextGen = 600;
  waveone.difficulty = 35;
}

function waveGen(hex) {
  this.lastGen = 0;
  this.last = 0;
  this.nextGen = 2700;
  // this.nextGen = 500;
  this.start = 0;
  this.blockTypes = blockTypes;
  this.ct = 0;
  this.hex = hex;
  this.difficulty = 1;
  this.dt = 0;
  this.update = function () {
    if (wavegenPaused) {
      return;
    }
    this.currentFunction();
    this.dt = (settings.platform == "mobile" ? 14 : 16.6667) * MainHex.ct;
    this.computeDifficulty();
    if (
      (this.dt - this.lastGen) * settings.creationSpeedModifier >
      this.nextGen
    ) {
      if (this.nextGen > 600) {
        this.nextGen -=
          11 * (this.nextGen / 1300) * settings.creationSpeedModifier;
      }
    }
  };

  this.randomGeneration = function () {
    if (this.dt - this.lastGen > this.nextGen) {
      this.ct++;
      this.lastGen = this.dt;
      var fv = randInt(MainHex.sides);
      addNewBlock(
        fv,
        this.blockTypes[randInt(this.blockTypes.length)],
        1.6 + (this.difficulty / 15) * 3,
      );
      var lim = 5;
      if (this.ct > lim) {
        var nextPattern = randInt(3 + 21);
        if (nextPattern > 15) {
          this.ct = 0;
          this.currentFunction = this.doubleGeneration;
        } else if (nextPattern > 10) {
          this.ct = 0;
          this.currentFunction = this.crosswiseGeneration;
        } else if (nextPattern > 7) {
          this.ct = 0;
          this.currentFunction = this.spiralGeneration;
        } else if (nextPattern > 4) {
          this.ct = 0;
          this.currentFunction = this.circleGeneration;
        } else if (nextPattern > 1) {
          this.ct = 0;
          this.currentFunction = this.halfCircleGeneration;
        }
      }
    }
  };

  this.computeDifficulty = function () {
    if (this.difficulty < 35) {
      var increment;
      if (this.difficulty < 8) {
        increment = ((this.dt - this.last) / 5166667) * settings.speedModifier;
      } else if (this.difficulty < 15) {
        increment = ((this.dt - this.last) / 72333333) * settings.speedModifier;
      } else {
        increment = ((this.dt - this.last) / 90000000) * settings.speedModifier;
      }

      this.difficulty += increment * (1 / 2);
    }
  };

  this.circleGeneration = function () {
    if (this.dt - this.lastGen > this.nextGen + 500) {
      const numBlockTypes = randInt(this.blockTypes.length) + 1;
      const blockTypeList = [...this.blockTypes]
        .sort((a, b) => (Math.random() < 0.5 ? -1 : 1))
        .slice(0, numBlockTypes);

      for (var i = 0; i < MainHex.sides; i++) {
        addNewBlock(
          i,
          blockTypeList[i % numBlockTypes],
          1.5 + (this.difficulty / 15) * 3,
        );
      }

      this.ct += 15;
      this.lastGen = this.dt;
      this.shouldChangePattern(1);
    }
  };

  this.halfCircleGeneration = function () {
    if (this.dt - this.lastGen > (this.nextGen + 500) / 2) {
      var t = this.blockTypes[randInt(this.blockTypes.length)];
      var blockTypeList = [t, t, t];
      if (Math.random() < 0.3333) {
        blockTypeList = [
          t,
          this.blockTypes[randInt(this.blockTypes.length)],
          t,
        ];
      }

      var d = randInt(MainHex.sides);
      for (var i = 0; i < blockTypeList.length; i++) {
        addNewBlock(
          (d + i) % MainHex.sides,
          blockTypeList[i],
          1.5 + (this.difficulty / 15) * 3,
        );
      }

      this.ct += 8;
      this.lastGen = this.dt;
      this.shouldChangePattern();
    }
  };

  this.crosswiseGeneration = function () {
    if (this.dt - this.lastGen > this.nextGen) {
      var ri = randInt(this.blockTypes.length);
      var i = randInt(this.blockTypes.length);
      addNewBlock(i, this.blockTypes[ri], 0.6 + (this.difficulty / 15) * 3);
      addNewBlock(
        (i + 3) % MainHex.sides,
        this.blockTypes[ri],
        0.6 + (this.difficulty / 15) * 3,
      );
      this.ct += 1.5;
      this.lastGen = this.dt;
      this.shouldChangePattern();
    }
  };

  this.spiralGeneration = function () {
    var dir = randInt(2);
    if (this.dt - this.lastGen > this.nextGen * (2 / 3)) {
      if (dir) {
        addNewBlock(
          5 - (this.ct % MainHex.sides),
          this.blockTypes[randInt(this.blockTypes.length)],
          1.5 + (this.difficulty / 15) * (3 / 2),
        );
      } else {
        addNewBlock(
          this.ct % MainHex.sides,
          this.blockTypes[randInt(this.blockTypes.length)],
          1.5 + (this.difficulty / 15) * (3 / 2),
        );
      }
      this.ct += 1;
      this.lastGen = this.dt;
      this.shouldChangePattern();
    }
  };

  this.doubleGeneration = function () {
    if (this.dt - this.lastGen > this.nextGen) {
      var i = randInt(this.blockTypes.length);
      addNewBlock(
        i,
        this.blockTypes[randInt(this.blockTypes.length)],
        1.5 + (this.difficulty / 15) * 3,
      );
      addNewBlock(
        (i + 1) % MainHex.sides,
        this.blockTypes[randInt(this.blockTypes.length)],
        1.5 + (this.difficulty / 15) * 3,
      );
      this.ct += 2;
      this.lastGen = this.dt;
      this.shouldChangePattern();
    }
  };

  this.setRandom = function () {
    this.ct = 0;
    this.currentFunction = this.randomGeneration;
  };

  this.shouldChangePattern = function (x) {
    if (x) {
      var q = randInt(4);
      this.ct = 0;
      switch (q) {
        case 0:
          this.currentFunction = this.doubleGeneration;
          break;
        case 1:
          this.currentFunction = this.spiralGeneration;
          break;
        case 2:
          this.currentFunction = this.crosswiseGeneration;
          break;
      }
    } else if (this.ct > 8) {
      if (randInt(2) === 0) {
        this.setRandom();
        return 1;
      }
    }

    return 0;
  };

  // rest of generation functions

  this.currentFunction = this.randomGeneration;
}

function spawnDeadBlocks() {
  for (const fv of [0, 1, 2, 3, 4, 5]) {
    addNewBlock(
      fv,
      this.blockTypes[randInt(waveone.blockTypes.length)],
      1.6 + (waveone.difficulty / 15) * 3,
      undefined,
      undefined,
      true,
    );
  }
}