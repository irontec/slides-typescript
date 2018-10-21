import baseConfig from './../content/config.json';

import 'reveal.js/css/reveal.css';

/**
 * Select current revel.js theme
 */
import './../content/css/index.scss';

// jQuery!
import $ from 'jquery';

// font-awesome
import { library, dom } from "@fortawesome/fontawesome-svg-core";
dom.watch();

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
  ...baseConfig.options,
});

import 'reveal.js/plugin/markdown/marked.js'
import { RevealMarkdown } from 'reveal.js/plugin/markdown/markdown';
RevealMarkdown.initialize();

// #if plugins.highlightjs
import 'highlight.js/styles/atom-one-dark.css'
import hljs from 'highlight.js/lib/highlight';

Promise.all(
  // Auto-find languages (alias not supported)
  $("code").toArray()
  .map(item => String($(item).attr("class") || "").replace("lang-","")).filter(Boolean)
  .map(lang => ({lang, bundledResult: require('highlight.js/lib/languages/'+ lang + '.js')}))
  .map(({lang, bundledResult}) => {
    return new Promise((resolve) => {
      bundledResult((result) => {
        hljs.registerLanguage(lang, result);
        return resolve();
      });
    });
  })
).then(() => hljs.initHighlightingOnLoad());
// #endif

// #if plugins.menu
import 'reveal.js-menu/menu.css';
import {
  faImages,
  faAdjust,
  faStickyNote,
  faTimes,
  faBars,
  faArrowAltCircleRight,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
library.add(faImages, faAdjust, faStickyNote, faTimes, faBars, faArrowAltCircleRight, faCheckCircle);
require("exports-loader?RevealMenu!reveal.js-menu/menu.js");
// #endif

// #if plugins.zoom
import 'reveal.js/plugin/zoom-js/zoom.js';
// #endif

// #if plugins.search
import 'reveal.js/plugin/search/search.js';
// #endif

// #if plugins.notes
const RevealNotes = require("exports-loader?RevealNotes!reveal.js/plugin/notes/notes")
Reveal.removeKeyBinding(83); // remove default notes.js keybinding
Reveal.addKeyBinding({keyCode: 83, key: 'S', description: 'Speaker notes view'}, function() {
  RevealNotes.open('./notes.html'); // pass "webpacked" route
} );
// #endif

// #if serviceWorker
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}
// #endif