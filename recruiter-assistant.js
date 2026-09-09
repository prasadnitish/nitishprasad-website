/* Reviewed portfolio answers. No model calls, chat storage, or inferred facts. */
function portfolioGuideAnswer(key) {
  const answers = {
    amplify: {
      question: 'Amplify customer',
      title: 'Account managers preparing for seller conversations.',
      body: 'Account managers pieced together seller signals and playbooks before calls. Nitish reframed a dashboard request around preparation and recommended next actions, built Amplify, and launched in North America with data-engineering support. European engineering adapted it. The product became the primary seller-insights tool for approximately 1,600 NA/EU account managers. Average preparation fell from 45 to 5 minutes in a before-and-after study of 10 account managers. That study does not establish a population-wide causal effect. Salesforce integration did not launch.',
      sources: [{ label: 'Amplify: customer, ownership, and evidence', url: '/project-amplify.html' }]
    },
    fees: {
      question: 'Fees portfolio',
      title: 'Commercial mechanisms for third-party sellers.',
      body: 'Since May 2025, Nitish has owned strategy and operating mechanisms across a $16B+ seller fee-incentive portfolio as a Senior Product Manager at Amazon. He launched three programs associated with 171% lift in targeted ASINs and 41% GMS lift. The $16B+ figure describes portfolio context; it is not incremental revenue attributed to him. Earlier Amazon Pay CX work delivered $4.8M in free-cash-flow impact. The public source does not give program-by-program attribution or experimental design.',
      sources: [{ label: 'Seller fees and incentives', url: '/project-seller-incentives.html' }, { label: 'Dated experience', url: '/resume.html#experience' }]
    },
    ninety: {
      question: '90 days with 2 engineers',
      title: 'A starting approach, subject to the customer and business.',
      body: 'Hypothetical approach, not a claim about a past team or a delivery commitment: first observe the customer workflow, agree on one problem and a baseline, and choose what to leave out. Then ship the smallest useful end-to-end flow with the two engineers and test it with a small group of users. Use the remaining time to measure repeat use and customer outcomes, fix the largest adoption barrier, and decide whether to expand, change direction, or stop. Scope and timing would depend on the product, access to customers, and technical constraints.',
      sources: [{ label: 'Frame / Bound / Prove / Scale', url: '/index.html#operate' }]
    },
    scope: {
      question: 'Principal vs Staff AI Platform',
      title: 'Principal / Staff IC ownership of a product area.',
      body: 'Nitish’s current title is Senior Product Manager at Amazon. He is exploring Principal and Staff individual-contributor roles across marketplaces, fintech, and AI products. The intended scope includes the customer problem, commercial tradeoffs, roadmap, rollout, and adoption. His technical portfolio demonstrates hands-on work with latency, cost, evaluation, and migrations. A Staff AI Platform role may fit when those systems serve clear product and customer outcomes. He is not claiming Principal or Staff as his current title, or using the target role to imply people-management responsibility.',
      sources: [{ label: 'About and role fit', url: '/about.html' }, { label: 'Technical portfolio', url: '/enterprise-ai-platform.html' }]
    }
  };
  return Object.prototype.hasOwnProperty.call(answers, key) ? answers[key] : null;
}

(() => {
  if (document.querySelector('.recruiter-assistant')) return;
  const root = document.createElement('div');
  root.className = 'recruiter-assistant';
  root.innerHTML = `
    <button class="ra-launcher" type="button" aria-haspopup="dialog" aria-controls="portfolio-guide" aria-expanded="false">Questions about scope <span aria-hidden="true">↗</span></button>
    <dialog class="ra-panel" id="portfolio-guide" aria-labelledby="ra-title" aria-describedby="ra-intro">
      <header class="ra-head"><div><p class="ra-eyebrow">Portfolio guide</p><h2 id="ra-title">A little more context.</h2></div><button class="ra-close" type="button" aria-label="Close portfolio guide" autofocus>×</button></header>
      <div class="ra-content"><p id="ra-intro">Four questions about the work and role fit. These are reviewed answers with links to the portfolio.</p>
      <div class="ra-suggestions" aria-label="Questions about scope"></div>
      <section class="ra-answer" aria-live="polite" aria-atomic="true"><p>Select a question to read the answer.</p></section></div>
      <footer class="ra-footer"><a href="mailto:hello@nitishprasad.com">Ask Nitish directly ↗</a><a href="/portfolio-privacy.html">Privacy</a></footer>
    </dialog>`;
  const mount = document.querySelector('[data-portfolio-guide]');
  // On technical pages, place the guide at the end of the reading flow.
  (mount || document.querySelector('main') || document.body).appendChild(root);
  const launcher = root.querySelector('.ra-launcher');
  const dialog = root.querySelector('dialog');
  const answerRegion = root.querySelector('.ra-answer');
  const suggestions = root.querySelector('.ra-suggestions');
  let previousOverflow = '';

  function showAnswer(key) {
    const answer = portfolioGuideAnswer(key);
    if (!answer) return;
    const heading = document.createElement('h3');
    heading.textContent = answer.title;
    const body = document.createElement('p');
    body.textContent = answer.body;
    const sources = document.createElement('div');
    sources.className = 'ra-sources';
    answer.sources.forEach(source => {
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.label + ' →';
      sources.appendChild(link);
    });
    answerRegion.replaceChildren(heading, body, sources);
    suggestions.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.question === key));
    });
  }

  ['amplify', 'fees', 'ninety', 'scope'].forEach(key => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ra-suggestion';
    button.dataset.question = key;
    button.setAttribute('aria-pressed', 'false');
    button.textContent = portfolioGuideAnswer(key).question;
    button.addEventListener('click', () => showAnswer(key));
    suggestions.appendChild(button);
  });
  launcher.addEventListener('click', () => {
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    launcher.setAttribute('aria-expanded', 'true');
  });
  root.querySelector('.ra-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll('button, a[href]')];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
})();
