(() => {
  const root = document.documentElement;
  let scrollFrame = 0;

  const updateHeaderState = () => {
    scrollFrame = 0;
    root.dataset.scrolled = window.scrollY > 36 ? "true" : "false";
  };

  const onScroll = () => {
    if (scrollFrame) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(updateHeaderState);
  };

  const findFaqButton = (target) => {
    if (!(target instanceof Element)) {
      return null;
    }

    return target.closest("[data-faq-toggle]");
  };

  const getFaqPanelElements = () => ({
    panel: document.querySelector("[data-faq-panel]"),
    grid: document.querySelector("[data-faq-grid]"),
  });

  const isMobileLayout = () => window.matchMedia("(max-width: 720px)").matches;

  const getFaqPanelBaseHeight = (panel) => {
    const designHeight = Number(panel.dataset.faqPanelBaseHeight);

    if (Number.isFinite(designHeight) && designHeight > 0) {
      return (designHeight / 1920) * window.innerWidth;
    }

    return panel.getBoundingClientRect().height;
  };

  const updateFaqPanelHeight = () => {
    const { panel, grid } = getFaqPanelElements();

    if (!panel || !grid || isMobileLayout()) {
      return;
    }

    const baseHeight = getFaqPanelBaseHeight(panel);
    const panelRect = panel.getBoundingClientRect();
    const cards = Array.from(grid.querySelectorAll("[data-faq-card]"));
    const contentBottom = cards.reduce((bottom, card) => {
      return Math.max(bottom, card.getBoundingClientRect().bottom);
    }, grid.getBoundingClientRect().bottom);
    const bottomPadding = Math.max(42, window.innerWidth * 0.035);
    const nextHeight = Math.ceil(contentBottom - panelRect.top + bottomPadding);

    panel.style.height = Math.max(baseHeight, nextHeight) + "px";
  };

  const setFaqExpanded = (card, expanded) => {
    card.dataset.expanded = expanded ? "true" : "false";
    const button = card.querySelector("[data-faq-toggle]");
    const answer = card.querySelector("[id^='faq-answer-']");

    if (button) {
      button.setAttribute("aria-expanded", String(expanded));
    }

    if (answer) {
      answer.setAttribute("aria-hidden", String(!expanded));
      answer.style.maxHeight = expanded ? answer.scrollHeight + "px" : "0px";
    }
  };

  const onFaqClick = (event) => {
    const button = findFaqButton(event.target);
    const card = button ? button.closest("[data-faq-card]") : null;

    if (!button || !card) {
      return;
    }

    const shouldExpand = card.dataset.expanded !== "true";

    document.querySelectorAll("[data-faq-card]").forEach((item) => {
      setFaqExpanded(item, item === card && shouldExpand);
    });

    window.requestAnimationFrame(updateFaqPanelHeight);
    window.setTimeout(updateFaqPanelHeight, 320);
  };

  const onFaqResize = () => {
    document.querySelectorAll("[data-faq-card]").forEach((card) => {
      setFaqExpanded(card, card.dataset.expanded === "true");
    });
    updateFaqPanelHeight();
  };

  const setupReveal = () => {
    const revealItems = Array.from(document.querySelectorAll("[data-lp-reveal]"));

    if (!revealItems.length) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => {
        item.dataset.visible = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target;
          element.dataset.visible = "true";
          observer.unobserve(element);
        });
      },
      {
        rootMargin: "0px 0px 35% 0px",
        threshold: 0.01,
      },
    );

    const markVisibleItems = () => {
      const revealLine = window.innerHeight * 1.35;

      revealItems.forEach((item) => {
        if (item.dataset.visible === "true") {
          return;
        }

        const rect = item.getBoundingClientRect();

        if (rect.top < revealLine && rect.bottom > -window.innerHeight * 0.25) {
          item.dataset.visible = "true";
          observer.unobserve(item);
        }
      });
    };

    revealItems.forEach((item) => observer.observe(item));
    markVisibleItems();
    window.addEventListener("scroll", markVisibleItems, { passive: true });
    window.addEventListener("resize", markVisibleItems);
  };

  const setupNavigation = () => {
    const header = document.querySelector('.header');
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.menuToggle');
    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const destinations = {
      inicio: '.artboard',
      assessoria: '.statue',
      servicos: '.goldBand',
      sobre: '.coupleMaskA',
      faq: '.faqPanel',
      contato: '.finalTitle',
    };
    const closeMenu = (restoreFocus = false) => {
      nav.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      if (restoreFocus) toggle.focus();
    };
    const destinationTop = (id) => {
      if (id === 'inicio') return 0;
      const section = document.getElementById(id);
      if (isMobileLayout()) return section.getBoundingClientRect().top + window.scrollY;
      const target = document.querySelector(destinations[id]);
      const artboard = document.querySelector('.artboard');
      // offsetTop excludes the translate used by the original entrance animation.
      return artboard.getBoundingClientRect().top + window.scrollY + target.offsetTop;
    };
    const updateActiveLink = () => {
      let current = 'inicio';
      const readingLine = window.scrollY + header.offsetHeight + 32;
      Object.keys(destinations).forEach((id) => {
        if (destinationTop(id) <= readingLine) current = id;
      });
      links.forEach((link) => {
        if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const navigate = (id, smooth) => {
      if (!(id in destinations)) return;
      closeMenu();
      const top = id === 'inicio' ? 0 : Math.max(0, destinationTop(id) - header.offsetHeight - 16);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top, behavior: smooth && !reduced ? 'smooth' : 'instant' });
      updateActiveLink();
    };
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const id = link.hash.slice(1);
        if (!(id in destinations)) return;
        event.preventDefault();
        if (location.hash !== link.hash) history.pushState(null, '', link.hash);
        navigate(id, true);
      });
    });
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      nav.dataset.open = String(open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    header.addEventListener('focusout', () => {
      requestAnimationFrame(() => {
        if (!header.contains(document.activeElement)) closeMenu();
      });
    });
    let frame = 0;
    window.addEventListener('scroll', () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; updateActiveLink(); });
    }, { passive: true });
    window.addEventListener('resize', () => { closeMenu(); updateActiveLink(); });
    window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'inicio', false));
    window.addEventListener('load', () => {
      if (location.hash) navigate(location.hash.slice(1), false);
    });
    updateActiveLink();
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    updateHeaderState();
    window.addEventListener("scroll", onScroll, { passive: true });

    document.querySelectorAll("[data-faq-card]").forEach((card) => {
      setFaqExpanded(card, false);
    });
    updateFaqPanelHeight();
    document.addEventListener("click", onFaqClick);
    window.addEventListener("resize", onFaqResize);
    window.requestAnimationFrame(setupReveal);
  });
})();