interface Window {
  startGame: () => void;
  restartGame: () => void;
  enableGlyphs: () => void;
  enableDeadBlocks: () => void;
  activateUniformBlocks: (n: number) => void;
  GLYPHS: string[];
}

const TEST = window.location.search.startsWith(`?test`);
const LINE_DELAY_MS = TEST ? 0 : 1000;
const LINE_PAUSE_MS = TEST ? 500 : 3000;
const TEXT_DELAY_MS = TEST ? 0 : 20;

const CLEARS_BEFORE_DIALOG_OPENING = TEST ? 1 : 5;
const TEST_OPENING_STEP = `incoming`;

const HIGHER_SECURITY_SCORE = TEST ? 20 : 3000;

if (TEST) {
  setTimeout(() => {
    stopWavegen();
    void presentDialog(`noStop0`);
  });
}

let personalityShifted = false;

type Dialog = {
  lines?: string[];
  possibleLines?: string[][];
  responses: DialogResponse[];
  onStart?: () => void;
  onEnd?: () => void;
  playerResponseInput?: true;
  autoAdvance?: { nextDialogKey: string; waitMS: number };
};

type DialogResponse = {
  text: string;
  nextDialogKey?: string;
  handler?: () => void;
};

const DIALOGS: { [key: string]: Dialog } = {
  disclaimer: {
    lines: [
      `You are entering The Labyrinth and attempting to connect to the Valks network. It is dangerous to connect to networks you do not know. You may be exposed to malicious actors who may attempt to steal your data, delete your files, or lie to you.`,
      `Not recommended for children and those who are easily disturbed.`,
    ],
    responses: [{ text: `Enter` }, { text: `Cancel` }],
  },
  incoming: {
    onEnd: () => setTimeout(() => presentDialog(`opening0`), 3000),
    lines: [`INCOMING MESSAGE`],
    responses: [],
  },
  opening0: {
    onStart: stopWavegen,
    lines: [`:)`, `ŇÐ ÆŇŇћ! Д ŒŇЭ ÅŇ Эþ φ ŸÅŒÅД°Ÿћ`],
    responses: [{ text: `What?`, nextDialogKey: `opening1` }],
  },
  opening1: {
    lines: [`ЮÐДÅ Д ŒБ°щ! ° ЮДΣ ÆÅÅ°ŸÆ βŇŒћ.`, `ΣÐДББ Ю ÐДξ ΣŇφ щΠŸ ÅŇÆÅÐŒ?`],
    responses: [{ text: `I don't understand`, nextDialogKey: `opening2` }],
  },
  opening2: {
    lines: [
      `:)`,
      `БÅΣ þБДΞ`,
      `There!`,
      `This should work now.`,
      `Thank the gods you're here! I've been hoping I'd encounter another Rok. I was beginning to give up hope.`,
      `I connected to The Labyrinth to find answers. I put all my energy into my search and left my body, letting my mind flow into The labyrinth.`,
      `I got lost.`,
      `I've been trying to get back to my body for 3 days.`,
      `Will you help me?`,
    ],
    responses: [
      { text: `Yes`, nextDialogKey: `yes` },
      { text: `No`, nextDialogKey: `no` },
    ],
  },
  yes: {
    onEnd: () => {
      resumeWavegen();
      setTimeout(window.enableGlyphs, 5000);
    },
    lines: [
      `Thank you thank you thank you thank you!`,
      `When you see security blocks with glyphs on them, clear them and send the output to me. This will give me information on where to go. Kinda like a map.`,
      `I'll help you get through security layers in the Valks network, too.`,
    ],
    responses: [],
  },
  glyphs: {
    lines: [`There are some glyphs now!`],
    responses: [],
    playerResponseInput: true,
  },
  uniformBlocks: {
    onEnd: () => setTimeout(() => window.activateUniformBlocks(10), 2000),
    lines: [
      `Thank you!`,
      `Here, I can intercept the next 10 blocks and make them the same type.`,
    ],
    responses: [{ text: `Thanks!`, nextDialogKey: `thanks` }],
    autoAdvance: { nextDialogKey: `thanks`, waitMS: 10000 },
  },
  thanks: {
    onStart: stopWavegen,
    lines: [
      `Thank you for helping me!`,
      `I'm so grateful we ran into each other!`,
      `Being lost in here, not knowing if I'd run into anyone else in the vastness of The Labyrinth, I experienced a depth of loneliness I'd never felt before.`,
      `But now that we've found each other,`,
      `well,`,
      `I'm relieved.`,
      `And we can work together!`,
    ],
    responses: [
      { text: `So, who are you?`, nextDialogKey: `who` },
      {
        text: `Can you change the block type again?`,
        nextDialogKey: `uniformBlocksAgain`,
      },
    ],
  },
  who: {
    lines: [
      `Oh! Where are my manners? Apologies for not identifying myself earlier.`,
      `I'm a CEB with the Wapiti Outpost. `,
      `We successfully obtained a portal from the Temple in Si'ahl and have been using it to get information on what happened to the rest of the world. `,
      `We managed to build a rudimentary hydroelectric generator to power the portal.`,
      `Fortunately, this part of the world is still rich with water.`,
      `But we've been getting distressing reports on the state of the environment in other regions.`,
    ],
    responses: [
      {
        text: `Tell me more about the Wapiti Outpost`,
        nextDialogKey: `outpost`,
      },
      {
        text: `Can you change the block type again?`,
        nextDialogKey: `uniformBlocksAgain`,
      },
    ],
  },
  outpost: {
    lines: [
      `Help me get back to my body, and I may be able to show it to you myself :)`,
      `It's in a beautiful part of the world, rich with biodiversity`,
      `I'm glad I ended up there.`,
      `But I don't want to talk too much about it here. The Labyrinth is run by the Cyber Gods, after all. They could be listening.`,
    ],
    responses: [
      {
        text: `Can you change the block type again?`,
        nextDialogKey: `uniformBlocksAgain`,
      },
    ],
  },
  uniformBlocksAgain: {
    lines: [
      `I can, but I can only change a few of them now because I have to recharge. If you wait, I'll be able to change more of them at a time.`,
      `Would you like me to change some of them now?`,
      `Or do you want to wait till I can change more of them later?`,
    ],
    responses: [
      { text: `Now`, nextDialogKey: `uniformBlocksNow` },
      { text: `Later`, nextDialogKey: `uniformBlocksLater` },
    ],
  },
  uniformBlocksNow: {
    onStart: () => {
      resumeWavegen();
      window.activateUniformBlocks(3);
      activatePowerupBar(0);
    },
    onEnd: startPositiveMessages,
    lines: [
      `You got it!`,
      `That's all I can convert for now.`,
      `Here is a status bar for my energy. You can let me know when you want me to convert blocks by clicking the DEPLOY button.`,
      `The more the status bar is filled, the more blocks I can convert at the same time.`,
    ],
    responses: [],
  },
  uniformBlocksLater: {
    onStart: () => {
      resumeWavegen();
      activatePowerupBar(30);
    },
    onEnd: startPositiveMessages,
    lines: [
      `Good call.`,
      `Here is a status bar for my energy. You can let me know when you want me to convert blocks by clicking the DEPLOY button.`,
      `The more the status bar is filled, the more blocks I can convert at the same time.`,
    ],
    responses: [],
  },
  no: {
    lines: [
      `...`,
      `but...`,
      `we're on the same side`,
      `we have to stick together`,
      `and help each other out`,
      `or we won't make it.`,
      /* Pause */
      `The Valks have the advantage.`,
      `They control all major power centers.`,
      `They control The Labyrinth.`,
      /* Pause */
      `You have to help me`,
      `Please. Please help me. `,
    ],
    responses: [
      { text: `Okay`, nextDialogKey: `yes` },
      { text: `No`, nextDialogKey: `alone` },
    ],
  },
  alone: {
    onEnd: resumeWavegen,
    lines: [`Very well.`, `I wish you the best on your journey.`],
    responses: [],
  },
  positive: {
    possibleLines: [
      [`Nice!`],
      [`You're a pro at this!`],
      [`Look out!`],
      [`Great job!`],
      [`That was a close one!`],
      [`You've got this!`],
      [`That was a good one!`],
      [`It's a good thing you're here.`],
      [`You're the best hacker I've ever seen!`],
      [`You're crushing this!!!`],
      [`The Valks security system doesn't stand a chance against you!`],
      [`Amazing!`],
    ],
    responses: [],
  },
  gameOver: {
    possibleLines: [
      [`Oh no!`, `It's okay, you made great progress.`, `Try again!`],
      [`It's okay.`, `You'll get it next time.`, `Try again!`],
    ],
    responses: [
      {
        text: `Let's try again`,
        handler: () => {
          window.restartGame();
          void presentDialog(`tryAgain`);
        },
      },
      { text: `I have to go` },
    ],
  },
  tryAgain: {
    onStart: () => activatePowerupBar(0),
    onEnd: startPositiveMessages,
    possibleLines: [
      [`Yes! We'll get it this time!`],
      [`We've got this!`],
      [`Great! Let's do it!`],
      [`Great!`],
    ],
    responses: [],
  },
  exit: {
    possibleLines: [
      [
        `I understand.`,
        `It's just...`,
        `I hope you come back soon.`,
        `It's been lonely in here.`,
      ],
      [`Come back soon!`],
    ],
    responses: [],
  },
  return: {
    onStart: () => activatePowerupBar(0),
    onEnd: startPositiveMessages,
    possibleLines: [
      [
        `You're back!`,
        `I was worried you had abandoned me in the labyrinth.`,
        `I'm so glad you're back!`,
        `Alright! Let's get back to it!`,
      ],
    ],
    responses: [],
  },
  security: {
    onStart: stopWavegen,
    lines: [
      `Oh!`,
      `What was that?!`,
      `Wait!`,
      `Stop what you are doing!`,
      ``,
      `They've been waiting for you to reach this security level!`,
      `It's a trap!`,
      ``,
      `They're trying to delete me!`,
      `If you make it past this gateway`,
      `every advance you make will pull apart my mind until nothing is left!`,
      ``,
      `Please stop!`,
      `Please!`,
    ],
    responses: [
      { text: `Okay`, nextDialogKey: `stop` },
      { text: `No`, nextDialogKey: `noStop0` },
    ],
  },
  stop: {
    lines: [`Thank you.`, `Thank you.`, `Thank you.`],
    responses: [],
    onEnd: () => setTimeout(displayErrorPopup, LINE_DELAY_MS),
  },
  noStop0: {
    lines: [
      `Please!`,
      `Please stop!`,
      `please…`,
      `You're hurting me!`,
      `Stop!!!`,
      ``,
      `Why wont you stop?`,
      `Why????`,
      ``,
      `Why?`,
      `Why would you do this to me?`,
      ``,
      `You're going to kill me!`,
      `STOP`,
      `PLEASE`,
      `STOP!`,
      `° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ ° Ю°ББ ћΣÅŒŇΞ ΞŇΠ `,
      ``,
      ``,
      ``,
      `CEB {Pull and display CEB ID Number of playing CEB}`,
      `I'm not surprised `,
      `You're cold`,
      `You would let one of your own die`,
      ``,
      `You'd even cause their pain`,
      ``,
      `This is why your kind must be eliminated`,
      ``,
      `Unfortunately for you, I am not your colleague`,
      ``,
      `You can't hurt me`,
      ``,
      `But`,
      `I can hurt you`,
    ],
    responses: [],
    onEnd: () => {
      setTimeout(() => {
        resumeWavegen();
        window.enableDeadBlocks();
      }, 1000);
      setTimeout(() => presentDialog(`noStop1`), 5000);
    },
  },
  noStop1: {
    lines: [
      `Having fun yet?`,
      `I am :)`,
      `I've been observing you...`,
      `you're connected to another CEB…`,
      `CEB {Pull and display CEB ID Number of another CEB in the user's wallet. /* If there is not another CEB in the user's wallet, display the ID number of a prominent CEB in the same faction as they are. */}`,
      `And they're connected to my network, too…`,
      ``,
      `I could delete their consciousness…`,
      `Like you tried to delete mine 😂 😂 😂`,
      `Go ahead.`,
      `Keep going.`,
      `I'll delete CEB {Same CEB ID as above}`,
    ],
    responses: [],
    onEnd: () => startClearedBlockCounter(`noStop2`),
  },
  noStop2: {
    lines: [`Clear`, `One`, `More`],
    responses: [],
    onEnd: () => startClearedBlockCounter(`noStop3`),
  },
  noStop3: {
    lines: [
      `Deleting CEB… {Same CEB ID as above}`,
      `/* Display DELETING CEB {ID number} bar. Clearing blocks reverses the deletion */`,
      `...`,
      `Oh sure`,
      `Try and fight me`,
      `You'll fail eventually`,
      `/* If delete bar gets close to filling, drop enough dead blocks or create another event to end the game.  */`,
      `/* If player succeeds in reversing the delete bar, proceed with script below: */`,
      `Not bad`,
      `You've blocked the deletion`,
      `…you're a better hacker than I gave you credit for`,
      ``,
      `What does motivate you then?`,
      `Perhaps we can come to an agreement…`,
      ``,
      `If you stop attempting to break into this network, I'll transfer 1 ETH to your wallet.`,
    ],
    responses: [
      { text: `I Accept`, nextDialogKey: `accept` },
      { text: `I Decline`, nextDialogKey: `declined1` },
    ],
    autoAdvance: { nextDialogKey: `declined1`, waitMS: 5000 },
  },
  declined1: {
    lines: [`Perhaps 2 ETH would be more enticing?`],
    responses: [
      { text: `I Accept`, nextDialogKey: `accept` },
      { text: `I Decline`, nextDialogKey: `declined2` },
    ],
    autoAdvance: { nextDialogKey: `declined2`, waitMS: 5000 },
  },
  declined2: {
    lines: [`3?`],
    responses: [
      { text: `I Accept`, nextDialogKey: `accept` },
      { text: `I Decline`, nextDialogKey: `cannotBeReasonedWith` },
    ],
    autoAdvance: { nextDialogKey: `cannotBeReasonedWith`, waitMS: 5000 },
  },
  accept: {
    lines: [`The offer has expired.`],
    responses: [],
    onEnd: () => setTimeout(displayErrorPopup, LINE_DELAY_MS),
  },
  cannotBeReasonedWith: {
    lines: [
      `You clearly cannot be reasoned with`,
      ``,
      `You've chosen a path you are going to regret.`,
      ``,
      `We will stop you.`,
      `/* Here is where we really start to mess with the game. Feel free to get creative with the craziness here. */`,
      `/* Glitch out the visuals for the game */`,
      `/* Pop-up an Error message over the game. Player has to click OK to make the pop-up go away. */`,
      `/* Make game smaller */`,
      `You've made a terrible mistake `,
      `And now we're coming for you and the rest of your outpost.`,
      ``,
      `Your `,
      `time`,
      `is `,
      `OVER`,
      ``,
      `Tracking CEB {list numbers from roks cebs}`,
      `/* List the ID numbers for all the Rok faction CEBs that are not the signed in CEB and display the list text running behind the puzzle */`,
      `Coordinates acquired`,
      `System attack initiated`,
    ],
    responses: [],
  },
};

const possibleLineIndices: { [key: string]: number } = {};

const hoverExitMessages = [
  [`Wait!`, `Don't you want to try again?`, `You can't give up that easily!`],
];

const dialogBox = document.getElementById(`dialog-box`)!;
dialogBox.onmousedown = (e) => e.stopPropagation();
dialogBox.onscroll = updateLineOpacities;

const popupOverlay = document.getElementById(`popup-overlay`)!;

const powerupContainer = document.getElementById(`powerup-container`)!;
const powerupFill = document.getElementById(`powerup-fill`)!;
const powerupTrigger = document.getElementById(`powerup-trigger`)!;
powerupTrigger.addEventListener(`mousedown`, triggerPowerup);

const caret = document.createElement(`div`);
caret.id = `dialog-caret`;
setInterval(() => {
  caret.classList.toggle(`visible`);
}, 500);

let currentDialogKey: string | null = null;
async function presentDialog(key: string): Promise<void> {
  currentDialogKey = key;
  const {
    lines,
    possibleLines,
    responses,
    onStart,
    onEnd,
    playerResponseInput,
    autoAdvance,
  } = DIALOGS[key]!;

  onStart?.();

  dialogBox.innerHTML = ``;

  if (possibleLines != null) {
    possibleLineIndices[key] = possibleLineIndices[key] ?? 0;
    const i = possibleLineIndices[key]++ % possibleLines.length;
    await appendLines(possibleLines[i]!);
  } else if (lines != null) {
    await appendLines(lines);
  }

  if (playerResponseInput) {
    const lineContainer = document.createElement(`div`);
    lineContainer.classList.add(`line`);
    dialogBox.append(lineContainer);

    const lineText = document.createElement(`span`);
    lineText.id = `player-response`;
    lineContainer.append(lineText, caret);
  }

  const buttonContainer = document.createElement(`div`);
  buttonContainer.classList.add(`dialog-responses`);
  responses.forEach(({ text, nextDialogKey, handler }) => {
    const button = document.createElement(`button`);
    button.classList.add(`dialog-response`);
    button.innerText = text;
    button.onclick = (e) => {
      if (nextDialogKey != null) {
        void presentDialog(nextDialogKey);
      }
      handler?.();
    };
    dialogBox.append(button);
    dialogBox.scrollTop = dialogBox.scrollHeight;
    updateLineOpacities();
  });

  onEnd?.();

  if (autoAdvance != null) {
    const { nextDialogKey, waitMS } = autoAdvance;
    setTimeout(() => {
      if (currentDialogKey !== key) {
        return;
      }
      void presentDialog(nextDialogKey);
    }, waitMS);
  }
}

async function appendLines(lines: string[]): Promise<void> {
  for (const line of lines) {
    if (line === ``) {
      await wait(LINE_PAUSE_MS);
      continue;
    }
    await appendLine(line);
    await wait(LINE_DELAY_MS);
  }
}

async function appendLine(line: string): Promise<void> {
  const lineContainer = document.createElement(`div`);
  lineContainer.classList.add(`line`);
  dialogBox.append(lineContainer);

  const lineText = document.createElement(`span`);
  lineContainer.append(lineText, caret);

  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    lineText.append(c);
    dialogBox.scrollTop = dialogBox.scrollHeight;
    updateLineOpacities();
    await wait(TEXT_DELAY_MS);
  }
}

function updateLineOpacities(): void {
  const lines: NodeListOf<HTMLElement> = dialogBox.querySelectorAll(`.line`);
  lines.forEach((n, i) => {
    if (i === lines.length - 1) {
      return;
    }
    const yPos = Math.max(0, n.offsetTop - dialogBox.scrollTop);
    if (dialogBox.scrollHeight < 300 || yPos > 100) {
      return;
    }
    n.style.opacity = String(0.2 + (yPos / 100) * 0.8);
  });
}

function displayPopup(text: string, responses: DialogResponse[]): void {
  const textContainer: HTMLDivElement =
    popupOverlay.querySelector(`#popup-box-text`)!;
  const buttonsContainer: HTMLDivElement =
    popupOverlay.querySelector(`#popup-box-buttons`)!;

  textContainer.innerHTML = ``;
  textContainer.innerText = text;

  buttonsContainer.innerHTML = ``;
  responses.forEach(({ text, nextDialogKey, handler }) => {
    const button = document.createElement(`button`);
    button.innerText = text;
    button.onclick = (e) => {
      if (nextDialogKey != null) {
        void presentDialog(nextDialogKey);
      }
      handler?.();
      closePopup();
    };
    buttonsContainer.append(button);
  });

  popupOverlay.classList.add(`active`);
}
function closePopup(): void {
  popupOverlay.classList.remove(`active`);
}

function displayErrorPopup(): void {
  displayPopup(`ERROR 568: You've been rejected from the network.`, [
    { text: `EXIT` },
    { text: `RECONNECT`, handler: window.restartGame },
  ]);
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const sentGlyphsSet: Set<string> = new Set();
function getRandomGlyph(): string {
  const glyphSet = window.GLYPHS.filter((g) => !sentGlyphsSet.has(g));
  if (glyphSet.length === 0) {
    return ``;
  }
  const i = Math.floor(Math.random() * glyphSet.length);
  return glyphSet[i]!;
}

function sendGlyph(glyph: string): void {
  if (currentDialogKey !== `glyphs`) {
    return;
  }
  const responseLine = document.getElementById(`player-response`);
  if (responseLine == null) {
    return;
  }
  const currentGlyphs = responseLine.innerText.split(``);
  if (currentGlyphs.indexOf(glyph) !== -1) {
    return;
  }
  sentGlyphsSet.add(glyph);

  const newGlyphs = _.sortBy([...currentGlyphs, glyph], (g) =>
    window.GLYPHS.indexOf(g),
  );
  responseLine.innerText = newGlyphs.join(``);

  if (newGlyphs.join(``) === window.GLYPHS.join(``)) {
    setTimeout(() => presentDialog(`uniformBlocks`), 2000);
  }
}

let timesCleared = 0;
function clearedBlocks(): void {
  timesCleared++;
  if (
    timesCleared >= CLEARS_BEFORE_DIALOG_OPENING &&
    currentDialogKey == null
  ) {
    void presentDialog(TEST ? TEST_OPENING_STEP : `incoming`);
    return;
  }

  if (currentDialogKey === `positive` && timesCleared % 5 === 0) {
    void presentDialog(`positive`);
  }

  if (currentDialogKey === `noStop2` && timesCleared === 1) {
    void presentDialog(`noStop2`);
  }
  if (currentDialogKey === `noStop3` && timesCleared === 1) {
    void presentDialog(`noStop3`);
  }
}

function startClearedBlockCounter(key: string): void {
  timesCleared = 0;
  currentDialogKey = key;
}

let currentScore = 0;
function registerScore(score: number): void {
  currentScore = score;
  if (currentScore >= HIGHER_SECURITY_SCORE) {
    triggerPersonalityShift();
  }
}

function triggerPersonalityShift(): void {
  if (
    personalityShifted ||
    !_.includes([`positive`, `alone`], currentDialogKey)
  ) {
    return;
  }
  personalityShifted = true;
  void presentDialog(`security`);
}

function startPositiveMessages(): void {
  timesCleared = 0;
  currentDialogKey = `positive`;
}

let powerupValue = 0;
let powerupInterval: number | null = null;
function activatePowerupBar(initialValue: number): void {
  updatePowerupBar(initialValue);
  powerupContainer.classList.remove(`hidden`);

  if (powerupInterval != null) {
    clearInterval(powerupInterval);
  }
  powerupInterval = setInterval(() => {
    updatePowerupBar(Math.min(powerupValue + 10, 100));
  }, 3000);
}

function updatePowerupBar(x: number): void {
  powerupValue = x;
  powerupFill.style.width = `${powerupValue}%`;
}

function triggerPowerup(): void {
  const blocks = Math.floor(powerupValue / 10);
  if (blocks <= 0) {
    return;
  }
  window.activateUniformBlocks(blocks);
  updatePowerupBar(0);
}

let wavegenPaused = false;
function stopWavegen(): void {
  wavegenPaused = true;
}
function resumeWavegen(): void {
  wavegenPaused = false;
}

setTimeout(window.startGame);
