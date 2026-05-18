'use strict';

(function () {
  // Perguntas do quiz (conteúdo confirmado pelo PO — PRD §7.1)
  const QUESTIONS = [
    {
      text: 'Qual é o seu perfil?',
      options: [
        { emoji: '🎒', label: 'Sou aluno',                tag: 'aluno'     },
        { emoji: '📚', label: 'Sou professor ou educador', tag: 'professor'  },
        { emoji: '👨‍👩‍👧', label: 'Sou pai ou responsável',   tag: 'responsavel' },
        { emoji: '🏫', label: 'Represento uma escola',     tag: 'escola'     },
      ],
    },
    {
      text: 'Qual é o seu nível de experiência com tecnologia?',
      options: [
        { emoji: '🌱', label: 'Iniciante — nunca programei', tag: 'iniciante'    },
        { emoji: '⚙️', label: 'Básico — já mexi um pouco',  tag: 'basico'       },
        { emoji: '🚀', label: 'Intermediário ou avançado',   tag: 'intermediario' },
      ],
    },
    {
      text: 'O que você quer alcançar?',
      options: [
        { emoji: '🤖', label: 'Aprender robótica e programação',    tag: 'aprender'   },
        { emoji: '🎓', label: 'Ensinar na minha turma ou escola',   tag: 'ensinar'    },
        { emoji: '💡', label: 'Desenvolver um projeto próprio',     tag: 'desenvolver' },
        { emoji: '🤝', label: 'Fechar parceria com a AMD',          tag: 'parceria'   },
      ],
    },
  ];

  // Mapeamento de perfil → curso recomendado
  const COURSES = {
    'escola':                    { id: 'consultoria',   name: 'Consultoria para Escola',    price: 'R$ 800',    desc: 'Implantamos o projeto de robótica na sua escola do início ao fim, com capacitação de professores e materiais didáticos.' },
    'responsavel':               { id: 'assinatura',    name: 'Assinatura Mensal AMD',      price: 'R$ 47/mês', desc: 'Acompanhe o progresso do seu filho com acesso a todos os materiais, aulas gravadas e relatórios mensais.' },
    'professor+ensinar+basico':  { id: 'pack-planos',   name: 'Pack 5 Planos de Aula',     price: 'R$ 147',    desc: '5 planos de aula completos com passo a passo, objetivos pedagógicos, recursos e avaliações prontos para aplicar.' },
    'professor+ensinar':         { id: 'plano-avulso',  name: 'Plano de Aula Avulso',      price: 'R$ 37',     desc: 'Plano de aula completo para uma turma, com passo a passo e todos os materiais necessários.' },
    'professor+desenvolver':     { id: 'esp8266',       name: 'Curso ESP-8266 na Prática', price: 'R$ 147',    desc: 'Aprenda IoT e conecte seus projetos à internet. Ideal para professores que querem ir além da robótica básica.' },
    'aluno+iniciante+aprender':  { id: 'python',        name: 'Robótica com Python',       price: 'R$ 197',    desc: 'Do zero ao robô! Aprenda Python enquanto constrói robôs reais. Ideal para quem nunca programou.' },
    'aluno+aprender':            { id: 'esp8266',       name: 'Curso ESP-8266 na Prática', price: 'R$ 147',    desc: 'Conecte robôs à internet usando ESP-8266. Para quem já tem noções básicas e quer avançar.' },
    'aluno+desenvolver':         { id: 'raspberry',     name: 'Curso Raspberry Pi Maker',  price: 'R$ 177',    desc: 'Crie projetos avançados com o mini-computador mais popular do mundo. Ideal para makers.' },
    'default':                   { id: 'mentoria',      name: 'Mentoria 1 hora',           price: 'R$ 150',    desc: 'Uma hora individual com o Professor Francenylson para traçar o melhor caminho para seu objetivo.' },
  };

  function getCourse(tags) {
    const has = (t) => tags.includes(t);

    if (has('escola'))       return COURSES['escola'];
    if (has('responsavel'))  return COURSES['responsavel'];

    if (has('professor')) {
      if (has('ensinar') && has('basico')) return COURSES['professor+ensinar+basico'];
      if (has('ensinar'))                  return COURSES['professor+ensinar'];
      if (has('desenvolver'))              return COURSES['professor+desenvolver'];
      return COURSES['professor+ensinar'];
    }

    if (has('aluno')) {
      if (has('iniciante') && has('aprender')) return COURSES['aluno+iniciante+aprender'];
      if (has('aprender'))                     return COURSES['aluno+aprender'];
      if (has('desenvolver'))                  return COURSES['aluno+desenvolver'];
      return COURSES['aluno+iniciante+aprender'];
    }

    return COURSES['default'];
  }

  function buildQuiz(container) {
    const tags = [];
    let currentStep = 0;

    // Estrutura
    container.innerHTML = `
      <div class="quiz__progress" role="progressbar" aria-label="Progresso do quiz" aria-valuenow="1" aria-valuemax="${QUESTIONS.length}">
        ${QUESTIONS.map((_, i) => `<div class="quiz__progress-step" data-step="${i}" aria-hidden="true"></div>`).join('')}
      </div>
      <div id="quiz-steps">
        ${QUESTIONS.map((q, qi) => `
          <div class="quiz__question ${qi === 0 ? 'active' : ''}" id="quiz-step-${qi}" role="group" aria-labelledby="quiz-q${qi}-label">
            <h3 id="quiz-q${qi}-label">${qi + 1}. ${q.text}</h3>
            <div class="quiz__options">
              ${q.options.map((opt) => `
                <button class="quiz__option" data-tag="${opt.tag}" aria-label="${opt.label}">
                  <span class="quiz__option-icon" aria-hidden="true">${opt.emoji}</span>
                  <span>${opt.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="quiz__result" id="quiz-result" aria-live="polite">
        <div class="quiz__result-card">
          <p class="quiz__result-label">Recomendamos para você</p>
          <h3 class="quiz__result-title" id="quiz-result-name"></h3>
          <p class="quiz__result-desc" id="quiz-result-desc"></p>
          <div class="quiz__result-price" id="quiz-result-price"></div>
          <div class="quiz__result-actions">
            <a class="btn btn--primary" id="quiz-result-cta" href="cursos.html">Ver este curso</a>
            <a class="btn btn--secondary" href="#agendamento">Falar com o professor</a>
          </div>
        </div>
        <button class="quiz__restart" id="quiz-restart">Refazer o quiz</button>
      </div>
    `;

    updateProgress();
    attachOptionListeners();
    attachRestartListener();

    function updateProgress() {
      container.querySelectorAll('.quiz__progress-step').forEach((step, i) => {
        step.classList.toggle('done', i < currentStep);
        step.classList.toggle('active', i === currentStep);
      });
      const pb = container.querySelector('.quiz__progress');
      if (pb) pb.setAttribute('aria-valuenow', currentStep + 1);
    }

    function attachOptionListeners() {
      container.querySelectorAll('.quiz__option').forEach((btn) => {
        btn.addEventListener('click', () => {
          const stepEl = btn.closest('.quiz__question');
          stepEl.querySelectorAll('.quiz__option').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');

          const tag = btn.dataset.tag;
          tags[currentStep] = tag;

          setTimeout(() => advanceStep(), 320);
        });
      });
    }

    function advanceStep() {
      const stepEl = document.getElementById(`quiz-step-${currentStep}`);
      if (stepEl) stepEl.classList.remove('active');
      currentStep++;

      if (currentStep < QUESTIONS.length) {
        const next = document.getElementById(`quiz-step-${currentStep}`);
        if (next) next.classList.add('active');
        updateProgress();
      } else {
        showResult();
      }
    }

    function showResult() {
      container.querySelector('#quiz-steps').style.display = 'none';
      container.querySelector('.quiz__progress').style.display = 'none';

      const course = getCourse(tags);
      document.getElementById('quiz-result-name').textContent  = course.name;
      document.getElementById('quiz-result-desc').textContent  = course.desc;
      document.getElementById('quiz-result-price').textContent = course.price;
      const cta = document.getElementById('quiz-result-cta');
      if (cta) cta.href = `cursos.html#curso-${course.id}`;

      document.getElementById('quiz-result').classList.add('active');
    }

    function attachRestartListener() {
      const btn = document.getElementById('quiz-restart');
      if (!btn) return;
      btn.addEventListener('click', () => {
        tags.length = 0;
        currentStep = 0;
        buildQuiz(container);
      });
    }
  }

  function init() {
    const container = document.getElementById('quiz-container');
    if (container) buildQuiz(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
