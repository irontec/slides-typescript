import baseConfig from './../content/config.json';

const context = require.context('../content/slides/', true, /\.[md|html?]/);

// resolve which extra attributes are added to section tag
function resolveAttrs(attrs) {
  const keys = Object.keys(attrs);
  if (!keys.length) return '';
  return ` ${keys.map(key => `${key}="${attrs[key]}"`)}`;
}


function prepareSlide(slide) {

  let slidePath = '', attrs = {};

  if (typeof slide === 'string') {
    slidePath = `./${slide}`;
  } else if (slide.path) {
    slidePath = `./${slide.path}`;
    if (slide.attrs) {
      attrs = slide.attrs;
    }
  } else {
    console.error("not a valid slide configuration found.");
  }

  const isMd = slidePath.endsWith('.md');

  const content = context(slidePath);
  if (isMd) {
      return `<section data-markdown${resolveAttrs(attrs)}><textarea data-template>${content}</textarea></section>`;
  } else {
    return `<section${resolveAttrs(attrs)}>${content}</section>`;
  }
}

export default baseConfig.slides.map(slide => {
  return (Array.isArray(slide))? slide.map(prepareSlide):prepareSlide(slide);
});