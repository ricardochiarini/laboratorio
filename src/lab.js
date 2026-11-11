/* Monta um cartão por experimento: palco, cabeçalho, controles ao vivo e reiniciar.
   Cada experimento só roda enquanto está pelo menos 30% visível; com movimento
   reduzido no sistema, mostra um único quadro parado. */
import { reduz } from './base.js';
import pintura from './pintura.js';
import nome from './nome.js';
import elastica from './elastica.js';
import tecido from './tecido.js';
import corda from './corda.js';
import ima from './ima.js';
import embaralha from './embaralha.js';
import gosma from './gosma.js';

const DEMOS = { pintura, nome, elastica, tecido, corda, ima, embaralha, gosma };

/* parâmetros que mudam a estrutura (quantidade de peças) e pedem remontagem */
const ESTRUTURAIS = ['n', 'lado', 'passo', 'malha'];

const grade = document.querySelector('.lab-grade');

Object.entries(DEMOS).forEach(([chave, def], idx) => {
  const num = String(idx + 1).padStart(2, '0');

  const card = document.createElement('article');
  card.className = 'lab-card';
  card.tabIndex = 0;
  card.setAttribute('aria-label', `Experimento ${num}: ${def.nome}`);
  card.innerHTML = `
    <header class="lab-topo"><span class="lab-n">${num}</span><b>${def.nome}</b><span class="lab-tec">${def.tec}</span></header>
    <div class="lab-palco"><span class="lab-dica">${def.dica}</span></div>
    <footer class="lab-pe">
      <div class="lab-ctrl"></div>
      <div class="lab-bts">
        <a href="src/${chave}.js">Ver código</a>
        <button class="lab-rein" type="button">Reiniciar</button>
      </div>
    </footer>`;
  grade.appendChild(card);

  const palco = card.querySelector('.lab-palco');
  /* cada parâmetro é [chave, rótulo, mínimo, máximo, passo, valor inicial] */
  const P = Object.fromEntries(def.params.map(([k, , , , , v]) => [k, v]));
  const inst = def.cria(palco, P);

  const ctrl = card.querySelector('.lab-ctrl');
  def.params.forEach(([k, rot, min, max, step]) => {
    const id = `lab-${idx}-${k}`;
    const linha = document.createElement('label');
    linha.className = 'lab-param';
    linha.htmlFor = id;
    linha.innerHTML = `<span>${rot}</span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${P[k]}"><output>${P[k]}</output>`;

    const inp = linha.querySelector('input');
    const out = linha.querySelector('output');
    inp.addEventListener('input', () => {
      P[k] = parseFloat(inp.value);
      out.textContent = inp.value;
      if (inst.mudou && ESTRUTURAIS.includes(k)) inst.mudou();
    });
    ctrl.appendChild(linha);
  });

  const reinicia = () => {
    if (inst.reinicia) inst.reinicia();
    palco.classList.remove('usado');
  };
  card.querySelector('.lab-rein').addEventListener('click', reinicia);

  /* atalhos com o cartão em foco: R reinicia, [ e ] ajustam o primeiro controle */
  card.addEventListener('keydown', (e) => {
    if (e.target.matches('input')) return;
    if (e.key === 'r' || e.key === 'R') {
      reinicia();
      e.preventDefault();
    }
    const inp = ctrl.querySelector('input');
    if (!inp) return;
    if (e.key === ']' || e.key === '+') {
      inp.stepUp();
      inp.dispatchEvent(new Event('input'));
    }
    if (e.key === '[' || e.key === '-') {
      inp.stepDown();
      inp.dispatchEvent(new Event('input'));
    }
  });

  /* a dica some depois da primeira interação */
  const usa = () => palco.classList.add('usado');
  palco.addEventListener('pointerdown', usa);
  palco.addEventListener('pointermove', usa, { once: true });

  new ResizeObserver(() => {
    if (inst.medir) inst.medir();
  }).observe(palco);

  if (reduz) {
    inst.passo(0.016);
    return;
  }

  let vivo = false;
  let raf = 0;
  let antes = 0;

  const loop = (t) => {
    if (!vivo) return;
    /* dt em segundos, limitado para a simulação não saltar ao voltar de uma aba inativa */
    const dt = Math.min(0.05, (t - antes) / 1000 || 0.016);
    antes = t;
    inst.passo(dt);
    raf = requestAnimationFrame(loop);
  };

  new IntersectionObserver(
    ([e]) => {
      vivo = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (vivo) {
        antes = performance.now();
        raf = requestAnimationFrame(loop);
      }
    },
    { threshold: 0.3 },
  ).observe(palco);
});
