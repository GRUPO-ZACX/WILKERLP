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

  const isMobileLayout = () => window.matchMedia('(max-width: 960px)').matches;

  const setFaqExpanded = (card, expanded) => {
    card.dataset.expanded = expanded ? "true" : "false";
    const button = card.querySelector("[data-faq-toggle]");
    const answer = card.querySelector("[id^='faq-answer-']");

    if (button) {
      button.setAttribute("aria-expanded", String(expanded));
    }

    if (answer) {
      answer.setAttribute("aria-hidden", String(!expanded));
      answer.inert = !expanded;
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
  };

  const onFaqResize = () => {
    document.querySelectorAll("[data-faq-card]").forEach((card) => {
      setFaqExpanded(card, card.dataset.expanded === "true");
    });
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
    const backdrop = document.querySelector('.menuBackdrop');
    const board = document.querySelector('.artboard');
    const setPageInert = (inert) => {
      Array.from(board.children).forEach((child) => {
        if (child !== header) child.inert = inert;
      });
    };
    const closeMenu = (restoreFocus = false) => {
      nav.dataset.open = 'false';
      root.dataset.menuOpen = 'false';
      backdrop.hidden = true;
      setPageInert(false);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      if (restoreFocus) toggle.focus();
    };
    const destinationTop = (id) => {
      if (id === 'inicio') return 0;
      const section = document.getElementById(id);
      if (isMobileLayout() || section.closest('.contentTail')) return section.getBoundingClientRect().top + window.scrollY;
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
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'contato';
      links.forEach((link) => {
        if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const navigate = (id, smooth) => {
      if (!(id in destinations)) return;
      closeMenu(isMobileLayout());
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
      if (toggle.getAttribute('aria-expanded') === 'true') return closeMenu(true);
      nav.dataset.open = 'true';
      root.dataset.menuOpen = 'true';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
      backdrop.hidden = false;
      setPageInert(true);
      nav.querySelector('.menuClose').focus();
    });
    nav.querySelector('.menuClose').addEventListener('click', () => closeMenu(true));
    backdrop.addEventListener('click', () => closeMenu(true));
    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') closeMenu(true);
      if (event.key === 'Tab') {
        const controls = Array.from(nav.querySelectorAll('a, button'));
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
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
    window.matchMedia('(max-width: 960px)').addEventListener('change', () => closeMenu());
    window.addEventListener('resize', updateActiveLink);
    window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'inicio', false));
    window.addEventListener('load', () => {
      if (location.hash) navigate(location.hash.slice(1), false);
    });
    closeMenu();
    updateActiveLink();
  };

  const setupRiskSequence = () => {
    const list = document.querySelector('.riskList');
    const items = Array.from(list.querySelectorAll('li'));
    const button = document.querySelector('.protectCta');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const duration = parseFloat(getComputedStyle(list).getPropertyValue('--risk-fill-duration')) || 550;
    const encountered = new Set();
    let nextIndex = 0;
    let running = false;
    let buttonStarted = false;
    let observer;
    const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
    const finish = () => {
      items.forEach((item) => { item.dataset.riskState = 'complete'; });
      button.dataset.riskState = 'complete';
      list.dataset.riskSequence = 'complete';
      observer?.disconnect();
    };
    if (motion.matches || !('IntersectionObserver' in window)) {
      finish();
      return;
    }
    list.dataset.riskSequence = 'ready';
    const advance = async () => {
      if (running || motion.matches || list.dataset.riskSequence === 'complete') return;
      running = true;
      try {
        while (nextIndex < items.length && encountered.has(items[nextIndex])) {
          list.dataset.riskSequence = 'running';
          const item = items[nextIndex];
          item.dataset.riskState = 'filling';
          await wait(duration);
          if (motion.matches) return;
          item.dataset.riskState = 'complete';
          nextIndex += 1;
          await wait(80);
        }
        if (nextIndex === items.length && encountered.has(button) && !buttonStarted) {
          buttonStarted = true;
          button.dataset.riskState = 'filling';
          await wait(duration);
          if (!motion.matches) finish();
        }
      } finally {
        running = false;
      }
    };
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // A fast scroll past a marker must not stall the remaining sequence.
          const passed = entry.target === button ? items.length : items.indexOf(entry.target) + 1;
          items.slice(0, passed).forEach((item) => encountered.add(item));
          if (entry.target === button) encountered.add(button);
          observer.unobserve(entry.target);
        }
      });
      advance();
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
    items.forEach((item) => observer.observe(item));
    observer.observe(button);
    motion.addEventListener('change', () => { if (motion.matches) finish(); });
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupRiskSequence();
    document.querySelectorAll('.miniItemHead').forEach((button) => {
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(expanded));
        document.getElementById(button.getAttribute('aria-controls')).setAttribute('aria-hidden', String(!expanded));
      });
    });
    setupNavigation();
    updateHeaderState();
    window.addEventListener("scroll", onScroll, { passive: true });

    document.querySelectorAll("[data-faq-card]").forEach((card) => {
      setFaqExpanded(card, false);
    });

    document.addEventListener("click", onFaqClick);
    window.addEventListener("resize", onFaqResize);
    window.requestAnimationFrame(setupReveal);
  });
})();