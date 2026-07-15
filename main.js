// ==========================================================================
// MAIN INTERACTIVE CONTROLLER - B2B MÉLDICA COSMÉTICOS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. SMOOTH SCROLLING FOR ANCHORS
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        // Scroll with offset for sticky header
        const headerHeight = document.querySelector('.main-header').offsetHeight || 80;
        const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });

        // Update active navigation state
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
        if (link.classList.contains('nav-link')) {
          link.classList.add('active');
        }
      }
    });
  });

  // 2. SCROLLSPY (Highlight nav menu based on scroll position)
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120; // offset

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentId = '#' + section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === currentId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });

  // 3. MULTI-STEP B2B QUIZ FORM LOGIC
  const quizForm = document.getElementById('b2b-quiz-form');
  const panels = document.querySelectorAll('.quiz-step-panel');
  const nextBtns = document.querySelectorAll('.btn-next');
  const prevBtns = document.querySelectorAll('.btn-prev');
  const progressBar = document.getElementById('quiz-progress');
  const stepIndicator = document.getElementById('step-indicator');
  const submitBtn = document.getElementById('quiz-submit-btn');

  let currentStep = 1;
  const totalSteps = 3;

  const stepTitles = {
    1: 'Passo 1 de 3: Identificação',
    2: 'Passo 2 de 3: Localização & Registro',
    3: 'Passo 3 de 3: Perfil Comercial'
  };

  // Helper to validate fields in current panel
  function validateStep(step) {
    const currentPanel = document.querySelector(`.quiz-step-panel[data-step="${step}"]`);
    const requiredInputs = currentPanel.querySelectorAll('[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
      // Basic empty check
      if (!input.value.trim()) {
        isValid = false;
        input.classList.add('invalid-field');
        input.reportValidity();
      } else {
        input.classList.remove('invalid-field');
      }

      // Specific WhatsApp format validation
      if (input.type === 'tel' && input.id === 'lead-whatsapp') {
        const val = input.value.replace(/\D/g, '');
        if (val.length < 10) {
          isValid = false;
          input.setCustomValidity('Por favor, digite um WhatsApp válido com DDD.');
          input.reportValidity();
        } else {
          input.setCustomValidity('');
        }
      }
    });

    return isValid;
  }

  // Helper to update progress and steps UI
  function updateQuizUI() {
    // Show active step panel
    panels.forEach(panel => {
      const panelStep = parseInt(panel.getAttribute('data-step'));
      if (panelStep === currentStep) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Update progress bar width
    const percentage = (currentStep / totalSteps) * 100;
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    // Update indicator text
    if (stepIndicator) {
      stepIndicator.textContent = stepTitles[currentStep];
    }
  }

  // Next Step Action
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateQuizUI();
        }
      }
    });
  });

  // Prev Step Action
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateQuizUI();
      }
    });
  });

  // Remove invalid style on type/input
  quizForm.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('invalid-field');
    });
    input.addEventListener('change', () => {
      input.classList.remove('invalid-field');
    });
  });

  // 4. AJAX SUBMISSION TO FORMSUBMIT
  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateStep(currentStep)) return;

      const name = document.getElementById('lead-name').value.trim();
      const company = document.getElementById('lead-company').value.trim();
      const whatsapp = document.getElementById('lead-whatsapp').value.trim();
      const city = document.getElementById('lead-city').value.trim();
      const state = document.getElementById('lead-state').value;
      const cnpj = document.querySelector('input[name="lead-cnpj"]:checked').value;
      const segment = document.getElementById('lead-segment').value;
      const resells = document.querySelector('input[name="lead-already-resells"]:checked').value;

      // Show sending state
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando...';

      // Send to FormSubmit via AJAX
      fetch("https://formsubmit.co/ajax/ascdocumentacao@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          "Nome do Contato": name,
          "Nome da Empresa": company,
          "WhatsApp": whatsapp,
          "Cidade": city,
          "Estado": state,
          "Possui CNPJ?": cnpj,
          "Segmento Comercial": segment,
          "Já Revende Cosméticos?": resells,
          "_subject": `Novo Lead B2B - ${company} (${state})`
        })
      })
      .then(response => response.json())
      .then(data => {
        // Success handler
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Catálogo Liberado! ✓';
        
        alert("Perfil qualificado com sucesso! Nossos especialistas comerciais entrarão em contato via WhatsApp nas próximas horas para liberar seu acesso.");
        
        // Reset Quiz Form
        quizForm.reset();
        currentStep = 1;
        updateQuizUI();

        // Reset submit button text
        setTimeout(() => {
          submitBtn.innerHTML = 'Quero falar com um consultor <i data-lucide="send"></i>';
          if (window.lucide) window.lucide.createIcons();
        }, 5000);
      })
      .catch(error => {
        console.error("Error submitting B2B lead:", error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Quero falar com um consultor <i data-lucide="send"></i>';
        if (window.lucide) window.lucide.createIcons();
        alert("Ocorreu um erro no envio. Por favor, tente novamente ou entre em contato pelo nosso WhatsApp oficial no rodapé.");
      });
    });
  }
});
