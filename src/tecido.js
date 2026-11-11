import { tela, ponteiro, cor } from './base.js';

/* Tecido: malha de pontos ligados por segmentos de comprimento fixo, presa no topo.
   Integração de Verlet: a velocidade não é guardada, ela é a diferença entre a posição
   atual e a anterior. Depois de mover os pontos, cada ligação é corrigida algumas vezes
   para voltar ao comprimento original; mais repetições = tecido mais rígido. */
export default {
  nome: 'Tecido',
  tec: 'Integração de Verlet · canvas 2D',
  dica: 'empurre; arraste para rasgar',
  params: [
    ['grav', 'Gravidade', 0, 0.8, 0.02, 0.3],
    ['rig', 'Rigidez', 1, 6, 1, 3],
    ['malha', 'Malha', 10, 26, 1, 18],
  ],

  cria(palco, P) {
    const T = tela(palco);
    const m = ponteiro(palco);
    let pts = [];
    let lig = [];

    const monta = () => {
      const { W, H } = T;
      const nx = P.malha;
      const ny = Math.round(P.malha * 0.6);
      const esp = Math.min((W * 0.8) / nx, (H * 0.75) / ny);
      const x0 = (W - esp * nx) / 2;
      const y0 = H * 0.08;

      pts = [];
      lig = [];
      for (let y = 0; y <= ny; y++) {
        for (let x = 0; x <= nx; x++) {
          const px = x0 + x * esp;
          const py = y0 + y * esp;
          /* na primeira linha, um ponto sim e um não fica fixo: são os alfinetes */
          pts.push({ x: px, y: py, ox: px, oy: py, fixo: y === 0 && x % 2 === 0 });
        }
      }

      const id = (x, y) => y * (nx + 1) + x;
      for (let y = 0; y <= ny; y++) {
        for (let x = 0; x <= nx; x++) {
          if (x < nx) lig.push([id(x, y), id(x + 1, y), esp]);
          if (y < ny) lig.push([id(x, y), id(x, y + 1), esp]);
        }
      }
    };
    monta();

    return {
      reinicia: monta,
      mudou: monta,
      medir: monta,

      passo() {
        const { g, W, H } = T;

        /* 1. move cada ponto pela inércia e pela gravidade */
        for (const p of pts) {
          if (p.fixo) continue;
          const vx = (p.x - p.ox) * 0.985;
          const vy = (p.y - p.oy) * 0.985;
          p.ox = p.x;
          p.oy = p.y;
          p.x += vx;
          p.y += vy + P.grav;

          /* o cursor empurra os pontos a menos de 40 px */
          if (m.dentro) {
            const dx = p.x - m.x;
            const dy = p.y - m.y;
            const d = Math.hypot(dx, dy);
            if (d < 40 && d > 0) {
              p.x += (dx / d) * (40 - d) * 0.3;
              p.y += (dy / d) * (40 - d) * 0.3;
            }
          }

          p.x = Math.max(0, Math.min(W, p.x));
          p.y = Math.max(0, Math.min(H, p.y));
        }

        /* 2. corrige as ligações; percorre de trás para frente porque algumas são removidas */
        for (let k = 0; k < P.rig; k++) {
          for (let j = lig.length - 1; j >= 0; j--) {
            const [a, b, L] = lig[j];
            const A = pts[a];
            const B = pts[b];
            const dx = B.x - A.x;
            const dy = B.y - A.y;
            const d = Math.hypot(dx, dy) || 1;

            /* rasga: com o botão pressionado sobre a ligação, ou quando ela estica demais */
            const noCursor = Math.abs((A.x + B.x) / 2 - m.x) < 10 && Math.abs((A.y + B.y) / 2 - m.y) < 10;
            if ((m.baixo && noCursor) || d > L * 4) {
              lig.splice(j, 1);
              continue;
            }

            const dif = (d - L) / d / 2;
            if (!A.fixo) {
              A.x += dx * dif;
              A.y += dy * dif;
            }
            if (!B.fixo) {
              B.x -= dx * dif;
              B.y -= dy * dif;
            }
          }
        }

        /* 3. desenha as ligações e os alfinetes */
        g.clearRect(0, 0, W, H);
        g.strokeStyle = cor(palco, '--fg');
        g.globalAlpha = 0.75;
        g.lineWidth = 1;
        g.beginPath();
        for (const [a, b] of lig) {
          g.moveTo(pts[a].x, pts[a].y);
          g.lineTo(pts[b].x, pts[b].y);
        }
        g.stroke();
        g.globalAlpha = 1;

        g.fillStyle = cor(palco, '--ac');
        for (const p of pts) if (p.fixo) g.fillRect(p.x - 3, p.y - 3, 6, 6);
      },
    };
  },
};
