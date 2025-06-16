const replaceOperStr = (formula) => {
  return formula
    .replace(/\+/g, '＋')
    .replace(/-/g, '－')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');
}

const displayAnswer = (id) => {
  const element = document.getElementById(id);
  element.style.display = 'inline';
}

const shuffle = (array) => {
  let currentIndex = array.length;
  let randomIndex = 0;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// 汎用的な式生成関数
const createFormula = (min, max, operator, filterFn = () => true) => {
  const result = [];
  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      if (filterFn(i, j)) {
        result.push(`${i}${operator}${j}`);
      }
    }
  }
  return result;
}

const createSumFormula = (min, max) => createFormula(min, max, '+');
const createSubFormula = (min, max) => createFormula(min, max, '-', (i, j) => i > j);
const createKukuFormula = (min, max) => createFormula(min, max, '*');
const createDivFormula = (min, max) => {
  const filterFn = (dividend, divisor) => divisor !== 0 && dividend % divisor === 0 && dividend !== divisor;
  return createFormula(min, max, '/', filterFn);
}

// 四則演算のみ対応の安全な計算関数
function safeEval(formula) {
  // 許可するパターン: 数字, +, -, *, /, 空白
  if (!/^\d+[+\-*/]\d+$/.test(formula)) {
    return '';
  }
  // 分解
  const match = formula.match(/(\d+)([+\-*/])(\d+)/);
  if (!match) return '';
  const a = Number(match[1]);
  const op = match[2];
  const b = Number(match[3]);
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : '';
    default: return '';
  }
}

const FORMULA_AMOUNT = 34;
const KUKU_MIN = 2;
const KUKU_MAX = 10;
const DIV_MIN = 2;
const DIV_MAX = 81;
const QUESTION_MAX = 100;

const generateFormulaList = () => {
  const MIN = 1;
  const MAX = 30;
  let formulaList = [];
  let lines = [];

  const sumFormulaList = shuffle(createSumFormula(MIN, MAX)).slice(0, FORMULA_AMOUNT);
  const subFormulaList = createSubFormula(MIN, MAX).slice(0, FORMULA_AMOUNT);
  const kukuAmount = Math.floor(FORMULA_AMOUNT / 3 * 2);
  const divAmount = FORMULA_AMOUNT - kukuAmount;
  const kukuFormula = shuffle(createKukuFormula(KUKU_MIN, KUKU_MAX)).slice(0, kukuAmount);
  const divFormulaList = shuffle(createDivFormula(DIV_MIN, DIV_MAX)).slice(0, divAmount);
  formulaList = sumFormulaList.concat(subFormulaList).concat(kukuFormula).concat(divFormulaList);
  formulaList = shuffle(formulaList);
  formulaList = formulaList.slice(0, QUESTION_MAX);

  formulaList.forEach((f, i) => {
    lines.push(`<li class="question pl-3"><span class="is-size-2 has-text-weight-bold">${replaceOperStr(f)}=<span id="answer${i}" class="answer" style="display:none;">${safeEval(f)}</span></span></li>`)
  });
  return lines.join('\n');
}

const isElementBelowViewport = (el) => {
  const rect = el.getBoundingClientRect();
  return rect.bottom > window.innerHeight;
}

const scrollToCurrentLine = () => {
  const currentLine = document.querySelector('.current-line');

  if (currentLine && isElementBelowViewport(currentLine)) { // 画面の下にある場合のみスクロール
    currentLine.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
  }
}

const updateCurrentLine = () =>  {
  const questionLis = document.querySelectorAll('li.question');

   questionLis.forEach(li => {
    li.classList.remove('current-line');
  });

  let firstHiddenAnswerLi = null;
  for (const li of questionLis) {
    const answer = li.querySelector('.answer');
    if (answer && answer.style.display === 'none') {
      firstHiddenAnswerLi = li;
      break;
    }
  }

  if (firstHiddenAnswerLi) {
    firstHiddenAnswerLi.classList.add('current-line');
    scrollToCurrentLine()
  }
}

let timerInterval;
let timeLeft = 60 * 2; // 2 min
const countdownTimer = ()  => {
  const timerDisplay = document.getElementById('timer');
  const startButton = document.getElementById('startButton');

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(1, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function startTimer() {
    const content = document.querySelector('.content');
    content.classList.remove('hide');
    startButton.disabled = true;
    clearInterval(timerInterval);
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        content.classList.add('disabled');
      }
    }, 1000);
  }

  startButton.addEventListener('click', startTimer);
  updateTimerDisplay();
}

// 画面タッチ・クリック時にEnterキーをシミュレート
function enableScreenInteraction() {
    const targetElement = document.body;
    if (targetElement) {
        targetElement.addEventListener('pointerup', function(event) {
            performDesiredAction(event);
        });
    }
}

// Enterキーの押下をシミュレート
function performDesiredAction() {
    const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13, // 非推奨だが互換性のため
        which: 13,   // 非推奨だが互換性のため
        bubbles: true,
        cancelable: true
    });
    if (document.activeElement) {
        document.activeElement.dispatchEvent(enterEvent);
    }
}

const main = () => {
  let clickCount = 0;

  document.getElementById('formula').innerHTML = generateFormulaList();
  countdownTimer();

  document.addEventListener('keydown', (event) => {
    const startButton = document.getElementById('startButton');
    const isHide = document.querySelector('.content')?.classList.contains('hide');

    if (event.code === 'Enter') {
      if (!startButton.disabled && isHide) {
        document.getElementById('startButton').click();
      } else if (startButton.disabled) {
        displayAnswer(`answer${clickCount}`);
        clickCount++;
        updateCurrentLine();

        // 全問終了判定
        if (clickCount >= QUESTION_MAX) {
          clearInterval(timerInterval);
          setTimeout(() => {
            window.alert('🎉全問完了しました！お疲れさまでした。🎉');
            document.querySelector('.content').classList.add('disabled');
          }, 100); // 少し遅延して最後の答えが表示されるように
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  main();
  updateCurrentLine();
  enableScreenInteraction();
});
