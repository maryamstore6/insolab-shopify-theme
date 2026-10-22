/* ============================================================
   INSOLAB SHOPIFY — Motion system
   Lenis smooth scroll + GSAP ScrollTrigger choreography
   Cleaned: no preloader, no fake checkout
   ============================================================ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------------------------------------------------------
     1. LENIS SMOOTH SCROLL
     --------------------------------------------------------- */
  let lenis = null;

  function initLenis() {
    if (prefersReduced || typeof Lenis === 'undefined') return null;

    const instance = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
      infinite: false
    });

    if (window.ScrollTrigger) {
      instance.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => instance.raf(time * 1000));
      gsap.ticker.lagSmoothing(500, 33);
    } else {
      function raf(time) {
        instance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    return instance;
  }

  /* ---------------------------------------------------------
     2. SMOOTH ANCHORS (Lenis-aware)
     --------------------------------------------------------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.6 });
        else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeNav();
      });
    });
  }

  /* ---------------------------------------------------------
     3. HEADER STATE + PROGRESS BAR
     --------------------------------------------------------- */
  function initChrome() {
    const hdr = document.querySelector('.hdr');
    const progress = document.querySelector('.progress');

    function onScroll() {
      const y = window.scrollY || window.pageYOffset;
      const stuck = y > 40;
      if (hdr) hdr.classList.toggle('is-stuck', stuck);
      document.documentElement.classList.toggle('hdr-stuck', stuck);

      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (y / max) * 100 : 0;
        progress.style.width = pct + '%';
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------
     4. MOBILE NAV
     --------------------------------------------------------- */
  function closeNav() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav-toggle');
    const wasOpen = nav && nav.classList.contains('is-open');
    if (nav) nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (wasOpen && toggle) toggle.focus();
    if (lenis) lenis.start();
  }

  function openNav() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav-toggle');
    if (!nav) return;
    nav.classList.add('is-open');
    document.body.classList.add('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
  }

  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const closeBtn = document.querySelector('.nav-close');
    const nav = document.querySelector('.nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeNav);

    // Ketik di luar pautan dalam overlay = tutup. Tanpa ini, pengguna yang
    // mengetik ruang kosong terperangkap dalam menu (body.nav-open dikunci).
    nav.addEventListener('click', (ev) => {
      if (!nav.classList.contains('is-open')) return;
      if (ev.target.closest('a, button')) return;
      closeNav();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });

    nav.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !nav.classList.contains('is-open')) return;
      const focusables = nav.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 760 && nav.classList.contains('is-open')) closeNav();
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     5. FAQ ACCORDION (height-animated)
     --------------------------------------------------------- */
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const btn = item.querySelector('.faq-q');
      const panel = item.querySelector('.faq-a');
      if (!btn || !panel) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        const group = item.parentElement;
        if (group) {
          group.querySelectorAll('.faq-item.is-open').forEach((other) => {
            if (other === item) return;
            other.classList.remove('is-open');
            const op = other.querySelector('.faq-a');
            const ob = other.querySelector('.faq-q');
            if (op) op.style.height = '0px';
            if (ob) ob.setAttribute('aria-expanded', 'false');
          });
        }

        item.classList.toggle('is-open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
        panel.style.height = isOpen ? '0px' : panel.scrollHeight + 'px';
      });
    });

    window.addEventListener('resize', () => {
      document.querySelectorAll('.faq-item.is-open .faq-a').forEach((p) => {
        p.style.height = p.scrollHeight + 'px';
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     6. GSAP CHOREOGRAPHY
     --------------------------------------------------------- */
  function initGsap() {
    const revealHero = () => {
      document.querySelectorAll('.hero .line-inner').forEach((el) => {
        el.style.transform = 'none';
      });
      document.querySelectorAll('.hero-sub, .hero-actions, .hero-meta, .hero-visual')
        .forEach((el) => { el.style.opacity = '1'; });
    };

    if (typeof gsap === 'undefined') { revealHero(); return; }
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    const reduced = prefersReduced;

    if (!reduced) {
      gsap.to('.hero .line-inner', {
        y: 0,
        duration: 1.25,
        ease: 'expo.out',
        stagger: 0.09,
        delay: 0.15
      });
      gsap.from('.hero-sub, .hero-actions, .hero-meta', {
        y: 26, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.55
      });
      gsap.from('.hero-visual', {
        y: 60, opacity: 0, scale: 0.96, duration: 1.5, ease: 'expo.out', delay: 0.35
      });
      gsap.from('.hero .scroll-hint', { opacity: 0, duration: 1, delay: 1.4 });

      setTimeout(revealHero, 4000);
      setTimeout(() => {
        document.querySelectorAll('[data-reveal]').forEach((el) => {
          if (getComputedStyle(el).opacity === '0') {
            el.style.opacity = '1';
            el.style.transform = 'none';
          }
        });
      }, 6000);
    } else {
      gsap.set('.hero .line-inner', { y: 0 });
    }

    if (!window.ScrollTrigger) return;

    if (!reduced) {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });

      ['[data-reveal-group]'].forEach((sel) => {
        document.querySelectorAll(sel).forEach((group) => {
          const kids = group.querySelectorAll('[data-reveal]');
          if (!kids.length) return;
          gsap.to(kids, {
            opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09,
            scrollTrigger: { trigger: group, start: 'top 82%', once: true }
          });
        });
      });
    } else {
      gsap.set('[data-reveal]', { opacity: 1, y: 0 });
    }

    if (!reduced && !isTouch) {
      document.querySelectorAll('.split-visual-film').forEach((film) => {
        gsap.fromTo(film,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: {
              trigger: film.closest('.split-visual'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );
      });
    }

    if (!reduced) {
      const heroInner = document.querySelector('.hero-inner');
      if (heroInner) {
        gsap.to(heroInner, {
          y: -70,
          opacity: 0.45,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.3 }
        });
      }

      const heroVisual = document.querySelector('.hero-visual');
      if (heroVisual) {
        gsap.to(heroVisual, {
          y: -140,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
        });
      }

      const heroBg = document.querySelector('.hero-bg-img');
      if (heroBg) {
        gsap.fromTo(heroBg,
          { scale: 1.15 },
          {
            scale: 1.0,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
          }
        );
      }

      const heroOverlay = document.querySelector('.hero-bg-overlay');
      if (heroOverlay) {
        gsap.to(heroOverlay, {
          opacity: 0.4,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
        });
      }
    }

    if (!reduced) {
      gsap.from('.process-row', {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.process-list', start: 'top 82%', once: true }
      });
    }

    if (!reduced) {
      document.querySelectorAll('.section-head h2').forEach((h) => {
        gsap.from(h, {
          opacity: 0, y: 34, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: h, start: 'top 88%', once: true }
        });
      });
    }

    ScrollTrigger.refresh();
  }

  /* ---------------------------------------------------------
     7. PROCESS FILMS (lazy autoplay)
     --------------------------------------------------------- */
  function initFilms() {
    const films = Array.from(document.querySelectorAll('.split-visual-film'));
    if (!films.length) return;

    if (prefersReduced) {
      films.forEach((v) => {
        v.removeAttribute('autoplay');
        v.pause();
        v.addEventListener('play', () => v.pause());
      });
      return;
    }

    films.forEach((v) => {
      let wanted = false;

      const play = () => {
        if (!wanted || !v.paused) return;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      };

      if (!('IntersectionObserver' in window)) { wanted = true; play(); return; }

      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          wanted = e.isIntersecting;
          if (wanted) play();
          else v.pause();
        });
      }, { threshold: 0.25 });
      io.observe(v);

      v.addEventListener('canplay', play);
    });
  }

  /* ---------------------------------------------------------
     7b. PAUTAN PESANAN (#order)

     Seksyen pesanan menggunakan id "order-<section.id>", jadi anchor
     "#order" dalam tetapan tema menunjuk ke tempat kosong. Selesaikan
     ke borang produk sebenar supaya butang utama tidak mati.
     --------------------------------------------------------- */
  function initOrderAnchor() {
    document.addEventListener('click', (ev) => {
      const link = ev.target.closest('a[href="#order"]');
      if (!link) return;
      if (document.getElementById('order')) return; // anchor memang wujud

      const form = document.querySelector('.order-form');
      const target = form ? (form.closest('section') || form) : null;
      if (!target) return;

      ev.preventDefault();
      target.setAttribute('tabindex', '-1');
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    });
  }

  /* ---------------------------------------------------------
     8. BOOT
     --------------------------------------------------------- */
  function boot() {
    // Keselamatan: kelas is-loading (overflow:hidden; height:100vh) mengunci
    // skrol sentuh pada telefon. Ia tiada preloader untuk membuangnya, jadi
    // buang di sini sekiranya markup cache masih membawanya.
    document.body.classList.remove('is-loading');

    // Mod editor tema Shopify: iframe editor membawa preview_theme_id.
    // Kelas ini membolehkan lencana nombor section dipapar dalam kanvas editor,
    // manakala CSS memastikannya tersembunyi pada storefront.
    if (/[?&]preview_theme_id=/.test(window.location.search)) {
      document.documentElement.classList.add('theme-editor');
    }

    if (prefersReduced) document.documentElement.classList.add('no-motion');

    if (typeof gsap !== 'undefined') {
      document.documentElement.classList.add('js-reveal');
    }

    lenis = initLenis();

    initChrome();
    initNav();
    initOrderAnchor();
    initAnchors();
    initFaq();
    initFilms();
    initGsap();

    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  window.addEventListener('error', () => {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
