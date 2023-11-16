import './_common.js';
import { p as pointInPolygon } from './_vendor.js';

window.addEventListener("load", () => {
  document.querySelectorAll(".top-partners").forEach((root) => {
    const toggleButtonGroup = root.querySelector(".toggle-button-group");
    const input = root.querySelector(".toggle-button-group input");
    const table = root.querySelector(".partners-table");
    if (input instanceof HTMLInputElement) {
      input.addEventListener("change", (e) => {
        const value = input.value;
        const source = toggleButtonGroup.querySelector(`[data-value="${value}"]`).getAttribute("data-change-source");
        table.setAttribute("data-source", source);
      });
    }
    const expandBtn = root.querySelector(".top-partners__expand-btn");
    const collapseBtn = root.querySelector(".top-partners__collapse-btn");
    if (expandBtn && collapseBtn) {
      expandBtn.addEventListener("click", () => {
        root.classList.add("expanded");
      });
      collapseBtn.addEventListener("click", () => {
        root.classList.remove("expanded");
      });
    }
  });
});

window.addEventListener("load", () => {
  const root = document.querySelector(".structure");
  const btns = root.querySelectorAll("[data-change-hexs-source]");
  const hexs = root.querySelector(".structure__hexs");
  if (!root || !btns || !hexs)
    return;
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const source = btn.getAttribute("data-change-hexs-source");
      if (source)
        hexs.setAttribute("data-source", source);
    });
  });
});

const addOnAttrChange = (element, attrName, callback, options = {}) => {
  const callOnCreate = options.callOnCreate ?? false;
  let prevAttr = element.getAttribute(attrName);
  if (callOnCreate) {
    callback(prevAttr);
  }
  const observer = new MutationObserver((mutationList) => {
    const attr = element.getAttribute(attrName);
    if (attr !== prevAttr) {
      callback(attr);
    }
    prevAttr = attr;
  });
  observer.observe(element, {
    attributes: true,
    attributeFilter: [attrName]
  });
  return () => {
    observer.disconnect();
  };
};

const updateRowWithPartner = (row, partner) => {
  row.querySelector('[data-name="name"] > .table__cell-value').textContent = partner.name;
  row.querySelector('[data-name="registeredDate"] > .table__cell-value').textContent = partner.registeredDate;
  row.querySelector('[data-name="status"] > .table__cell-value').textContent = partner.status;
  row.querySelector('[data-name="level"] > .table__cell-value').textContent = "" + partner.level;
  row.querySelector('[data-name="full"] > .table__cell-value').textContent = partner.full;
  row.querySelector('[data-name="chatUrl"] a').setAttribute("href", partner.chatUrl);
};
window.addEventListener("load", () => {
  document.querySelectorAll(".partners-table").forEach((root) => {
    const rows = root.querySelectorAll(".table__body .table__row");
    const loadSource = () => {
      const source = root.getAttribute("data-source");
      if (!source)
        return;
      fetch(source).then((data) => data.json()).then((partners) => {
        try {
          for (let i = 0; i < partners.length && i < rows.length; i++) {
            const row = rows[i];
            const partner = partners[i];
            updateRowWithPartner(row, partner);
          }
          root.classList.remove("loading");
        } catch (e) {
          console.error(e);
        }
      });
    };
    addOnAttrChange(root, "data-source", () => {
      root.classList.add("loading");
      loadSource();
    });
    loadSource();
  });
});

function debounce(cb, ms = 20) {
  let timeoutId = 0;
  let callable = (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => cb(...args), ms);
  };
  return callable;
}

class QNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}
class Queue {
  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0;
  }
  isEmpty() {
    return !this.size;
  }
  enqueue(item) {
    const newNode = new QNode(item);
    if (this.isEmpty()) {
      this.first = newNode;
      this.last = newNode;
    } else {
      this.last.next = newNode;
      this.last = newNode;
    }
    this.size++;
    return this;
  }
  dequeue() {
    if (this.isEmpty())
      return null;
    const itemToBeRemoved = this.first;
    if (this.first === this.last) {
      this.last = null;
    }
    this.first = this.first.next;
    this.size--;
    return itemToBeRemoved?.value || null;
  }
  peek() {
    return this.first;
  }
}

class Vector {
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(value) {
    if (typeof value === "number") {
      return new Vector(this.x + value, this.y + value);
    } else {
      return new Vector(this.x + value.x, this.y + value.y);
    }
  }
  subtract(value) {
    if (typeof value === "number") {
      return new Vector(this.x - value, this.y - value);
    } else {
      return new Vector(this.x - value.x, this.y - value.y);
    }
  }
  round() {
    return new Vector(Math.round(this.x), Math.round(this.y));
  }
  floor() {
    return new Vector(Math.floor(this.x), Math.floor(this.y));
  }
  ceil() {
    return new Vector(Math.ceil(this.x), Math.ceil(this.y));
  }
  multiply(value) {
    if (typeof value === "number") {
      return new Vector(this.x * value, this.y * value);
    } else {
      return new Vector(this.x * value.x, this.y * value.y);
    }
  }
  divide(value) {
    if (typeof value === "number") {
      return new Vector(this.x / value, this.y / value);
    } else {
      return new Vector(this.x / value.x, this.y / value.y);
    }
  }
  normalize() {
    if (this.length === 0)
      return Vector.from(this);
    return this.divide(this.length);
  }
  fitToMaxLength(length) {
    if (this.length > length)
      return this.normalize().multiply(length);
    return Vector.from(this);
  }
  isEqual(other) {
    return this.x === other.x && this.y === other.y;
  }
  // static
  static from(value) {
    return new Vector(value.x, value.y);
  }
  static split(from, to, step) {
    const delta = to.subtract(from);
    const deltaLength = delta.length;
    const deltaNormilized = delta.normalize();
    const vectors = [];
    for (let value = 0; value < deltaLength; value += step) {
      vectors.push(from.add(deltaNormilized.multiply(value)));
    }
    vectors.push(to);
    return vectors;
  }
}

const addOnFontsLoad = (fonts, callback, options = {}) => {
  const maxCheckTime = options.maxCheckTime ?? 1e4;
  const startTime = performance.now();
  const intervalId = setInterval(() => {
    const loaded = fonts.reduce((loaded2, font) => {
      return loaded2 && document.fonts.check(font);
    }, true);
    if (loaded) {
      callback();
      clearInterval(intervalId);
    } else {
      const currentTime = performance.now();
      if (currentTime - startTime > maxCheckTime) {
        clearInterval(intervalId);
      }
    }
  }, 100);
};

const { setSmartInveral, clearSmartInterval } = (() => {
  const runningSmartIntervals = /* @__PURE__ */ new Set();
  let lastId = 0;
  const setSmartInveral2 = (callback, ms) => {
    const id = lastId + 1;
    lastId++;
    runningSmartIntervals.add(id);
    let intervalMs = ms;
    let intervalId = -1;
    const intervalCallback = () => {
      if (!runningSmartIntervals.has(id)) {
        clearInterval(intervalId);
        return;
      }
      const start = performance.now();
      callback();
      const finish = performance.now();
      const delta = finish - start;
      if (delta > intervalMs) {
        intervalMs = delta + ms;
        clearInterval(intervalId);
        intervalId = window.setInterval(intervalCallback, intervalMs);
      }
    };
    intervalId = window.setInterval(intervalCallback, intervalMs);
    return id;
  };
  const clearSmartInterval2 = (id) => {
    runningSmartIntervals.delete(id);
  };
  return { setSmartInveral: setSmartInveral2, clearSmartInterval: clearSmartInterval2 };
})();

const throttle = (fn, delay) => {
  let wait = false;
  return (...args) => {
    if (wait)
      return void 0;
    const val = fn(...args);
    wait = true;
    window.setTimeout(() => {
      wait = false;
    }, delay);
    return val;
  };
};

const addOnResize = (element, onResize, options = {}) => {
  const resizeObserver = new ResizeObserver(throttle(onResize, options.throttle ?? 100));
  resizeObserver.observe(element);
  return () => {
    resizeObserver.unobserve(element);
  };
};

const minScale = 0.34;
const maxScale = 5;
const scaleStep = 0.1;
const pinchScaleStep = 5e-3;
const hexMargin = 4;
const hexSize = new Vector(243, 212);
const hexPeriod = new Vector(hexSize.x * 1.5 + hexMargin * 2, hexSize.y + hexMargin * 2);
const background = "transparent";
const emptyHexBackground = "rgba(0,0,0,0.16)";
const hexBackground = "#0D1D36";
const hexShadowBackground = "#0D1D36";
const textColor = "#fff";
const createTileElement = (props) => {
  const tileElement = document.createElement("canvas");
  tileElement.style.position = "absolute";
  tileElement.style.top = "0px";
  tileElement.style.left = "0px";
  tileElement.style.willChange = "transform";
  tileElement.style.width = `${props.size.x}px`;
  tileElement.style.height = `${props.size.y}px`;
  tileElement.width = props.size.x;
  tileElement.height = props.size.y;
  return tileElement;
};
const areRectsIntersected = (r1, r2) => {
  return !(r2.topLeft.x > r1.bottomRight.x || r2.bottomRight.x < r1.topLeft.x || r2.topLeft.y > r1.bottomRight.y || r2.bottomRight.y < r1.topLeft.y);
};
const isRectIntersected = (rect, point) => {
  return point.x > rect.topLeft.x && point.x < rect.bottomRight.x && point.y > rect.topLeft.y && point.y < rect.bottomRight.y;
};
const cached = [hexMargin + hexSize.x * 0.25, hexMargin + hexSize.x * 0.75, hexMargin + hexSize.x];
const isHexIntersected = (hexPosition, point) => {
  const polygon = [
    [hexPosition.x + cached[0], hexPosition.y + hexMargin],
    [hexPosition.x + cached[1], hexPosition.y + hexMargin],
    [hexPosition.x + cached[2], hexPosition.y + hexMargin + hexSize.y * 0.5],
    [hexPosition.x + cached[1], hexPosition.y + hexMargin + hexSize.y],
    [hexPosition.x + cached[0], hexPosition.y + hexMargin + hexSize.y],
    [hexPosition.x + hexMargin, hexPosition.y + hexMargin + hexSize.y * 0.5]
  ];
  return pointInPolygon([point.x, point.y], polygon);
};
const drawHexagon = (ctx, position, options = {}) => {
  ctx.beginPath();
  ctx.moveTo(position.x + cached[0], position.y + hexMargin);
  ctx.lineTo(position.x + cached[1], position.y + hexMargin);
  ctx.lineTo(position.x + cached[2], position.y + hexMargin + hexSize.y * 0.5);
  ctx.lineTo(position.x + cached[1], position.y + hexMargin + hexSize.y);
  ctx.lineTo(position.x + cached[0], position.y + hexMargin + hexSize.y);
  ctx.lineTo(position.x + hexMargin, position.y + hexMargin + hexSize.y * 0.5);
  ctx.closePath();
  ctx.fillStyle = options.background || emptyHexBackground;
  ctx.fill();
  if (options.text) {
    ctx.font = "12px Golos";
    ctx.fillStyle = textColor;
    ctx.fillText(options.text, position.x + hexSize.x * 0.25, position.y + hexMargin + hexSize.x * 0.5 - 6);
  }
};
const drawPartnerHexagon = (ctx, position, partner) => {
  const centerX = position.x + hexMargin + hexSize.x * 0.5;
  const drawText = () => {
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
    ctx.font = "400 12px Golos";
    ctx.fillText(partner.content.pretitle, centerX, position.y + 40);
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.font = "600 48px Golos";
    ctx.fillText(partner.content.status, centerX, position.y + 108);
    ctx.font = "500 16px Golos";
    ctx.fillText(partner.content.name, centerX, position.y + 134);
    ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
    ctx.font = "400 12px Golos";
    ctx.fillText(partner.content.turnLabel, centerX, position.y + 162);
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.font = "400 14px Golos";
    ctx.fillText(partner.content.turn, centerX, position.y + 186);
  };
  if (partner.backgroundSrc) {
    const img = new Image();
    img.src = partner.backgroundSrc;
    img.onload = () => {
      const imgSize = hexSize.add(hexMargin * 2);
      ctx.beginPath();
      ctx.moveTo(position.x + cached[0], position.y + hexMargin);
      ctx.lineTo(position.x + cached[1], position.y + hexMargin);
      ctx.lineTo(position.x + cached[2], position.y + hexMargin + hexSize.y * 0.5);
      ctx.lineTo(position.x + cached[1], position.y + hexMargin + hexSize.y);
      ctx.lineTo(position.x + cached[0], position.y + hexMargin + hexSize.y);
      ctx.lineTo(position.x + hexMargin, position.y + hexMargin + hexSize.y * 0.5);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, position.x, position.y, imgSize.x, imgSize.y);
      drawText();
      img.remove();
    };
  } else {
    drawText();
  }
};
const themeToShadowColor = {
  A1: "rgba(240, 203, 7, 0.56)",
  A2: "rgba(230, 222, 24, 0.56)",
  A3: "rgba(66, 212, 160, 0.56)",
  B1: "rgba(77, 156, 255, 0.56)",
  "B1-F": "rgba(77, 156, 255, 0.56)",
  B2: "rgba(236, 0, 241, 0.48)",
  "B2-F": "rgba(236, 0, 241, 0.48)",
  B3: "rgba(44, 10, 249, 0.56)",
  "B3-F": "rgba(44, 10, 249, 0.56)",
  C1: "rgba(11, 226, 159, 0.56)",
  "C1-F": "rgba(11, 226, 159, 0.56)",
  C2: "rgba(0, 206, 253, 0.56)",
  "C2-F": "rgba(0, 206, 253, 0.56)",
  C3: "rgba(232, 14, 154, 0.56)",
  "C3-F": "rgba(232, 14, 154, 0.56)",
  D1: "rgba(249, 216, 16, 0.56)",
  D2: "rgba(255, 127, 0, 0.56)",
  D3: "rgba(106, 255, 0, 0.56)",
  base: "rgba(42, 27, 194, 0.56)",
  none: "rgba(198, 195, 234, 0.56)"
};
const drawHexagonShadow = (ctx, position, partner) => {
  if (partner.theme) {
    ctx.beginPath();
    ctx.moveTo(position.x + cached[0], position.y + hexMargin);
    ctx.lineTo(position.x + cached[1], position.y + hexMargin);
    ctx.lineTo(position.x + cached[2], position.y + hexMargin + hexSize.y * 0.5);
    ctx.lineTo(position.x + cached[1], position.y + hexMargin + hexSize.y);
    ctx.lineTo(position.x + cached[0], position.y + hexMargin + hexSize.y);
    ctx.lineTo(position.x + hexMargin, position.y + hexMargin + hexSize.y * 0.5);
    ctx.closePath();
    ctx.shadowColor = themeToShadowColor[partner.theme];
    ctx.shadowBlur = 48;
    ctx.fillStyle = hexShadowBackground;
    ctx.fill();
  }
};
const getHexPositionsAround = (position) => {
  const p1 = new Vector(position.x + hexPeriod.x * 0.5, position.y + hexPeriod.y * 0.5);
  const p2 = new Vector(position.x, position.y + hexPeriod.y);
  const p3 = new Vector(position.x - hexPeriod.x * 0.5, position.y + hexPeriod.y * 0.5);
  const p4 = new Vector(position.x - hexPeriod.x * 0.5, position.y - hexPeriod.y * 0.5);
  const p5 = new Vector(position.x, position.y - hexPeriod.y);
  const p6 = new Vector(position.x + hexPeriod.x * 0.5, position.y - hexPeriod.y * 0.5);
  return [p1, p2, p3, p4, p5, p6];
};
const getHexPositionsBySpiral = (start, length) => {
  let toHash = (position) => `${position.x} ${position.y}`;
  let positions = new Queue();
  let hashes = /* @__PURE__ */ new Set();
  let result = [];
  positions.enqueue(start);
  hashes.add(toHash(start));
  for (let i = 0; i < length; i++) {
    const position = positions.dequeue();
    if (position) {
      result.push(position);
      getHexPositionsAround(position).forEach((p) => {
        const hash = toHash(p);
        if (!hashes.has(hash)) {
          hashes.add(hash);
          positions.enqueue(p);
        }
      });
    }
  }
  return result;
};
window.addEventListener("load", () => {
  try {
    const root = document.querySelector(".hexs");
    const hexsMain = root?.querySelector(".hexs__main");
    if (!(root instanceof HTMLElement))
      throw Error(".hexs is not HTMLElement");
    if (!(hexsMain instanceof HTMLElement))
      throw Error(".hexs has no .hexs__main");
    hexsMain.innerHTML = "";
    hexsMain.style.transformOrigin = "0 0";
    let scale = 0.8;
    let size = new Vector(root.clientWidth, root.clientHeight).divide(scale);
    let tileSize = size.multiply(1.5);
    let position = tileSize.multiply(0.5).subtract(size.multiply(0.5));
    let tiles = [
      {
        position: new Vector(0, 0)
      }
    ];
    let start = position.add(size.multiply(0.5)).divide(hexPeriod).floor().multiply(hexPeriod);
    let partners = [];
    let partnerPositions = [];
    let isLoading = true;
    let isZooming = false;
    const setIsZooming = debounce((value) => {
      isZooming = value;
    }, 300);
    const zoom = (zoomPosition, newScale) => {
      isZooming = true;
      if (newScale < minScale)
        return;
      if (newScale > maxScale)
        return;
      const deltaPosition = position.subtract(zoomPosition);
      const scaledDeltaPosition = deltaPosition.divide(scale).multiply(newScale);
      position = position.add(scaledDeltaPosition.subtract(deltaPosition));
      scale = newScale;
      size = new Vector(root.clientWidth, root.clientHeight).divide(newScale);
      tileSize = size.multiply(1.5);
      tiles.forEach((tile) => {
        tile.isInvalid = true;
      });
      setIsZooming(false);
    };
    const reset = () => {
      scale = 0.8;
      size = new Vector(root.clientWidth, root.clientHeight).divide(scale);
      tileSize = size.multiply(1.5);
      position = tileSize.multiply(0.5).subtract(size.multiply(0.5));
      tiles.forEach((tile) => tile.element?.remove());
      tiles = [
        {
          position: new Vector(0, 0)
        }
      ];
      start = position.add(size.multiply(0.5)).divide(hexPeriod).floor().multiply(hexPeriod);
      partners = [];
      partnerPositions = [];
      isLoading = true;
      isZooming = false;
    };
    setSmartInveral(() => {
      if (isLoading)
        return;
      if (isZooming)
        return;
      tiles = tiles.filter((tile) => {
        if (tile.isInvalid) {
          tile.element.remove();
          return false;
        }
        const tileRect = { topLeft: tile.position, bottomRight: tile.position.add(tileSize) };
        const viewRect = { topLeft: position, bottomRight: position.add(size) };
        if (!areRectsIntersected(tileRect, viewRect)) {
          tile.element?.remove();
          return false;
        }
        return true;
      });
      const topLeft = position.divide(tileSize).floor().multiply(tileSize);
      const bottomRight = position.add(size);
      for (let x = topLeft.x; x < bottomRight.x; x += tileSize.x) {
        for (let y = topLeft.y; y < bottomRight.y; y += tileSize.y) {
          if (!tiles.find((tile) => tile.position.x === x && tile.position.y === y)) {
            tiles.push({
              position: new Vector(x, y)
            });
          }
        }
      }
      tiles.forEach((tile) => {
        if (!tile.element) {
          const element = createTileElement({ size: tileSize });
          hexsMain.appendChild(element);
          tile.element = element;
        }
      });
    }, 100);
    addOnFontsLoad(["400 16px Golos", "500 16px Golos", "600 16px Golos", "700 16px Golos"], () => {
      setSmartInveral(() => {
        if (isLoading)
          return;
        tiles.forEach((tile) => {
          if (tile.isRendered || !tile.element)
            return;
          const ctx = tile.element.getContext("2d", { alpha: true });
          if (!ctx)
            return;
          let start2 = tile.position.divide(hexPeriod).floor().multiply(hexPeriod);
          let end = tile.position.add(tileSize);
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.fillStyle = background;
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          for (let x = start2.x; x < end.x; x += hexPeriod.x) {
            for (let y = start2.y; y < end.y; y += hexPeriod.y) {
              const positionInTile = new Vector(x, y).subtract(tile.position);
              drawHexagon(ctx, positionInTile);
            }
          }
          start2 = start2.subtract(hexPeriod.multiply(0.5));
          for (let x = start2.x; x < end.x; x += hexPeriod.x) {
            for (let y = start2.y; y < end.y; y += hexPeriod.y) {
              const positionInTile = new Vector(x, y).subtract(tile.position);
              drawHexagon(ctx, positionInTile);
            }
          }
          partners.forEach((partner, index) => {
            const positionInTile = partnerPositions[index].subtract(tile.position);
            if (positionInTile.x > -2 * hexPeriod.x && positionInTile.y > -2 * hexPeriod.x && positionInTile.x < tileSize.x + 2 * hexPeriod.x && positionInTile.y < tileSize.y + 2 * hexPeriod.x) {
              drawHexagonShadow(ctx, positionInTile, partner);
              ctx.shadowBlur = 0;
              ctx.shadowColor = "#000";
            }
          });
          partners.forEach((partner, index) => {
            const positionInTile = partnerPositions[index].subtract(tile.position);
            if (positionInTile.x > -2 * hexPeriod.x && positionInTile.y > -2 * hexPeriod.x && positionInTile.x < tileSize.x + 2 * hexPeriod.x && positionInTile.y < tileSize.y + 2 * hexPeriod.x) {
              drawHexagon(ctx, positionInTile, { background: hexBackground });
              drawPartnerHexagon(ctx, positionInTile, partner);
            }
          });
          ctx.save();
          tile.isRendered = true;
        });
      }, 100);
    });
    let prevScale;
    let prevPosition;
    const updateTransfrom = () => {
      if (isLoading) {
        requestAnimationFrame(updateTransfrom);
        return;
      }
      if (prevScale === scale && prevPosition?.isEqual(position)) {
        requestAnimationFrame(updateTransfrom);
        return;
      }
      tiles.forEach((tile) => {
        if (!tile.element)
          return;
        const translate = tile.position.subtract(position);
        tile.element.style.transform = `translate(${translate.x}px, ${translate.y}px)`;
      });
      hexsMain.style.transform = `scale(${scale})`;
      requestAnimationFrame(updateTransfrom);
    };
    updateTransfrom();
    addOnAttrChange(
      root,
      "data-source",
      () => {
        const source = root.getAttribute("data-source") || "";
        isLoading = true;
        root.classList.remove("loaded");
        fetch(source).then((data) => data.json()).then((data) => {
          reset();
          partners = data;
          partnerPositions = getHexPositionsBySpiral(start, partners.length);
          isLoading = false;
          root.classList.add("loaded");
        });
      },
      { callOnCreate: true }
    );
    addOnResize(root, () => {
      size = new Vector(root.clientWidth, root.clientHeight).divide(scale);
    });
    root.addEventListener("wheel", (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        const hexsViewPosition = Vector.from(root.getBoundingClientRect());
        const mouseViewPosition = new Vector(event.pageX, event.pageY);
        const zoomPosition = position.subtract(mouseViewPosition.subtract(hexsViewPosition).divide(scale));
        const newScale = scale + scale * scaleStep * Math.sign(event.deltaY) * -1;
        zoom(zoomPosition, newScale);
      }
    });
    let isMouseMoving = false;
    let startMouseEvent;
    let prevMouseEvent;
    root.addEventListener("mousedown", (event) => {
      event.preventDefault();
      startMouseEvent = event;
      prevMouseEvent = event;
      isMouseMoving = true;
      document.documentElement.style.userSelect = "none";
    });
    window.addEventListener("mousemove", (event) => {
      event.preventDefault();
      if (!prevMouseEvent || !isMouseMoving)
        return;
      const movement = new Vector(event.pageX - prevMouseEvent.pageX, event.pageY - prevMouseEvent.pageY).divide(scale).multiply(-1);
      position = position.add(movement);
      prevMouseEvent = event;
    });
    window.addEventListener("mouseup", () => {
      isMouseMoving = false;
      document.documentElement.style.userSelect = "";
    });
    document.addEventListener("mouseleave", () => {
      isMouseMoving = false;
      document.documentElement.style.userSelect = "";
    });
    root.addEventListener(
      "click",
      (event) => {
        if (!startMouseEvent)
          return;
        const deltaPageX = Math.abs(startMouseEvent.pageX - event.pageX);
        const deltaPageY = Math.abs(startMouseEvent.pageY - event.pageY);
        const deltaMove = Math.sqrt(deltaPageX * deltaPageX + deltaPageY * deltaPageY);
        if (deltaMove > 4) {
          event.stopPropagation();
        } else {
          const hexsViewPosition = Vector.from(root.getBoundingClientRect());
          const mouseViewPosition = new Vector(event.clientX, event.clientY);
          const clickPosition = position.add(mouseViewPosition.subtract(hexsViewPosition).divide(scale));
          partners.forEach((partner, index) => {
            const partnerPosition = partnerPositions[index];
            const hexRect = {
              topLeft: partnerPosition,
              bottomRight: partnerPosition.add(hexSize).add(hexMargin)
            };
            if (isRectIntersected(hexRect, clickPosition)) {
              if (isHexIntersected(partnerPosition, clickPosition)) {
                const event2 = new CustomEvent("hex-select", { detail: { data: partner } });
                root.dispatchEvent(event2);
              }
            }
          });
        }
      },
      { capture: true }
    );
    let touchState = "idle";
    let prevTouch;
    let startTouch;
    let prevTouchDiff;
    hexsMain.addEventListener("touchstart", (event) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        prevTouch = event.touches[0];
        startTouch = event.touches[0];
        touchState = "move";
      }
      if (event.touches.length === 2) {
        event.preventDefault();
        const touch1 = new Vector(event.touches[0].pageX, event.touches[0].pageY);
        const touch2 = new Vector(event.touches[1].pageX, event.touches[1].pageY);
        prevTouchDiff = touch1.subtract(touch2).length;
        touchState = "zoom";
      }
    });
    hexsMain.addEventListener("touchmove", (event) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        const touch = event.touches[0];
        if (touchState !== "zoom") {
          const movement = new Vector(touch.pageX - prevTouch.pageX, touch.pageY - prevTouch.pageY).divide(scale).multiply(-1);
          position = position.add(movement);
        }
        prevTouch = touch;
        touchState = "move";
      }
      if (event.touches.length === 2 && prevTouchDiff) {
        event.preventDefault();
        const touch1 = new Vector(event.touches[0].pageX, event.touches[0].pageY);
        const touch2 = new Vector(event.touches[1].pageX, event.touches[1].pageY);
        const touchDiff = touch1.subtract(touch2).length;
        const delta = touchDiff - prevTouchDiff;
        if (Math.abs(delta) > 0.1) {
          const hexsViewPosition = Vector.from(root.getBoundingClientRect());
          const from1to2 = touch2.subtract(touch1);
          const touchViewPosition = touch1.add(from1to2.normalize().multiply(from1to2.length * 0.5));
          const zoomPosition = position.subtract(touchViewPosition.subtract(hexsViewPosition).divide(scale));
          const newScale = scale + scale * Math.abs(delta) * pinchScaleStep * Math.sign(delta);
          zoom(zoomPosition, newScale);
        }
        prevTouchDiff = touchDiff;
        touchState = "zoom";
      }
    });
    window.addEventListener("touchend", (event) => {
      const touches = event.touches.length > 0 ? event.touches : event.changedTouches;
      if (touches.length === 1 && touchState !== "zoom") {
        const touch = touches[0];
        if (!startTouch)
          return;
        const delta = new Vector(startTouch.clientX - touch.clientX, startTouch.clientY - touch.clientY);
        if (delta.length < 4) {
          const hexsViewPosition = Vector.from(root.getBoundingClientRect());
          const touchViewPosition = new Vector(touch.pageX, touch.pageY);
          const touchPosition = position.add(touchViewPosition.subtract(hexsViewPosition).divide(scale));
          partners.forEach((partner, index) => {
            const partnerPosition = partnerPositions[index];
            const hexRect = {
              topLeft: partnerPosition,
              bottomRight: partnerPosition.add(hexSize).add(hexMargin)
            };
            if (isRectIntersected(hexRect, touchPosition)) {
              if (isHexIntersected(partnerPosition, touchPosition)) {
                const event2 = new CustomEvent("hex-select", { detail: { data: partner } });
                root.dispatchEvent(event2);
              }
            }
          });
        }
      }
    });
  } catch (e) {
    console.error(e);
  }
});
