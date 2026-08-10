// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const frameCount = 240;
const canvas = document.getElementById("scroll-canvas");
const context = canvas.getContext("2d");

// Image paths builder
const currentFramePath = (index) => {
  return `ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
};

// Store preloaded images
const images = [];
const sequence = { frame: 0 };
let loadedImagesCount = 0;

// Preload all frames
function preloadImages() {
  return new Promise((resolve) => {
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.onload = () => {
        loadedImagesCount++;
        if (loadedImagesCount === frameCount) {
          resolve();
        }
      };
      img.onerror = () => {
        loadedImagesCount++;
        if (loadedImagesCount === frameCount) {
          resolve();
        }
      };
      img.src = currentFramePath(i);
      images[img ? i - 1 : i - 1] = img; // store at index (i-1)
    }
  });
}

// Draw image on canvas (Cover algorithm)
function drawFrame(frameIndex) {
  const img = images[frameIndex];
  if (!img) return;

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  
  // Real dimensions of image
  const imgWidth = img.naturalWidth || img.width || 1920;
  const imgHeight = img.naturalHeight || img.height || 1080;
  
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, x, y;
  
  if (canvasRatio > imgRatio) {
    // Canvas is wider than image
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    x = 0;
    y = (canvasHeight - drawHeight) / 2;
  } else {
    // Canvas is taller than image
    drawWidth = canvasHeight * imgRatio;
    drawHeight = canvasHeight;
    x = (canvasWidth - drawWidth) / 2;
    y = 0;
  }
  
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(img, x, y, drawWidth, drawHeight);
}

// Handle canvas resizing for High-DPI/Retina displays
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  context.scale(dpr, dpr);
  
  // Redraw the current active frame on resize
  drawFrame(sequence.frame);
}

// Initialize GSAP Animation
function initGSAP() {
  // Timeline for image sequence scrubbing
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".animation-section",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5, // smooth scrubbing
    }
  });

  // Scrub the frame index property
  tl.to(sequence, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    onUpdate: () => {
      drawFrame(sequence.frame);
    }
  });

  // Fade out Mogu Mogu headline overlay on scroll (fully faded by 30% scroll progress)
  gsap.to(".scroll-hero-text", {
    opacity: 0,
    y: -40,
    scrollTrigger: {
      trigger: ".animation-section",
      start: "top top",
      end: "top+=30% top",
      scrub: true,
    }
  });
}

// Setup Header Navigation Listeners
function setupHeader() {
  const nav = document.getElementById("main-nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      nav.classList.remove("bg-white/20", "dark:bg-gray-950/20", "border-white/10");
      nav.classList.add("bg-white/80", "dark:bg-gray-900/80", "shadow-sm", "border-gray-200/50", "dark:border-gray-800/50");
    } else {
      nav.classList.add("bg-white/20", "dark:bg-gray-950/20", "border-white/10");
      nav.classList.remove("bg-white/80", "dark:bg-gray-900/80", "shadow-sm", "border-gray-200/50", "dark:border-gray-800/50");
    }
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
    
    // Close menu on link click
    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }
}

// Start everything
async function init() {
  // Bind resize handler
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Load first frame immediately for instant presentation
  const firstImg = new Image();
  firstImg.onload = () => {
    images[0] = firstImg;
    drawFrame(0);
  };
  firstImg.src = currentFramePath(1);

  // Preload all frames silently in the background
  await preloadImages();
  
  // Draw frame again once fully cached
  drawFrame(0);
  
  // Run animations
  initGSAP();

  // Bind navigation listeners
  setupHeader();
}

// Initialize application on window load
window.addEventListener("DOMContentLoaded", init);
