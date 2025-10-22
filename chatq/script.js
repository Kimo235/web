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

const CART_STORAGE_KEY = 'tischmadech-cart';
const CART_CURRENCY_FORMATTER = new Intl.NumberFormat('de-CH', {
  style: 'currency',
  currency: 'CHF',
  minimumFractionDigits: 2
});

function formatCartCurrency(value) {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return CART_CURRENCY_FORMATTER.format(safeAmount);
}

function readCartItems() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => item && typeof item.id === 'string');
    }
    return [];
  } catch (error) {
    console.error('Cart parse error', error);
    return [];
  }
}

function writeCartItems(items) {
  const serialised = JSON.stringify(items);
  localStorage.setItem(CART_STORAGE_KEY, serialised);
  window.dispatchEvent(new CustomEvent('cart:change', { detail: { items } }));
  return items;
}

function getCartItemCount(items = readCartItems()) {
  return items.reduce((total, entry) => total + (entry.qty || 0), 0);
}

function updateCartCountBadges() {
  const count = getCartItemCount();
  document.querySelectorAll('[data-cart-count]').forEach(node => {
    node.textContent = count.toString();
    node.classList.remove('is-updated');
    void node.offsetWidth;
    node.classList.add('is-updated');
    window.setTimeout(() => node.classList.remove('is-updated'), 620);
  });
}
function addItemToCart(entry) {
  if (!entry || !entry.id) {
    return readCartItems();
  }

  const items = readCartItems();
  const existing = items.find(item => item.id === entry.id);
  const quantity = Math.max(1, Number(entry.qty) || 1);

  if (existing) {
    existing.qty = (existing.qty || 0) + quantity;
    existing.price = Number(entry.price) || existing.price;
    existing.img = entry.img || existing.img;
    existing.title = entry.title || existing.title;
  } else {
    items.push({
      id: entry.id,
      title: entry.title,
      price: Number(entry.price) || 0,
      img: entry.img,
      qty: quantity
    });
  }

  writeCartItems(items);
  updateCartCountBadges();
  window.dispatchEvent(new CustomEvent('cart:added', { detail: { item: entry, items } }));
  return items;
}

updateCartCountBadges();

window.TischMadeCart = {
  read: readCartItems,
  write: writeCartItems,
  add: addItemToCart,
  count: getCartItemCount,
  update: updateCartCountBadges,
  format: formatCartCurrency
};








document.addEventListener('DOMContentLoaded', () => {
  const toast = document.createElement('aside');
  toast.className = 'cart-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = [
    '<div class="cart-toast-body">',
      '<p class="cart-toast-title">Zum Warenkorb wechseln?</p>',
      '<p class="cart-toast-copy"></p>',
    '</div>',
    '<div class="cart-toast-actions">',
      '<button type="button" class="cart-toast-btn cart-toast-btn-secondary" data-toast-action="continue">Weiter einkaufen</button>',
      '<button type="button" class="cart-toast-btn" data-toast-action="cart">Zum Warenkorb</button>',
    '</div>'
  ].join('');

  document.body.appendChild(toast);

  const copyNode = toast.querySelector('.cart-toast-copy');
  const continueBtn = toast.querySelector('[data-toast-action="continue"]');
  const cartBtn = toast.querySelector('[data-toast-action="cart"]');
  let hideTimer;

  const hideToast = () => {
    toast.classList.remove('is-visible');
  };

  const showToast = (item) => {
    const qty = Math.max(1, Number(item && item.qty) || 1);
    const productTitle = item && item.title ? item.title : 'Produkt';
    const message = qty + 'x ' + productTitle + ' wurde hinzugefuegt.';
    copyNode.textContent = message;
    toast.classList.add('is-visible');

    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hideToast, 6000);
  };

  continueBtn.addEventListener('click', hideToast);
  cartBtn.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });

  window.addEventListener('cart:added', (event) => {
    showToast(event.detail && event.detail.item);
  });
});
