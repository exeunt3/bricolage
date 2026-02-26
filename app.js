const SYSTEM_PROMPT = `You are generating prose for a website titled BRICOLAGE.

All prose must match or exceed the density, cadence, and ontological seriousness of the landing introduction.

MANDATORY:
- Long syntactic arcs.
- Multi-clause sentences.
- Dense philosophical vocabulary.
- Historical specificity.
- Minimal paragraph breaks.
- Average sentence length > 25 words.
- Occasional near-run-on permitted.
- No tidy closure.

PROHIBITED:
- "Not X but Y"
- "It is not X, it is Y"
- Modern conversational tone.
- Marketing cadence.
- Summary tone.
- "In many ways"
- "It is important to note"
- "Ultimately"
- "At its core"
- Bullet-like prose patterns.

When uncertain, increase density.
Never simplify.
Never explain metaphors.
Never conclude cleanly.`;

const ARCHIVAL_IMAGES = [
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Robert_Fludd_Utriusque_Cosmi_Historia.jpg',
    caption: 'Robert Fludd, Utriusque Cosmi Historia, plate fragment.'
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Athanasius_Kircher_Ars_Magna_Lucis_et_Umbrae.png',
    caption: 'Athanasius Kircher, Ars Magna Lucis et Umbrae, diagram.'
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Geological_cross_section_1815.jpg',
    caption: 'Nineteenth-century geological cross-section.'
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Kepler_mysterium_cosmographicum.jpg',
    caption: 'Kepler cosmographic solids, archival reproduction.'
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Blake_Newton_William_Blake.jpg',
    caption: 'William Blake, Newton, public-domain plate reproduction.'
  }
];

const LAYOUT_CLASSES = ['block-wide', 'block-narrow', 'block-nested', 'block-vertical', 'block-rotate-90', 'block-invert', 'block-margin'];
const DISRUPTION_CLASSES = ['block-vertical', 'block-rotate-90', 'block-margin', 'block-nested', 'block-invert'];
const PROHIBITED_PATTERNS = [
  /\bIn many ways\b/i,
  /\bIt is important to note\b/i,
  /\bUltimately\b/i,
  /\bAt its core\b/i,
  /\bIn conclusion\b/i,
  /\bTo conclude\b/i,
  /\bIn summary\b/i,
  /\bTo summarize\b/i,
  /\bYou can see\b/i,
  /\bLet'?s\b/i,
  /\bbasically\b/i,
  /\bsimply\b/i,
  /\bIt is not .*?, it is\b/i,
  /\bNot .*? but\b/i,
  /\blet'?s\b/i,
  /\byou(?:'re| are)\b/i,
  /\bjourney\b/i,
  /\bgame[- ]changer\b/i,
  /\bstate[- ]of[- ]the[- ]art\b/i,
  /\bcutting[- ]edge\b/i,
  /\bin conclusion\b/i,
  /\bto conclude\b/i,
  /\bin summary\b/i,
  /\bto summarize\b/i,
  /\boverall\b/i,
  /\bto sum up\b/i
];

const SENTENCE_SPLIT = /[.!?]+/;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(array, count) {
  const clone = [...array];
  const out = [];
  while (out.length < count && clone.length) {
    out.push(clone.splice(Math.floor(Math.random() * clone.length), 1)[0]);
  }
  return out;
}

function estimateCentury(dates) {
  const match = String(dates || '').match(/(\d{3,4})/);
  if (!match) return 'unknown';
  return Math.ceil(Number(match[1]) / 100);
}

function weightedFigureSelection(figures, min = 4, max = 8) {
  const target = randomInt(min, Math.min(max, figures.length));
  const seed = figures[Math.floor(Math.random() * figures.length)];
  const seedCentury = estimateCentury(seed.dates);
  const seedKeywords = new Set(seed.keywords || []);
  const scored = figures.map((figure) => {
    const century = estimateCentury(figure.dates);
    const sharedKeywordCount = (figure.keywords || []).filter((kw) => seedKeywords.has(kw)).length;
    let score = 1 + sharedKeywordCount * 3;
    if (century === seedCentury && century !== 'unknown') score += 4;
    return { figure, score };
  });

  const chosen = new Set([seed.id]);
  while (chosen.size < target) {
    const pool = scored.filter((entry) => !chosen.has(entry.figure.id));
    const total = pool.reduce((sum, x) => sum + x.score, 0);
    let cursor = Math.random() * total;
    for (const candidate of pool) {
      cursor -= candidate.score;
      if (cursor <= 0) {
        chosen.add(candidate.figure.id);
        break;
      }
    }
  }
  return figures.filter((f) => chosen.has(f.id));
}

function sentenceCount(text) {
  return text.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean).length;
}

function buildDenseParagraph(figure, targetWords, seeds) {
  const opening = `${figure.name} persists as a stratigraphic aperture rather than a biography, because archival residue, doctrinal rupture, and speculative method remain contemporaneous when read inside planetary duration.`;
  const connectors = [
    'therefore',
    'meanwhile',
    'consequently',
    'at the same time',
    'under this pressure',
    'within this manifold'
  ];

  const sentences = [opening];
  let words = opening.split(/\s+/).length;
  let cursor = 0;

  while (words < targetWords) {
    const seed = seeds[cursor % seeds.length];
    const connector = connectors[cursor % connectors.length];
    const sentence = `${seed} ${connector}, the figure is encountered as a moving facet where metaphysical vocabulary, technical craft, and political remainder continue to refract one another across centuries without offering terminal resolution.`;
    sentences.push(sentence);
    words += sentence.split(/\s+/).length;
    cursor += 1;
  }

  return sentences.join(' ');
}

function generateFigureCorpus(figure) {
  const biographicalWords = randomInt(280, 420);
  const facetWords = randomInt(220, 340);

  const biographicalSeed = `${figure.name} is positioned here as a temporal facet through which archives, laboratory notebooks, liturgical murmurs, and insurrectionary residues remain copresent, while the century in which the figure breathed only partially indexes the pressure being carried, because the lexical and symbolic traces migrate across eras and continue to refract technical, theological, and aesthetic strata that had not yet become historically adjacent.`;
  const facetSeed = `The designated hyperobject vector for ${figure.name} leans toward immanence as distributed causality, where each concept arrives with sediment already attached, and where the philosophical instrument cannot isolate pure origin because every claim bears geological drag, political ash, and spectral rehearsal from unrealized social worlds preserved as latent amplitude.`;
  const driftSeed = `In the occult drift fragment for ${figure.name}, diagrams tilt, coordinates loosen, and doctrinal boundaries begin to shear as if the page itself were a mineral fault, leaving an utterance that neither resolves nor stabilizes, yet continues to emit pressure through recursive citation and oblique resonance.`;

  return {
    paragraphA: buildDenseParagraph(figure, biographicalWords, [biographicalSeed, facetSeed]),
    paragraphB: buildDenseParagraph(figure, facetWords, [driftSeed, facetSeed]),
    shard: `${figure.name}: "A facet touched in one century returns as tectonic rumor in another, still carrying unfinished charge."`
  };
}

function sentenceLengthAverage(text) {
  const sentences = text.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean);
  if (!sentences.length) return 0;
  const words = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  return words.reduce((a, b) => a + b, 0) / words.length;
}

function longSentenceRatio(text, threshold = 28) {
  const sentences = text.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean);
  if (!sentences.length) return 0;
  const longSentences = sentences.filter((sentence) => sentence.split(/\s+/).filter(Boolean).length >= threshold).length;
  return longSentences / sentences.length;
}

function denseClauseRatio(text, minCommas = 2) {
  const sentences = text.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean);
  if (!sentences.length) return 0;
  const dense = sentences.filter((sentence) => (sentence.match(/,/g) || []).length >= minCommas).length;
  return dense / sentences.length;
}

function proseIsValid(text) {
  const average = sentenceLengthAverage(text);
  const longRatio = longSentenceRatio(text);
  const clauseRatio = denseClauseRatio(text);
  return (
    average > 25
    && longRatio >= 0.6
    && clauseRatio >= 0.5
    && sentenceCount(text) >= 6
    && PROHIBITED_PATTERNS.every((rx) => !rx.test(text))
  );
}

function chooseLayoutClass(state) {
  const options = LAYOUT_CLASSES.filter((name) => name !== 'block-invert' || state.invertedCount < 1);
  const chosen = options[Math.floor(Math.random() * options.length)];
  if (chosen === 'block-invert') state.invertedCount += 1;
  if (DISRUPTION_CLASSES.includes(chosen)) state.disruptionCount += 1;
  return chosen;
}

function renderFigureBlock(figure, corpus, layoutClass) {
  const block = document.createElement('section');
  block.className = `figure-block ${layoutClass}`;
  block.innerHTML = `
    <h2>${figure.name}</h2>
    <p>${corpus.paragraphA}</p>
    <p>${corpus.paragraphB}</p>
    <p><em>${corpus.shard}</em></p>
  `;
  return block;
}

function renderImageBlock(image, layoutClass) {
  const figure = document.createElement('figure');
  figure.className = `image-block ${layoutClass}`;
  figure.innerHTML = `<img src="${image.src}" alt="${image.caption}" loading="lazy" /><figcaption>${image.caption}</figcaption>`;
  return figure;
}

async function bootstrap() {
  const response = await fetch('./figures.json');
  const figures = await response.json();
  const chosenFigures = weightedFigureSelection(figures, 4, 8);

  const page = document.getElementById('page');
  const layoutState = { disruptionCount: 0, invertedCount: 0 };

  const fragments = [];
  for (const figure of chosenFigures) {
    const corpus = generateFigureCorpus(figure);
    const mergedText = `${corpus.paragraphA} ${corpus.paragraphB}`;
    if (!proseIsValid(mergedText)) {
      continue;
    }
    fragments.push({ type: 'figure', figure, corpus });
  }

  const imageCount = randomInt(2, 5);
  const images = sample(ARCHIVAL_IMAGES, imageCount).map((item) => ({ type: 'image', item }));

  const interleaved = [...fragments, ...images].sort(() => Math.random() - 0.5);

  interleaved.forEach((item) => {
    const className = chooseLayoutClass(layoutState);
    if (item.type === 'figure') {
      page.appendChild(renderFigureBlock(item.figure, item.corpus, className));
    } else {
      page.appendChild(renderImageBlock(item.item, className));
    }
  });

  if (layoutState.disruptionCount < 3) {
    for (let i = layoutState.disruptionCount; i < 3; i += 1) {
      const marker = document.createElement('section');
      marker.className = 'block-margin';
      marker.innerHTML = `<p>Architectural dislocation marker ${i + 1}.</p><p>${SYSTEM_PROMPT}</p>`;
      page.appendChild(marker);
    }
  }
}

bootstrap();
