const html = document.documentElement;
const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");

const frameCount = 240;
const currentFrame = index => (
  `new_frames/frame_${(index + 1).toString().padStart(4, '0')}.jpg`
);

const images = [];
let targetFrame = 0;
let currentFrameIndex = 0;
let isFirstRenderDone = false;

// Preload all frames
const preloadImages = () => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
      if (i === 0 && !isFirstRenderDone) {
        isFirstRenderDone = true;
        renderImage(images[0]);
      }
    };
    images.push(img);
  }
};

// Resize canvas only when window size changes
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const activeImage = images[Math.round(currentFrameIndex)] || images[0];
  if (activeImage && activeImage.complete) {
    renderImage(activeImage);
  }
}

// Ultra-smooth draw routine (no canvas resizing inside render loop)
function renderImage(img) {
  if (!img || !img.complete || img.width === 0) return;
  
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  
  // Cover scale
  const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const x = (canvasWidth - drawWidth) / 2;
  const y = (canvasHeight - drawHeight) / 2;

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(img, x, y, drawWidth, drawHeight);
}

// Calculate target frame on scroll
function onScroll() {
  const scrollTop = html.scrollTop || document.body.scrollTop;
  const maxScrollTop = html.scrollHeight - window.innerHeight;
  
  if (maxScrollTop <= 0) return;
  
  const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
  targetFrame = scrollFraction * (frameCount - 1);
}

// Continuous requestAnimationFrame loop with Smooth Lerp (Linear Interpolation)
function animationLoop() {
  currentFrameIndex += (targetFrame - currentFrameIndex) * 0.18;
  
  const frameToDraw = Math.max(0, Math.min(frameCount - 1, Math.round(currentFrameIndex)));
  const img = images[frameToDraw];
  
  if (img && img.complete) {
    renderImage(img);
  }
  
  requestAnimationFrame(animationLoop);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('scroll', onScroll, { passive: true });

// Initial setup
resizeCanvas();
preloadImages();
requestAnimationFrame(animationLoop);

/* ===================================================
   Custom Developer Cursor: </> with Click Blinking
   =================================================== */
const customCursor = document.getElementById("custom-cursor");
const cursorBadge = document.getElementById("cursor-badge");
const cursorFollower = document.getElementById("custom-cursor-follower");

if (customCursor && cursorFollower && window.matchMedia("(pointer: fine)").matches) {
  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let followerX = -100;
  let followerY = -100;
  let isVisible = false;

  // Track Mouse Move
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursorX = mouseX;
      cursorY = mouseY;
      followerX = mouseX;
      followerY = mouseY;
      customCursor.style.opacity = "1";
      cursorFollower.style.opacity = "1";
    }
  });

  // Hide on mouseleave, show on mouseenter
  document.addEventListener("mouseleave", () => {
    isVisible = false;
    customCursor.style.opacity = "0";
    cursorFollower.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    isVisible = true;
    customCursor.style.opacity = "1";
    cursorFollower.style.opacity = "1";
  });

  // Handle Click / Mousedown: Blink Animation & Click Ripple
  window.addEventListener("mousedown", (e) => {
    // Trigger blink animation on </> badge
    if (cursorBadge) {
      cursorBadge.classList.remove("blinking");
      // Force reflow
      void cursorBadge.offsetWidth;
      cursorBadge.classList.add("blinking");
    }

    // Spawn animated ripple ring
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 550);
  });

  // Smooth Cursor & Follower Animation Loop with GPU transforms & silky interpolation
  function updateCursorLoop() {
    if (isVisible) {
      // Silky-smooth lerp tracking for main </> cursor (zero jitter)
      cursorX += (mouseX - cursorX) * 0.32;
      cursorY += (mouseY - cursorY) * 0.32;
      customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

      // Graceful trailing follower ring
      followerX += (mouseX - followerX) * 0.14;
      followerY += (mouseY - followerY) * 0.14;
      cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(updateCursorLoop);
  }
  requestAnimationFrame(updateCursorLoop);

  // Interactive Hover Effects on Links, Buttons, Cards, Inputs
  const interactiveSelectors = 'a, button, input, textarea, select, [role="button"], .project-card, .creative-card, .creative-badge, .creative-icon-box, .stats-card, .testimonial-card, .badge, .tag, .section-badge-pill';
  
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      customCursor.classList.add("hovering");
      cursorFollower.classList.add("hovering");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      customCursor.classList.remove("hovering");
      cursorFollower.classList.remove("hovering");
    }
  });
}

/* ===================================================
   GSAP & ScrollTrigger Animations: AdCreative Toolkit
   =================================================== */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Animate AdCreative Section Header
    gsap.from(".creative-header-panel", {
      scrollTrigger: {
        trigger: "#creative-toolkit",
        start: "top 82%",
        toggleActions: "play none none none"
      },
      y: 40,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out"
    });

    // Animate 3 Creative Cards with Staggered Entrance
    gsap.from(".creative-card", {
      scrollTrigger: {
        trigger: ".creative-toolkit-section .grid",
        start: "top 85%",
        toggleActions: "play none none none"
      },
      y: 50,
      opacity: 0,
      duration: 0.9,
      stagger: 0.18,
      ease: "power3.out",
      clearProps: "transform,opacity"
    });

    // Subtle 3D Card Tilt Interaction on Desktop
    if (window.matchMedia("(pointer: fine)").matches) {
      const creativeCards = document.querySelectorAll(".creative-card");
      creativeCards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const rotateX = -(y / (rect.height / 2)) * 5;
          const rotateY = (x / (rect.width / 2)) * 5;

          gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
            ease: "power1.out",
            duration: 0.3
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            ease: "power2.out",
            duration: 0.5
          });
        });
      });
    }
  }
});

