/**
 * Level 404 - Main Script (Cinematic Version)
 * Realistic Round Stars with Glow, Full Object Timelines, and Music Control.
 */

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

// 滑鼠移動偵測
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

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 🎨 燈光設定
scene.add(new THREE.AmbientLight(0xddeeff, 1.2)); 
const areaLight = new THREE.SpotLight(0xffffff, 3);
areaLight.position.set(10, 25, 10);
areaLight.angle = Math.PI / 4;
areaLight.penumbra = 1; 
areaLight.decay = 1.5;
areaLight.distance = 150;
scene.add(areaLight);

const sideLight = new THREE.DirectionalLight(0xddeeff, 0.8);
sideLight.position.set(-15, 10, 5);
scene.add(sideLight);

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
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // 繪製多層漸層模擬光暈
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');     // 核心：純白
    gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.9)'); 
    gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.4)'); // 第一層光暈
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');  // 第二層外散
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');      // 邊緣消失
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

const starGroup = new THREE.Group();
scene.add(starGroup);

const starGeometry = new THREE.BufferGeometry();
const starCount = 6000; // 減少數量以換取更高質感的單點
const starPosArray = new Float32Array(starCount * 3);
const starColorArray = new Float32Array(starCount * 3);

for(let i = 0; i < starCount; i++) {
    // 廣域隨機分佈
    starPosArray[i * 3] = (Math.random() - 0.5) * 1800;
    starPosArray[i * 3 + 1] = (Math.random() - 0.5) * 1800;
    starPosArray[i * 3 + 2] = (Math.random() - 0.5) * 1800;

    // 擬真色偏：藍白、白、暖黃
    const type = Math.random();
    let r, g, b;
    if (type > 0.8) { // 偏藍星 (熱)
        r = 0.7; g = 0.8; b = 1.0;
    } else if (type > 0.6) { // 偏黃星 (老)
        r = 1.0; g = 0.9; b = 0.7;
    } else { // 主序白星
        r = 1.0; g = 1.0; b = 1.0;
    }
    starColorArray[i * 3] = r;
    starColorArray[i * 3 + 1] = g;
    starColorArray[i * 3 + 2] = b;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPosArray, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColorArray, 3));

const starMaterial = new THREE.PointsMaterial({
    size: 4.5, // 🚀 較大的發光感
    map: createRealisticStarTexture(),
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
    blending: THREE.AdditiveBlending, // 🚀 加法混合讓發光更像真實光源
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

const ballGroup = new THREE.Group();
scene.add(ballGroup);

function updateResponsiveLayout() {
    const width = window.innerWidth;
    const isMobile = width <= 768;

    camera.fov = isMobile ? 85 : 75; 
    camera.position.z = isMobile ? 12 : 10; 
    camera.updateProjectionMatrix();

    if (headPivot) {
        headPivot.visible = !isMobile;
        if (!isMobile) {
            headPivot.position.set(40, 15, 0); 
            headPivot.scale.set(1.5, 1.5, 1.5); 
        }
    }

    if (carouselGroup) {
        carouselGroup.visible = isMobile ? false : carouselGroup.visible;
        if (!isMobile) {
            carouselGroup.scale.set(2.5, 2.5, 2.5);
            carouselGroup.position.y = 0; 
        }
    }

    if (slideGroup) {
        slideGroup.visible = isMobile ? false : slideGroup.visible;
        if (!isMobile) {
            slideGroup.scale.set(6.0, 6.0, 6.0);
            slideGroup.position.y = 0; 
        }
    }

    if (bgGroup) {
        bgGroup.scale.set(isMobile ? 0.7 : 1, isMobile ? 0.7 : 1, isMobile ? 0.7 : 1);
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

ScrollTrigger.create({
    trigger: ".concept-section", 
    start: "top 50%",            
    onEnter: () => { 
        if (window.innerWidth > 768) {
            carouselGroup.visible = true; slideGroup.visible = true; 
            gsap.to(carouselGroup.position, { x: -30, duration: 0.6, ease: "power3.out" }); 
            gsap.to(slideGroup.position, { x: 30, duration: 0.6, ease: "power3.out" }); 
        }
    },
    onLeaveBack: () => { 
        gsap.to(carouselGroup.position, { x: -70, duration: 0.6, ease: "power2.in" }); 
        gsap.to(slideGroup.position, { x: 70, duration: 0.6, ease: "power2.in", onComplete: () => { slideGroup.visible = false; carouselGroup.visible = false; }});
    }
});

const loader = new THREE.GLTFLoader(loadingManager);
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
if (prevBtn) prevBtn.addEventListener('click', () => { currentCardIndex = (currentCardIndex - 1 + storyCards.length) % storyCards.length; updateStoryCards(); });
if (nextBtn) nextBtn.addEventListener('click', () => { currentCardIndex = (currentCardIndex + 1) % storyCards.length; updateStoryCards(); });
updateStoryCards();

function animate() {
    requestAnimationFrame(animate);
    if (starGroup) {
        starGroup.rotation.y += 0.0003;
        starGroup.rotation.z += 0.0001;
        // 🚀 微弱閃爍效果
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