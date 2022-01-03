interface Window {
  startGame: () => void;
}

// const LINE_DELAY_MS = 1000;
// const TEXT_DELAY_MS = 20;
const LINE_DELAY_MS = 0;
const TEXT_DELAY_MS = 0;

type Dialog = {
  lines: string[];
  responses: DialogResponse[];
};

type DialogResponse = {
  text: string;
  nextDialogKey?: string;
  handler?: () => void;
};

const DIALOGS: { [key: string]: Dialog } = {
  opening: {
    lines: [`...`, `CEB 00001`, `Can you see this?`, `Am I getting through?`],
    responses: [
      { text: `I can't understand you`, nextDialogKey: `cantUnderstand` },
      { text: `Nani?`, nextDialogKey: `nani` },
    ],
  },
  cantUnderstand: {
    lines: [`Y can't u understand me doe`, `Dat's not cool`],
    responses: [{ text: `Start game`, handler: window.startGame }],
  },
  nani: {
    lines: [`Now I can't understand YOU`, `Fkin' weeb`],
    responses: [{ text: `Start game`, handler: window.startGame }],
  },
};

const dialogBox = document.getElementById(`dialog-box`)!;

const caret = document.createElement(`div`);
caret.id = `dialog-caret`;
setInterval(() => {
  caret.classList.toggle(`visible`);
}, 500);

async function start(): Promise<void> {
  await presentDialog(DIALOGS.opening!);
}

async function presentDialog({ lines, responses }: Dialog): Promise<void> {
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
        void presentDialog(DIALOGS[nextDialogKey]!);
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
