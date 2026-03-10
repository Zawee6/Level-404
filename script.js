// 💡 修正 1：註冊外掛
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

window.addEventListener('mousemove', (event) => {
    const headXOffset = 0.8; 
    const headYOffset = 0.2; 
    targetMouse.x = (event.clientX / window.innerWidth - headXOffset) * 2;
    targetMouse.y = -(event.clientY / window.innerHeight - headYOffset) * 2;
    isMouseActive = true;
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => { isMouseActive = false; }, 1000);
});

const lenis = new Lenis();
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

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
// 🌟 容器宣告 🌟
// ==========================================
let pivotGroup = new THREE.Group(); // 告示牌
scene.add(pivotGroup);

let bgGroup = new THREE.Group();    // 背景 (建築+地板+頭)
bgGroup.position.z = -30; 
scene.add(bgGroup);

let walkmanGroup = new THREE.Group(); // 🌟 Walkman 專用容器
// 💡 修正：初始位置改為 -15，縮短升起所需的捲動距離
walkmanGroup.position.set(0, -15, 2); 
scene.add(walkmanGroup);

// ==========================================
// 🌟 核心動畫控制 🌟
// ==========================================

// 1. 背景(建築) 往上移
gsap.to(bgGroup.position, {
    y: 150, 
    scrollTrigger: {
        trigger: ".concept-section", 
        start: "top bottom",         
        end: "top top",              
        scrub: 1,
    }
});

// 💡 修正：使用 Timeline 統一管理 Walkman 動作，避免動畫衝突
let walkmanTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".concept-section",
        start: "top bottom", 
        end: "bottom top", 
        scrub: 1
    }
});

// 🎬 動作 A：從下方升起到中間 (進度 0% - 30%)
walkmanTl.to(walkmanGroup.position, { y: -5, duration: 3 });
// 🎬 動作 B：停留在中間 (進度 30% - 70%)
walkmanTl.to(walkmanGroup.position, { y: -5, duration: 4 });
// 🎬 動作 C：最後跟著網頁一起飛走 (進度 70% - 100%)
walkmanTl.to(walkmanGroup.position, { y: 60, duration: 3 });

// ==========================================
// 🌟 載入模型區域 🌟
// ==========================================
const loader = new THREE.GLTFLoader();

// 1. 載入路牌
loader.load('level404_sign.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    pivotGroup.add(model);
    
    const initialScale = 5 / Math.max(size.x, size.y, size.z); 
    pivotGroup.scale.set(initialScale, initialScale, initialScale);
    
    gsap.to(pivotGroup.scale, {
        x: initialScale * 10, y: initialScale * 10, z: initialScale * 10,
        scrollTrigger: { trigger: ".concept-section", start: "top bottom", end: "top 40%", scrub: 1 }
    });

    gsap.to(pivotGroup.position, {
        y: 40, 
        scrollTrigger: { trigger: ".concept-section", start: "top 40%", end: "top top", scrub: 1 }
    });
});

// 2. 載入 Walkman
loader.load('walkmancopy.glb', (gltf) => {
    const walkmanModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(walkmanModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    walkmanModel.position.set(-center.x, -center.y, -center.z);
    walkmanModel.rotation.z = Math.PI; // 上下顛倒
    
    walkmanGroup.add(walkmanModel); 

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = 5 / maxDim; // 5 倍大
    walkmanGroup.scale.set(targetScale, targetScale, targetScale); 
    
    console.log("✅ Walkman 獨立載入成功");
});

// 3. 載入建築
loader.load('buildingcopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    bgGroup.add(m);
    const s = 80 / Math.max(b.getSize(new THREE.Vector3()).x, b.getSize(new THREE.Vector3()).y, b.getSize(new THREE.Vector3()).z);
    bgGroup.scale.set(s, s, s);
});

// 4. 載入地板
loader.load('grasscopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    m.position.y -= 10; m.position.z += 15;
    m.scale.set(25, 25, 25); 
    bgGroup.add(m);
});

// 5. 載入頭部
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

// 渲染迴圈
function animate() {
    requestAnimationFrame(animate);
    if (headPivot) {
        if (isMouseActive) {
            currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
            currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;
            headPivot.rotation.y = currentMouse.x * Math.PI * 0.25;  
            headPivot.rotation.x = -currentMouse.y * Math.PI * 0.15; 
        } else {
            idleTime += 0.01; 
            headPivot.rotation.y += (Math.sin(idleTime) * Math.PI * 0.15 - headPivot.rotation.y) * 0.02;
            headPivot.rotation.x += (Math.cos(idleTime * 0.7) * 0.1 - headPivot.rotation.x) * 0.02;
        }
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});