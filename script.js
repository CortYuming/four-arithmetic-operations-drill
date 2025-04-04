const replaceOperStr = (formula) => {
  formula = formula.replace('+', '＋')
  formula = formula.replace('-', '－')
  formula = formula.replace('*', '×')
  formula = formula.replace('/', '÷')
  return formula
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
    for (let j = min + 1; j <= max; j++) {
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

const generateFormulaList = () => {
  const MIN = 1
  const MAX = 30
  let formulaList = []
  let lines = []

  const amount = 34
  const sumFormulaList =shuffle(createSumFormula(MIN, MAX)).slice(0, amount)
  const subFormulaList = createSubFormula(MIN, MAX).slice(0, amount)
  const kukuAmount = amount/3*2
  const divAmount = amount - kukuAmount
  const kukuFormula = shuffle(createKukuFormula(2, 10)).slice(0, kukuAmount)
  const divFormulaList = shuffle(createDivFormula(2, 81)).slice(0, divAmount)
  formulaList = sumFormulaList.concat(subFormulaList).concat(kukuFormula).concat(divFormulaList)
  formulaList = shuffle(formulaList)
  formulaList = formulaList.slice(0, 100);

  formulaList.forEach((f, i) => {
    lines.push(`<li class="question pl-3"><span class="is-size-2 has-text-weight-bold">${replaceOperStr(f)}=<span id="answer${i}" class="answer" style="display:none;">${eval(f)}</span></span></li>`)
  })
  return lines.join('\n')
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


const main = () => {
  let clickCount = 0

  document.getElementById('formula').innerHTML = generateFormulaList()
  countdownTimer();

  document.addEventListener('keydown', (event) => {
    const startButton = document.getElementById('startButton');
    const isHide = document.querySelector('.content')?.classList.contains('hide');

    if (event.code === 'Enter') {
      if (!startButton.disabled && isHide) {
        document.getElementById('startButton').click();
      } else if (startButton.disabled) {
        displayAnswer(`answer${clickCount}`)
        clickCount++
        updateCurrentLine()
      }
    }
  });
}

window.onload = function () {
  main()
  updateCurrentLine()
}
