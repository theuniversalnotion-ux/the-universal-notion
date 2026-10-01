/* ═══════════════════════════════════════════════════════════════════════
   faq.js — FAQ Accordion
   ───────────────────────────────────────────────────────────────────────
   Injects a keyboard-accessible accordion FAQ section before the footer.
   All answers are based only on content documented on this site.
   Items marked [CONFIRM] need your review before publishing.

   TO REMOVE: delete <script src="faq.js"> and the FAQ CSS block.
   TO EDIT QUESTIONS/ANSWERS: edit the FAQ_ITEMS array below.
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── FAQ content ──────────────────────────────────────────────────────
     Mark uncertain answers with [CONFIRM] so they're easy to find.
  ──────────────────────────────────────────────────────────────────────── */
  const FAQ_ITEMS = [
    {
      q: 'How do I add a template to my Notion workspace?',
      a: `After purchasing, Gumroad will email you a link to the template. Open the link in your browser, then click the <strong>"Duplicate"</strong> button in the top-right corner of the Notion page to add it to your workspace — no setup required.`,
    },
    {
      q: 'Does it work with the free Notion plan?',
      a: `Yes — duplicating a template to your workspace works on all Notion plans, including the free tier. All blocks use standard Notion features available to everyone.`,
    },
    {
      q: 'Does it work on mobile?',
      a: `Notion has a mobile app for iOS and Android, and your duplicated templates are fully accessible there. The templates are designed for desktop but work in Notion's mobile app.`,
    },
    {
      q: 'Is this a one-time purchase or a subscription?',
      a: `One-time purchase. You pay once and get lifetime access — use it forever across as many workspaces as you like. No subscriptions, no recurring fees.`,
    },
    {
      q: 'Can I customize the templates?',
      a: `Yes — every template is a fully editable Notion page. You can rename sections, add new databases, change colors, remove anything you don't need, and make it completely yours.`,
    },
    {
      q: 'What is your refund policy?',
      a: `All sales are generally final because these are instant digital downloads. However, if you experience a technical issue that prevents you from accessing your template, contact us within <strong>7 days</strong> of purchase at <a href="mailto:theuniversalnotion@gmail.com">theuniversalnotion@gmail.com</a> and we'll resolve it or issue a full refund. See the full <a href="refund.html">Refund Policy</a>.`,
    },
    {
      q: 'Can I use the templates for client work or commercial projects?',
      a: `Each purchase covers personal use for your own Notion workspace. If you'd like to use a template for client delivery, team licensing, or any commercial purpose, email us at <a href="mailto:theuniversalnotion@gmail.com">theuniversalnotion@gmail.com</a> to discuss terms.`,
    },
    {
      q: 'What if I buy the bundle and already own some individual blocks?',
      a: `The bundle and individual blocks are separate purchases — there's no partial credit or upgrade pricing at this time. If you have a specific situation you'd like to discuss, reach out at <a href="mailto:theuniversalnotion@gmail.com">theuniversalnotion@gmail.com</a>.`,
    },
  ];

  /* ── Build section ────────────────────────────────────────────────── */
  const section = document.createElement('section');
  section.className = 'faq-section';
  section.setAttribute('aria-labelledby', 'faq-heading');

  section.innerHTML = `
    <div class="faq-inner">
      <div class="section-label">
        <i class="ph-fill ph-question" aria-hidden="true"></i> FAQ
      </div>
      <h2 class="section-title" id="faq-heading">Good questions.</h2>
      <div class="faq-list" id="faq-list">
        ${FAQ_ITEMS.map((item, i) => `
          <div class="faq-item">
            <h3>
              <button
                class="faq-trigger"
                type="button"
                id="faq-btn-${i}"
                aria-expanded="false"
                aria-controls="faq-panel-${i}"
              >
                <span class="faq-q">${esc(item.q)}</span>
                <span class="faq-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path class="faq-chevron" d="M4 6 L9 11 L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </button>
            </h3>
            <div
              class="faq-panel"
              id="faq-panel-${i}"
              role="region"
              aria-labelledby="faq-btn-${i}"
              hidden
            >
              <div class="faq-answer">${item.a}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  /* Insert before footer */
  const footer = document.querySelector('footer');
  footer?.parentNode?.insertBefore(section, footer);

  /* ── Accordion logic ──────────────────────────────────────────────── */
  const list = section.querySelector('.faq-list');

  list.addEventListener('click', e => {
    const trigger = e.target.closest('.faq-trigger');
    if (!trigger) return;

    const item    = trigger.closest('.faq-item');
    const panel   = item.querySelector('.faq-panel');
    const isOpen  = trigger.getAttribute('aria-expanded') === 'true';

    /* Close all other panels */
    list.querySelectorAll('.faq-trigger[aria-expanded="true"]').forEach(t => {
      if (t === trigger) return;
      t.setAttribute('aria-expanded', 'false');
      const p = t.closest('.faq-item').querySelector('.faq-panel');
      collapsePanel(p);
    });

    /* Toggle this panel */
    if (isOpen) {
      trigger.setAttribute('aria-expanded', 'false');
      collapsePanel(panel);
    } else {
      trigger.setAttribute('aria-expanded', 'true');
      expandPanel(panel);
    }
  });

  /* Keyboard: Enter/Space on trigger (buttons handle this natively,
     but arrow keys for roving tabindex feel) */
  list.addEventListener('keydown', e => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const triggers = [...list.querySelectorAll('.faq-trigger')];
    const idx = triggers.indexOf(document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    let next;
    if (e.key === 'ArrowDown') next = triggers[(idx + 1) % triggers.length];
    if (e.key === 'ArrowUp')   next = triggers[(idx - 1 + triggers.length) % triggers.length];
    if (e.key === 'Home')      next = triggers[0];
    if (e.key === 'End')       next = triggers[triggers.length - 1];
    next?.focus();
  });

  /* ── Expand / collapse helpers ─────────────────────────────────────── */
  function expandPanel(panel) {
    panel.hidden = false;
    panel.style.overflow = 'hidden';

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(panel,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.32, ease: 'power2.out',
          onComplete() { panel.style.overflow = ''; panel.style.height = ''; } }
      );
    }
  }

  function collapsePanel(panel) {
    if (typeof gsap !== 'undefined') {
      gsap.to(panel, {
        height: 0, opacity: 0, duration: 0.24, ease: 'power2.in',
        onComplete() { panel.hidden = true; panel.style.height = ''; panel.style.overflow = ''; },
      });
    } else {
      panel.hidden = true;
    }
  }

  /* ── HTML-escape helper ───────────────────────────────────────────── */
  function esc(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

})();
