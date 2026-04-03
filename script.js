/**
 * Level 404 - Main Script (Cinematic Version)
 * Optimized for Mobile Performance.
 */

// 💡 偵測是否為手機端
const isMobile = window.innerWidth <= 768;

// 💡 註冊外掛
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 🌟 基礎變數與環境 🌟
// ==========================================
let headPivot; 
let targetMouse = { x: 0, y: 0 };
let currentMouse = { x: 0, y: 0 };
let isMouseActive = false;
let mouseTimeout;
let idleTime = 0;
const CONSTRAINT_RADIUS = 0.5; 

// 滑鼠移動偵測 (僅在非手機端啟用以省電)
if (!isMobile) {
    window.addEventListener('mousemove', (event) => {
        isMouseActive = true;
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => { isMouseActive = false; }, 1500);

        const nx = (event.clientX / window.innerWidth - 0.5) * 2;
        const ny = -(event.clientY / window.innerHeight - 0.5) * 2;
        const dist = Math.sqrt(nx * nx + ny * ny);
        
        const scale = dist > CONSTRAINT_RADIUS ? CONSTRAINT_RADIUS / dist : 1.0;
        targetMouse.x = nx * scale;
        targetMouse.y = ny * scale;
    });
}

// Lenis 平滑捲動
const lenis = new Lenis();
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Three.js 基礎設定
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000); 
camera.position.set(0, 0, 10); 

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
// 🚀 手機端限制解析度為 1，桌機最高 2
renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 🎨 燈光設定 (手機端簡化燈光計算)
scene.add(new THREE.AmbientLight(0xddeeff, 1.2)); 
const areaLight = new THREE.SpotLight(0xffffff, isMobile ? 2 : 3);
areaLight.position.set(10, 25, 10);
areaLight.decay = 1.5;
areaLight.distance = 150;
scene.add(areaLight);

if (!isMobile) {
    const sideLight = new THREE.DirectionalLight(0xddeeff, 0.8);
    sideLight.position.set(-15, 10, 5);
    scene.add(sideLight);
}

// ==========================================
// 📦 載入管理器
// ==========================================
const loadingProgress = document.getElementById('loading-progress');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    if (loadingProgress) loadingProgress.innerText = progress;
};

loadingManager.onLoad = () => {
    ScrollTrigger.refresh();
    gsap.to(loadingOverlay, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }
    });
};

// ==========================================
// 🎵 背景音樂控制
// ==========================================
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

window.addEventListener('click', () => {
    if (music && music.paused) {
        music.play().catch(err => console.log("Autoplay blocked:", err));
        if (musicToggle) musicToggle.innerText = "🔊";
    }
}, { once: true });

if (musicToggle) {
    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (music.muted) {
            music.muted = false;
            musicToggle.innerText = "🔊";
        } else {
            music.muted = true;
            musicToggle.innerText = "🔇";
        }
    });
}

// ==========================================
// 🌌 打造擬真圓形光暈星空 🌌
// ==========================================
function createRealisticStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; 
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)'); 
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)'); 
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}

const starGroup = new THREE.Group();
scene.add(starGroup);

const starGeometry = new THREE.BufferGeometry();
const starCount = isMobile ? 1500 : 6000; 
const starPosArray = new Float32Array(starCount * 3);
const starColorArray = new Float32Array(starCount * 3);

for(let i = 0; i < starCount; i++) {
    starPosArray[i * 3] = (Math.random() - 0.5) * 1800;
    starPosArray[i * 3 + 1] = (Math.random() - 0.5) * 1800;
    starPosArray[i * 3 + 2] = (Math.random() - 0.5) * 1800;

    const type = Math.random();
    let r, g, b;
    if (type > 0.8) { r = 0.7; g = 0.8; b = 1.0; }
    else if (type > 0.6) { r = 1.0; g = 0.9; b = 0.7; }
    else { r = 1.0; g = 1.0; b = 1.0; }
    starColorArray[i * 3] = r;
    starColorArray[i * 3 + 1] = g;
    starColorArray[i * 3 + 2] = b;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPosArray, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColorArray, 3));

const starMaterial = new THREE.PointsMaterial({
    size: isMobile ? 6 : 4.5, 
    map: createRealisticStarTexture(),
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    blending: isMobile ? THREE.NormalBlending : THREE.AdditiveBlending, 
    depthWrite: false, 
    sizeAttenuation: true
});

const stars = new THREE.Points(starGeometry, starMaterial);
starGroup.add(stars);

// ==========================================
// 🌟 模型容器與設定 🌟
// ==========================================
const signpostGroup = new THREE.Group(); 
scene.add(signpostGroup);

const walkmanGroup = new THREE.Group(); 
walkmanGroup.position.set(0, -40, 0); 
walkmanGroup.visible = false; 
scene.add(walkmanGroup);

const polePivot = new THREE.Group(); 
polePivot.position.set(-0.1, -40, 0); 
polePivot.visible = false; 
scene.add(polePivot);

const bgGroup = new THREE.Group(); 
bgGroup.position.z = -30; 
scene.add(bgGroup);

const carouselGroup = new THREE.Group();
carouselGroup.position.z = -20; 
carouselGroup.visible = false; 
scene.add(carouselGroup);

const slideGroup = new THREE.Group();
slideGroup.position.z = -20; 
slideGroup.visible = false; 
scene.add(slideGroup);

function updateResponsiveLayout() {
    const width = window.innerWidth;
    const isNowMobile = width <= 768;

    camera.fov = isNowMobile ? 85 : 75; 
    camera.position.z = isNowMobile ? 12 : 10; 
    camera.updateProjectionMatrix();

    if (headPivot) {
        headPivot.visible = !isNowMobile;
        if (!isNowMobile) {
            headPivot.position.set(40, 15, 0); 
            headPivot.scale.set(1.5, 1.5, 1.5); 
        }
    }

    if (carouselGroup) carouselGroup.visible = !isNowMobile;
    if (slideGroup) slideGroup.visible = !isNowMobile;

    if (bgGroup) {
        bgGroup.scale.set(isNowMobile ? 0.7 : 1, isNowMobile ? 0.7 : 1, isNowMobile ? 0.7 : 1);
    }
}

// GSAP Animations
const seaTL = gsap.timeline({ scrollTrigger: { trigger: ".concept-section", start: "top bottom", endTrigger: ".story-section", end: "bottom top", scrub: true }});
seaTL.fromTo("#sea-overlay", { y: "100%" }, { y: "0%", ease: "none" }).to("#sea-overlay", { y: "0%", duration: 2 }).to("#sea-overlay", { y: "-100%", ease: "none" }); 

gsap.to(bgGroup.position, { y: 150, ease: "none", scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true }});

const poleTL = gsap.timeline({ scrollTrigger: { trigger: ".concept-section", start: "top bottom", endTrigger: ".story-section", end: "top 25%", scrub: 0.7, onEnter: () => { polePivot.visible = true; }, onLeaveBack: () => { gsap.set(polePivot.position, { y: -40 }); polePivot.visible = false; }}});
poleTL.fromTo(polePivot.position, { y: -40 }, { y: 5, duration: 1.0 }).to(polePivot.position, { y: 5, duration: 3 }).to(polePivot.position, { y: 60, duration: 1.0 });

const walkmanTL = gsap.timeline({ scrollTrigger: { trigger: ".story-section", start: "top 80%", endTrigger: ".merch-section", end: "top top", scrub: 1.5, onEnter: () => { walkmanGroup.visible = true; }, onLeaveBack: () => { walkmanGroup.visible = false; }}});
walkmanTL.fromTo(walkmanGroup.position, { y: -40 }, { y: -5, duration: 1 }).to(walkmanGroup.position, { y: -5, duration: 3 }).to(walkmanGroup.position, { y: 25, duration: 1 });

const loader = new THREE.GLTFLoader(loadingManager);

// 🚀 核心模型 (全端載入)
loader.load('model/level404.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    signpostGroup.add(model);
    const initialScale = 10 / Math.max(size.x, size.y, size.z); 
    signpostGroup.scale.set(initialScale, initialScale, initialScale);
    const signpostTL = gsap.timeline({ scrollTrigger: { trigger: ".concept-section", start: "top bottom", end: "top 20%", scrub: 1 }});
    signpostTL.to(signpostGroup.scale, { x: initialScale * 3, y: initialScale * 3, z: initialScale * 3, ease: "power1.inOut" }).to(signpostGroup.position, { y: 40, ease: "power1.inOut" });
});

loader.load('model/walkmancopy.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.set(-center.x+3.56, -center.y, -center.z);
    model.rotation.z = Math.PI; 
    walkmanGroup.add(model); 
    const initialScale = 10 / Math.max(size.x, size.y, size.z); 
    walkmanGroup.scale.set(initialScale * 3, initialScale * 3, initialScale * 3); 
});

// 🚀 背景模型 (現在手機端也會載入)
loader.load('model/buildingcopy.glb', (m) => {
    const model = m.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    bgGroup.add(model);
    const s = 80 / Math.max(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z);
    model.scale.set(s, s, s);
});

loader.load('model/pole.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x-6.7, -center.y+5, -center.z+50);
    polePivot.add(model);
    const s = 24 / Math.max(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z);
    model.scale.set(s, s, s);
});

// 🚀 僅桌機端載入的模型
if (!isMobile) {
    loader.load('model/headcopy.glb', (gltf) => {
        const m = gltf.scene;
        const b = new THREE.Box3().setFromObject(m);
        const c = b.getCenter(new THREE.Vector3());
        headPivot = new THREE.Group();
        m.rotation.y = -Math.PI/2; 
        m.position.set(-c.x, -c.y, -c.z);
        headPivot.add(m);
        bgGroup.add(headPivot);
        updateResponsiveLayout();
    });

    loader.load('model/carouselcopy.glb', (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -center.y, -center.z);
        carouselGroup.add(model);
        updateResponsiveLayout();
    });

    loader.load('model/slidecopy.glb', (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -center.y, -center.z);
        slideGroup.add(model);
        updateResponsiveLayout();
    });
}

const dropbtn = document.querySelector('.dropbtn');
const dropdownContent = document.querySelector('.dropdown-content');
if (dropbtn) dropbtn.addEventListener('click', (e) => { e.stopPropagation(); dropdownContent.classList.toggle('show'); });
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) lenis.scrollTo(targetElement, { offset: 0, duration: 1.5 });
        }
        if (dropdownContent) dropdownContent.classList.remove('show');
    });
});
window.addEventListener('click', () => { if (dropdownContent && dropdownContent.classList.contains('show')) dropdownContent.classList.remove('show'); });

const storyCards = document.querySelectorAll('.story-card');
const storyContainer = document.querySelector('.story-container');
const prevBtn = document.querySelector('.story-nav.prev');
const nextBtn = document.querySelector('.story-nav.next');
let currentCardIndex = 0;

function updateStoryCards() {
    if(!storyCards.length) return;
    storyCards.forEach((card, index) => {
        card.classList.remove('active', 'prev-card', 'next-card');
        if (index === currentCardIndex) card.classList.add('active');
        else if (index < currentCardIndex) card.classList.add('prev-card');
        else card.classList.add('next-card');
    });
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % storyCards.length;
    updateStoryCards();
}

function prevCard() {
    currentCardIndex = (currentCardIndex - 1 + storyCards.length) % storyCards.length;
    updateStoryCards();
}

if (prevBtn) prevBtn.addEventListener('click', prevCard);
if (nextBtn) nextBtn.addEventListener('click', nextCard);

let touchStartX = 0;
let touchEndX = 0;

if (storyContainer) {
    storyContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    storyContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50; 
    if (touchEndX < touchStartX - swipeThreshold) nextCard();
    if (touchEndX > touchStartX + swipeThreshold) prevCard();
}

updateStoryCards();

function animate() {
    requestAnimationFrame(animate);
    if (starGroup) {
        starGroup.rotation.y += 0.0003;
        starGroup.rotation.z += 0.0001;
        starMaterial.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.2;
    }
    if (headPivot && headPivot.visible) {
        if (isMouseActive) {
            currentMouse.x += (targetMouse.x - currentMouse.x) * 0.08;
            currentMouse.y += (targetMouse.y - currentMouse.y) * 0.08;
            headPivot.rotation.y = currentMouse.x * Math.PI * 0.5;  
            headPivot.rotation.x = -currentMouse.y * Math.PI * 0.2; 
        } else {
            headPivot.rotation.y += 0.005; 
            headPivot.rotation.x += (0 - headPivot.rotation.x) * 0.05; 
        }
        idleTime += 0.01;
        headPivot.rotation.y += Math.sin(idleTime) * 0.003;
        headPivot.rotation.x += Math.cos(idleTime * 0.5) * 0.003;
    }
    
    // 🚀 手機端也會執行的動畫
    if (carouselGroup && carouselGroup.visible) carouselGroup.rotation.y += 0.01; 
    if (slideGroup && slideGroup.visible) slideGroup.rotation.y -= 0.01; 
    
    renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateResponsiveLayout();
});