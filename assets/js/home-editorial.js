(() => {
  const stories = [...document.querySelectorAll('.hs-story')];
  const steps = [...document.querySelectorAll('.hs-story-steps a')];
  if (stories.length && steps.length) {
    let pending = false;
    const updateStep = () => {
      pending = false;
      let active = 0;
      const line = Math.min(window.innerHeight * 0.45, 360);
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
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.hs-introduction .hs-banner-content > *,.section-head,.telegram-panel,.pricelist-teaser-inner,.channel-card').forEach(element => {
    element.classList.add('hs-reveal'); observer.observe(element);
  });
})();
