(function () {
  const KEY = 'kanban-board:v1';
  const COLUMNS = [['todo', 'To do'], ['doing', 'In progress'], ['done', 'Done']];
  const SEED = { todo: ['Design landing page', 'Write README'], doing: ['Build drag & drop'], done: [] };

  let state = load();
  const board = document.getElementById('board');

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(SEED); }
    catch { return structuredClone(SEED); }
  }
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));

  function move(fromCol, index, toCol) {
    const [task] = state[fromCol].splice(index, 1);
    state[toCol].push(task);
    save(); render();
  }

  function render() {
    board.innerHTML = '';
    for (const [id, label] of COLUMNS) {
      const col = document.createElement('section');
      col.className = 'column';
      col.innerHTML = `<h2>${label}<span>${state[id].length}</span></h2><div class="cards"></div>`;
      const cards = col.querySelector('.cards');

      state[id].forEach((text, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        const span = document.createElement('span');
        span.textContent = text;
        const del = document.createElement('button');
        del.textContent = '×';
        del.setAttribute('aria-label', `Delete ${text}`);
        del.onclick = () => { state[id].splice(i, 1); save(); render(); };
        card.append(span, del);
        card.ondragstart = (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({ from: id, index: i }));
          card.classList.add('dragging');
        };
        card.ondragend = () => card.classList.remove('dragging');
        cards.appendChild(card);
      });

      col.ondragover = (e) => { e.preventDefault(); col.classList.add('over'); };
      col.ondragleave = () => col.classList.remove('over');
      col.ondrop = (e) => {
        e.preventDefault();
        col.classList.remove('over');
        try {
          const { from, index } = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (from !== id) move(from, index, id);
        } catch { /* ignore foreign drops */ }
      };

      const form = document.createElement('form');
      form.innerHTML = '<input placeholder="Add a task…" aria-label="New task" required><button>Add</button>';
      form.onsubmit = (e) => {
        e.preventDefault();
        const input = form.querySelector('input');
        const text = input.value.trim();
        if (!text) return;
        state[id].push(text);
        save(); render();
      };
      col.appendChild(form);
      board.appendChild(col);
    }
  }

  document.getElementById('reset').onclick = () => {
    if (confirm('Reset the board?')) { state = structuredClone(SEED); save(); render(); }
  };
  render();
})();
