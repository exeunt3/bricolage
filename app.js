const ARCHIVAL_IMAGES = [
  { src: './assets/plates/plate-1.svg', title: 'Stratified marginal plate' },
  { src: './assets/plates/plate-2.svg', title: 'Recursive citation grid' },
  { src: './assets/plates/plate-3.svg', title: 'Vertical lexicon band' },
  { src: './assets/plates/plate-4.svg', title: 'Fractured doctrinal pane' },
  { src: './assets/plates/plate-5.svg', title: 'Collaged index specimen' }
];

const LAYOUT_CLASSES = ['block-wide', 'block-narrow', 'block-nested', 'block-vertical', 'block-rotate-90', 'block-invert', 'block-margin'];
const DISRUPTION_CLASSES = ['block-vertical', 'block-rotate-90', 'block-margin', 'block-nested', 'block-invert'];

function chooseLayoutClass(state) {
  const options = LAYOUT_CLASSES.filter((name) => name !== 'block-invert' || state.invertedCount < 1);
  const chosen = options[Math.floor(Math.random() * options.length)];
  if (chosen === 'block-invert') state.invertedCount += 1;
  if (DISRUPTION_CLASSES.includes(chosen)) state.disruptionCount += 1;
  return chosen;
}

function bibliographyForFigure(figure) {
  const refs = figure.references || {};
  const items = [
    ['Wikipedia', refs.wikipedia],
    ['Stanford Encyclopedia of Philosophy', refs.stanford_encyclopedia_of_philosophy],
    ['Internet Encyclopedia of Philosophy', refs.internet_encyclopedia_of_philosophy]
  ];

  return items
    .filter(([, href]) => Boolean(href))
    .map(([label, href]) => `<li><a href="${href}" target="_blank" rel="noreferrer">${label}</a></li>`)
    .join('');
}

function renderFigureBlock(figure, layoutClass) {
  const block = document.createElement('section');
  block.className = `figure-block ${layoutClass}`;

  const images = (figure.image_pool || []).slice(0, 2)
    .map((src, index) => `<figure class="inline-figure"><img src="${src}" alt="${figure.name} reference image ${index + 1}" loading="lazy" referrerpolicy="no-referrer" /></figure>`)
    .join('');

  block.innerHTML = `
    <h2>${figure.name}</h2>
    <div class="prose-collage">
      <div class="prose-main">
        <p>${figure.biography || ''}</p>
        <p><strong>Reference entries:</strong></p>
        <ul>${bibliographyForFigure(figure)}</ul>
      </div>
      <aside class="prose-overlay left"><p>${figure.hyperobject_vector || ''}</p></aside>
      <div class="vertical-ribbon">${(figure.keywords || []).join(' · ')}</div>
      ${images}
    </div>
  `;
  return block;
}

function renderImageBlock(image, layoutClass) {
  const figure = document.createElement('figure');
  figure.className = `image-block ${layoutClass}`;
  figure.innerHTML = `<img src="${image.src}" alt="${image.title}" loading="eager" referrerpolicy="no-referrer" /><figcaption>${image.title}</figcaption>`;
  return figure;
}

async function renderBricolage() {
  const response = await fetch('./figures.json');
  const figures = await response.json();

  const page = document.getElementById('page');
  page.innerHTML = '';

  const layoutState = { disruptionCount: 0, invertedCount: 0 };

  figures.forEach((figure) => {
    const className = chooseLayoutClass(layoutState);
    page.appendChild(renderFigureBlock(figure, className));
  });

  ARCHIVAL_IMAGES.forEach((item) => {
    const className = chooseLayoutClass(layoutState);
    page.appendChild(renderImageBlock(item, className));
  });
}

function bootstrap() {
  const introModal = document.getElementById('intro-modal');
  const enterButton = document.getElementById('enter-site');
  const page = document.getElementById('page');

  enterButton.addEventListener('click', async () => {
    introModal.classList.add('is-hidden');
    page.classList.remove('is-hidden');
    await renderBricolage();
  });
}

bootstrap();
