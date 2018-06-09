import baseConfig from './../content/config.json';

import 'reveal.js/css/reveal.css';
import 'highlight.js/styles/atom-one-dark.css'

/**
 * Select current revel.js theme
 */
import 'reveal.js/css/theme/moon.css';

//import '../reveal-irontec-theme/css/styleLight.css'

import './../content/css/index.scss';

import $ from 'jquery';
import Reveal from 'reveal.js';
import Marked from 'reveal.js/plugin/markdown/marked.js'
import { RevealMarkdown } from 'reveal.js/plugin/markdown/markdown';
import hljs from 'reveal.js/plugin/highlight/highlight';
import notes from 'reveal.js/plugin/notes/notes';

import slides from './slides-loader.js';

const $slides = $('#slides');

slides.forEach(slide => {
  if (Array.isArray(slide)) {
    $slides.append(`<section>${slide.join('')}</section>`);
   } else {
    $slides.append(slide);
   }
});

Reveal.initialize({
  controls: true,
  progress: true,
  history: true,
  center: true,
  slideNumber: true,
  margin: 0.0,
  transition: 'slide',
  // Optional libraries used to extend on reveal.js
  ...baseConfig.options
});



RevealMarkdown.initialize();
hljs.initHighlightingOnLoad();
