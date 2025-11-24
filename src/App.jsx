import { useState } from 'react'
import './App.css'

function App() {
  const [display, setDisplay] = useState('0') // Lo que se ve en pantalla
  const [previousValue, setPreviousValue] = useState(null) // El número anterior guardado
  const [operator, setOperator] = useState(null) // La operación pendiente
  const [waitingForNewValue, setWaitingForNewValue] = useState(false) // Bandera para saber si limpiar pantalla al escribir

  // Función al presionar un número (0-9)
  const handleNumberClick = (num) => {
    if (waitingForNewValue) {
      setDisplay(num.toString())
      setWaitingForNewValue(false)
    } else {
      // Si es 0 y presionan 0, no hacer nada, si no concatenar
      setDisplay(display === '0' ? num.toString() : display + num)
    }
  }

  // Función al presionar operador (+ - * /)
  const handleOperatorClick = (op) => {
    setOperator(op)
    setPreviousValue(display)
    setWaitingForNewValue(true)
  }

  // Función para calcular el resultado (=)
  const handleEqual = () => {
    if (!operator || previousValue === null) return

    const current = parseFloat(display)
    const previous = parseFloat(previousValue)
    let result = 0

    switch (operator) {
      case '+':
        result = previous + current
        break
      case '-':
        result = previous - current
        break
      case '*':
        result = previous * current
        break
      case '/':
        if (current === 0) {
          setDisplay('Error')
          setPreviousValue(null)
          setOperator(null)
          setWaitingForNewValue(true)
          return
        }
        result = previous / current
        break
      default:
        return
    }

    // Mostrar resultado (recortar decimales si es muy largo)
    setDisplay(String(result).length > 10 ? String(result).substring(0, 10) : String(result))
    setPreviousValue(null)
    setOperator(null)
    setWaitingForNewValue(true)
  }

  // Función para borrar (C)
  const handleClear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperator(null)
    setWaitingForNewValue(false)
  }

  return (
    <div className="slime-container">
      <h1 className="slime-title">Slime Calculator</h1>
      
      {/* Pantalla */}
      <div className="display-screen">
        <span className="result-text">{display}</span>
      </div>

      {/* Grilla de botones numérica */}
      <div className="buttons-grid">
        {/* Fila 1 */}
        <button className="slime-btn clear" onClick={handleClear}>C</button>
        <button className="slime-btn op" onClick={() => handleOperatorClick('/')}>÷</button>
        <button className="slime-btn op" onClick={() => handleOperatorClick('*')}>×</button>
        <button className="slime-btn op" onClick={() => handleOperatorClick('-')}>-</button>

        {/* Fila 2 */}
        <button className="slime-btn num" onClick={() => handleNumberClick(7)}>7</button>
        <button className="slime-btn num" onClick={() => handleNumberClick(8)}>8</button>
        <button className="slime-btn num" onClick={() => handleNumberClick(9)}>9</button>
        <button className="slime-btn op plus" onClick={() => handleOperatorClick('+')}>+</button>

        {/* Fila 3 */}
        <button className="slime-btn num" onClick={() => handleNumberClick(4)}>4</button>
        <button className="slime-btn num" onClick={() => handleNumberClick(5)}>5</button>
        <button className="slime-btn num" onClick={() => handleNumberClick(6)}>6</button>
        {/* El + ocupa dos filas visualmente en grid si quisieras, pero aquí lo dejaremos simple */}

        {/* Fila 4 (Reorganización para encajar) */}
        <button className="slime-btn num" onClick={() => handleNumberClick(1)}>1</button>
        <button className="slime-btn num" onClick={() => handleNumberClick(2)}>2</button>
        <button className="slime-btn num" onClick={() => handleNumberClick(3)}>3</button>
        
        {/* Fila 5 (El 0 y el igual) */}
        <button className="slime-btn num zero-btn" onClick={() => handleNumberClick(0)}>0</button>
        <button className="slime-btn equal" onClick={handleEqual}>=</button>
      </div>
    </div>
  )
}

export default App