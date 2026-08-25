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

  document.addEventListener("DOMContentLoaded", () => {
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