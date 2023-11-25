import { S as Swiper, N as Navigation, P as Pagination, c as createPopper } from './_vendor.js';

window.addEventListener("load", () => {
  new Swiper(".swiper", {
    modules: [Navigation, Pagination],
    navigation: {
      prevEl: ".swiper-button-prev",
      nextEl: ".swiper-button-next"
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true
    },
    loop: true
  });
});

window.addEventListener("load", () => {
  const headerTitle = document.querySelector("#header .header__title");
  if (headerTitle instanceof HTMLElement) {
    new ResizeObserver(() => {
      if (headerTitle.scrollWidth > headerTitle.clientWidth) {
        headerTitle.classList.add("overflow");
      } else {
        headerTitle.classList.remove("overflow");
      }
    }).observe(headerTitle);
  }
});

window.addEventListener("load", () => {
  const sideMenu = document.getElementById("sideMenu");
  if (!sideMenu)
    return;
  const sideMenuBody = sideMenu.querySelector(".side-menu__body");
  const overlay = sideMenu.querySelector(".side-menu__overlay");
  const burger = document.querySelector("#header .header__burger-btn");
  const openMenu = () => {
    if (sideMenu && burger && sideMenuBody) {
      sideMenuBody.scrollTop = 0;
      sideMenu.classList.add("open");
      burger.classList.add("open");
      document.documentElement.classList.add("side-menu-open");
    }
  };
  const closeMenu = () => {
    if (sideMenu && burger) {
      sideMenu.classList.remove("open");
      burger.classList.remove("open");
      document.documentElement.classList.remove("side-menu-open");
    }
  };
  const toggleMenu = () => {
    if (sideMenu.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  };
  if (overlay)
    overlay.addEventListener("click", closeMenu);
  if (burger)
    burger.addEventListener("click", toggleMenu);
  document.querySelectorAll(".tab-group").forEach((tabGroup) => {
    const label = tabGroup.querySelector(".tab-group__label");
    if (label)
      label.addEventListener("click", () => {
        tabGroup.classList.toggle("expanded");
      });
  });
});

const getCssVariable = (name) => {
  return getComputedStyle(document.body).getPropertyValue(name);
};

window.addEventListener("load", () => {
  const POPPER_VIEWPORT_PADDING = getCssVariable("--popper-viewport-padding");
  const ANIMATION_SLOW_MS = parseFloat(getCssVariable("--animation-slow")) * 1e3;
  document.querySelectorAll(".popper").forEach((popperElement) => {
    if (!(popperElement instanceof HTMLElement))
      return;
    const onHover = !!popperElement.getAttribute("data-popper-on-hover");
    const anchorElementQuery = popperElement.getAttribute("data-popper-anchor-element");
    const anchorElements = document.querySelectorAll(anchorElementQuery);
    const closeElements = popperElement.querySelectorAll("[data-popper-close-element]");
    if (!anchorElements)
      console.warn(popperElement, "has no 'data-popper-anchor-element'");
    let overlay;
    let popper;
    let closingTimeout;
    const openPopper = (currentAnchorElement, options = {}) => {
      const disableOverlay = options.disableOverlay ?? false;
      clearTimeout(closingTimeout);
      if (!popper)
        popper = createPopper(currentAnchorElement, popperElement, {
          strategy: "fixed",
          modifiers: [
            {
              name: "preventOverflow",
              options: {
                altAxis: true,
                padding: POPPER_VIEWPORT_PADDING
              }
            }
          ]
        });
      if (!disableOverlay) {
        overlay = document.createElement("div");
        overlay.classList.add("popper-overlay");
        overlay.addEventListener("click", closePopper);
        document.body.prepend(overlay);
      }
      popperElement.classList.add("open");
    };
    const closePopper = () => {
      if (overlay) {
        overlay.remove();
        overlay = void 0;
      }
      popperElement.classList.remove("open");
      clearTimeout(closingTimeout);
      closingTimeout = window.setTimeout(() => {
        popper?.destroy();
        popper = void 0;
      }, ANIMATION_SLOW_MS);
    };
    anchorElements.forEach((anchorElement) => {
      if (onHover) {
        anchorElement.addEventListener("mouseenter", (e) => {
          const isOpen = popperElement.classList.contains("open");
          if (!isOpen) {
            openPopper(e.currentTarget, { disableOverlay: true });
          }
        });
        anchorElement.addEventListener("mouseenter", (e) => {
        });
        anchorElement.addEventListener("mouseleave", () => {
          const isOpen = popperElement.classList.contains("open");
          if (isOpen) {
            closePopper();
          }
        });
      } else {
        closeElements.forEach((closeElement) => {
          closeElement.addEventListener("click", closePopper);
        });
        anchorElement.addEventListener("click", (e) => {
          const isOpen = popperElement.classList.contains("open");
          if (!isOpen) {
            openPopper(e.currentTarget);
          } else {
            closePopper();
          }
        });
        window.addEventListener("blur", () => {
          closePopper();
        });
      }
    });
  });
});

const setValue = (elements, value) => {
  elements.input?.setAttribute("value", value);
  elements.input?.dispatchEvent(new Event("change"));
};
const updateActive = (elements) => {
  const value = elements.input.value;
  let activeIndex = 0;
  elements.toggleButtonGroup.querySelectorAll(".toggle-button").forEach((button, index) => {
    if (button.getAttribute("data-value") === value) {
      button.classList.add("active");
      activeIndex = index;
    } else {
      button.classList.remove("active");
    }
  });
  elements.target?.forEach((elem) => {
    Array.from(elem.children).forEach((child, index) => {
      if (index === activeIndex) {
        child.classList.add("active");
      } else {
        child.classList.remove("active");
      }
    });
  });
};
window.addEventListener("load", () => {
  document.querySelectorAll(".toggle-button-group:not([data-disable-toggle-button-group-js])").forEach((toggleButtonGroup) => {
    if (!(toggleButtonGroup instanceof HTMLElement)) {
      console.error(".toggleButtonGroup is not a HTMLElement", toggleButtonGroup);
      return;
    }
    const input = toggleButtonGroup.querySelector("input");
    const buttons = Array.from(toggleButtonGroup.querySelectorAll(".toggle-button"));
    const str = toggleButtonGroup.getAttribute("data-toggle-button-group-target");
    const target = str ? Array.from(document.querySelectorAll(str)) : void 0;
    toggleButtonGroup.addEventListener("click", (e) => {
      if (!(e.target instanceof HTMLElement) || !e.target.closest(".toggle-button"))
        return;
      const activeButton = e.target;
      const value = activeButton.getAttribute("data-value");
      if (input && value !== null) {
        setValue({ input }, value);
      }
      buttons.forEach((button) => {
        if (button === activeButton) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });
      if (target) {
        const activeIndex = buttons.findIndex((button) => button === activeButton);
        target.forEach((elem) => {
          Array.from(elem.children).forEach((child, index) => {
            if (index === activeIndex) {
              child.classList.add("active");
            } else {
              child.classList.remove("active");
            }
          });
        });
      }
    });
    if (input) {
      updateActive({ input, target, toggleButtonGroup });
      input.addEventListener("change", () => {
        updateActive({ input, target, toggleButtonGroup });
      });
    }
  });
});

window.addEventListener("load", () => {
  document.querySelectorAll("[data-switch-classes]").forEach((root) => {
    const classNames = root.getAttribute("data-switch-classes").split(" ");
    const targetQuery = root.getAttribute("data-target");
    const targets = document.querySelectorAll(targetQuery);
    const sourceQuery = root.getAttribute("data-source");
    const sources = root.querySelectorAll(sourceQuery);
    sources.forEach((source, sourceIndex) => {
      source.addEventListener("click", () => {
        targets.forEach((target) => {
          classNames.forEach((className, classNameIndex) => {
            if (sourceIndex === classNameIndex) {
              target.classList.add(className);
            } else {
              target.classList.remove(className);
            }
          });
        });
      });
    });
  });
});

const INPUT_VALUE_SEP = ",";
window.addEventListener("load", () => {
  const elements = document.querySelectorAll(".input-url-sync:not([data-url-sync-disabled])");
  const updateValue = (input) => {
    const url = new URL(window.location.href);
    const paramValues = url.searchParams.getAll(input.name);
    const value = paramValues.join(INPUT_VALUE_SEP);
    if (input.value !== value) {
      input.setAttribute("value", value);
      input.dispatchEvent(new Event("change"));
    }
  };
  const updateUrl = (input) => {
    const name = input.name;
    const value = input.value;
    const url = new URL(window.location.href);
    url.searchParams.set(name, value);
    if (window.location.href !== url.href) {
      window.localStorage.setItem("page-scroll-top", "" + document.documentElement.scrollTop);
      window.location.replace(url.href);
    }
  };
  elements.forEach((element) => {
    element.addEventListener("change", (e) => {
      if (!(e.currentTarget instanceof HTMLInputElement))
        return;
      if (e.currentTarget.getAttribute("data-only-init") !== null)
        return;
      updateUrl(e.currentTarget);
    });
    if (element instanceof HTMLInputElement)
      updateValue(element);
  });
  window.addEventListener("locationchange", (e) => {
    elements.forEach((element) => {
      if (element instanceof HTMLInputElement)
        updateValue(element);
    });
  });
  const pageScrollTop = parseFloat(window.localStorage.getItem("page-scroll-top") || "0");
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo({ top: pageScrollTop });
  document.documentElement.style.scrollBehavior = "";
});

const getFinishDate = (el) => {
  const str = el.getAttribute("data-timer-finish-date");
  const finishDate = str ? new Date(str) : void 0;
  return finishDate;
};
const getStartDate = (el) => {
  const str = el.getAttribute("data-timer-start-date");
  const startDate = str ? new Date(str) : void 0;
  return startDate;
};
const getFormat = (el) => {
  const str = el.getAttribute("data-timer-format");
  return str || "hhhh:mm:ss";
};
const updateTimer = (timer) => {
  const finishDate = getFinishDate(timer);
  const startDate = getStartDate(timer);
  const format = getFormat(timer);
  if (!finishDate && !startDate)
    return;
  const now = Date.now();
  let diff = 0;
  if (finishDate) {
    diff = finishDate.getTime() - now;
  } else if (startDate) {
    diff = now - startDate.getTime();
  }
  diff = diff > 0 ? diff : 0;
  let seconds = String(Math.floor(diff / 1e3) % 60).padStart(2, "0");
  let minutes = String(Math.floor(diff / (60 * 1e3)) % 60).padStart(2, "0");
  let allhours = Math.floor(diff / (60 * 60 * 1e3));
  let hours = String(Math.floor(allhours % 24)).padStart(2, "0");
  let days = Math.floor(diff / (60 * 60 * 1e3 * 24));
  timer.textContent = format.replace("dd", "" + days).replace("hhhh", "" + allhours).replace("hh", "" + hours).replace("mm", "" + minutes).replace("ss", "" + seconds);
};
window.addEventListener("load", () => {
  const timers = document.querySelectorAll(".timer");
  timers.forEach((timer) => {
    const finishDate = getFinishDate(timer);
    const startDate = getStartDate(timer);
    if (!finishDate && !startDate) {
      console.warn("timer has no finish date adn start date", timer);
      return;
    }
    window.setInterval(() => {
      updateTimer(timer);
    }, 1e3);
    updateTimer(timer);
  });
});

window.addEventListener("load", () => {
  document.querySelectorAll(".input").forEach((root) => {
    const input = root.querySelector("input");
    if (!input)
      return;
    root.addEventListener("click", () => {
      input.focus();
    });
    input.addEventListener("focus", () => {
      input.classList.add("focus");
    });
    input.addEventListener("blur", () => {
      input.classList.remove("focus");
    });
  });
});

window.addEventListener("load", () => {
  document.querySelectorAll(".textarea-autosize").forEach((root) => {
    if (!(root instanceof HTMLTextAreaElement)) {
      console.error("Element with class 'textarea-autosize' is not textarea", root);
      return;
    }
    root.addEventListener("input", () => {
      const maxHeight = parseFloat(root.dataset.textareaAutosizeMaxWidth || "0");
      const initialHeight = root.style.height;
      console.log(initialHeight);
      root.style.height = "auto";
      if (maxHeight > 0 && root.scrollHeight < maxHeight) {
        root.style.height = root.scrollHeight + "px";
        root.style.overflowY = "hidden";
      } else {
        root.style.height = initialHeight;
        root.style.overflowY = "auto";
      }
    });
  });
});

const sameWidth = {
  name: "sameWidth",
  enabled: true,
  phase: "beforeWrite",
  requires: ["computeStyles"],
  fn: ({ state }) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  effect: ({ state }) => {
    state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
  }
};
const createPlacementHandler = (onPlacementChange) => {
  return {
    name: "placementHandler",
    enabled: true,
    phase: "beforeWrite",
    requires: ["computeStyles"],
    fn: ({ state }) => {
      onPlacementChange(state.placement, state.elements.popper);
    }
  };
};

function copyToClipboard(textToCopy) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(textToCopy);
  } else {
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      document.execCommand("copy") ? res(void 0) : rej();
      textArea.remove();
    });
  }
}

const parsePlacement = (className) => {
  return (className.match(/left|right|top|bottom/g) || [])[0];
};
const SHOW_TIME_MS = 2e3;
window.addEventListener("load", () => {
  const ANIMATION_SLOW_MS = parseFloat(getCssVariable("--animation-slow")) * 1e3;
  document.querySelectorAll(".copy-text").forEach((copyText) => {
    const value = copyText.querySelector(".copy-text__value")?.textContent?.trim();
    const tooltip = copyText.querySelector(".copy-text__success-tooltip");
    if (!value || !(tooltip instanceof HTMLElement))
      return;
    let popper;
    let hidingTimeout;
    let autoHidingTimeout;
    const showTooltip = () => {
      clearTimeout(hidingTimeout);
      popper = createPopper(copyText, tooltip, {
        placement: parsePlacement(tooltip.className) ?? "auto",
        strategy: "absolute",
        modifiers: [
          {
            name: "flip",
            options: {
              fallbackPlacements: ["auto"]
            }
          },
          createPlacementHandler((placement, element) => {
            element.classList.remove("top");
            element.classList.remove("left");
            element.classList.remove("right");
            element.classList.remove("bottom");
            element.classList.add(placement);
          })
        ]
      });
      tooltip.classList.add("show");
      tooltip.classList.remove("fade-out-slow");
    };
    const hideTooltip = (options = {}) => {
      clearTimeout(hidingTimeout);
      if (options.rightNow) {
        tooltip.classList.remove("show");
        tooltip.classList.remove("fade-out-slow");
      } else {
        tooltip.classList.add("fade-out-slow");
        hidingTimeout = window.setTimeout(() => {
          tooltip.classList.remove("show");
          tooltip.classList.remove("fade-out-slow");
          popper?.destroy();
        }, ANIMATION_SLOW_MS);
      }
    };
    const onClickOutside = (e) => {
      if (e.target instanceof HTMLElement && e.target.closest(".copy-text") === copyText)
        return;
      hideTooltip({ rightNow: true });
      document.documentElement.removeEventListener("click", onClickOutside);
    };
    copyText.addEventListener("click", () => {
      copyToClipboard(value).then(() => {
        clearTimeout(autoHidingTimeout);
        showTooltip();
        autoHidingTimeout = window.setTimeout(() => {
          hideTooltip();
          document.documentElement.removeEventListener("click", onClickOutside);
        }, SHOW_TIME_MS);
      });
      document.documentElement.addEventListener("click", onClickOutside);
    });
    document.body.appendChild(tooltip);
  });
});

const isModal = (element) => {
  return element.classList.contains("modal");
};
const getModalParent = (element) => {
  return element.closest(".modal");
};
const openModal = (modal) => {
  if (!isModal(modal)) {
    console.warn(`It is not a modal`, modal);
  }
  document.documentElement.classList.add("modal-open");
  modal.classList.add("open");
};
const closeModal = (modal) => {
  if (!isModal(modal)) {
    console.warn(`It is not a modal`, modal);
  }
  document.documentElement.classList.remove("modal-open");
  modal.classList.remove("open");
};

window.addEventListener("load", () => {
  document.querySelectorAll("[data-open-modal]").forEach((trigger) => {
    const modalQuery = trigger.getAttribute("data-open-modal");
    const modals = Array.from(document.querySelectorAll(modalQuery));
    const allModals = document.querySelectorAll(".modal");
    if (trigger && modals.length > 0) {
      trigger.addEventListener("click", () => {
        allModals.forEach((modal) => closeModal(modal));
        modals.forEach((modal) => openModal(modal));
      });
    }
  });
});

const enablePopper = (popper) => {
  popper.setOptions((options) => ({
    ...options,
    modifiers: [...options.modifiers || [], { name: "eventListeners", enabled: true }]
  }));
  popper.update();
};
const disablePopper = (popper) => {
  popper.setOptions((options) => ({
    ...options,
    modifiers: [...options.modifiers || [], { name: "eventListeners", enabled: false }]
  }));
};

window.addEventListener("load", () => {
  document.querySelectorAll(".select").forEach((select) => {
    const input = select.querySelector("input");
    const trigger = select.querySelector(".select__trigger");
    const triggerValue = select.querySelector(".select__trigger-value");
    const menu = select.querySelector(".select__menu");
    const menuItems = select.querySelectorAll(".select__menu-item");
    if (!input) {
      console.warn("'.select' has no input", input);
      return;
    }
    if (!(trigger instanceof HTMLElement)) {
      console.warn("'.select' has no trigger", trigger);
      return;
    }
    if (!(triggerValue instanceof HTMLElement)) {
      console.warn("'.select' has no triggerValue", triggerValue);
      return;
    }
    if (!(menu instanceof HTMLElement)) {
      console.warn("'.select' has no menu", menu);
      return;
    }
    document.body.append(menu);
    const popper = createPopper(trigger, menu, {
      strategy: "absolute",
      modifiers: [sameWidth]
    });
    const isMenuOpen = () => {
      return select.classList.contains("open");
    };
    const openMenu = () => {
      select.classList.add("open");
      menu.classList.add("open");
      enablePopper(popper);
      popper.update();
    };
    const closeMenu = () => {
      select.classList.remove("open");
      menu.classList.remove("open");
      disablePopper(popper);
    };
    const updateSelected = () => {
      let displayValue = "";
      const value = input.value;
      menuItems.forEach((menuItem) => {
        if (menuItem.getAttribute("data-value") === value) {
          menuItem.classList.add("selected");
          displayValue = menuItem.textContent || "";
        } else {
          menuItem.classList.remove("selected");
        }
      });
      triggerValue.textContent = displayValue;
    };
    const setValue = (value) => {
      input.value = value || "";
      input.dispatchEvent(new Event("change"));
    };
    const onClickOutside = (e) => {
      if (e.target instanceof HTMLElement && e.target.closest(".select__menu"))
        return;
      closeMenu();
      document.documentElement.removeEventListener("click", onClickOutside);
    };
    trigger.addEventListener("click", (e) => {
      if (!isMenuOpen()) {
        openMenu();
        e.stopPropagation();
        document.documentElement.addEventListener("click", onClickOutside);
      }
    });
    menu.addEventListener("click", (e) => {
      if (!(e.target instanceof Element))
        return;
      const menuItem = e.target.closest(".select__menu-item");
      if (!(menuItem instanceof HTMLElement))
        return;
      const value = menuItem.dataset.value;
      setValue(value || "");
      closeMenu();
    });
    input.addEventListener("change", () => {
      updateSelected();
    });
    updateSelected();
  });
});

window.addEventListener("load", () => {
  const stopCoef = 0.95;
  document.querySelectorAll("[data-drag-scroll]").forEach((element) => {
    if (!(element instanceof HTMLElement))
      return;
    let startPos = {
      top: 0,
      left: 0,
      x: 0,
      y: 0
    };
    let pos = {
      top: 0,
      left: 0,
      x: 0,
      y: 0
    };
    let prevPos = { ...pos };
    let isGrabbed = false;
    let transform = { x: 0, y: 0 };
    const onMouseDown = (e) => {
      startPos = {
        left: element.scrollLeft,
        top: element.scrollTop,
        x: e.clientX,
        y: e.clientY
      };
      pos = {
        ...startPos
      };
      prevPos = {
        ...pos
      };
      isGrabbed = true;
      transform = {
        x: 0,
        y: 0
      };
      element.style.cursor = "grabbing";
      element.style.userSelect = "none";
      element.querySelectorAll("img").forEach((img) => img.draggable = false);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      requestAnimationFrame(move);
    };
    const onMouseMove = (e) => {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      pos.left = startPos.left - dx;
      pos.top = startPos.top - dy;
      pos.x = e.clientX;
      pos.y = e.clientY;
    };
    const onMouseUp = (e) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      isGrabbed = false;
      element.style.cursor = "grab";
      element.style.removeProperty("user-select");
      requestAnimationFrame(moveByInertia);
    };
    const move = () => {
      if (!isGrabbed)
        return;
      transform = {
        x: prevPos.left - pos.left,
        y: prevPos.top - pos.top
      };
      element.scrollTop = pos.top;
      element.scrollLeft = pos.left;
      prevPos = {
        ...pos
      };
      requestAnimationFrame(move);
    };
    const moveByInertia = () => {
      if (isGrabbed)
        return;
      if (Math.pow(transform.x, 2) + Math.pow(transform.y, 2) < 0.3)
        return;
      transform.x *= stopCoef;
      transform.y *= stopCoef;
      element.scrollLeft -= transform.x;
      element.scrollTop -= transform.y;
      requestAnimationFrame(moveByInertia);
    };
    const preventClickIfMove = (e) => {
      const diff = {
        x: startPos.x - e.clientX,
        y: startPos.y - e.clientY
      };
      const diffLength = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
      if (diffLength > 4) {
        e.stopPropagation();
      }
    };
    element.style.cursor = "grab";
    element.addEventListener("mousedown", onMouseDown);
    element.addEventListener("click", preventClickIfMove, {
      capture: true
    });
  });
});

window.addEventListener("load", () => {
  document.querySelectorAll("[data-close-modal]").forEach((trigger) => {
    const modalQuery = trigger.getAttribute("data-close-modal");
    const modals = modalQuery ? Array.from(document.querySelectorAll(modalQuery)) : [getModalParent(trigger)];
    if (trigger && modals.length > 0) {
      trigger.addEventListener("click", () => {
        modals.forEach((modal) => closeModal(modal));
      });
    }
  });
});

window.addEventListener("load", () => {
  document.querySelectorAll(".input-password").forEach((root) => {
    const input = root.querySelector("input");
    const eyeBtn = root.querySelector(".input-password__eye-btn");
    if (!input || !eyeBtn)
      return;
    const turnEyeOn = () => {
      root.classList.add("eye-on");
      root.classList.remove("eye-off");
      input.setAttribute("type", "text");
    };
    const turnEyeOff = () => {
      root.classList.remove("eye-on");
      root.classList.add("eye-off");
      input.setAttribute("type", "password");
    };
    eyeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (root.classList.contains("eye-on")) {
        turnEyeOff();
      } else {
        turnEyeOn();
      }
    });
  });
});

window.addEventListener("load", () => {
  document.querySelectorAll("[data-toggle-class]").forEach((elem) => {
    if (!(elem instanceof HTMLElement))
      return;
    const className = elem.dataset.toggleClass;
    const selector = elem.dataset.target;
    const targets = selector ? document.querySelectorAll(selector) : void 0;
    if (className && targets) {
      elem.addEventListener("click", (e) => {
        targets.forEach((target) => {
          target.classList.toggle(className);
        });
      });
    }
  });
});

window.addEventListener("load", () => {
  const mediaViewer = document.querySelector(".media-viewer");
  const nextButton = mediaViewer?.querySelector(".media-viewer__next");
  const prevButton = mediaViewer?.querySelector(".media-viewer__prev");
  if (mediaViewer && nextButton && prevButton) {
    let mediaIndex = 0;
    const close = () => {
      mediaViewer.classList.remove("open");
      document.documentElement.classList.remove("media-viewer-open");
    };
    const open = (img) => {
      const downloadImage = mediaViewer.querySelector(".media-viewer__download-image");
      const image = mediaViewer.querySelector(".media-viewer__image");
      const downloadHref = img.getAttribute("data-download-url") ?? img.src;
      const previewSrc = img.src;
      const currentIndex = Array.from(document.querySelectorAll("[data-viewable]")).findIndex(
        (item) => item === img
      );
      if (downloadImage && image && previewSrc && downloadHref && currentIndex !== -1) {
        downloadImage.setAttribute("href", downloadHref);
        image.setAttribute("src", previewSrc);
        mediaIndex = currentIndex;
        mediaViewer.classList.add("open");
        document.documentElement.classList.add("media-viewer-open");
      }
    };
    const openNext = () => {
      const medias = document.querySelectorAll("[data-viewable]");
      const nextMedia = medias[mediaIndex + 1];
      if (nextMedia && nextMedia instanceof HTMLImageElement) {
        mediaIndex++;
        open(nextMedia);
      }
    };
    const openPrev = () => {
      const medias = document.querySelectorAll("[data-viewable]");
      const prevMedia = medias[mediaIndex - 1];
      if (prevMedia && prevMedia instanceof HTMLImageElement) {
        mediaIndex--;
        open(prevMedia);
      }
    };
    mediaViewer.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof Element && (target.classList.contains("media-viewer") || target.classList.contains("media-viewer__body"))) {
        close();
      }
    });
    nextButton.addEventListener("click", openNext);
    prevButton.addEventListener("click", openPrev);
    document.documentElement.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof HTMLImageElement && target.hasAttribute("data-viewable")) {
        open(target);
      }
    });
  }
});

window.addEventListener("load", () => {
  try {
    document.querySelectorAll("[data-toggle-collapse]").forEach((trigger) => {
      if (!(trigger instanceof HTMLElement))
        throw new Error("[data-toggle-collapse] is not HTMLElement");
      const str = trigger.getAttribute("data-toggle-collapse");
      const collapses = str ? document.querySelectorAll(str) : [];
      collapses.forEach((collapse) => {
        const content = collapse.querySelector(".collapse__content");
        if (!(collapse instanceof HTMLElement)) {
          throw new Error(`".collapse" is not HTMLElement`);
        }
        if (!(content instanceof HTMLElement)) {
          throw new Error(`Element ".collapse__content" is not found`);
        }
        collapse.style.height = "0px";
        collapse.style.overflow = "hidden";
        let heightAutoTimeout = -1;
        let collapseTimeout = -1;
        trigger.addEventListener("click", () => {
          const contentHeight = content.getBoundingClientRect().height;
          const animationTime = Math.sqrt(contentHeight) / 28;
          collapse.style.transition = `height ${animationTime}s`;
          clearTimeout(heightAutoTimeout);
          clearTimeout(collapseTimeout);
          if (trigger.classList.contains("expanded")) {
            collapse.style.height = contentHeight + "px";
            collapseTimeout = window.setTimeout(() => {
              trigger.classList.remove("expanded");
              collapse.classList.remove("expanded");
              collapse.style.height = "0";
            }, 1);
          } else {
            trigger.classList.add("expanded");
            collapse.classList.add("expanded");
            collapse.style.height = contentHeight + "px";
            heightAutoTimeout = window.setTimeout(() => {
              collapse.style.height = "auto";
            }, animationTime * 1e3);
          }
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
});

const VIEWPORT_PADDING = 12;
const createTooltip = (text) => {
  const tooltipContent = document.createElement("div");
  tooltipContent.classList.add("tooltip__content");
  tooltipContent.textContent = text;
  const tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  tooltip.appendChild(tooltipContent);
  return tooltip;
};
window.addEventListener("load", () => {
  const ANIMATION_SLOW_MS = parseFloat(getCssVariable("--animation-slow")) * 1e3;
  document.querySelectorAll("[data-tooltip]").forEach((trigger) => {
    if (!(trigger instanceof HTMLElement))
      return;
    const placement = trigger.dataset.placement || "top";
    const text = trigger?.dataset?.tooltipText || "";
    const tooltip = trigger.querySelector(".tooltip") || createTooltip(text);
    if (!(tooltip instanceof HTMLElement))
      return;
    let popper;
    let disappearTimeoutId = -1;
    trigger.addEventListener("mouseenter", () => {
      if (tooltip.parentElement !== document.body) {
        document.body.appendChild(tooltip);
      }
      if (!popper)
        popper = createPopper(trigger, tooltip, {
          placement,
          strategy: "absolute",
          modifiers: [
            {
              name: "flip",
              options: {
                fallbackPlacements: ["auto"]
              }
            },
            {
              name: "preventOverflow",
              options: {
                padding: VIEWPORT_PADDING
              }
            },
            createPlacementHandler((placement2, element) => {
              element.classList.remove("top");
              element.classList.remove("left");
              element.classList.remove("right");
              element.classList.remove("bottom");
              element.classList.add(placement2);
            })
          ]
        });
      tooltip.style.maxWidth = `calc(100vw - ${VIEWPORT_PADDING * 2}px)`;
      tooltip.classList.add("show");
      tooltip.classList.remove("fade-out-slow");
      clearTimeout(disappearTimeoutId);
      popper.update();
    });
    trigger.addEventListener("mouseleave", () => {
      tooltip.classList.add("fade-out-slow");
      disappearTimeoutId = window.setTimeout(() => {
        tooltip.classList.remove("show");
        if (popper) {
          popper.destroy();
          popper = void 0;
        }
      }, ANIMATION_SLOW_MS);
    });
  });
});
