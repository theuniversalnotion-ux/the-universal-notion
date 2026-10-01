/* ═══════════════════════════════════════════════════════════════════════
   products.js — Single source of truth for all template product data
   ───────────────────────────────────────────────────────────────────────
   Edit this file to update names, categories, descriptions, prices,
   covers, or Gumroad links. filters.js, builder.js, quiz.js, and
   quicklook.js all read from window.PRODUCTS automatically.

   PER-PRODUCT FIELDS
   ──────────────────
   images[]  : Array of cover paths. First = card cover. Add more for
               the Quick-Look gallery (up to 3 recommended).
   badge     : 'new' | 'bestseller' | null
   tilt      : CSS rotation applied to the card (matches HTML attribute)

   TO ADD A NEW PRODUCT
   ────────────────────
   1. Add an object to the PRODUCTS array below.
   2. Add a <div class="card"> block in index.html (copy any existing card).
   3. Place the cover image in /covers/.
   4. Re-run Playwright QA screenshots to check the grid layout.
═══════════════════════════════════════════════════════════════════════ */

window.PRODUCTS = [
  {
    id:       0,
    name:     'Group Hug',
    category: 'Social',
    tagBg:    '#E8D8F5',
    tagColor: '#8060B0',
    btnColor: '#A07BC8',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/jisidl',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/10-group-hug.png'],
    alt:      'Group Hug Notion template cover — shared social planning and memory tracking',
    desc:     'Track plans, memories, and everything in between with your favorite people — all in one shared space.',
    badge:    'new',
    tilt:     '3.5deg',
  },
  {
    id:       1,
    name:     'Budget + Finance Hub',
    category: 'Finance',
    tagBg:    '#D8EDD8',
    tagColor: '#5A855A',
    btnColor: '#8AAF8A',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/coxpw',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/01-budget-finance-hub.png'],
    alt:      'Budget + Finance Hub Notion template cover — income, expenses and savings tracker',
    desc:     'Track income, expenses, savings goals, and subscriptions all in one aesthetic workspace.',
    badge:    null,
    tilt:     '-4.5deg',
  },
  {
    id:       2,
    name:     'Second Brain',
    category: 'Productivity',
    tagBg:    '#EDE5FF',
    tagColor: '#9B7FD4',
    btnColor: '#9B7FD4',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/ijqbc',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/02-second-brain.png'],
    alt:      'Second Brain Notion template cover — knowledge hub for ideas, notes and projects',
    desc:     'Capture ideas, notes, projects, and resources in one organized knowledge hub.',
    badge:    null,
    tilt:     '2.5deg',
  },
  {
    id:       3,
    name:     'Romanticize Your Life Journal',
    category: 'Lifestyle',
    tagBg:    '#F5D0DC',
    tagColor: '#C07080',
    btnColor: '#E8A0A8',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/phlsor',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/03-romanticize-journal.png'],
    alt:      'Romanticize Your Life Journal Notion template cover — daily journaling and reflection',
    desc:     'A beautiful daily journal to help you slow down, reflect, and find joy in the everyday.',
    badge:    null,
    tilt:     '-3.5deg',
  },
  {
    id:       4,
    name:     'Health + Medical Tracker',
    category: 'Health & Wellness',
    tagBg:    '#D0EDD8',
    tagColor: '#6BA878',
    btnColor: '#6BA878',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/sagwrd',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/04-health-medical-tracker.png'],
    alt:      'Health + Medical Tracker Notion template cover — appointments, symptoms and wellness goals',
    desc:     'Log appointments, medications, symptoms, and health goals in one clear dashboard.',
    badge:    null,
    tilt:     '4deg',
  },
  {
    id:       5,
    name:     'Content Creation Hub',
    category: 'Creator',
    tagBg:    '#D0E5F5',
    tagColor: '#6090B8',
    btnColor: '#6090B8',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/ofnhi',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/05-content-creation-hub.png'],
    alt:      'Content Creation Hub Notion template cover — content planning and scheduling across platforms',
    desc:     'Plan, draft, and schedule content across all your platforms from one aesthetic command center.',
    badge:    null,
    tilt:     '-2.5deg',
  },
  {
    id:       6,
    name:     'Client + Admin Hub',
    category: 'Business & Freelance',
    tagBg:    '#FAE0D0',
    tagColor: '#D4886A',
    btnColor: '#D4886A',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/nmvuey',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/06-client-admin-hub.png'],
    alt:      'Client + Admin Hub Notion template cover — freelance client and project management',
    desc:     'Manage clients, projects, invoices, and admin tasks without the chaos.',
    badge:    null,
    tilt:     '3deg',
  },
  {
    id:       7,
    name:     'Universal Reading Log',
    category: 'Reading & Learning',
    tagBg:    '#F5E5C0',
    tagColor: '#C09040',
    btnColor: '#C09040',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/erzgsu',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/07-universal-reading-log.png'],
    alt:      'Universal Reading Log Notion template cover — book tracker with ratings and notes',
    desc:     'Track every book you\'ve read, want to read, and are reading — with ratings and notes.',
    badge:    null,
    tilt:     '-4deg',
  },
  {
    id:       8,
    name:     'The Bread Board',
    category: 'Food & Home',
    tagBg:    '#F5D8C0',
    tagColor: '#C07858',
    btnColor: '#C07858',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/cphel',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/08-bread-board.png'],
    alt:      'The Bread Board Notion template cover — recipe board and meal planning',
    desc:     'Your aesthetic recipe board — save, organize, and plan meals all in one place.',
    badge:    null,
    tilt:     '2deg',
  },
  {
    id:       9,
    name:     'Appliance Tracker',
    category: 'Home',
    tagBg:    '#C8E8C0',
    tagColor: '#70A868',
    btnColor: '#70A868',
    price:    '$4.99',
    priceNum: 4.99,
    url:      'https://universalnotion.gumroad.com/l/uszrz',
    fbq:      "fbq('track','AddToCart')",
    images:   ['covers/09-appliance-tracker.png'],
    alt:      'Appliance Tracker Notion template cover — home appliances, warranties and maintenance log',
    desc:     'Log your home appliances, warranties, maintenance schedules, and purchase info in one spot.',
    badge:    null,
    tilt:     '-3.5deg',
  },
];

/* ── Bundle metadata ──────────────────────────────────────────────────
   Separate price so any price change only needs editing here.
──────────────────────────────────────────────────────────────────────── */
window.BUNDLE = {
  name:          'The Complete Universal Notion System',
  price:         14.99,
  url:           'https://universalnotion.gumroad.com/l/ntuncf',
  fbq:           "fbq('track','AddToCart')",
  cover:         'covers/00-complete-system-bundle.png',
  coverAlt:      'The Complete Universal Notion System — all 10 templates included',
  /* Computed: sum of all individual product prices */
  separatelyPrice: +(window.PRODUCTS.reduce((s, p) => s + p.priceNum, 0).toFixed(2)),
};

/* ── Update "if bought separately" price in the bundle section ────────
   Runs once on load; the span must exist in the DOM.
──────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  var sep = document.getElementById('bundle-separately-price');
  if (sep) sep.textContent = '$' + window.BUNDLE.separatelyPrice.toFixed(2);

  /* Update the strikethrough "was" price in the bundle card as well */
  var was = document.querySelector('.bundle-was-amount');
  if (was) was.textContent = '$' + window.BUNDLE.separatelyPrice.toFixed(2);
});
