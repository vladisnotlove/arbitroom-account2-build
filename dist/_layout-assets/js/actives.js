import './_common.js';
import './_vendor.js';

window.addEventListener("load", () => {
  document.querySelectorAll(".active-blocks").forEach((root) => {
    const showBtn = root.querySelector(".active-blocks__show-btn");
    const hideBtn = root.querySelector(".active-blocks__hide-btn");
    if (showBtn && hideBtn) {
      showBtn.addEventListener("click", () => {
        root.classList.add("expanded");
      });
      hideBtn.addEventListener("click", () => {
        root.classList.remove("expanded");
      });
    }
    const blocks = root.querySelectorAll(".active-blocks__block.inactive");
    const input = root.querySelector("input");
    const activeBtn = root.querySelector(".active-blocks__active-btn");
    if (blocks && input && activeBtn) {
      blocks.forEach((block) => {
        const selectBlock = () => {
          blocks.forEach((block2) => block2.classList.remove("selected"));
          block.classList.add("selected");
          const value = block.getAttribute("data-value");
          if (value) {
            input.value = value;
            input.dispatchEvent(new Event("change"));
          }
          activeBtn.classList.remove("disabled");
        };
        const unselectBlock = () => {
          block.classList.remove("selected");
          input.value = "";
          input.dispatchEvent(new Event("change"));
          activeBtn.classList.add("disabled");
        };
        block.addEventListener("click", (e) => {
          e.stopPropagation();
          selectBlock();
        });
        document.addEventListener("click", (e) => {
          if (e.target instanceof HTMLElement && !e.target.closest(".active-blocks__active-btn")) {
            unselectBlock();
          }
        });
      });
    }
  });
});
