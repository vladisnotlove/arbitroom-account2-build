import './_common.js';
import './_vendor.js';

window.addEventListener("load", () => {
  const root = document.getElementById("outcomeVariants");
  if (!root)
    return;
  const variants = root.querySelectorAll("[data-outcome-variant]");
  const triggers = root.querySelectorAll("[data-to-outcome-variant]");
  triggers.forEach((trigger) => {
    const triggerKey = trigger.getAttribute("data-to-outcome-variant");
    trigger.addEventListener("click", () => {
      variants.forEach((variant) => {
        const variantKey = variant.getAttribute("data-outcome-variant");
        if (variantKey === triggerKey) {
          variant.classList.add("active");
        } else {
          variant.classList.remove("active");
        }
      });
    });
  });
});
