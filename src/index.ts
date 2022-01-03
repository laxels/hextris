interface Window {
  startGame: () => void;
}

const TEST = window.location.search.startsWith(`?test`);
const LINE_DELAY_MS = TEST ? 0 : 1000;
const TEXT_DELAY_MS = TEST ? 0 : 20;

type Dialog = {
  lines: string[];
  responses: DialogResponse[];
  onStart?: () => void;
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
    responses: [
      { text: `Enter`, nextDialogKey: `opening` },
      { text: `Cancel` },
    ],
  },
  opening: {
    lines: [`:)`, `ŇÐ ÆŇŇћ! Д ŒŇЭ ÅŇ Эþ φ ŸÅŒÅД°Ÿћ`],
    responses: [{ text: `What?`, nextDialogKey: `opening2` }],
  },
  opening2: {
    lines: [`ЮÐДÅ Д ŒБ°щ! ° ЮДΣ ÆÅÅ°ŸÆ βŇŒћ.`, `ΣÐДББ Ю ÐДξ ΣŇφ щΠŸ ÅŇÆÅÐŒ?`],
    responses: [{ text: `I don't understand`, nextDialogKey: `opening3` }],
  },
  opening3: {
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
    onStart: window.startGame,
    lines: [
      `Thank you thank you thank you thank you!`,
      `When you see security blocks with glyphs on them, clear them and send the output to me. This will give me information on where to go. Kinda like a map.`,
      `I’ll help you get through security layers in the Valks network, too.`,
      /* Display individual glyphs inside occasional blocks at random. Use the glyphs that spell out minotaur: φ°ŸŇÅДΠŒ */
      `There are some glyphs now!`,
      /* The glyphs cleared appear in the chat as if the player is replying with them. */
      `Thank you!`,
      `Here, I can intercept the next 10 blocks and make them the same type.`,
      /* Make the next 10 blocks the same type */
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
    onStart: window.startGame,
    lines: [`Very well.`, `I wish you the best on your journey.`],
    responses: [],
  },
};

const dialogBox = document.getElementById(`dialog-box`)!;

const caret = document.createElement(`div`);
caret.id = `dialog-caret`;
setInterval(() => {
  caret.classList.toggle(`visible`);
}, 500);

async function start(): Promise<void> {
  await presentDialog(`opening`);
}

async function presentDialog(key: string): Promise<void> {
  const { lines, responses, onStart } = DIALOGS[key]!;

  onStart?.();

  dialogBox.innerHTML = ``;

  for (const line of lines) {
    await appendLine(line);
    await wait(LINE_DELAY_MS);
  }

  const buttonContainer = document.createElement(`div`);
  buttonContainer.classList.add(`dialog-responses`);
  responses.forEach(({ text, nextDialogKey, handler }) => {
    const button = document.createElement(`button`);
    button.classList.add(`dialog-response`);
    button.innerText = text;
    button.onclick = () => {
      if (nextDialogKey != null) {
        void presentDialog(nextDialogKey);
      }
      handler?.();
    };
    dialogBox.append(button);
  });
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
    await wait(TEXT_DELAY_MS);
  }
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

void start();
