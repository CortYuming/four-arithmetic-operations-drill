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

const createSumFormula = (min, max) => {
  const formula = [];
  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      formula.push(`${i}+${j}`);
    }
  }
  return formula;
}

const generateFormulaList = () => {
  const formulaList = createSumFormula(1, 30).slice(0, 100);
  let lines = []

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
