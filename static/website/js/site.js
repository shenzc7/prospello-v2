const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const navDropdown = document.querySelector("[data-nav-dropdown]");
const navDropdownToggle = document.querySelector("[data-nav-dropdown-toggle]");
const navDropdownPanel = document.querySelector("[data-nav-dropdown-panel]");
const DESKTOP_NAV_BREAKPOINT = 760;
let dropdownCloseTimer = null;

const clearDropdownCloseTimer = () => {
  if (dropdownCloseTimer) {
    window.clearTimeout(dropdownCloseTimer);
    dropdownCloseTimer = null;
  }
};

const closeDropdown = () => {
  if (!navDropdown || !navDropdownToggle || !navDropdownPanel) {
    return;
  }

  navDropdown.classList.remove("is-open");
  navDropdownToggle.setAttribute("aria-expanded", "false");
  navDropdownPanel.setAttribute("aria-hidden", "true");
  clearDropdownCloseTimer();
};

const setDropdownOpen = (isOpen) => {
  if (!navDropdown || !navDropdownToggle || !navDropdownPanel) {
    return;
  }

  navDropdown.classList.toggle("is-open", isOpen);
  navDropdownToggle.setAttribute("aria-expanded", String(isOpen));
  navDropdownPanel.setAttribute("aria-hidden", String(!isOpen));
};

const closeNavMenu = () => {
  if (!navMenu || !navToggle) {
    return;
  }

  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

if (navDropdownPanel) {
  navDropdownPanel.setAttribute("aria-hidden", "true");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) {
      closeDropdown();
    }
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeNavMenu();
      closeDropdown();
    }
  });
}

if (navDropdown && navDropdownToggle) {
  navDropdownToggle.addEventListener("click", () => {
    setDropdownOpen(!navDropdown.classList.contains("is-open"));
  });

  navDropdown.addEventListener("mouseenter", () => {
    if (window.innerWidth > DESKTOP_NAV_BREAKPOINT) {
      clearDropdownCloseTimer();
      setDropdownOpen(true);
    }
  });

  navDropdown.addEventListener("mouseleave", () => {
    if (window.innerWidth > DESKTOP_NAV_BREAKPOINT) {
      clearDropdownCloseTimer();
      dropdownCloseTimer = window.setTimeout(() => {
        closeDropdown();
      }, 140);
    }
  });

  if (navDropdownPanel) {
    navDropdownPanel.addEventListener("mouseenter", clearDropdownCloseTimer);
  }

  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !navDropdown.contains(event.target)) {
      closeDropdown();
    }
  });
}

window.addEventListener("resize", () => {
  if (window.innerWidth > DESKTOP_NAV_BREAKPOINT) {
    closeNavMenu();
  } else {
    closeDropdown();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDropdown();
    closeNavMenu();
  }
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* Systems "View all" toggle: reveal hidden system cards in place */
const systemsToggle = document.querySelector("[data-systems-toggle]");
const systemsGrid = document.querySelector("[data-systems-grid]");
if (systemsToggle && systemsGrid) {
  systemsToggle.addEventListener("click", () => {
    const expanded = systemsGrid.classList.toggle("is-expanded");
    systemsToggle.setAttribute("aria-expanded", String(expanded));
    systemsToggle.textContent = expanded ? "SHOW LESS" : "VIEW ALL SYSTEMS";
    // Animate newly revealed cards
    systemsGrid
      .querySelectorAll(".system-card-hidden")
      .forEach((card) => card.classList.add("is-visible"));
  });
}

/* Careers "View open positions" toggle */
const careersToggle = document.querySelector("[data-careers-toggle]");
const careersOpenings = document.querySelector("[data-careers-openings]");
if (careersToggle && careersOpenings) {
  careersToggle.addEventListener("click", () => {
    const isHidden = careersOpenings.hasAttribute("hidden");
    if (isHidden) {
      careersOpenings.removeAttribute("hidden");
    } else {
      careersOpenings.setAttribute("hidden", "");
    }
    careersToggle.setAttribute("aria-expanded", String(isHidden));
  });
}


/* Operations Dashboard Component Interactive Logic */
/**
 * Operations Dashboard Interactive logic
 */
function initDashboard() {
  initSLAGauge();
  initBarChart();
  initLineChartTooltips();
  simulateLiveMetrics();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

/**
 * Animate the circular SLA gauge on mount
 */
function initSLAGauge() {
  const fillRing = document.querySelector('.ops-gauge-fill');
  const percentText = document.querySelector('.ops-gauge-text');
  
  if (!fillRing) return;

  const targetPercentage = 72; // The original dashboard SLA value
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // Approx 251.3

  // Initialize ring
  fillRing.style.strokeDasharray = `${circumference} ${circumference}`;
  fillRing.style.strokeDashoffset = circumference;

  // Animate offset and text counter after a short delay
  setTimeout(() => {
    const offset = circumference - (targetPercentage / 100) * circumference;
    fillRing.style.strokeDashoffset = offset;

    // Count up text
    let currentVal = 0;
    const duration = 1200; // ms
    const stepTime = Math.abs(Math.floor(duration / targetPercentage));
    
    const timer = setInterval(() => {
      currentVal++;
      if (percentText) {
        percentText.textContent = `${currentVal}%`;
      }
      if (currentVal >= targetPercentage) {
        clearInterval(timer);
      }
    }, stepTime);
  }, 300);
}

/**
 * Animate bar heights and tooltips for the Bar Chart
 */
function initBarChart() {
  const bars = document.querySelectorAll('.ops-bar');
  
  // Heights mapping representing the volumes in the SVG
  const barHeights = [
    { id: 'mon', pct: '32%' },
    { id: 'tue', pct: '50%' },
    { id: 'wed', pct: '64%' }, // Highlighted bar
    { id: 'thu', pct: '40%' },
    { id: 'fri', pct: '56%' },
    { id: 'sat', pct: '26%' }
  ];

  setTimeout(() => {
    bars.forEach((bar, index) => {
      if (barHeights[index]) {
        bar.style.height = barHeights[index].pct;
      }
    });
  }, 400);

  // Add hover information event listener
  const wrappers = document.querySelectorAll('.ops-bar-wrapper');
  wrappers.forEach((wrapper, index) => {
    const bar = wrapper.querySelector('.ops-bar');
    const label = wrapper.getAttribute('data-label') || 'Channel';
    
    wrapper.addEventListener('mouseenter', () => {
      // Dynamic scaling hover effect
      if (bar) bar.style.transform = 'scaleX(1.1)';
    });

    wrapper.addEventListener('mouseleave', () => {
      if (bar) bar.style.transform = 'scaleX(1)';
    });
  });
}

/**
 * Hover tooltips for Line Chart data points
 */
function initLineChartTooltips() {
  const points = document.querySelectorAll('.ops-chart-point');
  const tooltip = document.querySelector('.ops-chart-tooltip');
  const container = document.querySelector('.ops-chart-container');

  if (!points.length || !tooltip || !container) return;

  points.forEach(point => {
    point.addEventListener('mouseenter', (e) => {
      const val = point.getAttribute('data-value');
      const day = point.getAttribute('data-day');
      
      tooltip.innerHTML = `<strong>${day}</strong>: ${val}`;
      tooltip.classList.add('visible');

      positionTooltip(point);
    });

    point.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });

    // Support window resize
    window.addEventListener('resize', () => {
      if (tooltip.classList.contains('visible')) {
        positionTooltip(point);
      }
    });
  });

  function positionTooltip(point) {
    const containerRect = container.getBoundingClientRect();
    const pointRect = point.getBoundingClientRect();

    // Calculate center coordinates of the point relative to the container
    const x = pointRect.left - containerRect.left + (pointRect.width / 2);
    const y = pointRect.top - containerRect.top;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }
}

/**
 * Simulate live telemetry with subtle updates to uptime, active workflows and throughput
 */
function simulateLiveMetrics() {
  const uptimeVal = document.querySelector('[data-metric="uptime"]');
  const workflowsVal = document.querySelector('[data-metric="workflows"]');
  const throughputVal = document.querySelector('[data-metric="throughput"]');

  // Pulse update color indicator utility
  function highlightElement(el) {
    if (!el) return;
    el.style.transition = 'color 0.2s ease';
    el.style.color = '#FFFFFF';
    setTimeout(() => {
      el.style.color = '';
    }, 1000);
  }

  // Random workflow fluctuations
  setInterval(() => {
    if (!workflowsVal) return;
    let current = parseFloat(workflowsVal.textContent.replace('k', ''));
    // Small random delta between -0.02 and +0.02
    let delta = (Math.random() * 0.04 - 0.02);
    let updated = (current + delta).toFixed(2);
    workflowsVal.textContent = `${updated}k`;
    highlightElement(workflowsVal);
  }, 7000);

  // Uptime occasional fluctuations
  setInterval(() => {
    if (!uptimeVal) return;
    // 90% chance to remain 99.9%, 10% chance to fluctuate between 99.91% and 99.89%
    if (Math.random() > 0.9) {
      const uptimeVals = ['99.9%', '99.91%', '99.89%', '99.92%'];
      const chosen = uptimeVals[Math.floor(Math.random() * uptimeVals.length)];
      uptimeVal.textContent = chosen;
      highlightElement(uptimeVal);
    }
  }, 15000);

  // Throughput updates
  setInterval(() => {
    if (!throughputVal) return;
    let currentPct = parseInt(throughputVal.textContent.replace('%', '').replace('+', ''));
    let delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
    let updatedPct = currentPct + delta;
    throughputVal.textContent = `${updatedPct >= 0 ? '+' : ''}${updatedPct}%`;
    highlightElement(throughputVal);
  }, 10000);
}
