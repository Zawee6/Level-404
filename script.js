/**
 * Level 404 - Main Script
 * Optimized & Refactored
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
const CONSTRAINT_RADIUS = 0.5; // 🎯 圓形轉頭增益範圍 (0~1)

// 滑鼠移動偵測
window.addEventListener('mousemove', (event) => {
    isMouseActive = true;
    clearTimeout(mouseTimeout);
    
    // 滑鼠停住 1.5 秒後開始自動旋轉
    mouseTimeout = setTimeout(() => { isMouseActive = false; }, 1500);

    const nx = (event.clientX / window.innerWidth - 0.5) * 2;
    const ny = -(event.clientY / window.innerHeight - 0.5) * 2;
    const dist = Math.sqrt(nx * nx + ny * ny);
    
    // 🎯 圓形限制邏輯：超出範圍後鎖定在邊界
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

// 選單平滑捲動導航
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            lenis.scrollTo(targetElement, {
                offset: 0,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
});

// Three.js 基礎設定
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.5)); 
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

// ==========================================
// 📦 載入管理器 (Loading Manager)
// ==========================================
const loadingProgress = document.getElementById('loading-progress');
const loadingOverlay = document.getElementById('loading-overlay');

const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    loadingProgress.innerText = progress;
};

loadingManager.onLoad = () => {
    console.log('所有資源載入完成');
    gsap.to(loadingOverlay, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
            loadingOverlay.style.display = 'none';
        }
    });
};

loadingManager.onError = (url) => {
    console.error('載入錯誤:', url);
};

// ==========================================
// 🎵 背景音樂控制 🎵
// ==========================================
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

window.addEventListener('click', () => {
    if (music.paused) {
        music.play().catch(err => console.log("Autoplay blocked:", err));
    }
}, { once: true });

musicToggle.addEventListener('click', () => {
    if (music.paused) {
        music.play();
        musicToggle.innerText = "🔊 PLAY";
    } else {
        music.pause();
        musicToggle.innerText = "🔇 MUTE";
    }
});

// ==========================================
// 🌟 核心容器宣告 🌟
// ==========================================
const signpostGroup = new THREE.Group(); 
scene.add(signpostGroup);

const walkmanGroup = new THREE.Group(); 
walkmanGroup.position.set(0, -6, -0.1); 
walkmanGroup.visible = false; 
scene.add(walkmanGroup);

const polePivot = new THREE.Group(); 
polePivot.position.set(0, 15, 0.1); 
polePivot.visible = false; 
scene.add(polePivot);

const bgGroup = new THREE.Group(); 
bgGroup.position.z = -30; 
scene.add(bgGroup);

const carouselGroup = new THREE.Group();
carouselGroup.visible = false; 
scene.add(carouselGroup);

const slideGroup = new THREE.Group();
slideGroup.visible = false; 
scene.add(slideGroup);

// 建立竿子
const poleLength = 20; 
const cylinderGeo = new THREE.CylinderGeometry(0.7, 0.7, poleLength, 16); 
const cylinderMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5, metalness: 0.1 });
const poleMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
poleMesh.scale.y = 1; 
polePivot.add(poleMesh);
polePivot.position.set(-0.1, 0, 0);

// ==========================================
// 🎬 動畫控制 (GSAP + ScrollTrigger)
// ==========================================

// 1. 背景離開
gsap.to(bgGroup.position, {
    y: 150, 
    scrollTrigger: { trigger: ".concept-section", start: "top bottom", end: "top top", scrub: 1 }
});

// 2. 竿子顯示
ScrollTrigger.create({
    trigger: ".concept-section",
    start: "top 68%", 
    onEnter: () => { polePivot.visible = true; },
    onLeaveBack: () => { polePivot.visible = false; }
});

// 3. Walkman 顯示 (綁定圖片)
ScrollTrigger.create({
    trigger: ".concept-image", 
    start: "top 50%",
    onEnter: () => { walkmanGroup.visible = true; },
    onLeaveBack: () => { walkmanGroup.visible = false; }
});

// 4. 組合往上飛走 (前往周邊商品頁)
gsap.to([walkmanGroup.position, polePivot.position], {
    y: "+=40", 
    scrollTrigger: { trigger: ".merch-section", start: "top bottom", end: "top top", scrub: 1 }
});

// 5. 木馬與溜滑梯滑入
ScrollTrigger.create({
    trigger: ".concept-image",
    start: "top 80%",
    onEnter: () => { 
        carouselGroup.visible = true; 
        slideGroup.visible = true; 
        gsap.to(carouselGroup.position, { x: -10, duration: 1.2, ease: "power2.out" }); 
        gsap.to(slideGroup.position, { x: 10, duration: 1.2, ease: "power2.out" }); 
    },
    onLeaveBack: () => { 
        gsap.to(carouselGroup.position, { x: -30, duration: 1.2, ease: "power2.in" });
        gsap.to(slideGroup.position, { 
            x: 30, 
            duration: 1, 
            ease: "power2.in",
            onComplete: () => { 
                carouselGroup.visible = false; 
                slideGroup.visible = false; 
            }
        }); 
    }
});

// ==========================================
// 🚀 載入模型 🚀
// ==========================================
const loader = new THREE.GLTFLoader(loadingManager);

// 1. 路牌
loader.load('level404_sign.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    signpostGroup.add(model);
    
    const initialScale = 10 / Math.max(size.x, size.y, size.z); 
    signpostGroup.scale.set(initialScale, initialScale, initialScale);
    
    gsap.to(signpostGroup.scale, {
        x: initialScale * 3, y: initialScale * 3, z: initialScale * 3,
        scrollTrigger: { trigger: ".concept-section", start: "top bottom", end: "top 70%", scrub: 1 }
    });

    gsap.to(signpostGroup.position, {
        y: 40, 
        scrollTrigger: { trigger: ".concept-section", start: "top 70%", end: "top 50%", scrub: 1 }
    });
}, undefined, (error) => console.error('Error loading signpost:', error));

// 2. Walkman
loader.load('walkmancopy.glb', (gltf) => {
    const walkmanModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(walkmanModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    walkmanModel.position.set(-center.x + 1.784, -center.y - 1.6, -center.z + 8.55);
    walkmanModel.rotation.z = Math.PI; 
    
    walkmanGroup.add(walkmanModel); 
    const targetScale = 24 / Math.max(size.x, size.y, size.z); 
    walkmanGroup.scale.set(targetScale, targetScale, targetScale); 
});

// 3. 建築
loader.load('buildingcopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    bgGroup.add(m);
    const s = 80 / Math.max(b.getSize(new THREE.Vector3()).x, b.getSize(new THREE.Vector3()).y, b.getSize(new THREE.Vector3()).z);
    bgGroup.scale.set(s, s, s);
});

// 4. 地板
loader.load('grasscopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z - 10); // Offset adjusted
    m.position.y -= 10; m.position.z += 15;
    m.scale.set(40, 45, 25); 
    bgGroup.add(m);
});

// 5. 頭部
loader.load('headcopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    headPivot = new THREE.Group();
    m.rotation.y = -Math.PI/2; 
    m.position.set(-c.x, -c.y, -c.z);
    headPivot.add(m);
    headPivot.position.set(40, 15, 0); 
    const s = 10 / Math.max(b.getSize(new THREE.Vector3()).x, b.getSize(new THREE.Vector3()).y, b.getSize(new THREE.Vector3()).z);
    headPivot.scale.set(s, s, s); 
    bgGroup.add(headPivot);
});

// 6. 旋轉木馬
loader.load('carouselcopy.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    carouselGroup.add(model);
    const s = 8 / Math.max(size.x, size.y, size.z);
    carouselGroup.scale.set(s, s, s);
    carouselGroup.position.set(-30, 0, 0); 
});

// 7. 溜滑梯
loader.load('slidecopy.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    slideGroup.add(model);
    const s = 6 / Math.max(size.x, size.y, size.z);
    slideGroup.scale.set(s, s, s);
    slideGroup.position.set(30, 0, 0); 
});

// ==========================================
// 🔄 渲染迴圈 🔄
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    
    if (headPivot) {
        if (isMouseActive) {
            // 🖱️ 滑鼠活動中：平滑追蹤 (受 CONSTRAINT_RADIUS 限制)
            currentMouse.x += (targetMouse.x - currentMouse.x) * 0.08;
            currentMouse.y += (targetMouse.y - currentMouse.y) * 0.08;

            headPivot.rotation.y = currentMouse.x * Math.PI * 0.5;  
            headPivot.rotation.x = -currentMouse.y * Math.PI * 0.2; 
        } else {
            // 🔄 滑鼠停住：開始慢速自轉
            headPivot.rotation.y += 0.005; 
            headPivot.rotation.x += (0 - headPivot.rotation.x) * 0.05; // X 軸緩緩回正

            // 🎯 同步 currentMouse 防止滑鼠恢復移動時瞬間跳回
            currentMouse.x = headPivot.rotation.y / (Math.PI * 0.5);
            currentMouse.y = 0;
        }

        // 疊加微小呼吸感
        idleTime += 0.01;
        headPivot.rotation.y += Math.sin(idleTime) * 0.003;
        headPivot.rotation.x += Math.cos(idleTime * 0.5) * 0.003;
    }

    // 物件自轉
    if (carouselGroup && carouselGroup.visible) {
        carouselGroup.rotation.y += 0.01; 
    }
    if (slideGroup && slideGroup.visible) {
        slideGroup.rotation.y -= 0.01; 
    }

    renderer.render(scene, camera);
}
animate();

// 響應式視窗
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});