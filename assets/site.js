/* Five visible sections, one lightweight website. No framework or external scripts. */
(() => {
  const valid = new Set(['home','research','work','publications','cv']);
  const views = [...document.querySelectorAll('[data-view]')];
  const links = [...document.querySelectorAll('[data-nav]')];
  const nav = document.querySelector('.main-nav');
  const toggle = document.querySelector('.menu-toggle');
  const compact = window.matchMedia('(max-width: 760px)');
  const main = document.querySelector('main');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.hidden = !compact.matches;
    nav.hidden = compact.matches && !open;
    toggle.setAttribute('aria-expanded', String(compact.matches && open));
  }

  if (nav && toggle) {
    setMenu(false);
    compact.addEventListener('change', () => setMenu(false));
    window.addEventListener('pageshow', () => setMenu(false));
    toggle.addEventListener('click', () => setMenu(nav.hidden));
    nav.addEventListener('click', event => {
      if (!event.target.closest('a') || !compact.matches) return;
      setMenu(false);
      main?.focus({ preventScroll: true });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && compact.matches && !nav.hidden) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  document.querySelector('.skip-link')?.addEventListener('click', event => {
    if (!main) return;
    event.preventDefault();
    setMenu(false);
    main.focus();
    main.scrollIntoView({ block: 'start' });
  });

  const strip = document.querySelector('.workflow-strip');
  if (strip) {
    const controls = strip.parentElement.querySelector('.workflow-controls');
    const previous = controls.querySelector('.workflow-prev');
    const next = controls.querySelector('.workflow-next');
    function updateControls() {
      const limit = strip.scrollWidth - strip.clientWidth;
      controls.hidden = limit <= 1;
      previous.disabled = strip.scrollLeft <= 1;
      next.disabled = strip.scrollLeft >= limit - 1;
    }
    function shiftStep(direction) {
      const cards = strip.children;
      const stepWidth = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      strip.scrollBy({ left: direction * stepWidth, behavior: motion });
    }
    previous.addEventListener('click', () => shiftStep(-1));
    next.addEventListener('click', () => shiftStep(1));
    strip.addEventListener('scroll', updateControls, { passive: true });
    new ResizeObserver(updateControls).observe(strip);
    updateControls();
  }

  if (!views.length) return;
  function navigate(hash = window.location.hash) {
    const key = String(hash).replace(/^#/, '') || 'home';
    const target = valid.has(key) ? key : 'home';
    views.forEach(v => {
      const active = v.dataset.view === target;
      v.classList.toggle('is-active', active);
      v.setAttribute('aria-hidden', String(!active));
    });
    links.forEach(l => {
      if (l.dataset.nav === target) l.setAttribute('aria-current','page');
      else l.removeAttribute('aria-current');
    });
    document.title = (target === 'home' ? 'Home' : ({research:'Research',work:'Current Work',publications:'Publications',cv:'CV & Contact'})[target]) + ' · Jorge Roca Virués de Segovia';
    window.scrollTo({top:0,behavior:'instant'});
  }
  window.addEventListener('hashchange', () => navigate());
  document.querySelectorAll('[data-view-go]').forEach(button => button.addEventListener('click', () => {
    window.location.hash = button.dataset.viewGo;
    navigate();
  }));
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
    const dlg = document.getElementById(button.dataset.dialog);
    if (dlg && typeof dlg.showModal === 'function') dlg.showModal();
  }));
  document.querySelectorAll('dialog').forEach(dlg => {
    dlg.querySelector('.dialog-close')?.addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', evt => { if (evt.target === dlg) dlg.close(); });
  });
  navigate();
})();
