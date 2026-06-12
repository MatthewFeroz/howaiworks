// Single source of truth for per-route SEO metadata and crawlable lesson prose.
// Consumed by both the React app (DeeperDive component, useSeo hook) and
// scripts/prerender.mjs — keep this file plain JS with string content only (no JSX).

export const SITE = {
  origin: 'https://howaiworks.io',
  name: 'howaiworks.io',
  tagline: 'Learn How AI Works, Interactively',
  ogImage: '/og.png',
  author: {
    name: 'Matt Feroz',
    url: 'https://matthewferoz.com',
  },
  github: 'https://github.com/MatthewFeroz/howaiworks',
}

export const ROUTES = {
  '/': {
    title: 'Learn How AI Works, Interactively | howaiworks.io',
    description:
      "Don't read about AI — experience it. Free interactive lessons on tokenization, embeddings, attention, and inference. See what happens inside the machine.",
    proseTitle: 'What you can learn here',
    sections: [
      {
        heading: 'Interactive lessons, not lectures',
        paragraphs: [
          'howaiworks.io is a free, open-source learning platform where you experience how modern AI actually works instead of reading about it. Each lesson is a hands-on demo: type a sentence and watch GPT’s real tokenizer split it into tokens, explore a map of word embeddings organized by meaning, trace how a transformer’s attention mechanism figures out what “it” refers to, and run a real language model entirely inside your browser.',
          'The lessons build on each other in the same order an AI system processes language: first the history of how we got here, then tokenization (how text becomes numbers), embeddings (how numbers capture meaning), attention (how models weigh context), and finally inference (where and how models actually run).',
        ],
      },
      {
        heading: 'Who this is for',
        paragraphs: [
          'The lessons are designed for university students taking their first AI or NLP course, teachers looking for live demos to use in class, self-taught developers who want intuition to go with the APIs they use, and anyone curious about what is really happening inside ChatGPT, Claude, and other large language models. No math background or programming experience is required to start — every concept is something you can see and manipulate directly.',
        ],
      },
    ],
  },

  '/what-is-ai': {
    title: 'What Is AI? Four Eras of AI History, Animated | howaiworks.io',
    description:
      'From Turing’s 1950 question to ChatGPT: an animated tour of AI’s four eras — symbolic rules, machine learning, deep learning, and generative AI.',
    proseTitle: 'The four eras of AI, in brief',
    sections: [
      {
        heading: 'From hand-written rules to learned behavior',
        paragraphs: [
          'Artificial intelligence did not appear overnight — it evolved through four distinct eras. The symbolic era began with Alan Turing’s 1950 paper “Computing Machinery and Intelligence” and tried to capture intelligence as hand-written rules: if X, then Y. It produced chess programs and expert systems, but rules written by humans could never cover the messiness of the real world.',
          'The machine learning era flipped the approach: instead of writing rules, let the computer find patterns in examples. Algorithms like support vector machines (1992) learned decision boundaries from data, powering spam filters and recommendation systems — but humans still had to hand-design the features the models learned from.',
        ],
      },
      {
        heading: 'Deep learning and the generative explosion',
        paragraphs: [
          'In 2012, AlexNet’s win on the ImageNet challenge kicked off the deep learning era: neural networks with many layers that learn their own features directly from raw data, fueled by GPUs and massive datasets. Image recognition, speech recognition, and translation all jumped from “barely works” to “better than humans” within a few years.',
          'The current generative era traces to a single 2017 paper, “Attention Is All You Need,” which introduced the transformer architecture. Trained on terabytes of text with one deceptively simple objective — predict the next word — transformers turned out to absorb grammar, facts, and reasoning patterns, producing the large language models behind ChatGPT, Claude, and Gemini. The interactive timeline on this page walks through all four eras, with the landmark paper from each one.',
        ],
      },
    ],
  },

  '/tokenize': {
    title: 'Interactive AI Tokenizer — See Text the Way GPT Does | howaiworks.io',
    description:
      'Type anything and watch GPT-4’s real tokenizer (cl100k_base) split it into tokens, live. Understand why AI miscounts letters and why some languages cost more.',
    proseTitle: 'What is tokenization?',
    sections: [
      {
        heading: 'How AI reads your text',
        paragraphs: [
          'Language models never see letters or words — they see tokens. Before your prompt reaches the model, a tokenizer chops it into chunks drawn from a fixed vocabulary and replaces each chunk with a number (a token ID). The demo on this page runs cl100k_base, the actual byte-pair-encoding (BPE) tokenizer used by GPT-4, directly in your browser: everything you type is tokenized live, and you can even edit the raw token IDs and watch them decode back into text.',
          'Common words like “the” get a single token, while rarer words are split into sub-word pieces. That is why “strawberry” famously breaks into multiple tokens — and why language models struggle to count the letter “r” in it: the model never sees individual letters at all.',
        ],
      },
      {
        heading: 'Why tokens matter in practice',
        paragraphs: [
          'Tokens are the unit of everything in modern AI: API pricing is per token, context windows are measured in tokens, and generation speed is tokens per second. Tokenization also has an equity dimension — the same sentence in Arabic or Hindi can cost several times more tokens than in English, because tokenizer vocabularies are trained mostly on English text. Try typing مرحبا in the demo and compare the token count to “hello.”',
        ],
      },
    ],
  },

  '/understand': {
    title: 'Word Embeddings, Visualized — How AI Understands Meaning | howaiworks.io',
    description:
      'Explore an interactive map where words cluster by meaning, and try vector arithmetic like king − man + woman = queen. See how AI turns words into geometry.',
    proseTitle: 'What are word embeddings?',
    sections: [
      {
        heading: 'Meaning as geometry',
        paragraphs: [
          'After tokenization turns your text into numbers, embeddings give those numbers meaning. Every token is mapped to a vector — a long list of numbers that acts like coordinates in a high-dimensional space. Words used in similar contexts end up close together: “cat” sits near “dog,” “Paris” near “London.” The interactive Meaning Map on this page projects real embeddings down to two dimensions so you can see those neighborhoods form.',
        ],
      },
      {
        heading: 'Vector arithmetic: king − man + woman = queen',
        paragraphs: [
          'The most striking property of embeddings is that directions in the space carry meaning. Subtract the “man” vector from “king” and add “woman,” and the nearest word to the result is “queen.” The gender direction, the plural direction, even the capital-city direction all emerge purely from patterns in text — nobody programs them in. The Word Arithmetic demo lets you try these equations yourself with real embedding data.',
          'Embeddings are also the technology behind semantic search and retrieval-augmented generation (RAG): when an app “finds relevant documents,” it is comparing embedding vectors. Understanding this page is understanding half of how modern AI products work.',
        ],
      },
    ],
  },

  '/attention': {
    title: 'How Attention Works in Transformers, Interactively | howaiworks.io',
    description:
      'In “The animal didn’t cross the street because it was tired,” what does “it” mean? Watch a transformer’s self-attention figure that out, step by step.',
    proseTitle: 'What is attention?',
    sections: [
      {
        heading: 'How models decide what matters',
        paragraphs: [
          'Embeddings give every word a meaning, but meaning depends on context — the word “it” means nothing on its own. Self-attention is the mechanism that lets every token in a sentence look at every other token and decide which ones matter for interpreting it. In the classic example on this page, “The animal didn’t cross the street because it was tired,” attention is how the model links “it” back to “animal” rather than “street” — and if you change “tired” to “wide,” the link flips.',
        ],
      },
      {
        heading: 'Heads, layers, and why this scaled',
        paragraphs: [
          'Real transformers run many attention heads in parallel — one might track subject–verb relationships while another tracks pronoun references — and stack dozens of layers, so later layers build on earlier ones to capture increasingly abstract relationships. This is the core idea of the 2017 “Attention Is All You Need” paper, and it is the single mechanism most responsible for the capabilities of GPT-4, Claude, and every other modern large language model. The interactive demo lets you hover over each word to see its attention links, then goes deeper with the concept, the actual code, and a challenge.',
        ],
      },
    ],
  },

  '/run': {
    title: 'Run an LLM in Your Browser — Cloud vs. Local AI | howaiworks.io',
    description:
      'Chat with a real language model running entirely in your browser via WebGPU, then race it against the cloud. Understand the privacy, cost, and speed tradeoffs.',
    proseTitle: 'Where does AI actually run?',
    sections: [
      {
        heading: 'A real model, on your machine, right now',
        paragraphs: [
          'Every previous lesson showed a piece of the pipeline — this one runs the whole thing. Using WebLLM and WebGPU, this page downloads a quantized small language model (Qwen 2.5, 0.5 billion parameters) and runs inference entirely inside your browser tab. No server, no API key: the tokens are generated by your own GPU. If your browser does not support WebGPU, a recorded replay shows what it looks like.',
        ],
      },
      {
        heading: 'Cloud vs. local: the real tradeoffs',
        paragraphs: [
          'Cloud models like GPT-4 and Claude are enormous, fast, and always up to date — but you pay per token and your data leaves your machine. Local models are private, free to run, and work offline — but you trade away model size and speed. The Latency Race demo on this page makes the difference visceral, and the tradeoff cards break down when each option wins: privacy-sensitive work, cost-sensitive scale, and offline use favor local; frontier capability favors the cloud.',
          'This tradeoff is becoming central to how AI is deployed — from phones running on-device assistants to workstations like NVIDIA’s DGX Spark designed to run 200-billion-parameter models at your desk.',
        ],
      },
    ],
  },

  '/about': {
    title: 'About howaiworks.io — Interactive AI Education by Matt Feroz',
    description:
      'howaiworks.io makes AI education visceral: open-source, hands-on lessons where you experience tokenization, embeddings, attention, and inference directly.',
    proseTitle: 'About this project',
    sections: [
      {
        heading: 'Why howaiworks.io exists',
        paragraphs: [
          'howaiworks.io started with a question Matt Feroz asked during an NVIDIA developer livestream: is AI literacy a hardware problem or a software education problem? Hardware is being solved — machines like DGX Spark can run 200-billion-parameter models on a desk. This site is the education side: instead of slides and lectures, every lesson is something you do. Type and watch text become tokens. Drag through a map of meaning. Run a model on your own GPU.',
          'The entire platform is open source under the MIT license, free to use in classrooms, and built by Matt Feroz, an AI coach and engineer who helps professionals put AI to work. The project is part of a broader learning ecosystem including live workshops, a learning community, and 1:1 coaching at matthewferoz.com.',
        ],
      },
    ],
  },

  '/resources': {
    title: 'AI Learning Resources — Papers, Tools & Visualizers | howaiworks.io',
    description:
      'A curated list of the best free resources for understanding AI: landmark papers, interactive visualizers, tokenizer tools, and explainers — organized by lesson.',
    proseTitle: 'About these resources',
    sections: [
      {
        heading: 'Curated, not exhaustive',
        paragraphs: [
          'There is no shortage of AI content — the problem is knowing what is worth your time. This page collects the resources that pair best with each interactive lesson on howaiworks.io: the landmark papers behind each idea (from the original BPE tokenization paper to “Attention Is All You Need”), the best independent visualizers like Brendan Bycroft’s LLM visualization, and the libraries the demos on this site are built with, such as js-tiktoken and WebLLM. Everything listed is free.',
        ],
      },
    ],
  },
}

// Ordered list used for sitemap generation and prev/next navigation.
export const ROUTE_ORDER = ['/', '/what-is-ai', '/tokenize', '/understand', '/attention', '/run', '/about', '/resources']

// Lesson routes get LearningResource structured data; others get WebPage.
export const LESSON_ROUTES = ['/what-is-ai', '/tokenize', '/understand', '/attention', '/run']
