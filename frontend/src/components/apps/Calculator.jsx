import { useState } from 'react'

const BASIC_BUTTONS = [
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['0', '.', '=', '+'],
]

const SCIENTIFIC_BUTTONS = ['sin', 'cos', 'tan', 'log', '√', 'x²']

const Calculator = () => {
  const [display, setDisplay] = useState('0')
  const [mode, setMode] = useState('basic')
  const [accumulator, setAccumulator] = useState(null)
  const [operator, setOperator] = useState(null)

  const appendDigit = (value) => {
    setDisplay((prev) => (prev === '0' && value !== '.' ? value : prev + value))
  }

  const performOperation = (nextOperator) => {
    const current = parseFloat(display)
    if (accumulator == null) {
      setAccumulator(current)
    } else if (operator) {
      let result = accumulator
      switch (operator) {
        case '+':
          result += current
          break
        case '−':
          result -= current
          break
        case '×':
          result *= current
          break
        case '÷':
          result = current === 0 ? 0 : result / current
          break
        default:
          break
      }
      setAccumulator(result)
      setDisplay(String(result))
    }
    setOperator(nextOperator === '=' ? null : nextOperator)
    if (nextOperator !== '=') {
      setDisplay('0')
    }
  }

  const handleBasicPress = (value) => {
    if (['+', '−', '×', '÷', '='].includes(value)) {
      performOperation(value)
    } else {
      appendDigit(value)
    }
  }

  const handleScientific = (fn) => {
    const current = parseFloat(display)
    let result = current
    switch (fn) {
      case 'sin':
        result = Math.sin((current * Math.PI) / 180)
        break
      case 'cos':
        result = Math.cos((current * Math.PI) / 180)
        break
      case 'tan':
        result = Math.tan((current * Math.PI) / 180)
        break
      case 'log':
        result = Math.log10(current)
        break
      case '√':
        result = Math.sqrt(current)
        break
      case 'x²':
        result = current ** 2
        break
      default:
        break
    }
    setDisplay(String(result))
    setAccumulator(null)
    setOperator(null)
  }

  const clear = () => {
    setDisplay('0')
    setAccumulator(null)
    setOperator(null)
  }

  return (
    <div className="calculator">
      <div className="calculator-display">{display}</div>
      <div className="calculator-controls">
        <button onClick={() => setMode(mode === 'basic' ? 'scientific' : 'basic')} className="accent">
          {mode === 'basic' ? 'Scientific' : 'Basic'}
        </button>
        <button onClick={clear}>AC</button>
      </div>
      {mode === 'scientific' ? (
        <div className="calculator-scientific">
          {SCIENTIFIC_BUTTONS.map((fn) => (
            <button key={fn} onClick={() => handleScientific(fn)}>
              {fn}
            </button>
          ))}
        </div>
      ) : null}
      <div className="calculator-grid">
        {BASIC_BUTTONS.map((row) => (
          <div key={row.join('-')} className="calculator-row">
            {row.map((value) => (
              <button key={value} onClick={() => handleBasicPress(value)}>
                {value}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Calculator
