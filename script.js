// ==========================================
// 🌟 設定頭部模型的互動變數 🌟
// ==========================================
let headPivot; 
let targetMouse = { x: 0, y: 0 };
let currentMouse = { x: 0, y: 0 };
let isMouseActive = false;
let mouseTimeout;
let idleTime = 0;

// 💡 修正關鍵：註冊外掛
gsap.registerPlugin(ScrollTrigger);

// 監聽滑鼠移動
window.addEventListener('mousemove', (event) => {
    const headXOffset = 0.8; 
    const headYOffset = 0.2; 
    targetMouse.x = (event.clientX / window.innerWidth - headXOffset) * 2;
    targetMouse.y = -(event.clientY / window.innerHeight - headYOffset) * 2;
    isMouseActive = true;
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => { isMouseActive = false; }, 1000);
});

// 1. 初始化 Lenis
const lenis = new Lenis();
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// 2. Three.js 環境
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 3. 燈光
scene.add(new THREE.AmbientLight(0xffffff, 1.5)); 
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

// ==========================================
// 🌟 核心容器宣告
// ==========================================
let pivotGroup = new THREE.Group(); 
scene.add(pivotGroup);

let bgGroup = new THREE.Group(); 
bgGroup.position.z = -30; 
scene.add(bgGroup);

// ==========================================
// 🌟 全新 GSAP 滾動特效
// ==========================================

// 動畫 1：背景封面往上移
gsap.to(bgGroup.position, {
    y: 150, 
    scrollTrigger: {
        trigger: ".concept-section", 
        start: "top bottom",         
        end: "top top",              
        scrub: 1,
    }
});

// ==========================================
// 4. 載入模型區域
// ==========================================
const loader = new THREE.GLTFLoader();

// 載入路牌
loader.load('level404_sign.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    model.position.set(-center.x, -center.y, -center.z);
    pivotGroup.add(model);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const initialScale = 5 / maxDim; 
    pivotGroup.scale.set(initialScale, initialScale, initialScale);
    
    // 🎬 動畫 A：路牌先放大
    gsap.to(pivotGroup.scale, {
        x: initialScale * 10,
        y: initialScale * 10,
        z: initialScale * 10,
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top bottom",     
            end: "top 40%",          
            scrub: 1,
        }
    });

    // 🎬 動畫 B：隨後往上滑走
    gsap.to(pivotGroup.position, {
        y: 40, 
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top 40%",        
            end: "top top",          
            scrub: 1,
        }
    });
    // 💡 這裡原本報錯的 signTl 區塊已被移除
});

// 載入建築
loader.load('buildingcopy.glb', (gltf) => {
    const bgModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(bgModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    bgModel.position.set(-center.x, -center.y, -center.z);
    bgGroup.add(bgModel);
    const bgScale = 80 / Math.max(size.x, size.y, size.z); 
    bgGroup.scale.set(bgScale, bgScale, bgScale);
});

// 載入地板
loader.load('grasscopy.glb', (gltf) => {
    const floorModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(floorModel);
    const center = box.getCenter(new THREE.Vector3());
    floorModel.position.set(-center.x, -center.y, -center.z);
    floorModel.position.y -= 10; 
    floorModel.position.z += 15;
    floorModel.scale.set(25, 25, 25); 
    bgGroup.add(floorModel);
});

// 載入頭部
loader.load('headcopy.glb', (gltf) => {
    const headModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(headModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()); 
    headPivot = new THREE.Group();
    headModel.rotation.y = -Math.PI/2; 
    headModel.position.set(-center.x, -center.y, -center.z);
    headPivot.add(headModel);
    headPivot.position.set(40, 15, 0); 
    const headScale = 10 / Math.max(size.x, size.y, size.z); 
    headPivot.scale.set(headScale, headScale, headScale); 
    bgGroup.add(headPivot);
});

// 載入 Walkman
loader.load('walkmancopy.glb', (gltf) => {
    const walkmanModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(walkmanModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    walkmanModel.position.set(-center.x, -center.y, -center.z);
    walkmanModel.rotation.z = Math.PI; // 上下顛倒
    pivotGroup.add(walkmanModel); // 與路牌同圖層

    const targetScale = 0.8 / Math.max(size.x, size.y, size.z); 
    walkmanModel.scale.set(targetScale, targetScale, targetScale); 
    walkmanModel.position.y -= 6; 
    walkmanModel.position.z += 0.5;

    // 💡 瞬間出現邏輯
    walkmanModel.visible = false; 
    ScrollTrigger.create({
        trigger: ".concept-section",
        start: "top 80%", 
        onEnter: () => { walkmanModel.visible = true; },
        onLeaveBack: () => { walkmanModel.visible = false; }
    });
});

// 5. 渲染迴圈
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