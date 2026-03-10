// ==========================================
// 🌟 設定頭部模型的互動變數 🌟
// ==========================================
let headPivot; 
let targetMouse = { x: 0, y: 0 };
let currentMouse = { x: 0, y: 0 };
let isMouseActive = false;
let mouseTimeout;
let idleTime = 0;

// 監聽滑鼠移動事件
window.addEventListener('mousemove', (event) => {
    const headXOffset = 0.8; 
    const headYOffset = 0.2; 
    
    targetMouse.x = (event.clientX / window.innerWidth - headXOffset) * 2;
    targetMouse.y = -(event.clientY / window.innerHeight - headYOffset) * 2;
    
    isMouseActive = true;
    
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => {
        isMouseActive = false;
    }, 1000);
});

// 1. 初始化 Lenis
const lenis = new Lenis();
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Three.js 基礎環境
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
// 🌟 核心容器宣告 (必須在最前面統一宣告)
// ==========================================
let pivotGroup = new THREE.Group(); // 路牌專屬容器
scene.add(pivotGroup);

let bgGroup = new THREE.Group(); // 背景(建築、草地、頭)共用大紙箱
bgGroup.position.z = -30; 
scene.add(bgGroup);

// ==========================================
// 🌟 全新 GSAP 滾動特效 🌟
// ==========================================

// 動畫 1：整個背景(建築+草地+頭) 當作封面，往上滑出畫面
gsap.to(bgGroup.position, {
    y: 50, 
    scrollTrigger: {
        trigger: ".concept-section", 
        start: "top bottom",         
        end: "top top",              
        scrub: 1,
    }
});

// 動畫 2：讓路牌在 Level 404 出來「之前」就往上滑走！
gsap.to(pivotGroup.position, {
    y: 30, // 往上移動並移出鏡頭
    scrollTrigger: {
        trigger: ".concept-section", 
        start: "top bottom",         // 只要一開始滑動就觸發
        end: "top center",           // 👈 提早在區塊到達畫面中間前就跑走
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
    
    console.log("✅ 路牌模型已載入");
    
    // 讓路牌往上滑走的同時，微微放大一點點(增加飛過去的立體感)
    gsap.to(pivotGroup.scale, {
        x: initialScale * 2,
        y: initialScale * 2,
        z: initialScale * 2,
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top bottom",
            end: "top center",
            scrub: 1,
        }
    });
});

// 載入建築
loader.load('buildingcopy.glb', (gltf) => {
    const bgModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(bgModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    bgModel.position.set(-center.x, -center.y, -center.z);
    bgGroup.add(bgModel); // 💡 加入背景箱子
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const bgScale = 80 / maxDim; 
    bgGroup.scale.set(bgScale, bgScale, bgScale);
    
    console.log("✅ 建築模型已載入");
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
    
    bgGroup.add(floorModel); // 💡 確保地板也加進同一個背景箱子！
    console.log("✅ 地板模型已載入並綁定");
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
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const headScale = 10 / maxDim; 
    headPivot.scale.set(headScale, headScale, headScale); 
    
    bgGroup.add(headPivot); // 💡 頭也加進同一個背景箱子！
    console.log("✅ 頭部模型已載入");
});

// 5. 渲染與視窗縮放
function animate() {
    requestAnimationFrame(animate);
    
    if (headPivot) {
        if (isMouseActive) {
            currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
            currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;
            
            headPivot.rotation.y = currentMouse.x * Math.PI * 0.25;  
            headPivot.rotation.x = -currentMouse.y * Math.PI * 0.15; 
            headPivot.rotation.z = 0; 
            
        } else {
            idleTime += 0.01; 
            
            const randomRotY = Math.sin(idleTime) * Math.PI * 0.15;      
            const randomRotX = Math.cos(idleTime * 0.7) * 0.1;    
            const randomRotZ = Math.sin(idleTime * 0.5) * 0.05;    
            
            headPivot.rotation.y += (randomRotY - headPivot.rotation.y) * 0.02;
            headPivot.rotation.x += (randomRotX - headPivot.rotation.x) * 0.02;
            headPivot.rotation.z += (randomRotZ - headPivot.rotation.z) * 0.02;
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