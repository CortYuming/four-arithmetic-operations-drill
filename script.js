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
  const formula = [];
  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      formula.push(`${i}+${j}`);
    }
  }
  return formula;
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

const generateFormulaList = () => {
  const MIN = 1
  const MAX = 30
  let formulaList = []
  let lines = []

  const sumFormulaList = createSumFormula(MIN, MAX)
  const subFormulaList = createSubFormula(MIN, MAX)
  formulaList = sumFormulaList.concat(subFormulaList)
  formulaList = shuffle(formulaList)
  formulaList = formulaList.slice(0, 100);

  formulaList.forEach((f, i) => {
    lines.push(`<li class="question pl-3" onclick="displayAnswer('answer${i}')"><span class="is-size-2 has-text-weight-bold">${replaceOperStr(f)}=<span id="answer${i}" class="answer" style="display:none;">${eval(f)}</span></span></li>`)
  })
  return lines.join('\n')
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
  }
}


const main = () => {
  document.getElementById('formula').innerHTML = generateFormulaList()

  let clickCount = 0
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Enter') {
      event.preventDefault(); // Prevent page scrolling
      document.getElementById(`answer${clickCount}`).click();
      clickCount++
      updateCurrentLine()
    }
  });
}

window.onload = function () {
  main()
  updateCurrentLine()
}
