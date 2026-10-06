(function () {
  'use strict';

  const gap = 20;

  function initSlider(slider) {
    const track = slider.querySelector('.slider-track');
    const trackContainer = slider.querySelector('.slider-track-container');
    const cards = Array.from(slider.querySelectorAll('.card'));
    const btnPrev = slider.querySelector('.slider-btn--prev');
    const btnNext = slider.querySelector('.slider-btn--next');
    const dotsContainer = slider.querySelector('.slider-dots');

    if (!track || !trackContainer || !cards.length) return;

    let currentIndex = 0;
    let maxIndex = 0;

    function getCardStep() {
      if (!cards[0]) return 0;
      const style = getComputedStyle(track);
      const gapValue = parseFloat(style.gap) || gap;
      return cards[0].offsetWidth + gapValue;
    }

    function getVisibleCount() {
      const containerWidth = trackContainer.offsetWidth;
      const step = getCardStep();
      if (step <= 0) return 1;
      return Math.max(1, Math.floor((containerWidth + gap) / step));
    }

    function updateMaxIndex() {
      const visible = getVisibleCount();
      maxIndex = Math.max(0, cards.length - visible);
    }

    function setPosition(index) {
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      const step = getCardStep();
      track.style.transform = `translateX(-${currentIndex * step}px)`;
      updateButtons();
      updateDots();
    }

    function updateButtons() {
      if (btnPrev) btnPrev.disabled = currentIndex <= 0;
      if (btnNext) btnNext.disabled = currentIndex >= maxIndex;
    }

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const dotCount = maxIndex + 1;
      for (let i = 0; i < dotCount; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slider-dot';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', i === currentIndex);
        btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
        btn.addEventListener('click', () => setPosition(i));
        dotsContainer.appendChild(btn);
      }
    }

    function updateDots() {
      const dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];
      dots.forEach((dot, i) => {
        dot.setAttribute('aria-selected', i === currentIndex);
      });
    }

    function init() {
      updateMaxIndex();
      setPosition(0);
      buildDots();
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => setPosition(currentIndex - 1));
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => setPosition(currentIndex + 1));
    }

    let touchStartX = 0;
    trackContainer.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    trackContainer.addEventListener(
      'touchend',
      (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        const minSwipe = 50;
        if (Math.abs(diff) >= minSwipe) {
          if (diff > 0) setPosition(currentIndex + 1);
          else setPosition(currentIndex - 1);
        }
      },
      { passive: true }
    );

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateMaxIndex();
        setPosition(Math.min(currentIndex, maxIndex));
        buildDots();
      }, 150);
    };
    window.addEventListener('resize', onResize);

    init();
  }

  const containers = document.querySelectorAll('.slider-container');
  containers.forEach(initSlider);

  // Project mode: light / dark toggle
  const modeToggle = document.querySelector('.mode-toggle');
  const MODE_KEY = 'card-slider-mode';
  if (modeToggle) {
    if (localStorage.getItem(MODE_KEY) === 'light') {
      document.body.classList.add('mode-light');
    }
    modeToggle.addEventListener('click', function () {
      document.body.classList.toggle('mode-light');
      localStorage.setItem(MODE_KEY, document.body.classList.contains('mode-light') ? 'light' : 'dark');
    });
  }
})();
