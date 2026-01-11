// ====================
// 設定
// ====================
const CONFIG = {
  timer: {
    initialSeconds: 120, // 2分
  },
  formula: {
    questionMax: 100,
    amount: 34,
    sum: { min: 1, max: 30 },
    sub: { min: 1, max: 30 },
    kuku: { min: 2, max: 10 },
    div: { min: 2, max: 81 },
  },
};

// ====================
// ユーティリティ関数
// ====================

/**
 * 演算子を全角文字に変換
 */
const replaceOperStr = (formula) => {
  return formula
    .replace(/\+/g, '＋')
    .replace(/-/g, '－')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');
};

/**
 * Fisher-Yates シャッフルアルゴリズム
 */
const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * 四則演算のみ対応の安全な計算関数
 */
const safeEval = (formula) => {
  if (!/^\d+[+\-*/]\d+$/.test(formula)) {
    return '';
  }
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
};

// ====================
// 式生成
// ====================

/**
 * 汎用的な式生成関数
 */
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
};

const createSumFormula = (min, max) => createFormula(min, max, '+');
const createSubFormula = (min, max) => createFormula(min, max, '-', (i, j) => i > j);
const createKukuFormula = (min, max) => createFormula(min, max, '*');
const createDivFormula = (min, max) => {
  const filterFn = (dividend, divisor) =>
    divisor !== 0 && dividend % divisor === 0 && dividend !== divisor;
  return createFormula(min, max, '/', filterFn);
};

/**
 * 問題リストのHTML生成
 */
const generateFormulaList = () => {
  const { sum, sub, kuku, div, amount, questionMax } = CONFIG.formula;

  const kukuAmount = Math.floor(amount / 3 * 2);
  const divAmount = amount - kukuAmount;

  const formulaList = shuffle([
    ...shuffle(createSumFormula(sum.min, sum.max)).slice(0, amount),
    ...createSubFormula(sub.min, sub.max).slice(0, amount),
    ...shuffle(createKukuFormula(kuku.min, kuku.max)).slice(0, kukuAmount),
    ...shuffle(createDivFormula(div.min, div.max)).slice(0, divAmount),
  ]).slice(0, questionMax);

  return formulaList
    .map((f, i) =>
      `<li class="question pl-3" id="question-${i}">` +
      `<span class="is-size-2 has-text-weight-bold">` +
      `${replaceOperStr(f)}=<span id="answer-${i}" class="answer" style="display:none;">${safeEval(f)}</span>` +
      `</span></li>`
    )
    .join('\n');
};

// ====================
// Timer クラス
// ====================

class Timer {
  constructor(options) {
    this.initialSeconds = options.initialSeconds;
    this.timeLeft = this.initialSeconds;
    this.intervalId = null;
    this.onTick = options.onTick || (() => {});
    this.onComplete = options.onComplete || (() => {});
  }

  formatTime() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  start() {
    this.stop();
    this.onTick(this.formatTime());

    this.intervalId = setInterval(() => {
      this.timeLeft--;
      this.onTick(this.formatTime());

      if (this.timeLeft <= 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.stop();
    this.timeLeft = this.initialSeconds;
    this.onTick(this.formatTime());
  }
}

// ====================
// UI ヘルパー
// ====================

/**
 * 要素が画面外（下）にあるかチェック
 */
const isElementBelowViewport = (el) => {
  const rect = el.getBoundingClientRect();
  return rect.bottom > window.innerHeight;
};

/**
 * 現在の行にスクロール
 */
const scrollToCurrentLine = (element) => {
  if (element && isElementBelowViewport(element)) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }
};

// ====================
// DrillApp クラス
// ====================

class DrillApp {
  constructor() {
    this.elements = this.cacheElements();
    this.currentQuestionIndex = 0;
    this.isStarted = false;
    this.timer = new Timer({
      initialSeconds: CONFIG.timer.initialSeconds,
      onTick: (time) => this.updateTimerDisplay(time),
      onComplete: () => this.handleTimeUp(),
    });
  }

  cacheElements() {
    return {
      actionButton: document.getElementById('actionButton'),
      timerDisplay: document.getElementById('timer'),
      content: document.querySelector('.content'),
      formulaContainer: document.getElementById('formula'),
    };
  }

  init() {
    this.elements.formulaContainer.innerHTML = generateFormulaList();
    this.updateTimerDisplay(this.timer.formatTime());
    this.updateCurrentLine();
    this.bindEvents();
  }

  bindEvents() {
    // アクションボタン（START/RETRY トグル）
    this.elements.actionButton.addEventListener('click', () => this.handleActionButton());

    // キーボード・タッチ共通のアクション
    const handleAction = () => {
      if (!this.isStarted) {
        this.start();
      } else {
        this.showNextAnswer();
      }
    };

    // キーボードイベント
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        handleAction();
      }
    });

    // タッチ・クリックイベント（ボタン以外の領域）
    document.body.addEventListener('pointerup', (event) => {
      // ボタンのクリックは除外
      if (event.target.closest('button')) return;
      handleAction();
    });
  }

  handleActionButton() {
    if (!this.isStarted) {
      this.start();
    } else {
      this.retry();
    }
  }

  start() {
    if (this.isStarted) return;

    this.isStarted = true;
    this.elements.content.classList.remove('hide');
    this.updateActionButton('retry');
    this.timer.start();
  }

  updateActionButton(mode) {
    const button = this.elements.actionButton;
    if (mode === 'retry') {
      button.textContent = 'RETRY';
      button.classList.remove('is-primary');
      button.classList.add('is-warning');
      button.setAttribute('aria-label', 'ドリルをやり直す');
    } else {
      button.textContent = 'START';
      button.classList.remove('is-warning');
      button.classList.add('is-primary');
      button.setAttribute('aria-label', 'ドリルを開始する');
    }
  }

  showNextAnswer() {
    if (this.currentQuestionIndex >= CONFIG.formula.questionMax) return;

    const answerElement = document.getElementById(`answer-${this.currentQuestionIndex}`);
    if (answerElement) {
      answerElement.style.display = 'inline';
    }

    this.currentQuestionIndex++;
    this.updateCurrentLine();

    if (this.currentQuestionIndex >= CONFIG.formula.questionMax) {
      this.handleComplete();
    }
  }

  updateTimerDisplay(time) {
    this.elements.timerDisplay.textContent = time;
    this.elements.timerDisplay.setAttribute('aria-label', `残り時間: ${time}`);
  }

  updateCurrentLine() {
    const questions = document.querySelectorAll('li.question');
    questions.forEach((li) => li.classList.remove('current-line'));

    const currentQuestion = document.getElementById(`question-${this.currentQuestionIndex}`);
    if (currentQuestion) {
      currentQuestion.classList.add('current-line');
      currentQuestion.setAttribute('aria-current', 'true');
      scrollToCurrentLine(currentQuestion);
    }
  }

  handleTimeUp() {
    this.showAllAnswers();
    setTimeout(() => {
      window.alert(`🌟よくがんばりました！🌟\n${this.currentQuestionIndex}問解けました！`);
      this.elements.content.classList.add('disabled');
    }, 100);
  }

  showAllAnswers() {
    const answers = document.querySelectorAll('.answer');
    answers.forEach((answer) => {
      answer.style.display = 'inline';
    });
  }

  retry() {
    // タイマーをリセット
    this.timer.reset();

    // 状態をリセット
    this.currentQuestionIndex = 0;
    this.isStarted = false;

    // UIをリセット
    this.elements.content.classList.add('hide');
    this.elements.content.classList.remove('disabled');
    this.updateActionButton('start');

    // 新しい問題を生成
    this.elements.formulaContainer.innerHTML = generateFormulaList();
    this.updateCurrentLine();
  }

  handleComplete() {
    this.timer.stop();
    setTimeout(() => {
      window.alert('🎉全問完了しました！お疲れさまでした。🎉');
      this.elements.content.classList.add('disabled');
    }, 100);
  }
}

// ====================
// アプリケーション起動
// ====================

document.addEventListener('DOMContentLoaded', () => {
  const app = new DrillApp();
  app.init();
});
