// Contents from Animation JS.txt
import Spheres2Background from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.8/build/backgrounds/spheres2.cdn.min.js';

const webglCanvas = document.getElementById('webgl-canvas');

if (webglCanvas) {
    const bg = Spheres2Background(webglCanvas, {
      count: 200,
      colors: [0xff0000, 0x000000, 0xffffff], // Red, Black, White
      minSize: 0.5,
      maxSize: 1.2, // Slightly increased max size for more variation
      particleSpeed: 0.0005 // Slower particle speed
    });

    const colorsBtn = document.getElementById('colors-btn');

    // Pause/unpause on click anywhere EXCEPT the button
    // Ensure the hero section itself doesn't trigger pause if user clicks on text elements.
    // It's better to have a more specific target for pause/unpause or remove it if it's too broad.
    // For now, let's restrict it to clicks on the #app container but not its children.
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.addEventListener('click', (ev) => {
            if (ev.target === appContainer && ev.target !== colorsBtn) { // Click on #app itself, not children
                if (bg && typeof bg.togglePause === 'function') {
                    bg.togglePause();
                }
            }
        });
    }


    if (colorsBtn) {
        colorsBtn.addEventListener('click', (event) => {
          event.stopPropagation(); // Prevent click from bubbling to appContainer for pause/unpause
          if (bg && bg.spheres && typeof bg.spheres.setColors === 'function') {
            // Generate more vibrant and distinct random colors
            const color1 = Math.random() * 0xffffff;
            const color2 = Math.random() * 0xffffff;
            const color3 = Math.random() * 0xffffff;
            bg.spheres.setColors([color1, color2, color3]);
          }
          if (bg && bg.spheres && bg.spheres.light1 && bg.spheres.light1.color && typeof bg.spheres.light1.color.set === 'function') {
            bg.spheres.light1.color.set(Math.random() * 0xffffff);
          }
        });
    }
} else {
    console.warn("webgl-canvas not found. Spheres2Background animation not initialized.");
}