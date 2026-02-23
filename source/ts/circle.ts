import timelineData from "./data";
import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

let swiper: Swiper | null = null;
let currentActiveId: number = 6;

const descriptions = [
  "Наука",
  "Кино",
  "Литература",
  "Театр",
  "Технологии",
  "Наука",
];

class NumberCounterAnimator {
  private animatingYears: Set<Element> = new Set();

  updateYear(element: Element | null, newValue: string): void {
    if (!element || this.animatingYears.has(element)) return;

    this.animatingYears.add(element);

    const yearElement = element as HTMLElement;
    const oldValue = parseInt(yearElement.textContent || "0", 10);
    const newValueNum = parseInt(newValue, 10);

    const diff = newValueNum - oldValue;
    if (diff === 0) {
      this.animatingYears.delete(element);
      return;
    }

    const duration = 600;
    const steps = 30;
    const intervalTime = duration / steps;
    const step = diff / steps;

    let currentStep = 0;
    let currentValue = oldValue;

    const interval = setInterval(() => {
      currentStep++;
      currentValue = Math.round(oldValue + step * currentStep);

      yearElement.textContent = currentValue.toString();

      if (
        currentStep >= steps ||
        (diff > 0 && currentValue >= newValueNum) ||
        (diff < 0 && currentValue <= newValueNum)
      ) {
        yearElement.textContent = newValueNum.toString();
        clearInterval(interval);
        this.animatingYears.delete(element);
      }
    }, intervalTime);
  }
}

const numberAnimator = new NumberCounterAnimator();

function initSwiper(): void {
  swiper = new Swiper(".description-swiper", {
    modules: [Navigation, Pagination],
    watchOverflow: true,
    loop: false,

    slidesPerView: 1.6,
    spaceBetween: 25,

    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 40,
      },
      1440: {
        slidesPerView: 3.4,
        spaceBetween: 80,
      },
    },

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
}

function updateSliderEvents(events: { year: number; text: string }[]): void {
  const swiperWrapper = document.querySelector(
    ".date-description__list.swiper-wrapper",
  );

  if (!swiperWrapper) return;

  swiperWrapper.innerHTML = "";

  events.forEach((event) => {
    const slide = document.createElement("li");
    slide.className = "date-description__item swiper-slide";

    slide.innerHTML = `
      <div class="date-description__item-content">
        <h2>${event.year}</h2>
        <p>${event.text}</p>
      </div>
    `;

    swiperWrapper.appendChild(slide);
  });

  if (swiper) {
    swiper.update();
    swiper.slideTo(0);
  }
}

function updateMobileDescription(activeId: number): void {
  const mobileDescription = document.querySelector(".mobile-description__text");
  if (mobileDescription) {
    const index = 6 - activeId;
    mobileDescription.textContent = descriptions[index];

    mobileDescription.classList.add("mobile-description__text--updating");
    setTimeout(() => {
      mobileDescription.classList.remove("mobile-description__text--updating");
    }, 300);
  }
}

function updateNavigationButtonsState(total: number): void {
  const prevButton = document.querySelector(".btn-block__switch--prev");
  const nextButton = document.querySelector(".btn-block__switch--next");

  if (!prevButton || !nextButton) return;

  if (currentActiveId === 1) {
    prevButton.classList.add("btn-block__switch--disabled");
    (prevButton as HTMLButtonElement).disabled = true;
  } else {
    prevButton.classList.remove("btn-block__switch--disabled");
    (prevButton as HTMLButtonElement).disabled = false;
  }

  if (currentActiveId === total) {
    nextButton.classList.add("btn-block__switch--disabled");
    (nextButton as HTMLButtonElement).disabled = true;
  } else {
    nextButton.classList.remove("btn-block__switch--disabled");
    (nextButton as HTMLButtonElement).disabled = false;
  }
}

function updatePaginationButtons(currentId: number): void {
  const paginationButtons = document.querySelectorAll(".pagination__button");

  paginationButtons.forEach((button) => {
    button.classList.remove("pagination__button--active");

    if (Number(button.id) === currentId) {
      button.classList.add("pagination__button--active");
    }
  });
}

function updateBtnBlockText(currentId: number, total: number): void {
  const startText = document.querySelector(".btn-block__text--start");
  const endText = document.querySelector(".btn-block__text--end");

  if (startText) {
    startText.textContent = currentId.toString().padStart(2, "0");
  }
  if (endText) {
    endText.textContent = total.toString().padStart(2, "0");
  }

  updateNavigationButtonsState(total);
  updatePaginationButtons(currentId);
}

function showActiveButtonLabel(): void {
  document.querySelectorAll(".circle__button-label").forEach((label) => {
    label.classList.remove("circle__button-label--visible");
  });

  const points =
    document.querySelectorAll<HTMLButtonElement>(".circle__button");
  const activePoint = Array.from(points).find((p) =>
    p.classList.contains("circle__button--active"),
  );

  if (activePoint) {
    const buttonIndex = Array.from(points).indexOf(activePoint);
    const labels = document.querySelectorAll(".circle__button-label");
    if (labels[buttonIndex]) {
      labels[buttonIndex].classList.add("circle__button-label--visible");
    }
  }
}

function hideAllLabels(): void {
  document.querySelectorAll(".circle__button-label").forEach((label) => {
    label.classList.remove("circle__button-label--visible");
  });
}

function activatePointById(
  id: number,
  points: NodeListOf<HTMLButtonElement>,
): void {
  if (id === currentActiveId) return;

  const pointToActivate = Array.from(points).find((p) => Number(p.id) === id);

  if (pointToActivate) {
    hideAllLabels();

    points.forEach((p) => p.classList.remove("circle__button--active"));
    pointToActivate.classList.add("circle__button--active");

    const angle = Number(pointToActivate.dataset.angle);
    rotateToPoint(angle, points);

    currentActiveId = id;

    const rangeYearStart = document.querySelector(".range__year--start");
    const rangeYearEnd = document.querySelector(".range__year--end");

    const selectedItem = timelineData.find((item) => item.id === id);

    if (selectedItem) {
      numberAnimator.updateYear(
        rangeYearStart,
        selectedItem.startYear.toString(),
      );
      numberAnimator.updateYear(rangeYearEnd, selectedItem.endYear.toString());

      updateSliderEvents(selectedItem.events);
      updateBtnBlockText(id, points.length);
      updateMobileDescription(id);
    }

    setTimeout(() => {
      showActiveButtonLabel();
    }, 600);
  }
}

function navigateToPoint(
  direction: "next" | "prev",
  points: NodeListOf<HTMLButtonElement>,
): void {
  const totalPoints = points.length;
  let nextId: number;

  if (direction === "next") {
    if (currentActiveId === totalPoints) return;
    nextId = currentActiveId + 1;
  } else {
    if (currentActiveId === 1) return;
    nextId = currentActiveId - 1;
  }

  hideAllLabels();
  activatePointById(nextId, points);
}

function rotateToPoint(
  targetAngle: number,
  points: NodeListOf<HTMLButtonElement>,
): void {
  const circle = document.querySelector(".circle__section");
  if (!(circle instanceof HTMLElement)) return;

  const START_OFFSET = -60;
  const rotation = START_OFFSET - targetAngle;

  circle.style.transition = "transform 0.6s ease";
  circle.style.transform = `rotate(${rotation}deg)`;

  points.forEach((point) => {
    point.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
  });
}

function setInitialState(points: NodeListOf<HTMLButtonElement>): void {
  const initialId = 6;

  const pointToActivate = Array.from(points).find(
    (p) => Number(p.id) === initialId,
  );

  if (pointToActivate) {
    hideAllLabels();

    points.forEach((p) => p.classList.remove("circle__button--active"));
    pointToActivate.classList.add("circle__button--active");

    const angle = Number(pointToActivate.dataset.angle);
    rotateToPoint(angle, points);

    currentActiveId = initialId;

    const rangeYearStart = document.querySelector(".range__year--start");
    const rangeYearEnd = document.querySelector(".range__year--end");

    const selectedItem = timelineData.find((item) => item.id === initialId);

    if (selectedItem) {
      if (rangeYearStart) {
        (rangeYearStart as HTMLElement).textContent =
          selectedItem.startYear.toString();
      }
      if (rangeYearEnd) {
        (rangeYearEnd as HTMLElement).textContent =
          selectedItem.endYear.toString();
      }

      updateSliderEvents(selectedItem.events);
    }

    updateBtnBlockText(initialId, points.length);
    updateMobileDescription(initialId);

    setTimeout(() => {
      showActiveButtonLabel();
    }, 600);
  }
}

export function initCircle(): void {
  const circle = document.querySelector(".circle__section");
  if (!(circle instanceof HTMLElement)) return;

  const points = circle.querySelectorAll<HTMLButtonElement>(".circle__button");
  if (!points.length) return;

  const degToRad = (deg: number): number => deg * (Math.PI / 180);
  const START_OFFSET = -60;

  const positionPoints = (): void => {
    const rect = circle.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 2;

    const total = points.length;

    points.forEach((point, index) => {
      const angleDeg = (index / total) * 360 + START_OFFSET;
      const angleRad = degToRad(angleDeg);

      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY + radius * Math.sin(angleRad);

      point.style.position = "absolute";
      point.style.left = `${x}px`;
      point.style.top = `${y}px`;
      point.style.transform = "translate(-50%, -50%)";
      point.dataset.angle = angleDeg.toString();
    });
  };

  initSwiper();
  positionPoints();
  setInitialState(points);

  points.forEach((point) => {
    point.addEventListener("mouseenter", () => {
      point.classList.add("circle__button--mouseenter");
    });

    point.addEventListener("mouseleave", () => {
      point.classList.remove("circle__button--mouseenter");
    });

    point.addEventListener("click", () => {
      const pointId = Number(point.id);
      hideAllLabels();
      activatePointById(pointId, points);
    });
  });

  const prevButton = document.querySelector(".btn-block__switch--prev");
  const nextButton = document.querySelector(".btn-block__switch--next");

  prevButton?.addEventListener("click", () => {
    navigateToPoint("prev", points);
  });

  nextButton?.addEventListener("click", () => {
    navigateToPoint("next", points);
  });

  const paginationButtons = document.querySelectorAll(".pagination__button");

  paginationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = Number(button.id);

      if (targetId === currentActiveId) return;

      hideAllLabels();
      activatePointById(targetId, points);
    });
  });

  window.addEventListener("resize", () => {
    positionPoints();
    const activePoint = Array.from(points).find((p) =>
      p.classList.contains("circle__button--active"),
    );
    if (activePoint) {
      const angle = Number(activePoint.dataset.angle);
      rotateToPoint(angle, points);

      setTimeout(() => {
        showActiveButtonLabel();
      }, 100);
    }
  });
}
