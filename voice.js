const recognition = new webkitSpeechRecognition();
recognition.continuous = true;

const startRecord = () => {
  instructions.className = '';
  instructions.textContent = 'Voice record';
  instructions.classList.add('success');
}

const stopRecord = () => {
  instructions.className = '';
  instructions.textContent = 'Voice recording stopped';
  instructions.classList.add('danger');
}

const writeText = event => {
  let text = (event.results[event.resultIndex][0].transcript);
  instructions.textContent = text;
  text = text.replace(/\s/g, '').toUpperCase();
  console.log(text);
  const figure = text.slice(0, 2);
  console.log(figure, figure.length);
  const figureCell = getCellByName(figure);
  console.log(figureCell);
  if (figureCell) {
    figureCell.click();
    instructions.className = 'success';
    if (selectedFigure) {
      let move = text.slice(2, 4);
      if (move.length === 1) {
        move = figure[0] + move;
      }
      console.log(move, move.length);
      const moveCell = getCellByName(move);
      console.log(moveCell);
      if (moveCell) moveCell.click();
    }
  } else {
    instructions.className = 'error';
  }

}

recognition.onstart = startRecord

recognition.onerror = stopRecord

recognition.onresult = writeText

document.addEventListener('keyup', ev => {
  if (ev.key === 'r') {
    recognition.start();
  } else if (ev.key === 's') {
    recognition.abort();
  }
});