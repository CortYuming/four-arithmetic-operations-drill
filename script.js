// ====================
// レベル別設定
// ====================
const LEVEL_CONFIGS = {
  3: {
    name: '小学3年生',
    questionMax: 100,
    timer: 120,
    problems: {
      sum: { enabled: true, min: 1, max: 30, amount: 34 },
      sub: { enabled: true, min: 1, max: 30, amount: 34 },
      mul: { enabled: true, min: 2, max: 9, amount: 22 },
      div: { enabled: true, min: 2, max: 81, amount: 10 },
      decimalSum: { enabled: false },
      decimalSub: { enabled: false },
      decimalMul: { enabled: false },
      decimalDiv: { enabled: false },
      fractionSum: { enabled: false },
      fractionSub: { enabled: false },
      fractionMul: { enabled: false },
      fractionDiv: { enabled: false },
    },
  },
  4: {
    name: '小学4年生',
    questionMax: 20,
    timer: 120,
    problems: {
      sum: { enabled: true, min: 10, max: 200, amount: 20 },
      sub: { enabled: true, min: 10, max: 200, amount: 20 },
      mul: { enabled: true, min: 2, max: 12, amount: 15 },
      div: { enabled: true, min: 2, max: 100, amount: 10 },
      decimalSum: { enabled: true, decimals: 1, min: 0.1, max: 9.9, amount: 8 },
      decimalSub: { enabled: true, decimals: 1, min: 0.1, max: 9.9, amount: 7 },
      decimalMul: { enabled: false },
      decimalDiv: { enabled: false },
      fractionSum: { enabled: false },
      fractionSub: { enabled: false },
      fractionMul: { enabled: false },
      fractionDiv: { enabled: false },
    },
  },
  5: {
    name: '小学5年生',
    questionMax: 15,
    timer: 120,
    problems: {
      sum: { enabled: true, min: 10, max: 100, amount: 3 },
      sub: { enabled: true, min: 10, max: 100, amount: 3 },
      mul: { enabled: true, min: 2, max: 12, amount: 3 },
      div: { enabled: true, min: 2, max: 100, amount: 3 },
      decimalSum: { enabled: false },
      decimalSub: { enabled: false },
      decimalMul: { enabled: true, decimals: 1, min: 0.1, max: 9.9, intMin: 2, intMax: 9, amount: 16 },
      decimalDiv: { enabled: true, decimals: 1, min: 0.1, max: 9.9, amount: 14 },
      fractionSum: { enabled: true, maxDenom: 8, amount: 9 },
      fractionSub: { enabled: true, maxDenom: 8, amount: 9 },
      fractionMul: { enabled: false },
      fractionDiv: { enabled: false },
    },
  },
  51: {
    name: '小5小数問題',
    questionMax: 15,
    timer: 120,
    problems: {
      sum: { enabled: false },
      sub: { enabled: false },
      mul: { enabled: false },
      div: { enabled: false },
      decimalSum: { enabled: true, forceColumn: true, intMin: 1, intMax: 99, amount: 4 },
      decimalSub: { enabled: true, forceColumn: true, intMin: 1, intMax: 99, amount: 4 },
      decimalMul: { enabled: true, forceColumn: true, decimalIntMin: 1, decimalIntMax: 99, intMin: 2, intMax: 9, amount: 4 },
      decimalDiv: { enabled: true, forceColumn: true, amount: 3 },
      fractionSum: { enabled: false },
      fractionSub: { enabled: false },
      fractionMul: { enabled: false },
      fractionDiv: { enabled: false },
    },
  },
  6: {
    name: '小学6年生',
    questionMax: 11,
    timer: 120,
    problems: {
      sum: { enabled: true, min: 10, max: 100, amount: 2 },
      sub: { enabled: true, min: 10, max: 100, amount: 2 },
      mul: { enabled: true, min: 2, max: 12, amount: 2 },
      div: { enabled: true, min: 2, max: 100, amount: 2 },
      decimalSum: { enabled: false },
      decimalSub: { enabled: false },
      decimalMul: { enabled: true, decimals: 2, min: 0.01, max: 9.99, intMin: 2, intMax: 9, amount: 13 },
      decimalDiv: { enabled: true, decimals: 2, min: 0.01, max: 9.99, amount: 11 },
      fractionSum: { enabled: false },
      fractionSub: { enabled: false },
      fractionMul: { enabled: true, maxDenom: 6, amount: 12 },
      fractionDiv: { enabled: true, maxDenom: 6, amount: 11 },
    },
  },
};

const DEFAULT_LEVEL = 3;

// ====================
// URLパラメータ管理
// ====================
const getLevelFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const level = parseInt(params.get('level'), 10);
  return LEVEL_CONFIGS[level] ? level : DEFAULT_LEVEL;
};

const setLevelToURL = (level) => {
  const url = new URL(window.location);
  url.searchParams.set('level', level);
  window.history.pushState({}, '', url);
};

// ====================
// 現在の設定を取得
// ====================
let currentLevel = getLevelFromURL();

const getConfig = () => LEVEL_CONFIGS[currentLevel];

// ====================
// ユーティリティ関数
// ====================

/**
 * 演算子の全角変換
 */
const getOperatorDisplay = (op) => {
  const operators = { '+': '＋', '-': '－', '*': '×', '/': '÷' };
  return operators[op] || op;
};

/**
 * 式中の演算子を全角文字に変換
 */
const replaceOperStr = (formula) => {
  return formula.replace(/[+\-*/]/g, (op) => getOperatorDisplay(op));
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
 * 最大公約数を求める
 */
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/**
 * 分数を約分する
 */
const reduceFraction = (num, denom) => {
  const g = gcd(Math.abs(num), Math.abs(denom));
  return { num: num / g, denom: denom / g };
};

/**
 * 小数を指定桁数で丸める
 */
const roundDecimal = (value, decimals) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

// ====================
// 計算関数
// ====================

/**
 * 四則演算のみ対応の安全な計算関数
 */
const safeEval = (formula) => {
  if (!/^[\d.]+[+\-*/][\d.]+$/.test(formula)) {
    return '';
  }
  const match = formula.match(/([\d.]+)([+\-*/])([\d.]+)/);
  if (!match) return '';

  const a = Number(match[1]);
  const op = match[2];
  const b = Number(match[3]);

  let result;
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = b !== 0 ? a / b : ''; break;
    default: return '';
  }

  // 小数点以下の桁数を適切に処理
  if (typeof result === 'number' && !Number.isInteger(result)) {
    result = roundDecimal(result, 2);
  }
  return result;
};

/**
 * 分数の計算
 */
const calculateFraction = (n1, d1, op, n2, d2) => {
  let resultNum, resultDenom;

  switch (op) {
    case '+':
      resultNum = n1 * d2 + n2 * d1;
      resultDenom = d1 * d2;
      break;
    case '-':
      resultNum = n1 * d2 - n2 * d1;
      resultDenom = d1 * d2;
      break;
    case '*':
      resultNum = n1 * n2;
      resultDenom = d1 * d2;
      break;
    case '/':
      resultNum = n1 * d2;
      resultDenom = d1 * n2;
      break;
    default:
      return null;
  }

  return reduceFraction(resultNum, resultDenom);
};

// ====================
// 式生成（整数）
// ====================

/**
 * 汎用的な式生成関数
 */
const createFormula = (min, max, operator, filterFn = () => true) => {
  const result = [];
  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      if (filterFn(i, j)) {
        result.push({ type: 'integer', formula: `${i}${operator}${j}` });
      }
    }
  }
  return result;
};

const createSumFormula = (min, max) => createFormula(min, max, '+');
const createSubFormula = (min, max) => createFormula(min, max, '-', (i, j) => i > j);
const createMulFormula = (min, max) => createFormula(min, max, '*');
const createDivFormula = (min, max) => {
  const filterFn = (dividend, divisor) =>
    divisor !== 0 && dividend % divisor === 0 && dividend !== divisor;
  return createFormula(min, max, '/', filterFn);
};

// ====================
// 式生成（小数）
// ====================

/**
 * 筆算強制モード用：整数部1-2桁＋小数部1または2桁の数値を生成
 * 片方は1桁、片方は2桁になるようにして桁ズレを必ず作る
 */
const generateColumnPair = (intMin, intMax) => {
  const intA = Math.floor(intMin + Math.random() * (intMax - intMin + 1));
  const intB = Math.floor(intMin + Math.random() * (intMax - intMin + 1));
  const fracA = Math.floor(1 + Math.random() * 9) / 10;
  const fracB = Math.floor(10 + Math.random() * 90) / 100;
  const a = roundDecimal(intA + fracA, 1);
  const b = roundDecimal(intB + fracB, 2);
  return Math.random() < 0.5 ? [a, b] : [b, a];
};

const createDecimalSumFormula = (config) => {
  const { decimals, min, max, amount, forceColumn, intMin, intMax } = config;
  const result = [];

  for (let i = 0; i < amount * 3; i++) {
    let a, b;
    if (forceColumn) {
      [a, b] = generateColumnPair(intMin, intMax);
    } else {
      a = roundDecimal(min + Math.random() * (max - min), decimals);
      b = roundDecimal(min + Math.random() * (max - min), decimals);
    }
    result.push({
      type: 'decimal',
      formula: `${a}+${b}`,
      decimals: forceColumn ? 2 : decimals,
    });
  }
  return shuffle(result).slice(0, amount);
};

const createDecimalSubFormula = (config) => {
  const { decimals, min, max, amount, forceColumn, intMin, intMax } = config;
  const result = [];

  for (let i = 0; i < amount * 3; i++) {
    let a, b;
    if (forceColumn) {
      [a, b] = generateColumnPair(intMin, intMax);
    } else {
      a = roundDecimal(min + Math.random() * (max - min), decimals);
      b = roundDecimal(min + Math.random() * (max - min), decimals);
    }
    if (a < b) [a, b] = [b, a];
    result.push({
      type: 'decimal',
      formula: `${a}-${b}`,
      decimals: forceColumn ? 2 : decimals,
    });
  }
  return shuffle(result).slice(0, amount);
};

const createDecimalMulFormula = (config) => {
  const { decimals, min, max, intMin, intMax, amount, forceColumn, decimalIntMin, decimalIntMax } = config;
  const result = [];

  for (let i = 0; i < amount * 3; i++) {
    let decimal;
    let decimalPlaces;
    if (forceColumn) {
      // 小数側：整数部 decimalIntMin〜decimalIntMax、小数部1または2桁ランダム
      const intPart = Math.floor(decimalIntMin + Math.random() * (decimalIntMax - decimalIntMin + 1));
      decimalPlaces = Math.random() < 0.5 ? 1 : 2;
      const fracPart = decimalPlaces === 1
        ? Math.floor(1 + Math.random() * 9) / 10
        : Math.floor(10 + Math.random() * 90) / 100;
      decimal = roundDecimal(intPart + fracPart, 2);
    } else {
      decimal = roundDecimal(min + Math.random() * (max - min), decimals);
      decimalPlaces = decimals;
    }
    const integer = Math.floor(intMin + Math.random() * (intMax - intMin + 1));
    result.push({
      type: 'decimal',
      formula: `${decimal}*${integer}`,
      decimals: decimalPlaces,
    });
  }
  return shuffle(result).slice(0, amount);
};

const createDecimalDivFormula = (config) => {
  const { decimals, min, max, amount, forceColumn } = config;
  const result = [];

  if (forceColumn) {
    // 筆算強制：被除数を2桁以上の小数（整数部1-2桁＋小数1-2桁）、除数を1桁整数2-9、割り切れる
    for (let i = 0; i < amount * 15; i++) {
      const divisor = Math.floor(2 + Math.random() * 8);
      const qDec = Math.random() < 0.5 ? 1 : 2;
      const quotient = qDec === 1
        ? Math.floor(1 + Math.random() * 99) / 10
        : Math.floor(10 + Math.random() * 990) / 100;
      const dividend = roundDecimal(divisor * quotient, qDec);
      if (dividend > 1 && dividend < 100 && dividend !== Math.floor(dividend)) {
        result.push({
          type: 'decimal',
          formula: `${dividend}/${divisor}`,
          decimals: 2,
        });
      }
    }
    return shuffle(result).slice(0, amount);
  }

  // 既存ロジック：割り切れる小数の割り算を生成
  for (let i = 0; i < amount * 5; i++) {
    const divisor = Math.floor(2 + Math.random() * 8); // 2〜9
    const quotient = roundDecimal(min + Math.random() * (max - min), decimals);
    const dividend = roundDecimal(divisor * quotient, decimals + 1);

    if (dividend <= max * 10) {
      result.push({
        type: 'decimal',
        formula: `${dividend}/${divisor}`,
        decimals,
      });
    }
  }
  return shuffle(result).slice(0, amount);
};

// ====================
// 式生成（分数）
// ====================

const createFractionSumFormula = (config) => {
  const { maxDenom, amount } = config;
  const result = [];

  // 同分母の分数の足し算
  for (let denom = 2; denom <= maxDenom; denom++) {
    for (let n1 = 1; n1 < denom; n1++) {
      for (let n2 = 1; n2 < denom; n2++) {
        if (n1 + n2 < denom * 2) {
          result.push({
            type: 'fraction',
            op: '+',
            n1, d1: denom,
            n2, d2: denom,
          });
        }
      }
    }
  }
  return shuffle(result).slice(0, amount);
};

const createFractionSubFormula = (config) => {
  const { maxDenom, amount } = config;
  const result = [];

  // 同分母の分数の引き算
  for (let denom = 2; denom <= maxDenom; denom++) {
    for (let n1 = 2; n1 < denom; n1++) {
      for (let n2 = 1; n2 < n1; n2++) {
        result.push({
          type: 'fraction',
          op: '-',
          n1, d1: denom,
          n2, d2: denom,
        });
      }
    }
  }
  return shuffle(result).slice(0, amount);
};

const createFractionMulFormula = (config) => {
  const { maxDenom, amount } = config;
  const result = [];

  // 分数の掛け算
  for (let d1 = 2; d1 <= maxDenom; d1++) {
    for (let n1 = 1; n1 < d1; n1++) {
      for (let d2 = 2; d2 <= maxDenom; d2++) {
        for (let n2 = 1; n2 < d2; n2++) {
          // 真分数同士の掛け算
          result.push({
            type: 'fraction',
            op: '*',
            n1, d1,
            n2, d2,
          });
        }
      }
    }
  }
  return shuffle(result).slice(0, amount);
};

const createFractionDivFormula = (config) => {
  const { maxDenom, amount } = config;
  const result = [];

  // 分数の割り算
  for (let d1 = 2; d1 <= maxDenom; d1++) {
    for (let n1 = 1; n1 < d1; n1++) {
      for (let d2 = 2; d2 <= maxDenom; d2++) {
        for (let n2 = 1; n2 < d2; n2++) {
          result.push({
            type: 'fraction',
            op: '/',
            n1, d1,
            n2, d2,
          });
        }
      }
    }
  }
  return shuffle(result).slice(0, amount);
};

// ====================
// HTML生成
// ====================

/**
 * 分数のHTML生成
 */
const createFractionHTML = (num, denom) => {
  if (denom === 1) return `<span class="integer">${num}</span>`;
  return `<span class="fraction"><span class="numerator">${num}</span><span class="denominator">${denom}</span></span>`;
};

/**
 * 問題アイテムのHTML生成
 */
const generateQuestionHTML = (item, index) => {
  let displayFormula, answer;

  if (item.type === 'fraction') {
    const { op, n1, d1, n2, d2 } = item;
    displayFormula =
      createFractionHTML(n1, d1) +
      `<span class="operator">${getOperatorDisplay(op)}</span>` +
      createFractionHTML(n2, d2);

    const result = calculateFraction(n1, d1, op, n2, d2);
    answer = createFractionHTML(result.num, result.denom);
  } else {
    displayFormula = `<span>${replaceOperStr(item.formula)}</span>`;
    answer = `<span>${safeEval(item.formula)}</span>`;
  }

  return (
    `<li class="question pl-3" id="question-${index}">` +
    `<span class="formula-container is-size-2 has-text-weight-bold">` +
    `${displayFormula}<span class="equals">＝</span>` +
    `<span id="answer-${index}" class="answer" style="display:none;">${answer}</span>` +
    `</span></li>`
  );
};

/**
 * 問題リストの生成
 */
const generateFormulaList = () => {
  const config = getConfig();
  const { problems, questionMax } = config;
  let formulaList = [];

  // 整数の四則演算
  if (problems.sum.enabled) {
    formulaList.push(...shuffle(createSumFormula(problems.sum.min, problems.sum.max)).slice(0, problems.sum.amount));
  }
  if (problems.sub.enabled) {
    formulaList.push(...shuffle(createSubFormula(problems.sub.min, problems.sub.max)).slice(0, problems.sub.amount));
  }
  if (problems.mul.enabled) {
    formulaList.push(...shuffle(createMulFormula(problems.mul.min, problems.mul.max)).slice(0, problems.mul.amount));
  }
  if (problems.div.enabled) {
    formulaList.push(...shuffle(createDivFormula(problems.div.min, problems.div.max)).slice(0, problems.div.amount));
  }

  // 小数の計算
  if (problems.decimalSum.enabled) {
    formulaList.push(...createDecimalSumFormula(problems.decimalSum));
  }
  if (problems.decimalSub.enabled) {
    formulaList.push(...createDecimalSubFormula(problems.decimalSub));
  }
  if (problems.decimalMul.enabled) {
    formulaList.push(...createDecimalMulFormula(problems.decimalMul));
  }
  if (problems.decimalDiv.enabled) {
    formulaList.push(...createDecimalDivFormula(problems.decimalDiv));
  }

  // 分数の計算
  if (problems.fractionSum.enabled) {
    formulaList.push(...createFractionSumFormula(problems.fractionSum));
  }
  if (problems.fractionSub.enabled) {
    formulaList.push(...createFractionSubFormula(problems.fractionSub));
  }
  if (problems.fractionMul.enabled) {
    formulaList.push(...createFractionMulFormula(problems.fractionMul));
  }
  if (problems.fractionDiv.enabled) {
    formulaList.push(...createFractionDivFormula(problems.fractionDiv));
  }

  // シャッフルして問題数を制限
  formulaList = shuffle(formulaList).slice(0, questionMax);

  return formulaList.map((item, i) => generateQuestionHTML(item, i)).join('\n');
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
      initialSeconds: getConfig().timer,
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
      levelSelect: document.getElementById('levelSelect'),
    };
  }

  init() {
    this.elements.formulaContainer.innerHTML = generateFormulaList();
    this.updateTimerDisplay(this.timer.formatTime());
    this.updateCurrentLine();
    this.updateLevelSelect();
    this.bindEvents();
  }

  updateLevelSelect() {
    if (this.elements.levelSelect) {
      this.elements.levelSelect.value = currentLevel;
    }
  }

  bindEvents() {
    // アクションボタン（START/RETRY トグル）
    this.elements.actionButton.addEventListener('click', () => this.handleActionButton());

    // レベル選択
    if (this.elements.levelSelect) {
      this.elements.levelSelect.addEventListener('change', (e) => this.handleLevelChange(e));
    }

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
      // ボタンやセレクトボックスのクリックは除外
      if (event.target.closest('button') || event.target.closest('select')) return;
      handleAction();
    });
  }

  handleLevelChange(event) {
    const newLevel = parseInt(event.target.value, 10);
    if (LEVEL_CONFIGS[newLevel]) {
      currentLevel = newLevel;
      setLevelToURL(newLevel);
      this.resetForNewLevel();
    }
  }

  resetForNewLevel() {
    // タイマーを新しい設定でリセット
    this.timer = new Timer({
      initialSeconds: getConfig().timer,
      onTick: (time) => this.updateTimerDisplay(time),
      onComplete: () => this.handleTimeUp(),
    });

    // 状態をリセット
    this.currentQuestionIndex = 0;
    this.isStarted = false;

    // UIをリセット
    this.elements.content.classList.add('hide');
    this.elements.content.classList.remove('disabled');
    this.updateActionButton('start');
    this.updateTimerDisplay(this.timer.formatTime());

    // 新しい問題を生成
    this.elements.formulaContainer.innerHTML = generateFormulaList();
    this.updateCurrentLine();
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
    const config = getConfig();
    if (this.currentQuestionIndex >= config.questionMax) return;

    const answerElement = document.getElementById(`answer-${this.currentQuestionIndex}`);
    if (answerElement) {
      answerElement.style.display = 'inline';
    }

    this.currentQuestionIndex++;
    this.updateCurrentLine();

    if (this.currentQuestionIndex >= config.questionMax) {
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
    const config = getConfig();
    setTimeout(() => {
      window.alert(`🎉全${config.questionMax}問完了しました！お疲れさまでした。🎉`);
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
