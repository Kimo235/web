const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.style.display === 'flex';
    mobileMenu.style.display = isOpen ? 'none' : 'flex';
    mobileMenu.setAttribute('aria-hidden', isOpen);
    burger.classList.toggle('is-active', !isOpen);
  });

  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden', true);
      burger.classList.remove('is-active');
    });
  });
}

const animatedNodes = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = entry.target;
      target.classList.add('is-visible');

      if (target.dataset.animate === 'stagger') {
        const items = target.querySelectorAll('[data-animate-item]');
        items.forEach((item, index) => {
          item.style.transitionDelay = `${index * 120}ms`;
          requestAnimationFrame(() => {
            item.classList.add('is-visible');
          });
        });
      }

      obs.unobserve(target);
    }
  });
}, {
  threshold: 0.2,
  rootMargin: '0px 0px -10%'
});

animatedNodes.forEach(node => {
  if (node.dataset.animate === 'hero') {
    node.classList.add('is-visible');
    return;
  }
  observer.observe(node);
});

const staggerRoots = document.querySelectorAll('[data-animate-item]');
staggerRoots.forEach(node => {
  if (!node.closest('[data-animate="stagger"]')) {
    observer.observe(node);
  }
});

const heroSection = document.querySelector('[data-hero]');

if (heroSection) {
  const heroSlides = Array.from(heroSection.querySelectorAll('[data-hero-slide]'));
  const heroNavItems = Array.from(heroSection.querySelectorAll('[data-hero-nav]'));
  const transitionLayer = heroSection.querySelector('[data-hero-transition]');
  let heroCurrent = 0;
  let heroTimer = null;
  const heroDelay = 6500;

  const setHeroSlide = index => {
    if (!heroSlides.length) {
      return;
    }

    const previous = heroCurrent;
    heroCurrent = (index + heroSlides.length) % heroSlides.length;

    if (heroCurrent === previous && heroSection.dataset.heroReady === 'true') {
      return;
    }

    heroSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === heroCurrent;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', (!isActive).toString());
      slide.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    heroNavItems.forEach((item, itemIndex) => {
      const isActive = itemIndex === heroCurrent;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive.toString());
      item.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    heroSection.setAttribute('data-active-index', `${heroCurrent}`);
    heroSection.dataset.heroReady = 'true';

    if (transitionLayer) {
      transitionLayer.classList.remove('is-animating');
      void transitionLayer.offsetWidth;
      transitionLayer.classList.add('is-animating');
    }
  };

  const stopHeroAutoplay = () => {
    if (heroTimer) {
      clearTimeout(heroTimer);
      heroTimer = null;
    }
  };

  const startHeroAutoplay = () => {
    if (heroSlides.length < 2) {
      return;
    }

    stopHeroAutoplay();
    heroTimer = window.setTimeout(() => {
      setHeroSlide(heroCurrent + 1);
      startHeroAutoplay();
    }, heroDelay);
  };

  heroNavItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      stopHeroAutoplay();
      setHeroSlide(index);
      startHeroAutoplay();
    });

    item.addEventListener('mouseenter', stopHeroAutoplay);
    item.addEventListener('mouseleave', startHeroAutoplay);
    item.addEventListener('focus', stopHeroAutoplay);
    item.addEventListener('blur', startHeroAutoplay);
  });

  heroSection.addEventListener('mouseenter', stopHeroAutoplay);
  heroSection.addEventListener('mouseleave', startHeroAutoplay);
  heroSection.addEventListener('touchstart', stopHeroAutoplay, { passive: true });
  heroSection.addEventListener('touchend', startHeroAutoplay, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopHeroAutoplay();
    } else {
      startHeroAutoplay();
    }
  });

  setHeroSlide(0);
  startHeroAutoplay();
}