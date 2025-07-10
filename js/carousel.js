document.addEventListener("DOMContentLoaded", () => {
  const slidesContainer = document.getElementById("slides-container");
  const slides = document.querySelectorAll(".min-w-full");
  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");
  const indicators = document.querySelectorAll(".slide-indicator");

  let currentSlide = 0;
  const totalSlides = slides.length;

  // Función para actualizar el carousel
  function updateCarousel() {
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Actualizar indicadores
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("bg-white", index === currentSlide);
      indicator.classList.toggle("bg-white/50", index !== currentSlide);
    });
  }

  // Función para ir al siguiente slide
  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }

  // Función para ir al slide anterior
  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

  // Función para ir a un slide específico
  function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
  }

  // Event listeners para los botones
  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  // Event listeners para los indicadores
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToSlide(index));
  });

  // Auto-play (opcional)
  let autoPlayInterval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos

  // Pausar auto-play cuando el usuario interactúa
  const carouselContainer = document.querySelector(".relative.h-72");
  carouselContainer.addEventListener("mouseenter", () => {
    clearInterval(autoPlayInterval);
  });

  carouselContainer.addEventListener("mouseleave", () => {
    autoPlayInterval = setInterval(nextSlide, 5000);
  });

  // Inicializar el carousel
  updateCarousel();

  // Soporte para navegación con teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  });

  // Soporte para touch/swipe en móviles
  let startX = 0;
  let endX = 0;

  slidesContainer.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  slidesContainer.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });

  function handleSwipe() {
    const threshold = 50; // Mínimo de píxeles para considerar un swipe
    const diff = startX - endX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide(); // Swipe left -> siguiente
      } else {
        prevSlide(); // Swipe right -> anterior
      }
    }
  }
});
