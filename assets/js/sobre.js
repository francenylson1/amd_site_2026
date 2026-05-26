'use strict';

(async () => {
  try {
    const res = await fetch('/api/about-photos');
    if (!res.ok) return;
    const photos = await res.json();

    const professorPhotos = photos.filter(p => p.section === 'professor');
    if (professorPhotos.length > 0) {
      const img = document.querySelector('.professor-photo img');
      if (img) {
        img.src = '/' + professorPhotos[0].image_url;
        if (professorPhotos[0].alt_text) img.alt = professorPhotos[0].alt_text;
      }
    }

    const espacoPhotos = photos.filter(p => p.section === 'espaco');
    if (espacoPhotos.length > 0) {
      const gallery = document.querySelector('.about-gallery');
      if (gallery) {
        gallery.innerHTML = espacoPhotos.map(p =>
          `<img src="/${p.image_url}" alt="${p.alt_text || 'Espaço Maker'}" loading="lazy" width="400" height="300">`
        ).join('');
        if (window.AMD?.observeReveal) window.AMD.observeReveal(gallery);
      }
    }
  } catch {
    // Fallback silencioso: HTML estático permanece visível
  }
})();
