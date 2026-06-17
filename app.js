/*
  TaskUp Solutions - Global Application Logic
  Provides interactive components, micro-animations, and Wishup calculators
*/

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounters();
  initTabs();
  initStepper();
  initTestimonialSlider();
  initFaqAccordions();
  initModals();
  initWizard();
  initCalendlyMock();
  calculateSavings(); // Initial calculator run
});

/* ==========================================================================
   Header & Mobile Navigation
   ========================================================================== */
function initNavbar() {
  const header = document.getElementById('mainHeader');
  const navToggle = document.getElementById('navToggle');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  navToggle.addEventListener('click', () => {
    navbar.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  // Close nav on link click (only for non-dropdown-triggers)
  navbar.querySelectorAll('a:not(.dropdown-trigger)').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('active');
      navToggle.classList.remove('active');
      // Close any active mobile dropdowns
      navbar.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active-mobile'));
    });
  });

  // Toggle dropdowns on mobile
  const dropdowns = navbar.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();
          
          const isActive = dropdown.classList.contains('active-mobile');
          
          // Close other dropdowns
          dropdowns.forEach(d => {
            if (d !== dropdown) {
              d.classList.remove('active-mobile');
            }
          });
          
          dropdown.classList.toggle('active-mobile');
        }
      });
    }
  });
}

/* ==========================================================================
   Dynamic Stat Counter Count-up
   ========================================================================== */
function initCounters() {
  const trustNumbers = document.querySelectorAll('.trust-number');
  const duration = 2000; // ms

  const animateCounters = () => {
    trustNumbers.forEach(num => {
      const target = parseInt(num.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * target);
        num.innerText = currentVal + (target >= 5000 ? '+' : (target === 100 ? '+' : '+'));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          num.innerText = target + (target >= 5000 ? '+' : (target === 100 ? '+' : '+'));
        }
      };
      window.requestAnimationFrame(step);
    });

    // Mock dashboard number counter count-up
    const hoursNum = document.getElementById('mockStatHours');
    if (hoursNum) {
      let startHoursTimestamp = null;
      const hoursStep = (timestamp) => {
        if (!startHoursTimestamp) startHoursTimestamp = timestamp;
        const progress = Math.min((timestamp - startHoursTimestamp) / 1500, 1);
        hoursNum.innerText = Math.floor(progress * 1250);
        if (progress < 1) {
          window.requestAnimationFrame(hoursStep);
        } else {
          hoursNum.innerText = "1,250+";
        }
      };
      window.requestAnimationFrame(hoursStep);
    }
  };

  // Intersection Observer to run counters only when they enter viewport
  const observerOptions = {
    root: null,
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const trustSection = document.querySelector('.trust-banner');
  if (trustSection) {
    observer.observe(trustSection);
  }
}

/* ==========================================================================
   Services Tab Switcher
   ========================================================================== */
window.switchTab = function(tabIndex) {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab, index) => {
    if (index === tabIndex) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  contents.forEach((content, index) => {
    if (index === tabIndex) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
};

function initTabs() {
  // Tab triggers configured inline in html
}

/* ==========================================================================
   Dynamic Cost & Savings Calculator
   ========================================================================== */
window.calculateSavings = function() {
  const resourceType = document.getElementById('calcResource').value;
  const hours = parseInt(document.getElementById('calcHours').value, 10);
  
  // Rate Cards (hourly rates)
  const rates = {
    va: { outsource: 15, inhouse: 40 },
    bookkeeper: { outsource: 20, inhouse: 48 },
    developer: { outsource: 30, inhouse: 65 },
    marketer: { outsource: 22, inhouse: 50 }
  };
  
  const selectedRates = rates[resourceType] || rates['va'];
  const weeksPerMonth = 4.33;
  
  // Calculations
  const outsourceMonthly = Math.round(selectedRates.outsource * hours * weeksPerMonth);
  // Inhouse: rate * hours * weeks + 30% benefit burden + $500 office space overhead
  const inhouseBase = selectedRates.inhouse * hours * weeksPerMonth;
  const inhouseMonthly = Math.round((inhouseBase * 1.3) + 500);
  const monthlySavings = inhouseMonthly - outsourceMonthly;
  const savingsPercent = Math.round((monthlySavings / inhouseMonthly) * 100);

  // Update UI Elements
  document.getElementById('hoursLabel').innerText = `${hours} Hours / Week`;
  document.getElementById('valInhouse').innerText = `$${inhouseMonthly.toLocaleString()} / mo`;
  document.getElementById('valOutsource').innerText = `$${outsourceMonthly.toLocaleString()} / mo`;
  document.getElementById('valSavings').innerText = `$${monthlySavings.toLocaleString()} / mo`;
  
  const fill = document.getElementById('savingsProgressFill');
  if (fill) {
    fill.style.width = `${savingsPercent}%`;
  }
};

/* ==========================================================================
   Onboarding Stepper
   ========================================================================== */
let activeStep = 0;

window.switchStep = function(stepIndex) {
  const steps = document.querySelectorAll('.step-node');
  const panels = document.querySelectorAll('.step-panel');
  const progressLine = document.getElementById('stepProgress');

  activeStep = stepIndex;

  // Update line progress width
  const percent = (stepIndex / (steps.length - 1)) * 100;
  if (progressLine) {
    progressLine.style.width = `${percent}%`;
  }

  // Update nodes active states
  steps.forEach((step, idx) => {
    if (idx === stepIndex) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else if (idx < stepIndex) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else {
      step.classList.remove('active', 'completed');
    }
  });

  // Update active details panel
  panels.forEach((panel, idx) => {
    if (idx === stepIndex) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
};

function initStepper() {
  switchStep(0);
}

/* ==========================================================================
   Testimonials Slider
   ========================================================================== */
let currentSlide = 0;
let autoPlayInterval;

function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.slider-dot');
  if (!track) return;

  window.goSlide = function(slideIndex) {
    currentSlide = slideIndex;
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
    
    dots.forEach((dot, idx) => {
      if (idx === slideIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    resetAutoplay();
  };

  window.nextSlide = function() {
    const totalSlides = dots.length;
    let nextIndex = currentSlide + 1;
    if (nextIndex >= totalSlides) nextIndex = 0;
    goSlide(nextIndex);
  };

  window.prevSlide = function() {
    const totalSlides = dots.length;
    let prevIndex = currentSlide - 1;
    if (prevIndex < 0) prevIndex = totalSlides - 1;
    goSlide(prevIndex);
  };

  function startAutoplay() {
    autoPlayInterval = setInterval(nextSlide, 6000);
  }

  function resetAutoplay() {
    clearInterval(autoPlayInterval);
    startAutoplay();
  }

  startAutoplay();
}

/* ==========================================================================
   FAQ Accordions
   ========================================================================== */
window.toggleFaq = function(button) {
  const item = button.parentElement;
  const content = item.querySelector('.faq-content');
  const isActive = item.classList.contains('active');

  // Close other open FAQ items
  document.querySelectorAll('.faq-item').forEach(otherItem => {
    if (otherItem !== item) {
      otherItem.classList.remove('active');
      otherItem.querySelector('.faq-content').style.maxHeight = null;
    }
  });

  if (isActive) {
    item.classList.remove('active');
    content.style.maxHeight = null;
  } else {
    item.classList.add('active');
    content.style.maxHeight = content.scrollHeight + 'px';
  }
};

function initFaqAccordions() {
  // Handled via html onclick
}

/* ==========================================================================
   Modal Managers
   ========================================================================== */
window.toggleModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const isActive = modal.classList.contains('active');

  // Close all other modals
  document.querySelectorAll('.modal-overlay').forEach(otherModal => {
    otherModal.classList.remove('active');
  });

  if (!isActive) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        toggleModal(overlay.id);
      }
    });
  });
}

/* ==========================================================================
   Multi-step Quote Wizard Form
   ========================================================================== */
let wizardStep = 0;
const totalWizardSteps = 3;

window.toggleCheckboxStyle = function(label) {
  const checkbox = label.querySelector('input');
  setTimeout(() => {
    if (checkbox.checked) {
      label.classList.add('checked');
    } else {
      label.classList.remove('checked');
    }
  }, 10);
};

window.navigateWizard = function(direction) {
  if (direction === 1 && !validateCurrentStep()) {
    return;
  }

  const steps = document.querySelectorAll('.wizard-step');
  const prevBtn = document.getElementById('prevStepBtn');
  const nextBtn = document.getElementById('nextStepBtn');
  const progressLine = document.getElementById('wizardProgressLine');

  steps[wizardStep].classList.remove('active');
  wizardStep += direction;

  steps[wizardStep].classList.add('active');

  // Progress Bar
  const percent = ((wizardStep + 1) / totalWizardSteps) * 100;
  if (progressLine) {
    progressLine.style.width = `${percent}%`;
  }

  // Prev Button visibility
  if (wizardStep === 0) {
    prevBtn.style.visibility = 'hidden';
  } else {
    prevBtn.style.visibility = 'visible';
  }

  // Next/Submit Button copy
  if (wizardStep === totalWizardSteps - 1) {
    nextBtn.innerText = 'Submit Quote Request';
    nextBtn.onclick = null;
    nextBtn.type = 'submit';
  } else {
    nextBtn.innerText = 'Next Step';
    nextBtn.onclick = () => navigateWizard(1);
    nextBtn.type = 'button';
  }
};

function validateCurrentStep() {
  if (wizardStep === 0) {
    const name = document.getElementById('clientName').value.trim();
    const company = document.getElementById('companyName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    
    if (!name || !company || !email || !phone) {
      alert('Please fill out all required profile details.');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      return false;
    }
  } else if (wizardStep === 1) {
    const checked = document.querySelectorAll('input[name="services"]:checked');
    if (checked.length === 0) {
      alert('Please select at least one service vertical.');
      return false;
    }
  }
  return true;
}

window.handleWizardSubmit = async function(event) {
  event.preventDefault();
  
  const requestPayload = {
    name: document.getElementById('clientName').value,
    company: document.getElementById('companyName').value,
    email: document.getElementById('clientEmail').value,
    phone: document.getElementById('clientPhone').value,
    services: Array.from(document.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value),
    teamSize: document.getElementById('teamSize').value,
    timeline: document.getElementById('timeline').value,
    notes: document.getElementById('extraNotes').value
  };
  
  // Optimistically store in localStorage
  localStorage.setItem('taskup_quote_request', JSON.stringify(requestPayload));

  const steps = document.querySelectorAll('.wizard-step');
  const footer = document.getElementById('wizardFooter');
  const successPanel = document.getElementById('wizard-success-panel');
  const progressLine = document.getElementById('wizardProgressLine');

  try {
    const response = await fetch('/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });
    const resData = await response.json();
    if (!resData.success) {
      console.error('API submission failed:', resData.error);
    }
  } catch (error) {
    console.error('Network error submitting quote to backend:', error);
  }

  steps.forEach(step => step.classList.remove('active'));
  footer.style.display = 'none';
  successPanel.style.display = 'block';
  if (progressLine) {
    progressLine.style.width = '100%';
  }
};

function initWizard() {
  // Setup callbacks
}

/* ==========================================================================
   Calendly Simulation Scheduler Mockup
   ========================================================================== */
let selectedDate = "June 16, 2026";
let selectedTimeVal = null;

function initCalendlyMock() {
  const days = document.querySelectorAll('.calendar-day-btn.active-day');
  days.forEach(day => {
    day.addEventListener('click', () => {
      days.forEach(d => d.classList.remove('selected-day'));
      day.classList.add('selected-day');
      selectedDate = `June ${day.innerText}, 2026`;
      
      // Reset time slots
      selectedTimeVal = null;
      document.querySelectorAll('.scheduler-time-btn').forEach(btn => btn.style.backgroundColor = '');
      const confirmContainer = document.getElementById('confirmBtnContainer');
      if (confirmContainer) confirmContainer.innerHTML = '';
    });
  });
}

window.selectTime = function(btn, time) {
  selectedTimeVal = time;
  document.querySelectorAll('.scheduler-time-btn').forEach(b => {
    b.style.backgroundColor = '';
    b.style.color = 'var(--accent-base)';
  });
  btn.style.backgroundColor = 'var(--accent-base)';
  btn.style.color = 'white';

  const stored = JSON.parse(localStorage.getItem('taskup_quote_request') || '{}');
  const defaultName = stored.name || '';
  const defaultEmail = stored.email || '';

  const confirmContainer = document.getElementById('confirmBtnContainer');
  if (confirmContainer) {
    confirmContainer.innerHTML = `
      <div class="scheduler-confirm-container" style="animation: fadeIn 0.3s ease; display: flex; flex-direction: column; gap: 10px; margin-top: 15px; background: rgba(0, 168, 150, 0.03); padding: 15px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); text-align: left;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-base); margin-bottom: 4px;">Enter Booking Information:</div>
        <input type="text" id="schedulerName" placeholder="Your Name *" class="form-control" style="padding: 8px 12px; font-size: 0.85rem; background: white;" value="${defaultName}" required>
        <input type="email" id="schedulerEmail" placeholder="Work Email *" class="form-control" style="padding: 8px 12px; font-size: 0.85rem; background: white;" value="${defaultEmail}" required>
        <button class="scheduler-confirm-btn" style="margin-top: 5px; width: 100%;" onclick="confirmBooking()">Confirm 7-Day Trial Appointment</button>
      </div>
    `;
  }
};

window.confirmBooking = async function() {
  const nameInput = document.getElementById('schedulerName');
  const emailInput = document.getElementById('schedulerEmail');
  
  if (!nameInput || !emailInput) return;
  
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  
  if (!name || !email) {
    alert('Please provide your name and email to confirm the appointment.');
    return;
  }
  
  const stored = JSON.parse(localStorage.getItem('taskup_quote_request') || '{}');
  const company = stored.company || 'Not Specified';

  const bookingPayload = {
    name,
    company,
    email,
    date: selectedDate,
    time: selectedTimeVal
  };

  const schedulerBody = document.querySelector('.mock-calendly-grid');

  try {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingPayload)
    });
    const resData = await response.json();
    if (!resData.success) {
      console.error('API scheduling failed:', resData.error);
    }
  } catch (error) {
    console.error('Network error booking appointment with backend:', error);
  }

  if (schedulerBody) {
    schedulerBody.innerHTML = `
      <div style="grid-column: span 2; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; text-align: center;">
        <div class="success-icon-box">
          <svg viewBox="0 0 24 24" style="width: 36px; height: 36px; fill: #10B981;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
        <h3 style="font-size: 1.6rem; margin-bottom: 12px; color: var(--primary-base);">Trial Appointment Confirmed!</h3>
        <p style="color: var(--text-secondary); max-width: 450px; margin-bottom: 24px;">Your 7-Day trial call is booked for <strong>${selectedDate}</strong> at <strong>${selectedTimeVal}</strong> (EST). A calendar invite and Google Meet link have been dispatched to your email address.</p>
        <button class="btn btn-primary" onclick="toggleModal('calendlyModal'); window.location.reload();">Return to Website</button>
      </div>
    `;
  }
};
