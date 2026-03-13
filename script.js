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

// 🎨 冷白色憂鬱燈光設定
scene.add(new THREE.AmbientLight(0xddeeff, 1.0)); // 冷白色環境光

const areaLight = new THREE.SpotLight(0xffffff, 3); // 純白主面光
areaLight.position.set(10, 25, 10);
areaLight.angle = Math.PI / 4;
areaLight.penumbra = 1; 
areaLight.decay = 1.5;
areaLight.distance = 150;
scene.add(areaLight);

const sideLight = new THREE.DirectionalLight(0xddeeff, 0.8); // 冷白色側光
sideLight.position.set(-15, 10, 5);
scene.add(sideLight);

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
    ScrollTrigger.refresh();
    gsap.to(loadingOverlay, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
            loadingOverlay.style.display = 'none';
        }
    });
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

const miniPlayBtn = document.getElementById('mini-play-btn');
const miniTrackName = document.getElementById('mini-track-name');
const miniProgressBar = document.getElementById('mini-progress-bar');

let isGlobalMuted = true; 
let bgMusicFadeTimeout;

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function fadeInBG() {
    clearTimeout(bgMusicFadeTimeout);
    if (isGlobalMuted) return;
    music.play();
    gsap.to(music, { volume: 1, duration: 2 });
}

function fadeOutBG() {
    clearTimeout(bgMusicFadeTimeout);
    gsap.to(music, { volume: 0, duration: 1 });
}

window.addEventListener('click', () => {
    if (isGlobalMuted) return;
    if (music.paused) {
        music.play().catch(err => console.log("Autoplay blocked:", err));
    }
}, { once: true });

musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
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
        if (playerAudio.paused) fadeInBG();
    }
});

function togglePlayback() {
    if (isGlobalMuted) {
        isGlobalMuted = false;
        musicToggle.innerText = "🔊";
        playerAudio.volume = 1;
    }
    if (!playerAudio.src || playerAudio.src === "" || playerAudio.src.endsWith('/')) {
        const firstItem = playlistItems[0];
        if (firstItem) { firstItem.click(); return; }
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

playlistItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
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

playerPlayBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlayback(); });
miniPlayBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlayback(); });

playerAudio.addEventListener('timeupdate', () => {
    const progress = (playerAudio.currentTime / playerAudio.duration) * 100 || 0;
    progressBar.value = progress;
    miniProgressBar.value = progress;
    miniProgressBar.style.setProperty('--progress', progress + '%');
    currentTimeDisplay.innerText = formatTime(playerAudio.currentTime);
});

playerAudio.addEventListener('loadedmetadata', () => {
    durationDisplay.innerText = formatTime(playerAudio.duration);
});

progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * playerAudio.duration;
    playerAudio.currentTime = seekTime;
});

miniProgressBar.addEventListener('input', () => {
    const seekTime = (miniProgressBar.value / 100) * playerAudio.duration;
    playerAudio.currentTime = seekTime;
    miniProgressBar.style.setProperty('--progress', miniProgressBar.value + '%');
});

playerAudio.addEventListener('ended', () => {
    const activeItem = document.querySelector('#playlist li.active');
    if (activeItem) {
        const nextItem = activeItem.nextElementSibling;
        if (nextItem) nextItem.click();
        else playlistItems[0].click();
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

const ballGroup = new THREE.Group();
scene.add(ballGroup);

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

ScrollTrigger.create({
    trigger: ".concept-section",
    start: "top 68%", 
    onEnter: () => { polePivot.visible = true; },
    onLeaveBack: () => { polePivot.visible = false; }
});

gsap.to(polePivot.position, {
    y: 60, 
    scrollTrigger: {
        trigger: ".story-section",
        start: "top bottom", 
        end: "top top",      
        scrub: 0.1
    }
});

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

gsap.to([walkmanGroup.position, polePivot.position], {
    y: "+=40", 
    scrollTrigger: { trigger: ".merch-section", start: "top bottom", end: "top top", scrub: 1 }
});

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

// 滾動球動畫邏輯
let ballBaseMesh;
let isBallAnimationActive = false;

function spawnRollingBall() {
    if (!ballBaseMesh || !isBallAnimationActive) return;

    const newBall = ballBaseMesh.clone();
    newBall.visible = true;
    ballGroup.add(newBall);

    const startX = (Math.random() - 0.5) * 40; 
    const outDirection = Math.random() > 0.5 ? 1 : -1; 
    const endX = outDirection * 50;

    newBall.position.set(startX, 25, 0);
    newBall.rotation.set(0, 0, 0);

    const tl = gsap.timeline({
        onComplete: () => { ballGroup.remove(newBall); }
    });

    tl.to(newBall.position, {
        x: startX + (outDirection * 10),
        y: -10,
        duration: 4, 
        ease: "power1.in"
    }).to(newBall.position, {
        x: endX,
        y: -30,
        duration: 3, 
        ease: "power1.out"
    });

    gsap.to(newBall.rotation, {
        x: Math.PI * 4,
        z: Math.PI * 2 * -outDirection,
        duration: 7, 
        ease: "none"
    });
}

function ballSpawnLoop() {
    if (!isBallAnimationActive) return;
    spawnRollingBall();
    gsap.delayedCall(1.5, ballSpawnLoop); // 縮短間隔至 1.5 秒
}

ScrollTrigger.create({
    trigger: ".concept-section", // 從 ALBUM 區開始
    start: "top bottom",
    endTrigger: "html", // 持續到整個網頁結束
    end: "bottom top",
    onEnter: () => { 
        if (!isBallAnimationActive) {
            isBallAnimationActive = true; 
            ballSpawnLoop(); 
        }
    },
    onEnterBack: () => { 
        if (!isBallAnimationActive) {
            isBallAnimationActive = true; 
            ballSpawnLoop(); 
        }
    },
    onLeave: () => { 
        // 只有在滾動超過底部或回到頂部時才考慮停止（這裡設定為完全離開觸發區域）
    },
    onLeaveBack: () => { 
        // 回到 Hero 區時停止並清理
        isBallAnimationActive = false; 
        gsap.killDelayedCallsTo(ballSpawnLoop); 
        ballGroup.clear(); 
    }
});

// ==========================================
// 🚀 載入模型 🚀
// ==========================================
const loader = new THREE.GLTFLoader(loadingManager);

loader.load('model/ball1.glb', (gltf) => {
    ballBaseMesh = gltf.scene;
    ballBaseMesh.visible = false;
    ballBaseMesh.scale.set(3, 3, 3);
});

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

loader.load('model/buildingcopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    bgGroup.add(m);
    const s = 80 / Math.max(b.getSize(new THREE.Vector3()).x, b.getSize(new THREE.Vector3()).y, b.getSize(new THREE.Vector3()).z);
    bgGroup.scale.set(s, s, s);
});

loader.load('model/grasscopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z - 10); 
    m.position.y -= 10; m.position.z += 15;
    m.scale.set(40, 45, 25); 
    bgGroup.add(m);
});

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

const dropbtn = document.querySelector('.dropbtn');
const dropdownContent = document.querySelector('.dropdown-content');
dropbtn.addEventListener('click', (e) => { e.stopPropagation(); dropdownContent.classList.toggle('show'); });
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, { offset: 0, duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
            }
        }
        dropdownContent.classList.remove('show');
    });
});
window.addEventListener('click', () => { if (dropdownContent.classList.contains('show')) dropdownContent.classList.remove('show'); });

const storyCards = document.querySelectorAll('.story-card');
const prevBtn = document.querySelector('.story-nav.prev');
const nextBtn = document.querySelector('.story-nav.next');
let currentCardIndex = 0;
function updateStoryCards() {
    storyCards.forEach((card, index) => {
        card.classList.remove('active', 'prev-card', 'next-card');
        if (index === currentCardIndex) card.classList.add('active');
        else if (index < currentCardIndex) card.classList.add('prev-card');
        else card.classList.add('next-card');
    });
}
prevBtn.addEventListener('click', () => { currentCardIndex = (currentCardIndex - 1 + storyCards.length) % storyCards.length; updateStoryCards(); });
nextBtn.addEventListener('click', () => { currentCardIndex = (currentCardIndex + 1) % storyCards.length; updateStoryCards(); });
updateStoryCards();

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