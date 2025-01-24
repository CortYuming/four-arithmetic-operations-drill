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

const generateFormulaList = () => {
  const formulaList = [ // TODO: 表示確認用なのであとで差し替える
    '1+1',
    '2+3',
    '4*5',
    '12/6',
  ]
  let lines = []

  formulaList.forEach(f => {
    lines.push(`<li class="question"><span class="is-size-2 has-text-weight-bold">${replaceOperStr(f)}=<span class="answer">${eval(f)}</span></span></li>`)
  })
  return lines.join('\n')
}

const main = () => {
  document.getElementById('formula').innerHTML = generateFormulaList()
}

window.onload = function () {
  main()
}
