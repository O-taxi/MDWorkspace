const cells = document.querySelectorAll('.cell');
let currentPlayer = 'X';
let gameOver = false;

function checkWin() {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (cells[a].textContent === currentPlayer &&
        cells[b].textContent === currentPlayer &&
        cells[c].textContent === currentPlayer) {
      return true;
    }
  }

  return false;
}

function handleCellClick(e) {
  if (e.target.textContent === '' && !gameOver) {
    e.target.textContent = currentPlayer;

    if (checkWin()) {
      alert(`Player ${currentPlayer} wins!`);
      gameOver = true;
    } else if ([...cells].every(cell => cell.textContent !== '')) {
      alert("It's a tie!");
      gameOver = true;
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
  }
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));

function resetBoard() {
    cells.forEach(cell => cell.textContent = '');
    currentPlayer = 'X';
    gameOver = false;
  }
  
function handleCellClick(e) {
    if (e.target.textContent === '' && !gameOver) {
      e.target.textContent = currentPlayer;
  
      if (checkWin()) {
        alert(`Player ${currentPlayer} wins!`);
        gameOver = true;
      } else if ([...cells].every(cell => cell.textContent !== '')) {
        alert("It's a tie!");
        gameOver = true;
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      }
    }
  }
  
// リセットボタンにイベントリスナーを追加
document.getElementById('resetButton').addEventListener('click', resetBoard);