const replaceOperStr = (formula) => {
  return formula
    .replace(/\+/g, '＋')
    .replace(/-/g, '－')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');
}

const displayAnswer = (id) =>{ // eslint-disable-line no-unused-vars
  const element = document.getElementById(id);
  element.style.display = 'inline';
}

const shuffle = (array) => {
  let currentIndex = array.length
  let randomIndex = 0;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

const createSumFormula = (min, max) => {
  const result = [];
  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      result.push(`${i}+${j}`);
    }
  }
  return result;
}

const createSubFormula = (min, max) => {
 const result = [];
  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      if (i > j) {
        result.push(`${i}-${j}`);
      }
    }
  }
  return result;
}

const createKukuFormula = (min, max) => {
  const result = [];
  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      result.push(`${i}*${j}`);
    }
  }
  return result;
}

const createDivFormula = (min, max) => {
  const result = [];
  for (let dividend = min; dividend <= max; dividend++) {
    for (let divisor = min; divisor <= max; divisor++) {
      if (divisor !== 0 && dividend % divisor === 0 && dividend !== divisor) {
        result.push(`${dividend}/${divisor}`);
      }
    }
  }

  return result;
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

const countdownTimer = ()  => {
  const timerDisplay = document.getElementById('timer');
  const startButton = document.getElementById('startButton');
  let timerInterval;
  let timeLeft = 60 * 2;

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

function enableScreenInteraction() {
    const targetElement = document.body; // 画面全体を対象とする

    if (targetElement) {
        // pointerup イベントを使用: マウス、タッチ、ペン操作の終了を検知
        // これ一つで touchend と click の重複を避けることができます。
        targetElement.addEventListener('pointerup', function(event) {
            console.log('画面がポインターアップされました (pointerType: ' + event.pointerType + ')。');

            // 必要に応じて、イベントのデフォルト動作をキャンセル
            // event.preventDefault(); 
            // 注意: これを有効にすると、画面内の他のリンクやボタンのクリックも無効になる可能性があります。
            // 慎重に検討してください。

            performDesiredAction(event);
        });
    }
}

/**
 * 画面がタッチまたはクリックされたときに実行したい処理
 * ここではEnterキーの押下をシミュレートする例
 * @param {PointerEvent} originalEvent - 元のポインターイベントオブジェクト
 */
function performDesiredAction(originalEvent) {
    // EnterキーのKeyboardEventを作成し、発火させる
    // 注意点:
    // ブラウザのセキュリティ上の制約により、JavaScriptから強制的にキーイベントを発火させることは
    // 常に意図した通りに動作するとは限りません。特に、ユーザーの明確な操作を伴わない
    // 自動的なキーイベントの発火は、ブラウザによって制限されたり無視されたりする場合があります。
    const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',      // キーの識別子 (例: "Enter", "a", "Escape")
        code: 'Enter',     // 物理的なキーコード (例: "Enter", "KeyA")
        keyCode: 13,       // 非推奨だが互換性のため (EnterキーのkeyCode)
        which: 13,         // 非推奨だが互換性のため
        bubbles: true,     // イベントがDOMツリーをバブルアップ（親要素へ伝播）するか
        cancelable: true   // イベントがキャンセル可能か (preventDefault() でデフォルト動作を抑制できるか)
    });

    // 現在フォーカスされている要素に対してイベントを発火させることが最も一般的です。
    // 例: テキスト入力フィールドがフォーカスされている場合、そこでEnterキーが押されたかのような挙動になります。
    if (document.activeElement) {
        document.activeElement.dispatchEvent(enterEvent);
        console.log('Enterキーイベントを発火しました。');
    } else {
        console.log('フォーカスされている要素がないため、Enterキーイベントを発火できませんでした。');
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
      }
    }
  });
}

window.onload = function () {
  main()
  updateCurrentLine()
}

document.addEventListener('DOMContentLoaded', enableScreenInteraction);
