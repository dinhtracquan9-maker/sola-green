(() => {
  const buyerTrack = document.querySelector('.hs-buyer-track');
  if (buyerTrack) {
    const previous = document.querySelector('[data-buyer-prev]');
    const next = document.querySelector('[data-buyer-next]');
    const progress = document.querySelector('.hs-buyer-progress span');
    const move = direction => {
      const cards = [...buyerTrack.children];
      const current = cards.reduce((best, card, i) => Math.abs(card.offsetLeft - buyerTrack.offsetLeft - buyerTrack.scrollLeft) < Math.abs(cards[best].offsetLeft - buyerTrack.offsetLeft - buyerTrack.scrollLeft) ? i : best, 0);
      const target = cards[Math.max(0, Math.min(cards.length - 1, current + direction))];
      buyerTrack.scrollTo({ left: target.offsetLeft - buyerTrack.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };
    const sync = () => {
      const max = buyerTrack.scrollWidth - buyerTrack.clientWidth;
      previous.disabled = buyerTrack.scrollLeft < 2;
      next.disabled = buyerTrack.scrollLeft >= max - 2;
      progress.style.width = `${max > 0 ? 25 + 75 * buyerTrack.scrollLeft / max : 100}%`;
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    buyerTrack.addEventListener('scroll', sync, { passive: true });
    buyerTrack.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    });
    window.addEventListener('resize', sync);
    sync();
  }
  const stories = [...document.querySelectorAll('.hs-story')];
  const steps = [...document.querySelectorAll('.hs-story-steps a')];
  if (stories.length && steps.length) {
    let pending = false;
    const updateStep = () => {
      pending = false;
      let active = 0;
      const line = window.innerWidth > 760 ? 220 : 180;
      stories.forEach((story, index) => {
        if (story.getBoundingClientRect().top <= line) active = index;
      });
      steps.forEach((step, index) => {
        if (index === active) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
    };
    const schedule = () => {
      if (!pending) { pending = true; requestAnimationFrame(updateStep); }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    updateStep();
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('hs-motion-ready');
  const stats = document.querySelector('.trust-stats');
  if (stats) {
    const counterObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      counterObserver.disconnect();
      stats.querySelectorAll('b').forEach((element, index) => {
        const finalText = element.textContent.trim();
        const match = finalText.match(/^(\d+)(.*)$/);
        element.setAttribute('aria-label', finalText);
        const visual = document.createElement('span');
        visual.className = 'hs-stat-value';
        visual.setAttribute('aria-hidden', 'true');
        element.replaceChildren(visual);
        if (match) {
          const target = Number(match[1]);
          const start = performance.now() + index * 100;
          const tick = now => {
            const progress = Math.max(0, Math.min(1, (now - start) / 1400));
            visual.textContent = `${Math.round(target * (1 - Math.pow(1 - progress, 3)))}${match[2]}`;
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        } else {
          [...finalText].forEach((character, characterIndex) => {
            const letter = document.createElement('span');
            letter.className = 'hs-stat-letter';
            letter.style.animationDelay = `${index * 100 + characterIndex * 110}ms`;
            letter.textContent = character;
            visual.append(letter);
          });
        }
      });
    }, { threshold: 0.35 });
    counterObserver.observe(stats);
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.hs-introduction .hs-banner-content > *,.section-head,.telegram-panel,.pricelist-teaser-inner,.channel-card').forEach(element => {
    element.classList.add('hs-reveal'); observer.observe(element);
  });
})();
