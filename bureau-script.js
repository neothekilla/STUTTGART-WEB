// === BUREAU SCRIPT COMPLET (Chrome FIX) ===

// RÉFÉRENCE DE LA WORKSPACE
const workspace = document.getElementById('workspace');
let zBase = 10;

// === DRAG & DROP FLUIDE ===
function makeDraggable(el, options = {}) {
  const ignoreSelector = options.ignoreSelector || '';
  let pointerId = null;
  let offsetX = 0, offsetY = 0;
  let moved = false;
  let useCapture = !el.querySelector('img'); // 🚨 Pas de pointercapture si image présente

  function onPointerDown(e) {
    // Laisse les liens cliquables
    if (e.target.closest('a')) return;
    if (ignoreSelector && e.target.closest(ignoreSelector)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    pointerId = e.pointerId;
    moved = false;

    const elRect = el.getBoundingClientRect();
    const wsRect = workspace.getBoundingClientRect();

    offsetX = e.clientX - elRect.left;
    offsetY = e.clientY - elRect.top;

    const initialLeft = Math.round(elRect.left - wsRect.left);
    const initialTop  = Math.round(elRect.top - wsRect.top);
    if (!el.style.left) el.style.left = initialLeft + 'px';
    if (!el.style.top)  el.style.top  = initialTop  + 'px';

    // 🚫 Chrome fix : éviter pointer capture sur les cards avec images
    if (useCapture) {
      try { el.setPointerCapture(pointerId); } catch {}
    }

    el.style.transition = 'none';
    el.style.cursor = 'grabbing';
    el.style.zIndex = ++zBase;

    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (pointerId === null || e.pointerId !== pointerId) return;
    e.preventDefault();

    const wsRect = workspace.getBoundingClientRect();
    const newLeft = e.clientX - wsRect.left - offsetX;
    const newTop  = e.clientY - wsRect.top  - offsetY;

    if (!moved) {
      const currLeft = parseFloat(el.style.left || 0);
      const currTop  = parseFloat(el.style.top  || 0);
      if (Math.abs(newLeft - currLeft) > 3 || Math.abs(newTop - currTop) > 3)
        moved = true;
    }

    const maxLeft = Math.max(0, wsRect.width - el.offsetWidth);
    const maxTop  = Math.max(0, wsRect.height - el.offsetHeight);

    el.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
    el.style.top  = Math.max(0, Math.min(newTop, maxTop)) + 'px';
  }

  function onPointerUp(e) {
    // ✅ Chrome fix : toujours libérer avant d’écouter les clics
    try { el.releasePointerCapture(pointerId); } catch {}

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);

    el.style.cursor = 'grab';
    el.style.transition = '';

    el.dataset.wasMoved = moved ? '1' : '0';
    setTimeout(() => { el.dataset.wasMoved = '0'; }, 120);

    pointerId = null;
  }

  el.addEventListener('pointerdown', onPointerDown);
}

// === APPLICATION DU DRAG ===
document.querySelectorAll('.card').forEach(card => {
  const img = card.querySelector('img');
  if (img && img.src && img.src.toLowerCase().endsWith('.png')) {
    makeDraggable(card); // icônes PNG = déplaçables
  } else {
    makeDraggable(card, { ignoreSelector: 'img' }); // photos = clic pour zoom
  }
});
document.querySelectorAll('.tab').forEach(tab => 
  makeDraggable(tab, { ignoreSelector: 'a, .content' })
);

// === AJOUT DE NOTES ===
document.getElementById('addTab').addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'tab';
  div.style.left = '60px';
  div.style.top = '60px';
  div.innerHTML = `
    <div class="title">✎ Nouvelle note ✎</div>
    <div class="content" contenteditable="true">
      Écris ce que tu veux :)...
    </div>
  `;
  workspace.appendChild(div);
  makeDraggable(div, { ignoreSelector: 'a, .content' });
});

// === MODAL IMAGE / ZOOM ===
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalCaption = document.getElementById('modalCaption');

function openImageModal(src, caption) {
  modalImg.src = src;
  modalCaption.textContent = caption || '';
  modal.classList.add('show');
  modalImg.classList.remove('zoomed');
}

function closeImageModal() {
  modal.classList.remove('show');
  modalImg.classList.remove('zoomed');
}

// === GESTION DU CLIC SUR LES IMAGES ===
document.querySelectorAll('.card img').forEach(img => {
  img.addEventListener('click', (e) => {
    const card = img.closest('.card');
    if (card.dataset.wasMoved === '1') return; // pas de zoom après drag

    e.stopPropagation();
    openImageModal(
      img.src,
      (card.querySelector('.caption') || {}).textContent || ''
    );
  });
});

// === GESTION DU MODAL ===
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeImageModal();
});
document.getElementById('closeModal').addEventListener('click', closeImageModal);
modalImg.addEventListener('click', (e) => {
  e.stopPropagation();
  modalImg.classList.toggle('zoomed');
});

// === LIENS DANS NOTES ===
workspace.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  window.open(a.href, '_blank');
});
