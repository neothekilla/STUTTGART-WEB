document.addEventListener("DOMContentLoaded", () => {
    // ===== Gestion du lecteur audio =====
    const items = document.querySelectorAll(".music-item");

    items.forEach(item => {
        item.addEventListener("click", (e) => {
            const player = item.querySelector(".player");
            const isOpen = player.style.display === "block";

            // Fermer tous les autres lecteurs
            document.querySelectorAll(".player").forEach(p => p.style.display = "none");

            // Ouvrir ou fermer le lecteur sélectionné
            if (isOpen) {
                player.style.display = "none";
            } else {
                player.style.display = "block";
            }

            e.stopPropagation();
        });
    });

    // Fermer les lecteurs si on clique en dehors
    document.addEventListener("click", () => {
        document.querySelectorAll(".player").forEach(p => p.style.display = "none");
    });

    // ===== Slider de covers infini et fluide (effet miroir) =====
    const track = document.querySelector(".slide-track");
    const slides = Array.from(track.children);

    // Cloner la série originale
    slides.forEach(slide => track.appendChild(slide.cloneNode(true)));
    // Cloner une deuxième fois et inverser l'ordre pour effet miroir
    slides.slice().reverse().forEach(slide => track.appendChild(slide.cloneNode(true)));

    let speed = 0.5; // pixels par frame
    let position = 0;

    // Calculer la largeur de la moitié de la track (original + clone)
    const trackWidth = track.scrollWidth / 3;

    function animateSlider() {
        position += speed;
        if (position >= trackWidth) {
            position = 0; // reset à la moitié de la track
        }
        track.style.transform = `translateX(${-position}px)`;
        requestAnimationFrame(animateSlider);
    }

    animateSlider();
});