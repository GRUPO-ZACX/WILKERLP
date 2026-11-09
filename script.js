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

const platformsCarousel = document.querySelector("[data-platforms-carousel]");

if (platformsCarousel) {
  const slides = Array.from(platformsCarousel.querySelectorAll("[data-platforms-slide]"));
  let activeSlide = 0;
  let rotationTimer = null;
  let isVisible = false;

  const syncRotation = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = null;

    if (isVisible && !document.hidden && slides.length > 1) {
      rotationTimer = window.setInterval(() => {
        activeSlide = (activeSlide + 1) % slides.length;

        slides.forEach((slide, index) => {
          const isActive = index === activeSlide;
          slide.classList.toggle("is-active", isActive);
          slide.setAttribute("aria-hidden", String(!isActive));
        });
      }, 2000);
    }
  };

  document.addEventListener("visibilitychange", syncRotation);

  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
    syncRotation();
  }, { threshold: [0, 0.2] }).observe(platformsCarousel);
}

const feedbackCarousel = document.querySelector(".feedbacks-marquee");

if (feedbackCarousel) {
  const cards = Array.from(feedbackCarousel.querySelectorAll(".feedback-card"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reviewTimer = null;
  let isVisible = false;
  let isHovered = false;
  let isTouching = false;
  let reviewHeightFrame = 0;

  const updateReviewHeight = () => {
    reviewHeightFrame = 0;
    const viewport = feedbackCarousel.getBoundingClientRect();
    let visibleHeight = 0;

    cards.forEach((card) => {
      const bounds = card.getBoundingClientRect();
      const overlap = Math.min(bounds.right, viewport.right) - Math.max(bounds.left, viewport.left);
      if (overlap >= bounds.width * 0.5) {
        visibleHeight = Math.max(visibleHeight, bounds.height);
      }
    });

    if (visibleHeight) {
      const height = `${Math.ceil(visibleHeight)}px`;
      if (feedbackCarousel.style.height !== height) feedbackCarousel.style.height = height;
    }
  };

  const requestReviewHeight = () => {
    if (!reviewHeightFrame) reviewHeightFrame = window.requestAnimationFrame(updateReviewHeight);
  };

  feedbackCarousel.addEventListener("scroll", requestReviewHeight, { passive: true });
  window.addEventListener("resize", requestReviewHeight);
  const reviewResizeObserver = new ResizeObserver(requestReviewHeight);
  cards.forEach((card) => reviewResizeObserver.observe(card));
  document.fonts.ready.then(requestReviewHeight);
  updateReviewHeight();

  const moveReviews = (direction) => {
    const stride = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
    const maxScroll = feedbackCarousel.scrollWidth - feedbackCarousel.clientWidth;
    let nextScroll = feedbackCarousel.scrollLeft + stride * direction;

    if (direction > 0 && feedbackCarousel.scrollLeft >= maxScroll - 2) {
      nextScroll = 0;
    } else if (direction < 0 && feedbackCarousel.scrollLeft <= 2) {
      nextScroll = maxScroll;
    }

    feedbackCarousel.scrollTo({
      left: Math.max(0, Math.min(nextScroll, maxScroll)),
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  };

  const syncReviews = () => {
    window.clearInterval(reviewTimer);
    reviewTimer = null;

    if (isVisible && !document.hidden && !isHovered && !isTouching && !feedbackCarousel.contains(document.activeElement) && cards.length > 1) {
      reviewTimer = window.setInterval(() => moveReviews(1), 3500);
    }
  };

  feedbackCarousel.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") {
      isHovered = true;
      syncReviews();
    }
  });

  feedbackCarousel.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      isHovered = false;
      syncReviews();
    }
  });

  feedbackCarousel.addEventListener("touchstart", () => {
    isTouching = true;
    syncReviews();
  }, { passive: true });

  const endTouch = () => {
    isTouching = false;
    syncReviews();
  };
  feedbackCarousel.addEventListener("touchend", endTouch, { passive: true });
  feedbackCarousel.addEventListener("touchcancel", endTouch, { passive: true });
  feedbackCarousel.addEventListener("focusin", syncReviews);
  feedbackCarousel.addEventListener("focusout", () => window.setTimeout(syncReviews, 0));
  feedbackCarousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveReviews(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  document.addEventListener("visibilitychange", syncReviews);

  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    syncReviews();
  }).observe(feedbackCarousel);
}
