const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');

if (burger && mobileMenu) {
  const toggleMenu = (open) => {
    const isOpen = typeof open === 'boolean' ? open : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', isOpen.toString());
  };

  // Ensure initial state
  toggleMenu(false);

  burger.addEventListener('click', () => toggleMenu());

  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close mobile menu with Escape for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMenu(false);
      burger.focus();
    }
  });
}

/* Contact modal: open/close + simple focus return */
const contactOpen = document.getElementById('contact-open');
const modalBackdrop = document.createElement('div');
modalBackdrop.className = 'modal-backdrop';
modalBackdrop.innerHTML = [
  '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="contact-title">',
    '<h3 id="contact-title">Anfrage senden</h3>',
    '<div class="form-row"><label class="sr-only">Name<input type="text" id="contact-name" placeholder="Ihr Name"></label></div>',
    '<div class="form-row"><label class="sr-only">Email<input type="email" id="contact-email" placeholder="Email"></label></div>',
    '<div class="form-row"><label class="sr-only">Nachricht<textarea id="contact-message" rows="4" placeholder="Ihre Nachricht"></textarea></label></div>',
    '<div class="modal-actions">',
      '<button type="button" class="btn btn-ghost" data-modal-close>Abbrechen</button>',
      '<button type="button" class="btn btn-primary" id="contact-send">Senden</button>',
    '</div>',
  '</div>'
].join('');

document.body.appendChild(modalBackdrop);

const openModal = () => {
  modalBackdrop.classList.add('open');
  modalBackdrop.querySelector('.modal').focus();
  modalBackdrop.setAttribute('aria-hidden', 'false');
};

const closeModal = () => {
  modalBackdrop.classList.remove('open');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  if (contactOpen) contactOpen.focus();
};

modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop || e.target.matches('[data-modal-close]')) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeModal();
});

if (contactOpen) {
  contactOpen.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
}

// Basic send handler (no backend) — show confirmation toast
const contactSend = () => {
  closeModal();
  const toast = document.createElement('div');
  toast.className = 'contact-sent-toast';
  toast.textContent = 'Danke — wir melden uns bald bei Ihnen.';
  Object.assign(toast.style, { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--wood-dark)', color: '#fff', padding: '0.6rem 1rem', borderRadius: '6px', zIndex: 2100 });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
};

document.body.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'contact-send') {
    contactSend();
  }
});

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

const heroLabo = document.querySelector('[data-hero-labo]');

if (heroLabo) {
  const heroItems = Array.from(heroLabo.querySelectorAll('[data-hero-item]'));
  const heroIndicators = Array.from(heroLabo.querySelectorAll('[data-hero-indicator]'));
  const mainImage = heroLabo.querySelector('[data-hero-main]');
  const heroLink = heroLabo.querySelector('[data-hero-link]');
  const overlayText = heroLabo.querySelector('[data-hero-overlay]');
  const heroMainImage = heroLabo.querySelector('[data-hero-main-image]');
  let heroCurrent = Math.max(0, heroItems.findIndex(item => item.classList.contains('is-active')));
  let heroTimer = null;
  const heroDelay = 7000;

  const setHeroState = (index, userTriggered = false) => {
    if (!heroItems.length) return;
    const targetIndex = (index + heroItems.length) % heroItems.length;
    const target = heroItems[targetIndex];

    heroItems.forEach((item, i) => {
      const isActive = i === targetIndex;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive.toString());
      item.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    if (mainImage && target.dataset.image) {
      mainImage.src = target.dataset.image;
      mainImage.alt = target.dataset.overlay || 'Hero Bild';
    }

    if (heroLink && target.dataset.link) {
      heroLink.href = target.dataset.link;
    }

    if (overlayText) {
      overlayText.textContent = target.dataset.overlay || '';
    }

    heroIndicators.forEach((indicator, indicatorIndex) => {
      const isDotActive = indicatorIndex === targetIndex;
      indicator.classList.toggle('is-active', isDotActive);
      indicator.setAttribute('aria-current', isDotActive ? 'true' : 'false');
    });

    heroCurrent = targetIndex;

    if (userTriggered) {
      restartAutoplay();
    }
  };

  const stopAutoplay = () => {
    if (heroTimer) {
      clearTimeout(heroTimer);
      heroTimer = null;
    }
  };

  const startAutoplay = () => {
    if (heroItems.length < 2) return;
    stopAutoplay();
    heroTimer = window.setTimeout(() => {
      setHeroState(heroCurrent + 1);
      startAutoplay();
    }, heroDelay);
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  const attachNavHandlers = (nodeList) => {
    nodeList.forEach((item, index) => {
      item.addEventListener('mouseenter', () => setHeroState(index, true));
      item.addEventListener('click', () => setHeroState(index, true));
      item.addEventListener('focus', () => setHeroState(index, true));
    });
  };

  attachNavHandlers(heroItems);
  attachNavHandlers(heroIndicators);

  heroLabo.addEventListener('mouseenter', stopAutoplay);
  heroLabo.addEventListener('mouseleave', startAutoplay);
  heroLabo.addEventListener('touchstart', stopAutoplay, { passive: true });
  heroLabo.addEventListener('touchend', startAutoplay, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  setHeroState(heroCurrent || 0);
  startAutoplay();

  if (overlayText && heroMainImage) {
    const setOverlayHover = state => {
      heroMainImage.classList.toggle('is-overlay-hover', state);
      overlayText.classList.toggle('is-overlay-hover', state);
    };

    ['mouseenter', 'focus'].forEach(evt => {
      overlayText.addEventListener(evt, () => setOverlayHover(true));
    });

    ['mouseleave', 'blur'].forEach(evt => {
      overlayText.addEventListener(evt, () => setOverlayHover(false));
    });
  }
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
