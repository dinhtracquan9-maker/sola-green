(() => {
  const stories = [...document.querySelectorAll('.hs-story')];
  const steps = [...document.querySelectorAll('.hs-story-steps a')];
  if (stories.length && steps.length) {
    const section = document.querySelector('.hs-stories');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0, timer, visible = false, hovered = false, focused = false, paused = false;
    section.classList.add('hs-slideshow');
    const pause = document.createElement('button');
    pause.type = 'button'; pause.className = 'hs-story-pause';
    pause.textContent = 'Pause'; pause.setAttribute('aria-label', 'Pause automatic image rotation');
    section.querySelector('.hs-story-steps').append(pause);
    const show = index => {
      active = (index + stories.length) % stories.length;
      stories.forEach((story, i) => {
        story.classList.toggle('is-active', i === active);
        story.setAttribute('aria-hidden', String(i !== active));
      });
      steps.forEach((step, index) => {
        if (index === active) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
    };
    const schedule = () => {
      clearTimeout(timer);
      if (visible && !hovered && !focused && !paused && !document.hidden && !reduced.matches) {
        timer = setTimeout(() => { show(active + 1); schedule(); }, 4800);
      }
    };
    steps.forEach((step, i) => step.addEventListener('click', event => {
      event.preventDefault(); show(i); schedule();
    }));
    pause.addEventListener('click', () => {
      paused = !paused; pause.textContent = paused ? 'Play' : 'Pause';
      pause.setAttribute('aria-label', paused ? 'Resume automatic image rotation' : 'Pause automatic image rotation');
      schedule();
    });
    section.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    section.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    section.addEventListener('focusin', () => { focused = true; schedule(); });
    section.addEventListener('focusout', event => { focused = section.contains(event.relatedTarget); schedule(); });
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', schedule);
    let touchX = 0;
    const stack = section.querySelector('.hs-story-stack');
    stack.addEventListener('touchstart', event => { touchX = event.changedTouches[0].clientX; clearTimeout(timer); }, { passive: true });
    stack.addEventListener('touchend', event => {
      const delta = event.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 45) show(active + (delta < 0 ? 1 : -1));
      schedule();
    }, { passive: true });
    show(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .2 }).observe(section);
    }
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('hs-motion-ready');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.hs-introduction .hs-banner-content > *,.section-head,.telegram-panel,.pricelist-teaser-inner,.channel-card').forEach(element => {
    element.classList.add('hs-reveal'); observer.observe(element);
  });
})();
