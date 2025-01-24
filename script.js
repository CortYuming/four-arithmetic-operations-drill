document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    alert('keydown:space!!!')
    
  }
});

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
  const sums = new Set();
  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      sums.add(`${i}-${j}`);
    }
  }
  return Array.from(sums).sort((a, b) => a - b);
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
    lines.push(`<li class="question" onclick="displayAnswer('answer${i}')"><span class="is-size-2 has-text-weight-bold">${replaceOperStr(f)}=<span id="answer${i}" style="display:none;">${eval(f)}</span></span></li>`)
  })
  return lines.join('\n')
}

const main = () => {
  document.getElementById('formula').innerHTML = generateFormulaList()
}

window.onload = function () {
  main()
}
