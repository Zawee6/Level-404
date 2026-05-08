/**
 * Level 404 - Main Script (Cinematic Version)
 * Optimized for Mobile Performance and Stability.
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

// 自定義鼠標變數
const customCursor = document.getElementById('custom-cursor');
let cursorX = 0, cursorY = 0;
let targetX = 0, targetY = 0;
let isMouseDown = false;

// ==========================================
// 🚀 鼠標事件監聽 (精確偵測實體滑鼠) 🚀
// ==========================================
window.addEventListener('pointermove', (event) => {
    // 💡 只有當指標類型為滑鼠時才啟動自定義鼠標
    if (event.pointerType === 'mouse') {
        isMouseActive = true;
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => { isMouseActive = false; }, 1500);
        
        const nx = (event.clientX / window.innerWidth - 0.5) * 2;
        const ny = -(event.clientY / window.innerHeight - 0.5) * 2;
        const dist = Math.sqrt(nx * nx + ny * ny);
        const scale = dist > CONSTRAINT_RADIUS ? CONSTRAINT_RADIUS / dist : 1.0;
        targetMouse.x = nx * scale;
        targetMouse.y = ny * scale;

        // 🚀 第一次偵測到滑鼠時，顯示棒棒糖並隱藏原生鼠標
        if (customCursor) {
            if (customCursor.style.display !== 'block') {
                customCursor.style.display = 'block';
                document.documentElement.classList.add('has-mouse');
            }
            customCursor.style.left = `${event.clientX}px`;
            customCursor.style.top = `${event.clientY}px`;
        }
    }
});

// 🚀 當滑鼠離開視窗時隱藏棒棒糖
window.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse' && customCursor) {
        customCursor.style.display = 'none';
        document.documentElement.classList.remove('has-mouse');
    }
});

// 🚀 當滑鼠重新進入視窗時顯示棒棒糖
window.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse' && customCursor) {
        customCursor.style.display = 'block';
        document.documentElement.classList.add('has-mouse');
    }
});

window.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && customCursor) {
        customCursor.classList.add('active');
    }
});

window.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'mouse' && customCursor) {
        customCursor.classList.remove('active');
    }
});

// 防止預設拖曳行為干擾
window.addEventListener('dragstart', (e) => e.preventDefault());

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

const renderer = new THREE.WebGLRenderer({ 
    antialias: !isMobile, 
    alpha: true, 
    powerPreference: "high-performance",
    precision: isMobile ? "mediump" : "highp" 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 🎨 燈光設定
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
const loadingStatus = document.getElementById('loading-status');
const enterContainer = document.getElementById('enter-container');
const enterBtn = document.getElementById('enter-btn');
const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    if (loadingProgress) loadingProgress.innerText = progress;
};

loadingManager.onLoad = () => {
    ScrollTrigger.refresh();
    // 隱藏載入進度，顯示進入容器
    if (loadingStatus) loadingStatus.style.display = 'none';
    if (enterContainer) {
        enterContainer.style.display = 'block';
        gsap.from(enterContainer, { opacity: 0, y: 20, duration: 1.5, ease: "power2.out" });
    }
};

// ==========================================
// 🎵 背景音樂控制
// ==========================================
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        // 播放音樂
        if (music) {
            music.play().catch(err => console.log("Music play blocked:", err));
            if (musicToggle) musicToggle.innerText = "🔊";
        }

        // 顯示導覽列
        const topNav = document.querySelector('.top-nav');
        if (topNav) {
            gsap.to(topNav, { opacity: 1, duration: 1, delay: 0.5, onComplete: () => { topNav.style.pointerEvents = 'auto'; } });
        }

        // 隱藏 Loading 畫面
        gsap.to(loadingOverlay, {
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                if (loadingOverlay) loadingOverlay.style.display = 'none';
            }
        });
    });
}

if (musicToggle) {
    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (music.muted) {
            music.muted = false;
            musicToggle.innerText = "🔊";
            // 🚀 如果音樂目前是暫停的（例如剛從影片翻回來），切換靜音時順便播放
            if (music.paused) {
                music.play().catch(err => console.log("Music play blocked:", err));
            }
        } else {
            music.muted = true;
            musicToggle.innerText = "🔇";
        }
    });
}

// ==========================================
// 🌌 星空系統
// ==========================================
function createRealisticStarTexture() {
    if (isMobile) return null;
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
const starCount = isMobile ? 1000 : 6000; 
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
    size: isMobile ? 2 : 4.5, 
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
    if (carouselGroup) {
        carouselGroup.visible = isNowMobile ? false : carouselGroup.visible;
        if (!isNowMobile) { carouselGroup.scale.set(2.5, 2.5, 2.5); carouselGroup.position.y = 0; }
    }
    if (slideGroup) {
        slideGroup.visible = isNowMobile ? false : slideGroup.visible;
        if (!isNowMobile) { slideGroup.scale.set(6.0, 6.0, 6.0); slideGroup.position.y = 0; }
    }
    if (bgGroup) {
        bgGroup.scale.set(isNowMobile ? 0.7 : 1, isNowMobile ? 0.7 : 1, isNowMobile ? 0.7 : 1);
    }
}

// ==========================================
// 🚀 核心動畫邏輯 🚀
// ==========================================

// 🚀 1. 背景建築上升動畫 (Fix: 確保它一定會動)
gsap.to(bgGroup.position, {
    y: 150,
    ease: "none",
    scrollTrigger: {
        trigger: "#top",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// 🚀 2. 電線桿動畫
const poleTL = gsap.timeline({ 
    scrollTrigger: { 
        trigger: ".concept-section", 
        start: "top bottom", 
        endTrigger: ".story-section", 
        end: "top 25%", 
        scrub: 0.7, 
        onEnter: () => { polePivot.visible = true; }, 
        onLeaveBack: () => { gsap.set(polePivot.position, { y: -40 }); polePivot.visible = false; }
    }
});
poleTL.fromTo(polePivot.position, { y: -40 }, { y: 5, duration: 1.0 })
      .to(polePivot.position, { y: 5, duration: 3 })
      .to(polePivot.position, { y: 60, duration: 1.0 });

// 🚀 3. Walkman 動畫
const walkmanTL = gsap.timeline({ 
    scrollTrigger: { 
        trigger: ".story-section", 
        start: "top 80%", 
        endTrigger: ".merch-section", 
        end: "top top", 
        scrub: 1.5, 
        onEnter: () => { walkmanGroup.visible = true; }, 
        onLeaveBack: () => { walkmanGroup.visible = false; }
    }
});
walkmanTL.fromTo(walkmanGroup.position, { y: -40 }, { y: -5, duration: 1 })
         .to(walkmanGroup.position, { y: -5, duration: 3 })
         .to(walkmanGroup.position, { y: 25, duration: 1 });

// 🚀 4. 木馬與滑梯動畫 (僅桌機)
if (!isMobile) {
    ScrollTrigger.create({
        trigger: ".concept-section", 
        start: "top 50%",            
        onEnter: () => { 
            carouselGroup.visible = true; slideGroup.visible = true; 
            gsap.to(carouselGroup.position, { x: -30, duration: 0.6, ease: "power3.out" }); 
            gsap.to(slideGroup.position, { x: 30, duration: 0.6, ease: "power3.out" }); 
        },
        onLeaveBack: () => { 
            gsap.to(carouselGroup.position, { x: -70, duration: 0.6, ease: "power2.in" }); 
            gsap.to(slideGroup.position, { x: 70, duration: 0.6, ease: "power2.in", onComplete: () => { slideGroup.visible = false; carouselGroup.visible = false; }});
        }
    });
}

// 🚀 5. Sea Overlay 動畫
// 進入：從 Album 開始上升，同時控制顯示與淡入
gsap.fromTo("#sea-overlay", 
    { y: "100%", opacity: 0 }, 
    { 
        y: "0%", 
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top bottom",
            end: "top top",
            scrub: true,
            onEnter: () => gsap.set("#sea-overlay", { display: 'block' }), // 進入區域才顯示
            onLeaveBack: () => gsap.set("#sea-overlay", { display: 'none' }) // 回到 Top 則隱藏
        }
    }
);

// 離開：直到 Songs 區塊滑到接近螢幕頂端 (20%)，才開始從 0% 往上移動至 -100%，同時淡出
gsap.fromTo("#sea-overlay", 
    { y: "0%", opacity: 0.3 }, 
    { 
        y: "-100%", 
        opacity: 0,
        ease: "none",
        scrollTrigger: {
            trigger: ".story-section",
            start: "top 0%",
            end: "bottom top",
            scrub: true
        }
    }
);




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

// 🚀 6. Ball1 掉落動畫
if (!isMobile) {
    const ballGroup = new THREE.Group();
    scene.add(ballGroup);
    let canSpawnBalls = false; // 控制是否生成新球

    loader.load('model/ball1.glb', (gltf) => {
        const originalBall = gltf.scene;
        
        for (let i = 0; i < 12; i++) {
            const ball = originalBall.clone();
            const s = 0.8;
            ball.scale.set(s, s, s);
            
            // 初始位置設定在下方並隱藏
            ball.position.y = -50;
            ballGroup.add(ball);

            // GSAP 掉落動畫
            const fallAnim = gsap.to(ball.position, {
                y: -30, 
                duration: Math.random() * 3 + 3,
                repeat: -1,
                ease: "none",
                paused: true,
                onRepeat: () => {
                    if (canSpawnBalls) {
                        resetBall(ball);
                    } else {
                        // 如果不允許生成，就讓這顆球在掉完後停在下方並暫停動畫
                        fallAnim.pause();
                    }
                }
            });

            const rotAnim = gsap.to(ball.rotation, {
                x: Math.PI * 2,
                z: Math.PI * 2,
                duration: Math.random() * 3 + 2,
                repeat: -1,
                ease: "none",
                paused: true
            });

            // 控制區域：從 Album 完全進入開始 (top top) 到 Story 底部離開
            ScrollTrigger.create({
                trigger: ".concept-section",
                start: "top top", 
                endTrigger: ".story-section",
                end: "bottom top",
                onEnter: () => { 
                    canSpawnBalls = true; 
                    if (ball.position.y < -25) { resetBall(ball); fallAnim.play(0); } 
                    else { fallAnim.play(); } 
                    rotAnim.play(); 
                },
                onLeave: () => { canSpawnBalls = false; }, 
                onEnterBack: () => { 
                    canSpawnBalls = true; 
                    fallAnim.play(); 
                    rotAnim.play(); 
                },
                onLeaveBack: () => { canSpawnBalls = false; } 
            });
        }
    });

    function resetBall(ball) {
        ball.position.set(
            (Math.random() - 0.5) * 40, 
            30 + Math.random() * 20, 
            (Math.random() - 0.5) * 20
        );
    }
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

function nextCard() { currentCardIndex = (currentCardIndex + 1) % storyCards.length; updateStoryCards(); }
function prevCard() { currentCardIndex = (currentCardIndex - 1 + storyCards.length) % storyCards.length; updateStoryCards(); }
if (prevBtn) prevBtn.addEventListener('click', prevCard);
if (nextBtn) nextBtn.addEventListener('click', nextCard);

let touchStartX = 0;
if (storyContainer) {
    storyContainer.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    storyContainer.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) { if (diff > 0) nextCard(); else prevCard(); }
    }, { passive: true });
}

updateStoryCards();

const albumCard = document.querySelector('.album-flip-card');
const albumIframe = albumCard ? albumCard.querySelector('iframe') : null;

if (albumCard && music) {
    const transitionOverlay = document.getElementById('transition-overlay');

    albumCard.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const isFlippingToBack = !albumCard.classList.contains('flipped');
        albumCard.classList.toggle('flipped');
        
        if (albumCard.classList.contains('flipped')) {
            music.pause();
            // 不需要切換按鈕文字，因為這只是臨時暫停以觀看影片
            
            // 🚀 啟動電影感過渡動畫
            gsap.set(transitionOverlay, { width: 0, height: 0, opacity: 1 });
            gsap.to(transitionOverlay, {
                width: "100vw",
                height: "100vh",
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    if (albumIframe) {
                        let currentSrc = albumIframe.src;
                        if (!currentSrc.includes('autoplay=1')) {
                            const separator = currentSrc.includes('?') ? '&' : '?';
                            albumIframe.src = currentSrc + separator + 'autoplay=1';
                        }
                        
                        // 觸發全螢幕
                        if (albumIframe.requestFullscreen) albumIframe.requestFullscreen();
                        else if (albumIframe.webkitRequestFullscreen) albumIframe.webkitRequestFullscreen();
                    }
                    // 動畫結束後淡出過渡層
                    gsap.to(transitionOverlay, { opacity: 0, duration: 0.5, delay: 0.5 });
                }
            });
        } else {
            // 翻回正面
            if (albumIframe) {
                let currentSrc = albumIframe.src;
                currentSrc = currentSrc.replace(/[&?]autoplay=1/, '');
                albumIframe.src = ''; 
                albumIframe.src = currentSrc; 
            }
            // 🚀 只有在背景音樂沒被靜音的情況下才恢復播放
            if (music && !music.muted) {
                music.play().catch(err => console.log("Music play blocked:", err));
            }
        }
    });
}

// 🚀 全域點擊監聽：處理「點擊外部」邏輯
window.addEventListener('click', (e) => {
    // 1. 處理專輯卡片：如果已翻面且點擊卡片以外區域，則翻回正面
    if (albumCard && albumCard.classList.contains('flipped') && !albumCard.contains(e.target)) {
        albumCard.classList.remove('flipped');
        
        // 🚀 點擊外部翻回時也要停止影片
        if (albumIframe) {
            let currentSrc = albumIframe.src;
            currentSrc = currentSrc.replace(/[&?]autoplay=1/, '');
            albumIframe.src = '';
            albumIframe.src = currentSrc;
        }

        if (music && !music.muted) {
            music.play().catch(err => console.log("Music play blocked:", err));
        }
    }

    // 2. 處理導航選單：點擊外部時關閉
    if (dropdownContent && dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
    }
});

// 🚀 偵測使用者點擊影片時暫停音樂 (處理所有 YouTube iframe)
window.addEventListener('blur', () => {
    if (document.activeElement.tagName === 'IFRAME') {
        if (music && !music.paused) {
            music.pause();
            if (musicToggle) musicToggle.innerText = "🔇";
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    
    if (starGroup) {
        starGroup.rotation.y += 0.0003;
        starGroup.rotation.z += 0.0001;
        if (!isMobile) starMaterial.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.2;
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

// ==========================================
// 💰 募資進度設定 (手動更新) 💰
// ==========================================
// 🚀 當募資進度有變動時，只需修改下方數值：
const FUNDING_CONFIG = {
    currentPercent: 0,        // 目前完成度百分比 (例如: 45)
    currentAmount: "0",       // 目前贊助人次 (例如: "45")
    goalAmount: "100"         // 目標 (選填)
};

function initFundingAnimation() {
    const progressBar = document.getElementById('funding-progress-bar');
    const percentText = document.getElementById('funding-percent');
    const currentText = document.getElementById('funding-current');

    if (progressBar && percentText && currentText) {
        // 設定初始值 (贊助人次)
        currentText.innerText = FUNDING_CONFIG.currentAmount;

        ScrollTrigger.create({
            trigger: ".funding-section",
            start: "top 80%",
            onEnter: () => {
                // 1. 進度條動畫
                progressBar.style.width = Math.min(FUNDING_CONFIG.currentPercent, 100) + "%";

                // 2. 百分比數字跳動動畫
                let displayPercent = 0;
                const duration = 2000; // 2秒跑完
                
                if (FUNDING_CONFIG.currentPercent > 0) {
                    const stepTime = duration / FUNDING_CONFIG.currentPercent;
                    const interval = setInterval(() => {
                        if (displayPercent >= FUNDING_CONFIG.currentPercent) {
                            clearInterval(interval);
                        } else {
                            displayPercent++;
                            percentText.innerText = displayPercent + "%";
                        }
                    }, stepTime > 20 ? stepTime : 20);
                } else {
                    percentText.innerText = "0%";
                }
            }
        });
    }
}

// 在 DOM 加載後執行
document.addEventListener('DOMContentLoaded', () => {
    initFundingAnimation();
});