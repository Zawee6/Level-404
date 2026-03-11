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
// 🎵 背景音樂與播放器同步邏輯 🎵
// ==========================================
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const playerAudio = document.getElementById('player-audio');
const playlistItems = document.querySelectorAll('#playlist li');
const playerPlayBtn = document.getElementById('player-play-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');
const currentTrackNameDisplay = document.getElementById('current-track-name');

// 迷你播放器元素
const miniPlayBtn = document.getElementById('mini-play-btn');
const miniTrackName = document.getElementById('mini-track-name');
const miniProgressBar = document.getElementById('mini-progress-bar');

let isGlobalMuted = true; // 預設靜音狀態
let bgMusicFadeTimeout;

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// 平滑淡入背景音樂
function fadeInBG() {
    clearTimeout(bgMusicFadeTimeout);
    if (isGlobalMuted) return;
    
    music.play();
    gsap.to(music, { volume: 1, duration: 2 });
}

// 平滑淡出背景音樂
function fadeOutBG() {
    clearTimeout(bgMusicFadeTimeout);
    gsap.to(music, { 
        volume: 0, 
        duration: 1
    });
}

// 監聽全局點擊以啟動音訊
window.addEventListener('click', () => {
    if (isGlobalMuted) return;
    if (music.paused) {
        music.play().catch(err => console.log("Autoplay blocked:", err));
    }
}, { once: true });

// 全局靜音控制
musicToggle.addEventListener('click', () => {
    isGlobalMuted = !isGlobalMuted;
    
    if (isGlobalMuted) {
        music.pause();
        playerAudio.pause();
        playerPlayBtn.innerText = "▶ PLAY";
        miniPlayBtn.innerText = "▶";
        musicToggle.innerText = "🔇";
        music.volume = 0;
        playerAudio.volume = 0;
    } else {
        musicToggle.innerText = "🔊";
        playerAudio.volume = 1;
        
        // 如果播放器沒在動，就恢復背景音樂
        if (playerAudio.paused) {
            fadeInBG();
        }
    }
});

// 播放控制邏輯 (主副同步)
function togglePlayback() {
    if (isGlobalMuted) {
        isGlobalMuted = false;
        musicToggle.innerText = "🔊";
        playerAudio.volume = 1;
    }

    if (!playerAudio.src || playerAudio.src === "" || playerAudio.src.endsWith('/')) {
        const firstItem = playlistItems[0];
        if (firstItem) {
            firstItem.click();
            return;
        }
    }

    if (playerAudio.paused) {
        fadeOutBG();
        playerAudio.play();
        playerPlayBtn.innerText = "⏸ PAUSE";
        miniPlayBtn.innerText = "⏸";
    } else {
        playerAudio.pause();
        playerPlayBtn.innerText = "▶ PLAY";
        miniPlayBtn.innerText = "▶";
        bgMusicFadeTimeout = setTimeout(fadeInBG, 5000);
    }
}

// 播放列表點擊邏輯
playlistItems.forEach(item => {
    item.addEventListener('click', () => {
        if (isGlobalMuted) {
            isGlobalMuted = false;
            musicToggle.innerText = "🔊";
            playerAudio.volume = 1;
        }

        playlistItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const trackName = item.innerText;
        currentTrackNameDisplay.innerText = trackName;
        miniTrackName.innerText = trackName;

        const src = item.getAttribute('data-src');
        playerAudio.src = src;
        
        fadeOutBG(); 
        playerAudio.play();
        playerPlayBtn.innerText = "⏸ PAUSE";
        miniPlayBtn.innerText = "⏸";
    });
});

// 事件綁定
playerPlayBtn.addEventListener('click', togglePlayback);
miniPlayBtn.addEventListener('click', togglePlayback);

playerAudio.addEventListener('timeupdate', () => {
    const progress = (playerAudio.currentTime / playerAudio.duration) * 100 || 0;
    
    // 同步主進度條與迷你進度條
    progressBar.value = progress;
    miniProgressBar.value = progress;
    currentTimeDisplay.innerText = formatTime(playerAudio.currentTime);
});

playerAudio.addEventListener('loadedmetadata', () => {
    durationDisplay.innerText = formatTime(playerAudio.duration);
});

// 主進度條調整
progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * playerAudio.duration;
    playerAudio.currentTime = seekTime;
});

// 迷你進度條調整
miniProgressBar.addEventListener('input', () => {
    const seekTime = (miniProgressBar.value / 100) * playerAudio.duration;
    playerAudio.currentTime = seekTime;
});

// 歌曲結束處理
playerAudio.addEventListener('ended', () => {
    const activeItem = document.querySelector('#playlist li.active');
    if (activeItem) {
        const nextItem = activeItem.nextElementSibling;
        if (nextItem) {
            nextItem.click();
        } else {
            playlistItems[0].click();
        }
    } else {
        playerPlayBtn.innerText = "▶ PLAY";
        miniPlayBtn.innerText = "▶";
        bgMusicFadeTimeout = setTimeout(fadeInBG, 5000);
    }
});

// ==========================================
// 🌟 核心容器宣告 🌟
// ==========================================
const signpostGroup = new THREE.Group(); 
scene.add(signpostGroup);

const walkmanGroup = new THREE.Group(); 
walkmanGroup.position.set(0, -25, 0); 
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

// 大海背景疊加層 (sea.gif) 滑動動畫
const seaTL = gsap.timeline({
    scrollTrigger: {
        trigger: ".concept-section", 
        start: "top bottom",
        endTrigger: ".music-section", 
        end: "bottom top",
        scrub: true
    }
});

seaTL.fromTo("#sea-overlay", { y: "100%" }, { y: "0%", ease: "none" }) 
     .to("#sea-overlay", { y: "0%", duration: 2 }) 
     .to("#sea-overlay", { y: "-100%", ease: "none" }); 

// 1. 背景(建築+頭+地板)離開
gsap.to(bgGroup.position, {
    y: 150, 
    ease: "none",
    scrollTrigger: { 
        trigger: "#hero", 
        start: "top top", 
        end: "bottom top", 
        scrub: true 
    }
});

// 2. 竿子顯示
ScrollTrigger.create({
    trigger: ".concept-section",
    start: "top 68%", 
    onEnter: () => { polePivot.visible = true; },
    onLeaveBack: () => { polePivot.visible = false; }
});

// 竿子上滑
gsap.to(polePivot.position, {
    y: 60, 
    scrollTrigger: {
        trigger: ".story-section",
        start: "top bottom", 
        end: "top top",      
        scrub: 0.1
    }
});

// 3. Walkman 顯示與滑入
gsap.fromTo(walkmanGroup.position, 
    { y: -40 }, 
    {
        y: 0,
        scrollTrigger: {
            trigger: ".story-section",
            start: "top bottom",
            end: "top center",
            scrub: 0.1,
            onEnter: () => { walkmanGroup.visible = true; },
            onLeaveBack: () => { walkmanGroup.visible = false; }
        }
    }
);

// 4. 組合往上飛走
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
loader.load('model/level404_sign.glb', (gltf) => {
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
}, undefined, (error) => console.error('Error loading walkman:', error));

// 3. 建築
loader.load('model/buildingcopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    bgGroup.add(m);
    const s = 80 / Math.max(b.getSize(new THREE.Vector3()).x, b.getSize(new THREE.Vector3()).y, b.getSize(new THREE.Vector3()).z);
    bgGroup.scale.set(s, s, s);
});

// 4. 地板
loader.load('model/grasscopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z - 10); 
    m.position.y -= 10; m.position.z += 15;
    m.scale.set(40, 45, 25); 
    bgGroup.add(m);
});

// 5. 頭部
loader.load('model/headcopy.glb', (gltf) => {
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
loader.load('model/carouselcopy.glb', (gltf) => {
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
loader.load('model/slidecopy.glb', (gltf) => {
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
// 📱 選單控制 (Menu Toggle) 📱
// ==========================================
const dropbtn = document.querySelector('.dropbtn');
const dropdownContent = document.querySelector('.dropdown-content');

dropbtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    dropdownContent.classList.toggle('show');
});

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        }
        dropdownContent.classList.remove('show');
    });
});

window.addEventListener('click', () => {
    if (dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
    }
});

// ==========================================
// 📖 STORY 字卡切換邏輯 📖
// ==========================================
const storyCards = document.querySelectorAll('.story-card');
const prevBtn = document.querySelector('.story-nav.prev');
const nextBtn = document.querySelector('.story-nav.next');
let currentCardIndex = 0;

function updateStoryCards() {
    storyCards.forEach((card, index) => {
        card.classList.remove('active', 'prev-card', 'next-card');
        if (index === currentCardIndex) {
            card.classList.add('active');
        } else if (index < currentCardIndex) {
            card.classList.add('prev-card');
        } else {
            card.classList.add('next-card');
        }
    });
}

prevBtn.addEventListener('click', () => {
    currentCardIndex = (currentCardIndex - 1 + storyCards.length) % storyCards.length;
    updateStoryCards();
});

nextBtn.addEventListener('click', () => {
    currentCardIndex = (currentCardIndex + 1) % storyCards.length;
    updateStoryCards();
});

updateStoryCards();

// ==========================================
// 🔄 渲染迴圈 🔄
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    
    if (headPivot) {
        if (isMouseActive) {
            currentMouse.x += (targetMouse.x - currentMouse.x) * 0.08;
            currentMouse.y += (targetMouse.y - currentMouse.y) * 0.08;
            headPivot.rotation.y = currentMouse.x * Math.PI * 0.5;  
            headPivot.rotation.x = -currentMouse.y * Math.PI * 0.2; 
        } else {
            headPivot.rotation.y += 0.005; 
            headPivot.rotation.x += (0 - headPivot.rotation.x) * 0.05; 
            currentMouse.x = headPivot.rotation.y / (Math.PI * 0.5);
            currentMouse.y = 0;
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
});