const board = document.getElementById('board');
const autoplay = document.getElementById('autoplay');
const reset = document.getElementById('reset');
const eatenWhite = document.getElementById('eaten-white');
const eatenBlack = document.getElementById('eaten-black');
const instructions = document.getElementById('instructions');

const addEaten = function(figure) {
  const el = document.createElement('div');
  el.className = 'eaten';
  el.style.backgroundImage = 'url("img/' + figure.team + '-' + figure.name + '.svg")';
  this.appendChild(el);
}

eatenWhite.addEaten = addEaten;
eatenBlack.addEaten = addEaten;

let cells = [];
let record = {
  white: [],
  black: [],
};

let score = 0;

let currentMove = 'white';
let selectedFigure;
let eatenFigures = {
  white: [],
  black: [],
}

let figures = {
  white: [],
  black: [],
}

let end = false;
let isAutoplay = false;

let kingsCell = {
  white: null,
  black: null,
}

let availableMoves = [];

// Get random item of array
const randomItem = array => array[Math.floor(Math.random()*array.length)];
// Wait count of ms
const wait = ms => new Promise(res => setTimeout(() => res(), ms))

const clearBoard = () => {
  for (let i = 64; i--;) {
    cells[i].className = 'cell';
  }
}

const getCell = ({row, col}) => {
  if (row > 8 && row < 1) throw Error('No field ', {row, col});
  if (col > 8 && col < 1) throw Error('No field ', {row, col});
  const index = 8 * (8 - row) + col - 1;
  return cells[index];
}

const setFigure = function(figure, silence = false) {
  this.hasFigure = true;
  figure.row = this.row;
  figure.col = this.col;
  this.figure = figure;
  if (!silence) {
    this.style.backgroundImage = 'url("img/' + figure.team + '-' + figure.name + '.svg")';
  }
  if (figure.name === 'king') {
    kingsCell[figure.team] = this;
  }
}

const addFigure = function(figure, silence = false) {
  this.setFigure(figure, silence);
  figures[figure.team].push(figure);
  if (figure.name === 'king') {
    kingsCell[figure.team] = this;
  }
}

const removeFigure = function(silence = false) {
  this.hasFigure = false;
  this.figure = null;
  if (!silence) {
    this.style.backgroundImage = 'none';
  }
}

const moveFigure = (figure, cell, silence = false) => {
  getCell(figure).removeFigure(silence);
  // Check for pawn transformation
  if (isPawnLastRow(figure, cell) && !silence) {
    let result;
    if (!autoplay) {
      do {
        result = prompt('Who you want for the pawn?\n Variants: (queen, rook, bishop, knight)' );
      } while(!isCorrectTransform(result));
    } else {
      result = 'queen';
    }
    figure.name = result;
  } else if (figure.name === 'king' && !silence) {
    // check castling
    if (cell.col === figure.col + 2) {
      const rookCell = getCell({row: figure.row, col: 8});
      const rook = rookCell.figure;
      rookCell.removeFigure();
      getCell({row: figure.row, col: 6}).setFigure(rook);
    } else if (cell.col === figure.col - 2) {
      const rookCell = getCell({row: figure.row, col: 1});
      const rook = rookCell.figure;
      rookCell.removeFigure();
      getCell({row: figure.row, col: 4}).setFigure(rook);
    }
  }
  if (!silence) {
    figure.isMoved = true;
  }
  cell.setFigure(figure, silence);
}

const eatFigure = (figure, cell, silence = false) => {
  figures[cell.figure.team].splice(figures[cell.figure.team].findIndex(figure => figure === cell.figure), 1);
  if (!silence) {
    eatenFigures[figure.team].push(cell.figure);
    if (figure.team === 'white') {
      eatenWhite.addEaten(cell.figure);
    } else if (figure.team === 'black') {
      eatenBlack.addEaten(cell.figure);
    }
  }
  moveFigure(figure, cell, silence);
}

const isCorrectTransform = (figure) => ['queen', 'bishop', 'knight', 'rook'].includes(figure);

const isPawnLastRow = (figure, cell) => {
  return figure.name === 'pawn' &&
    ((figure.team === 'black' && cell.row === 1) ||
    (figure.team ==='white' && cell.row === 8));
}
/**
 * Here is all moves functions
 */
const getRookMoves = (figure) => {
  const els = [];
  for (let col = figure.col + 1, row = figure.row; col <= 8; col++) {
    const el = getCell({row, col});
    if (el.hasFigure) {
      if (el.figure.team !== figure.team) {
        els.push(el);
      }
      break;
    }
    els.push(el);
  }
  for (let col = figure.col - 1, row = figure.row; col > 0; col--) {
    const el = getCell({row, col});
    if (el.hasFigure) {
      if (el.figure.team !== figure.team) {
        els.push(el);
      }
      break;
    }
    els.push(el);
  }
  for (let col = figure.col, row = figure.row + 1; row <= 8; row++) {
    const el = getCell({row, col});
    if (el.hasFigure) {
      if (el.figure.team !== figure.team) {
        els.push(el);
      }
      break;
    }
    els.push(el);
  }
  for (let col = figure.col, row = figure.row - 1; row > 0; row--) {
    const el = getCell({row, col});
    if (el.hasFigure) {
      if (el.figure.team !== figure.team) {
        els.push(el);
      }
      break;
    }
    els.push(el);
  }
  return els;
}

const getBishopMoves = (figure) => {
  const els = [];
  for (let col = figure.col + 1, row = figure.row + 1; col <= 8 && row <=8; col++ && row++) {
    const el = getCell({row, col});
    if (el.hasFigure) {
      if (el.figure.team !== figure.team) {
        els.push(el);
      }
      break;
    }
    els.push(el);
  }
  for (let col = figure.col - 1, row = figure.row + 1; col > 0 && row <=8; col-- && row++) {
    const el = getCell({row, col});
    if (el.hasFigure) {
      if (el.figure.team !== figure.team) {
        els.push(el);
      }
      break;
    }
    els.push(el);
  }
  for (let col = figure.col + 1, row = figure.row - 1; col <= 8 && row >0 ; col++ && row--) {
    const el = getCell({row, col});
    if (el.hasFigure) {
      if (el.figure.team !== figure.team) {
        els.push(el);
      }
      break;
    }
    els.push(el);
  }
  for (let col = figure.col - 1, row = figure.row - 1; col > 0 && row > 0 ; col-- && row--) {
    const el = getCell({row, col});
    if (el.hasFigure) {
      if (el.figure.team !== figure.team) {
        els.push(el);
      }
      break;
    }
    els.push(el);
  }
  return els;
}

const getQueenMoves = (figure) => {
  return [...getRookMoves(figure), ...getBishopMoves(figure)];
}

const getKingMoves = (figure, eats) => {
  return cells.filter(el =>
    (!el.hasFigure || el.figure.team !== figure.team) &&
    (
      (el.col === figure.col + 1 && el.row === figure.row) ||
      (el.col === figure.col && el.row === figure.row + 1) ||
      (el.col === figure.col + 1 && el.row === figure.row + 1) ||
      (el.col === figure.col - 1 && el.row === figure.row) ||
      (el.col === figure.col && el.row === figure.row - 1) ||
      (el.col === figure.col - 1 && el.row === figure.row - 1) ||
      (el.col === figure.col + 1 && el.row === figure.row - 1) ||
      (el.col === figure.col - 1 && el.row === figure.row + 1) ||
      (!eats && checkCastling(figure, el))
    )
  );
}

const inDanger = (cell, team) => {
  return getAllEats(getAnotherTeam(team)).includes(cell);
}

const checkCastling = (figure, el) => {
  // King didn't move
  // Rook didn't move
  // All fields between king and rook are free
  // All fields between start and end of the king move is not in danger

  if (figure.isMoved) return false;

  if (el.col === figure.col + 2 && el.row === figure.row) {
    // short castling
    const rookField = getCell({row: figure.row, col: figure.col + 3});

    // there is our rook and it didn't move yet
    if (!rookField.hasFigure ||
      rookField.figure.name !== 'rook' ||
      rookField.figure.team !== figure.team ||
      rookField.figure.isMoved)
      return false;

    const right1Cell = getCell({row: figure.row, col: figure.col + 1});
    const right2Cell = getCell({row: figure.row, col: figure.col + 2});

    // Fields between king and rook are free and not in danger
    if (right1Cell.hasFigure || right2Cell.hasFigure)
      return false;

    const inDanger = getAllEats(getAnotherTeam(figure.team));

    if (inDanger.includes(right1Cell) || inDanger.includes(right1Cell) || inDanger.includes(kingsCell[figure.team]))
      return false;

    return true;

  } else if (el.col === figure.col - 2 && el.row === figure.row) {
    // short castling
    const rookField = getCell({row: figure.row, col: figure.col - 4});

    // there is our rook and it didn't move yet
    if (!rookField.hasFigure ||
      rookField.figure.name !== 'rook' ||
      rookField.figure.team !== figure.team ||
      rookField.figure.isMoved)
      return false;

    const left1Cell = getCell({row: figure.row, col: figure.col - 1});
    const left2Cell = getCell({row: figure.row, col: figure.col - 2});
    const left3Cell = getCell({row: figure.row, col: figure.col - 3});

    // Fields between king and rook are free and not in danger
    if (left1Cell.hasFigure ||
      left2Cell.hasFigure ||
      left3Cell.hasFigure)
        return false;

    const inDanger = getAllEats(getAnotherTeam(figure.team));

    if (inDanger.includes(left1Cell) || inDanger.includes(left2Cell) || inDanger.includes(kingsCell[figure.team]))
      return false;

    return true;
  }
  return false;
}

const getKnightMoves = (figure) => {
  return cells.filter(el =>
    !(el.hasFigure && el.figure.team === figure.team) &&
    ((el.row === figure.row + 2 && el.col === figure.col + 1) ||
    (el.row === figure.row + 2 && el.col === figure.col -1) ||
    (el.row === figure.row + 1 && el.col === figure.col + 2) ||
    (el.row === figure.row + 1 && el.col === figure.col - 2) ||
    (el.row === figure.row - 2 && el.col === figure.col + 1) ||
    (el.row === figure.row - 2 && el.col === figure.col -1) ||
    (el.row === figure.row - 1 && el.col === figure.col + 2) ||
    (el.row === figure.row - 1 && el.col === figure.col - 2))
  )
}

const getPawnMoves = (figure, eats) => {
  if (figure.team === 'white') {
    return cells.filter(el =>
      // 1 step
      (!eats && !el.hasFigure && el.row === figure.row+1 && el.col === figure.col) ||
      // 2 steps on first line
      (!eats && figure.row === 2 && !el.hasFigure &&
      !getCell({row: figure.row + 1, col: figure.col}).hasFigure &&
      el.row === figure.row+2 && el.col === figure.col) ||
      // eat
      (el.hasFigure && el.figure.team !== figure.team &&
      el.row === figure.row+1 && (el.col === figure.col+1 || el.col === figure.col-1))
    )
  } else if (figure.team === 'black') {
    return cells.filter(el =>
      // 1 step
      (!eats && !el.hasFigure && el.row === figure.row-1 && el.col === figure.col) ||
      // 2 steps on first line
      (!eats && figure.row === 7 && !el.hasFigure &&
      !getCell({row: figure.row - 1, col: figure.col}).hasFigure &&
      el.row === figure.row-2 && el.col === figure.col) ||
      // eat
      (el.hasFigure && el.figure.team !== figure.team &&
      el.row === figure.row-1 && (el.col === figure.col+1 || el.col === figure.col-1))
    )
  }
}

/**
 * Moves functions end
 */

const getMoves = (figure, check, eats) => {
  // debugger;
  let moves = [];
  if (figure.name === 'pawn') {
    moves = getPawnMoves(figure, eats);
  } else if (figure.name === 'rook') {
    moves = getRookMoves(figure);
  } else if (figure.name === 'knight') {
    moves = getKnightMoves(figure);
  } else if (figure.name === 'bishop') {
    moves = getBishopMoves(figure);
  } else if (figure.name === 'queen') {
    moves = getQueenMoves(figure);
  } else if (figure.name === 'king') {
    moves = getKingMoves(figure, eats);
  }

  // Check check
  if (check) {
    // debugger;
    moves = moves.filter(move => {
      if (willBeCheck(figure, move)) {
        return false;
      }
      return true;
    });
  }

  return moves;
}

const willBeCheck = (figure, move) => {
  const fromCell = getCell(figure);
  let eatenFigure;
  if (move.hasFigure) {
    eatenFigure = move.figure;
  }
  fromCell.removeFigure(true);
  if (eatenFigure) {
    eatFigure(figure, move, true);
  } else {
    moveFigure(figure, move, true);
  }

  // Check
  const result = isCheck(figure.team);

  moveFigure(figure, fromCell, true);

  if (eatenFigure) {
    move.addFigure(eatenFigure, true);
  } else {
    move.removeFigure(true);
  }
  return result;
}

const showMoves = (figure) => {
  availableMoves = getMoves(figure, true);
  console.log(availableMoves);
  availableMoves.forEach(el => el.classList.add('marked'));
}

function removeDuplicates(array) {
  const newArray = [];
  for (let i = array.length; i--;) {
    if (!newArray.includes(array[i])) {
      newArray.push(array[i]);
    }
  }
  return newArray;
 }

const getAllEats = (team) => {
  let eats = [];

  figures[team].forEach(figure => {
    eats = eats.concat(getEats(figure));
  });

  eats = removeDuplicates(eats);

  return eats;
  // console.log('getAllEats');
  // return figures[team].reduce((prev, figure) => {
  //   return prev.concat(getEats(figure));
  // }, []);
};

const getAllMoves = (team, check) => {
  console.log('getAllMoves', figures);
  return figures[team].reduce((prev, figure) => {
    return prev.concat(getMoves(figure, check));
  }, []);
}

const getEats = (figure) => {
  // debugger;
  let moves = getMoves(figure, false, true);
  if (figure.name === 'pawn') {
    moves = moves.filter(move => figure.col !== move.col);
    cells.forEach(el => {
      if (figure.team === 'white' &&
          (!el.hasFigure || el.figure.team === 'black') &&
          el.row === figure.row+1 && (el.col === figure.col+1 || el.col === figure.col-1)
        ) {
        moves.push(el);
      } else if (figure.team === 'black' &&
          (!el.hasFigure || el.figure.team === 'white') &&
          el.row === figure.row-1 && (el.col === figure.col+1 || el.col === figure.col-1)
        ) {
        moves.push(el);
      }
    });
  }
  // console.log(moves);
  return moves;
}

const onclick = function(ev) {
  console.log('click');
  if (this.hasFigure && this.figure.team === currentMove) {
    clearBoard();
    availableMoves = [];
    selectedFigure = this.figure;
    console.log(this.figure);
    showMoves(this.figure);
    this.classList.add('selected');
  } else {
    if (selectedFigure && availableMoves.includes(this)) {
      console.log(
         selectedFigure.name,
        `${getColName(selectedFigure.col)}${selectedFigure.row}:${getColName(this.col)}${this.row}`
      );
      record[currentMove].push(`${selectedFigure.name}:${getColName(selectedFigure.col)}${selectedFigure.row}:${getColName(this.col)}${this.row}`);

      if (this.hasFigure) {
        eatFigure(selectedFigure, this);
      } else {
        moveFigure(selectedFigure, this);
      }
      currentMove = currentMove === 'white' ? 'black' : 'white';
      clearBoard();
      availableMoves = [];

      if (!getAllMoves(currentMove, true).length) {
        // No moves
        if (isCheck(currentMove)) {
          alert(`Checkmate, ${getAnotherTeam(currentMove)} win!`);

        } else {
          alert(`Pat, it's draw!`)
        }
        end = true;
        reset.hidden = false;
        autoplay.hidden = true;
      }
      if (isCheck(currentMove)) {
        console.log('check');
        kingsCell[currentMove].classList.add('danger');
      }
    }
  }
}

const getAllAvailableToMove = (team, check = true) => {
  return figures[team].filter(el => getMoves(el, check).length)
}

const runBots = async () => {
  isAutoplay = true;
  while (!end) {
    const speed = 1;
    const figures = getAllAvailableToMove(currentMove);
    await wait(500 / speed);
    const figure = randomItem(figures);
    const cell = getCell(figure);
    cell.click();
    await wait(500 / speed);
    const move = randomItem(availableMoves);
    move.click();
  }
}

const isCheck = team => getAllEats(getAnotherTeam(team)).includes(kingsCell[team])

const getAnotherTeam = team => team === 'white' ? 'black' : 'white';

const getColName = num => {
  if (num === 1) return 'A';
  if (num === 2) return 'B';
  if (num === 3) return 'C';
  if (num === 4) return 'D';
  if (num === 5) return 'E';
  if (num === 6) return 'F';
  if (num === 7) return 'G';
  if (num === 8) return 'H';
}

const getColNum = letter => {
  if (letter === 'A') return 1;
  if (letter === 'B') return 2;
  if (letter === 'C') return 3;
  if (letter === 'D') return 4;
  if (letter === 'E') return 5;
  if (letter === 'F') return 6;
  if (letter === 'G') return 7;
  if (letter === 'H') return 8;
}

const getCellByName = cell => {
  if (cell.length > 2) return null;
  const row = +cell[1];
  if (row < 0 || row > 8) return null;
  const col = getColNum(cell[0]);
  if (row && col) {
    return getCell({row, col});
  }
}

reset.onclick = function() {
  cells = [];
  record = [];
  currentMove = 'white';
  selectedFigure = null;
  eatenFigures = {
    white: [],
    black: [],
  }
  figures = {
    white: [],
    black: [],
  }
  end = false;
  isAutoplay = false;
  kingsCell = {
    white: null,
    black: null,
  }
  availableMoves = [];
  board.innerHTML = '';
  eatenWhite.innerHTML = '';
  eatenBlack.innerHTML = '';
  init();
  reset.hidden = true;
  autoplay.hidden = false;
}

const init = function() {
  for (var i = 0; i < 64; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const row = 8 - Math.floor(i / 8);
    const col = i % 8 + 1;
    cell.row = row;
    cell.col = col;
    cell.setAttribute('data-row', row);
    cell.setAttribute('data-col', col);
    cell.innerText = `${getColName(col)}${row}`;
    cell.setFigure = setFigure;
    cell.addFigure = addFigure;
    cell.removeFigure = removeFigure;
    cell.onclick = onclick;
    // Set pawns
    if (row === 2) {
      cell.addFigure({team: 'white', name: 'pawn'})
    } else if (row === 7) {
      cell.addFigure({team: 'black', name: 'pawn'})
    } else if (row === 1) {
      if (col === 1 || col === 8) {
        cell.addFigure({team: 'white', name: 'rook'})
      }
      if (col === 2 || col === 7) {
        cell.addFigure({team: 'white', name: 'knight'})
      }
      if (col === 3 || col === 6) {
        cell.addFigure({team: 'white', name: 'bishop'})
      }
      if (col === 4) {
        cell.addFigure({team: 'white', name: 'queen'})
      }
      if (col === 5) {
        cell.addFigure({team: 'white', name: 'king'})
      }
    } else if (row === 8) {
      if (col === 1 || col === 8) {
        cell.addFigure({team: 'black', name: 'rook'})
      }
      if (col === 2 || col === 7) {
        cell.addFigure({team: 'black', name: 'knight'})
      }
      if (col === 3 || col === 6) {
        cell.addFigure({team: 'black', name: 'bishop'})
      }
      if (col === 4) {
        cell.addFigure({team: 'black', name: 'queen'})
      }
      if (col === 5) {
        cell.addFigure({team: 'black', name: 'king'})
      }
    }
    cells.push(cell);
    board.appendChild(cell);
  }
}

autoplay.onclick = runBots;

console.time('init');
init(); // always in the end
console.timeEnd('init');
