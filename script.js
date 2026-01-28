// Futuristic scroll reveal effect
window.addEventListener("scroll", () => {
  document.querySelectorAll(".card").forEach(card => {
    let position = card.getBoundingClientRect().top;
    if (position < window.innerHeight - 100) {
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    } else {
      card.style.opacity = 0.5;
      card.style.transform = "translateY(50px)";
    }
  });
});
