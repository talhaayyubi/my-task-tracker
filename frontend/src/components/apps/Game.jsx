import { useState } from 'react'

const SIZE = 8
const MINES = 10

const createBoard = () => {
  const board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  })))
  let placed = 0
  while (placed < MINES) {
    const x = Math.floor(Math.random() * SIZE)
    const y = Math.floor(Math.random() * SIZE)
    if (!board[y][x].mine) {
      board[y][x].mine = true
      placed += 1
    }
  }
  const dirs = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ]
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (board[y][x].mine) continue
      let count = 0
      dirs.forEach(([dx, dy]) => {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && board[ny][nx].mine) {
          count += 1
        }
      })
      board[y][x].adjacent = count
    }
  }
  return board
}

const cloneBoard = (board) => board.map((row) => row.map((cell) => ({ ...cell })))

const Game = () => {
  const [board, setBoard] = useState(createBoard)
  const [status, setStatus] = useState('playing')

  const revealZeros = (grid, x, y) => {
    const queue = [[x, y]]
    while (queue.length) {
      const [cx, cy] = queue.shift()
      const cell = grid[cy][cx]
      if (cell.revealed || cell.flagged) continue
      cell.revealed = true
      if (cell.adjacent === 0) {
        for (let dx = -1; dx <= 1; dx += 1) {
          for (let dy = -1; dy <= 1; dy += 1) {
            const nx = cx + dx
            const ny = cy + dy
            if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
              queue.push([nx, ny])
            }
          }
        }
      }
    }
  }

  const handleReveal = (x, y) => {
    if (status !== 'playing') return
    setBoard((prev) => {
      const next = cloneBoard(prev)
      const cell = next[y][x]
      if (cell.flagged || cell.revealed) return prev
      if (cell.mine) {
        cell.revealed = true
        setStatus('lost')
        return next
      }
      if (cell.adjacent === 0) {
        revealZeros(next, x, y)
      } else {
        cell.revealed = true
      }
      const remaining = next.flat().filter((c) => !c.mine && !c.revealed)
      if (remaining.length === 0) {
        setStatus('won')
      }
      return next
    })
  }

  const handleFlag = (event, x, y) => {
    event.preventDefault()
    if (status !== 'playing') return
    setBoard((prev) => {
      const next = cloneBoard(prev)
      const cell = next[y][x]
      if (cell.revealed) return prev
      cell.flagged = !cell.flagged
      return next
    })
  }

  const reset = () => {
    setBoard(createBoard())
    setStatus('playing')
  }

  return (
    <div className="minesweeper">
      <div className="minesweeper-header">
        <span>Status: {status}</span>
        <button className="accent" onClick={reset}>
          Restart
        </button>
      </div>
      <div className="minesweeper-grid">
        {board.map((row, y) => (
          <div key={y} className="minesweeper-row">
            {row.map((cell, x) => (
              <button
                key={`${x}-${y}`}
                className={`minesweeper-cell ${cell.revealed ? 'revealed' : ''} ${cell.flagged ? 'flagged' : ''}`}
                onClick={() => handleReveal(x, y)}
                onContextMenu={(event) => handleFlag(event, x, y)}
              >
                {cell.revealed ? (cell.mine ? '💣' : cell.adjacent || '') : cell.flagged ? '🚩' : ''}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Game
