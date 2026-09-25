const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const easeOut = (value) => 1 - Math.pow(1 - value, 3);

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector("#site-nav");

if (header && menuToggle && siteNav) {
  const setMenuOpen = (isOpen) => {
    header.classList.toggle("is-menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(!header.classList.contains("is-menu-open"));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      setMenuOpen(false);
    }
  });
}

const problemSection = document.querySelector(".problem");

if (problemSection) {
  const problemList = problemSection.querySelector(".problem-list");
  const problemVisual = problemSection.querySelector("[data-problem-visual]");
  const problemCopy = problemSection.querySelector("[data-problem-copy]");
  const problemCards = problemList ? Array.from(problemList.querySelectorAll("p")) : [];
  let parallaxFrame = 0;

  const updateProblemSection = () => {
    parallaxFrame = 0;

    if (!problemVisual || !problemCopy) {
      return;
    }

    const isStackedLayout = window.innerWidth <= 1080;
    const sectionRect = problemSection.getBoundingClientRect();
    const visualHeight = problemVisual.getBoundingClientRect().height;

    if (isStackedLayout) {
      problemCopy.style.setProperty("--problem-copy-y", "0px");

      problemCards.forEach((card) => {
        card.style.setProperty("--item-opacity", "1");
        card.style.setProperty("--item-y", "0px");
        card.style.setProperty("--item-scale-y", "1");
        card.style.setProperty("--item-number-scale", "1");
      });

      return;
    }

    const textDistance = Math.max(sectionRect.height - visualHeight * 0.5, visualHeight * 1.25);
    const textProgress = clamp(-sectionRect.top / textDistance);
    const textTravel = visualHeight * 0.62;

    problemCopy.style.setProperty("--problem-copy-y", `${textProgress * textTravel}px`);

    if (!problemList || !problemCards.length) {
      return;
    }

    const timelineStart = window.innerHeight * 0.18;
    const timelineDistance = Math.max((sectionRect.height - visualHeight) * 0.62, visualHeight * 2.45);
    const timelineProgress = clamp((-sectionRect.top - timelineStart) / timelineDistance);

    problemCards.forEach((card, index) => {
      const revealStart = index * 0.12;
      const itemProgress = easeOut(clamp((timelineProgress - revealStart) / 0.2));

      card.style.setProperty("--item-opacity", itemProgress.toFixed(3));
      card.style.setProperty("--item-y", `${((1 - itemProgress) * 18).toFixed(2)}px`);
      card.style.setProperty("--item-scale-y", (0.72 + itemProgress * 0.28).toFixed(3));
      card.style.setProperty("--item-number-scale", (0.84 + itemProgress * 0.16).toFixed(3));
    });
  };

  const requestProblemUpdate = () => {
    if (!parallaxFrame) {
      parallaxFrame = window.requestAnimationFrame(updateProblemSection);
    }
  };

  updateProblemSection();
  window.addEventListener("scroll", requestProblemUpdate, { passive: true });
  window.addEventListener("resize", requestProblemUpdate);
}

const feedbackMarquee = document.querySelector(".feedbacks-marquee");

if (feedbackMarquee) {
  const feedbackTrack = feedbackMarquee.querySelector(".feedbacks-track");
  const feedbackGroup = feedbackTrack?.querySelector(".feedbacks-group");
  let isFeedbackDragging = false;
  let feedbackStartX = 0;
  let feedbackStartOffset = 0;
  let feedbackDragOffset = 0;

  const setFeedbackOffset = () => {
    feedbackTrack?.style.setProperty("--feedback-drag", `${feedbackDragOffset}px`);
  };

  const normalizeFeedbackOffset = () => {
    const loopWidth = feedbackGroup?.getBoundingClientRect().width || 0;

    if (!loopWidth) {
      return;
    }

    feedbackDragOffset = ((feedbackDragOffset % loopWidth) + loopWidth) % loopWidth;

    if (feedbackDragOffset > 0) {
      feedbackDragOffset -= loopWidth;
    }

    setFeedbackOffset();
  };

  feedbackMarquee.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  feedbackMarquee.addEventListener("pointerdown", (event) => {
    if (!feedbackTrack || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    isFeedbackDragging = true;
    feedbackStartX = event.clientX;
    feedbackStartOffset = feedbackDragOffset;
    feedbackMarquee.classList.add("is-dragging");
    feedbackMarquee.setPointerCapture?.(event.pointerId);
  });

  feedbackMarquee.addEventListener("pointermove", (event) => {
    if (!isFeedbackDragging) {
      return;
    }

    feedbackDragOffset = feedbackStartOffset + event.clientX - feedbackStartX;
    setFeedbackOffset();
    event.preventDefault();
  });

  const stopFeedbackDrag = (event) => {
    if (!isFeedbackDragging) {
      return;
    }

    isFeedbackDragging = false;
    normalizeFeedbackOffset();
    feedbackMarquee.classList.remove("is-dragging");

    if (feedbackMarquee.hasPointerCapture?.(event.pointerId)) {
      feedbackMarquee.releasePointerCapture(event.pointerId);
    }
  };

  feedbackMarquee.addEventListener("pointerup", stopFeedbackDrag);
  feedbackMarquee.addEventListener("pointercancel", stopFeedbackDrag);
  window.addEventListener("resize", normalizeFeedbackOffset);
}
