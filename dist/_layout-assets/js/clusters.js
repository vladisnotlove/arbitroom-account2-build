import './_common.js';
import './_vendor.js';

window.addEventListener("load", () => {
  const element = document.getElementById("clusterTimers");
  const tabs = element.querySelectorAll(".cluster-timers__tab");
  const tabContents = element.querySelectorAll(".cluster-timers__tab-content");
  const inactiveAll = () => {
    tabs.forEach((tab) => tab.classList.remove("active"));
    tabContents.forEach((tab) => tab.classList.remove("active"));
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      inactiveAll();
      tab.classList.add("active");
      tabContents[index]?.classList.add("active");
    });
  });
});
