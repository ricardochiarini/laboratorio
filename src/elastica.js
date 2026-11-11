/* Tipografia elástica: cada letra é um <span> com escala própria.
   Arrastar define um alvo de escala; uma mola de Hooke (força = rigidez × distância ao alvo)
   leva a escala atual até ele, com amortecimento. As letras vizinhas acompanham em parte. */
export default {
  nome: 'Tipografia elástica',
  tec: 'Mola de Hooke por letra · DOM',
  dica: 'arraste uma letra',
  params: [
    ['rigidez', 'Rigidez', 0.05, 0.4, 0.01, 0.16],
    ['amort', 'Amortecimento', 0.6, 0.95, 0.01, 0.78],
  ],

  cria(palco, P) {
    const box = document.createElement('div');
    box.className = 'elas';
    palco.appendChild(box);

    const txt = 'ELÁSTICO';
    const ls = [...txt].map((ch) => {
      const s = document.createElement('span');
      s.textContent = ch;
      box.appendChild(s);
      /* sx, sy: escala atual · tx, ty: escala alvo · ox: deslocamento alvo · oy: deslocamento atual */
      return { el: s, sx: 1, sy: 1, vx: 0, vy: 0, tx: 1, ty: 1, ox: 0, oy: 0, vox: 0, voy: 0 };
    });

    let ativa = null;
    let x0 = 0;
    let y0 = 0;

    box.addEventListener('pointerdown', (e) => {
      const i = ls.findIndex((l) => l.el === e.target);
      if (i < 0) return;
      ativa = ls[i];
      x0 = e.clientX;
      y0 = e.clientY;
      try {
        box.setPointerCapture(e.pointerId);
      } catch (er) {}
      e.preventDefault();
    });

    addEventListener('pointermove', (e) => {
      if (!ativa) return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      ativa.ty = Math.max(0.4, 1 - dy / 90);
      ativa.tx = Math.max(0.5, 1 + Math.abs(dx) / 160);
      ativa.ox = dx * 0.25;
    });

    const solta = () => {
      if (!ativa) return;
      ls.forEach((l) => {
        l.tx = 1;
        l.ty = 1;
        l.ox = 0;
      });
      ativa = null;
    };
    addEventListener('pointerup', solta);
    addEventListener('pointercancel', solta);

    return {
      reinicia: () =>
        ls.forEach((l) => Object.assign(l, { sx: 1, sy: 1, vx: 0, vy: 0, tx: 1, ty: 1, ox: 0, oy: 0, vox: 0 })),

      passo() {
        ls.forEach((l, i) => {
          /* a letra vizinha acompanha um pouco (a palavra inteira reage) */
          const viz = ativa ? Math.max(0, 1 - Math.abs(ls.indexOf(ativa) - i) / 3) : 0;
          const ty = ativa && l !== ativa ? 1 + (ativa.ty - 1) * viz * 0.5 : l.ty;

          l.vy = (l.vy + (ty - l.sy) * P.rigidez) * P.amort;
          l.sy += l.vy;
          l.vx = (l.vx + (l.tx - l.sx) * P.rigidez) * P.amort;
          l.sx += l.vx;
          l.vox = (l.vox + (l.ox - l.oy) * P.rigidez) * P.amort;
          l.oy += l.vox;

          l.el.style.transform = `translateX(${l.oy}px) scale(${l.sx},${l.sy})`;
        });
      },
    };
  },
};
