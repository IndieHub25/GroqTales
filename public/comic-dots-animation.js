// Interactive Comic Dots Animation - Gen-Z Style!
(function () {
    'use strict';

    // Create canvas for background animation
    const canvas = document.createElement('canvas');
    canvas.id = 'comic-dots-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        document.body.insertBefore(canvas, document.body.firstChild);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Dots configuration
        const dots = [];
        const dotCount = 100; // Reduced count for cleaner look
        const colors = ['#FF0000', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']; // Vibrant Gen-Z colors

        // Create dots
        class Dot {
            constructor() {
                this.reset();
                this.y = Math.random() * height;
                this.baseColor = colors[Math.floor(Math.random() * colors.length)];
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.2; // Slower movement
                this.vy = (Math.random() - 0.5) * 0.2; // Slower movement
                this.radius = Math.random() * 2 + 1; // Slightly smaller dots
            }

            update() {
                // Apply velocity
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) {
                    this.vx *= -1;
                    this.x = Math.max(0, Math.min(width, this.x));
                }
                if (this.y < 0 || this.y > height) {
                    this.vy *= -1;
                    this.y = Math.max(0, Math.min(height, this.y));
                }
            }

            draw() {
                // Draw dot with comic style
                ctx.fillStyle = this.baseColor;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // Initialize dots
        for (let i = 0; i < dotCount; i++) {
            dots.push(new Dot());
        }

        // Handle resize
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Animation loop
        function animate() {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Update and draw all dots
            dots.forEach(dot => {
                dot.update();
                dot.draw();
            });

            requestAnimationFrame(animate);
        }

        // Start animation
        animate();
    }
})();
