import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uSpread;
  varying vec2 vUv;

  float hash(vec2 p) {
    vec2 p2 = vec2(dot(p, vec3(37.1, 61.7, 12.4).xy));
    return fract(sin(dot(p2, vec2(37.1, 61.7))) * 3758.5453123);
  }

  float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p * 1.0) * 0.5;
    v += noise(p * 2.0) * 0.25;
    v += noise(p * 4.0) * 0.125;
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

    float dissolveEdge = uv.y - uProgress * 1.2;
    float noiseValue = fbm(centeredUv * 15.0);
    float d = dissolveEdge + noiseValue * uSpread;

    float pixelSize = 1.0 / uResolution.y;
    float alpha = 1.0 - smoothstep(pixelSize, pixelSize, d);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}

const CONFIG = {
    color: "#f4f1ea", // Matches the earth-sand color below
    spread: 0.5,
    speed: 2,
};

export const CareGuideHero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const [isWebGLReady, setIsWebGLReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;

        const hero = containerRef.current;
        const canvas = canvasRef.current;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
        });

        function resize() {
            if (!hero) return;
            const width = hero.offsetWidth;
            const height = hero.offsetHeight;
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        resize();
        window.addEventListener("resize", resize);

        const rgb = hexToRgb(CONFIG.color) || { r: 0.957, g: 0.945, b: 0.918 };
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uProgress: { value: 0 },
                uResolution: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
                uColor: { value: new THREE.Color(rgb.r, rgb.g, rgb.b) },
                uSpread: { value: CONFIG.spread },
            },
            transparent: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let scrollProgress = 0;
        let animationFrameId: number;

        function animate() {
            material.uniforms.uProgress.value = scrollProgress;
            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        }

        // Wait for the background image to actually load before showing the canvas and starting the animation sequence
        const bgImage = document.querySelector('.custom-hero-img img') as HTMLImageElement;

        let sceneStarted = false;
        const startScene = () => {
             if (sceneStarted) return;
             sceneStarted = true;
             // Only after the image is fully downloaded and parsed by the browser, we start the WebGL loop and show everything
             animate();
             requestAnimationFrame(() => {
                 setIsWebGLReady(true);
             });
        };

        if (bgImage && bgImage.complete) {
            startScene();
        } else if (bgImage) {
            bgImage.addEventListener('load', startScene);
            bgImage.addEventListener('error', startScene);
        } else {
            // Fallback if image tag not found for some reason
            startScene();
        }

        // Failsafe timeout so we never get stuck on a blank screen if network is flaky
        const fallbackTimeout = setTimeout(startScene, 800);

        const handleScroll = () => {
            const heroHeight = hero.offsetHeight;
            const windowHeight = window.innerHeight;
            // The scroll amount relative to the container
            const rect = hero.getBoundingClientRect();
            // How much of the hero has scrolled past the top of the viewport
            const scrolled = Math.max(0, -rect.top);
            const maxScroll = heroHeight - windowHeight;

            // Delay the dissolve until the yellow text hits the very top (approx 45% of viewport height)
            const delayScroll = windowHeight * 0.45;

            if (scrolled <= delayScroll) {
                scrollProgress = 0;
            } else if (maxScroll > delayScroll) {
                const activeScroll = scrolled - delayScroll;
                const scrollRange = maxScroll - delayScroll;
                // Multiply by 1.2 to ensure the effect fully reveals the image before hitting the end
                scrollProgress = Math.min((activeScroll / scrollRange) * 1.2, 1.2);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        const handleResize = () => {
            if (material.uniforms.uResolution) {
                material.uniforms.uResolution.value.set(hero.offsetWidth, hero.offsetHeight);
            }
        };
        window.addEventListener("resize", handleResize);

        // Text Animation Logic (Replacing premium SplitText with our simulated one)
        if (textRef.current) {
            const words = Array.from(textRef.current.querySelectorAll('.split-word'));
            gsap.set(words, { opacity: 0 });

            ScrollTrigger.create({
                trigger: ".custom-hero-content",
                start: "top 75%", // Changed from 25% so it triggers earlier on screen
                end: "bottom 85%", // Changed from 100% to finish sooner
                onUpdate: (self) => {
                    const progress = self.progress;
                    words.forEach((word, index) => {
                        const nextWordProgress = (index + 1) / words.length;
                        const wordProgress = index / words.length;

                        let opacity = 0.15;
                        if (progress >= nextWordProgress) {
                            opacity = 1;
                        } else if (progress > wordProgress) {
                            opacity = 0.15 + 0.85 * ((progress - wordProgress) / (nextWordProgress - wordProgress));
                        }

                        gsap.to(word, {
                            opacity: opacity,
                            duration: 0.1,
                            overwrite: true,
                        });
                    });
                },
            });
        }

        return () => {
            clearTimeout(fallbackTimeout);
            window.removeEventListener("resize", resize);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleScroll);
            cancelAnimationFrame(animationFrameId);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            ScrollTrigger.getAll().forEach(t => {
                if (t.vars.trigger === ".custom-hero-content") t.kill();
            });
        };
    }, []);

    const rawText = "Nature does not hurry, yet everything is accomplished. This guide decodes the silent language of your botanical companions, ensuring their enduring vitality within your sanctuary.";
    const simulatedSplitText = rawText.split(' ').map((word, i) => (
        <span key={i} className="split-word inline-block mr-[0.3em] font-normal">{word}</span>
    ));

    return (
        <div className="codegrid-container w-full relative">
            <style dangerouslySetInnerHTML={{__html: `
                @import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap");

                .codegrid-container {
                    --base-100: #f4f1ea;
                    --base-200: #fec84d;
                    --base-300: #0f0f0f;
                }

                .custom-hero {
                    position: relative;
                    width: 100%;
                    height: 250vh;
                    color: var(--base-200);
                    overflow: hidden;
                    background-color: var(--base-100);
                }

                .custom-hero-img {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }

                .custom-hero-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .custom-hero-header {
                    position: absolute;
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 0.5rem;
                    text-align: center;
                    z-index: 10;
                }

                .custom-hero-header h1 {
                    text-transform: uppercase;
                    font-family: "Instrument Serif", sans-serif;
                    font-weight: 500;
                    line-height: 0.9;
                    font-size: clamp(4rem, 7.5vw, 10rem);
                    margin: 0;
                }

                .custom-hero-header p {
                    font-family: "Instrument Sans", sans-serif;
                    font-size: 1.125rem;
                    font-weight: 400;
                    width: 75%;
                    margin: 0;
                }

                .custom-hero-canvas {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 5;
                }

                .custom-hero-content {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    z-index: 10;
                    pointer-events: none;
                }

                .custom-hero-content h2 {
                    text-transform: uppercase;
                    font-family: "Instrument Serif", serif;
                    font-weight: 500;
                    line-height: 0.9;
                    font-size: clamp(2.5rem, 4.5vw, 5rem);
                    width: 75%;
                    max-width: 1200px;
                    color: var(--base-300);
                    margin: 0;
                }

                @media (max-width: 1000px) {
                    .custom-hero-content h2 {
                        width: calc(100% - 4rem);
                    }
                }
            `}} />

            <section ref={containerRef} className="custom-hero" style={{ opacity: isWebGLReady ? 1 : 0, transition: 'opacity 0.6s ease-out' }}>
                <div className="custom-hero-img" style={{ backgroundColor: '#2a3b2c' }}>
                    <img
                        src="https://images.pexels.com/photos/31829947/pexels-photo-31829947.jpeg?auto=compress&cs=tinysrgb&w=2000"
                        alt="Leaves background"
                    />
                </div>

                <div className="custom-hero-header">
                    <h1>Survival Guide</h1>
                    <p>Master the art of botanical longevity.</p>
                </div>

                <canvas ref={canvasRef} className="custom-hero-canvas"></canvas>

                <div className="custom-hero-content">
                    <h2 ref={textRef} className="z-10 pointer-events-none text-[#0f0f0f]">
                        {simulatedSplitText}
                    </h2>
                </div>
            </section>
        </div>
    );
};
