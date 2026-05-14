<script>
  // Fade in observer
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  // Form submit
  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('.form-btn');
    btn.innerHTML = '<span>Enviando...</span>';
    btn.disabled = true;
    setTimeout(() => {
      form.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'flex';
      // Build whatsapp message from form data
      const inputs = form.querySelectorAll('input, select');
      const name = inputs[0].value;
      const phone = inputs[1].value;
      const email = inputs[2].value;
      const specialty = inputs[3].value;
      const revenue = inputs[4].value;
      const msg = encodeURIComponent(`Olá! Preenchi o formulário do site.\nNome: ${name}\nTelefone: ${phone}\nE-mail: ${email}\nEspecialidade: ${specialty}\nFaturamento: ${revenue}`);
      window.open(`https://api.whatsapp.com/send?phone=5518991270645&text=${msg}`, '_blank');
    }, 1000);
  }

  // Carousel
  (function() {
    const carousel = document.getElementById('reviewsCarousel');
    if (!carousel) return;
    const cards = carousel.querySelectorAll('.review-card');
    const dotsContainer = document.getElementById('carouselDots');
    let current = 0;
    let autoTimer;

    function getVisible() {
      if (window.innerWidth >= 1100) return 3;
      if (window.innerWidth >= 640) return 2;
      return 1;
    }

    let visibleCount = getVisible();
    let maxIndex = Math.max(0, cards.length - visibleCount);

    function buildDots() {
      dotsContainer.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const d = document.createElement('button');
        d.className = 'carousel-dot' + (i === current ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(d);
      }
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIndex));
      const cardW = cards[0].offsetWidth + 24; // gap
      carousel.style.transform = `translateX(-${current * cardW}px)`;
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function autoPlay() {
      autoTimer = setInterval(() => goTo(current >= maxIndex ? 0 : current + 1), 5000);
    }

    document.getElementById('carouselPrev').addEventListener('click', () => { clearInterval(autoTimer); goTo(current - 1); autoPlay(); });
    document.getElementById('carouselNext').addEventListener('click', () => { clearInterval(autoTimer); goTo(current + 1); autoPlay(); });

    // Touch/swipe
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { clearInterval(autoTimer); goTo(dx < 0 ? current + 1 : current - 1); autoPlay(); }
    }, { passive: true });

    window.addEventListener('resize', () => {
      visibleCount = getVisible();
      maxIndex = Math.max(0, cards.length - visibleCount);
      if (current > maxIndex) current = maxIndex;
      buildDots();
      goTo(current);
    });

    buildDots();
    goTo(0);
    autoPlay();
  })();
  // ── NAV SCROLL (estilo Medre: aparece suave + link ativo por seção) ──
  const nav = document.querySelector('nav');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id], div[id="form"]');

  // Fundo e sombra aparecem ao rolar
  function onScroll() {
    const y = window.scrollY;
    if (y > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    // Link ativo: qual seção está mais visível
    let active = null;
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= nav.offsetHeight + 80) active = sec.id;
    });
    navLinks.forEach(a => {
      const href = a.getAttribute('href').replace('#','');
      a.classList.toggle('nav-active', href === active);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── FORM: envio por email via FormSubmit + WhatsApp ──
  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('.form-btn');
    const inputs = form.querySelectorAll('input[name], select');

    let nome = '', phone = '', email = '', specialty = '', revenue = '';
    inputs.forEach(inp => {
      if (inp.name === 'nome') nome = inp.value;
      if (inp.name === 'whatsapp') phone = inp.value;
      if (inp.name === 'email') email = inp.value;
      if (!inp.name) {
        if (!specialty) specialty = inp.value;
        else revenue = inp.value;
      }
    });

    btn.innerHTML = '<span>Enviando...</span>';
    btn.disabled = true;

    // FormSubmit via fetch (AJAX silencioso)
    const data = new FormData(form);
    data.append('especialidade', specialty);
    data.append('faturamento', revenue);

    fetch('https://formsubmit.co/ajax/julio@agenciazero18.com.br', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    }).catch(() => {}); // falha silenciosa — não bloquear a UX

    setTimeout(() => {
      form.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'flex';
      // Também envia para WhatsApp
      const msg = encodeURIComponent(
        `Olá! Preenchi o formulário do site.\nNome: ${nome}\nWhatsApp: ${phone}\nE-mail: ${email}\nEspecialidade: ${specialty}\nFaturamento: ${revenue}`
      );
      window.open(`https://api.whatsapp.com/send?phone=5518991270645&text=${msg}`, '_blank');
    }, 900);
  }
</script>