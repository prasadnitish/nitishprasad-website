/* Native navigation for the founder pages; content is visible without JavaScript. */
(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  if (menu && nav) {
    document.body.classList.add('has-menu');
    const close = () => {
      menu.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
        menu.focus();
      }
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', close);
  }
  document.querySelector('[data-print-resume]')?.addEventListener('click', () => window.print());
})();
