// ==========================================
// 🌟 設定頭部模型的互動變數 🌟
// ==========================================
let headPivot; 
let targetMouse = { x: 0, y: 0 };
let currentMouse = { x: 0, y: 0 };
let isMouseActive = false;
let mouseTimeout;
let idleTime = 0;

// 監聽滑鼠移動事件 (💡 已補回右上角的偏移量修正)
window.addEventListener('mousemove', (event) => {
    const headXOffset = 0.8; // 偏右
    const headYOffset = 0.2; // 偏上
    
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
// 🌟 核心容器宣告 (💡 修正：必須在載入模型前統一宣告)
// ==========================================
let pivotGroup = new THREE.Group(); // 路牌的容器
scene.add(pivotGroup);

let bgGroup = new THREE.Group(); // 背景封面(建築、草地、頭)的容器
// 先設定背景的深度和縮放比例
bgGroup.position.z = -30; 
// 這裡預設先給個基礎縮放，等建築物載入後會自動覆蓋精確數值
scene.add(bgGroup);

// ==========================================
// 4. 載入模型區域
// ==========================================

// 載入路牌
const loader = new THREE.GLTFLoader();
loader.load('level404_sign.glb', (gltf) => {
    const model = gltf.scene;
    
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    model.position.x = -center.x;
    model.position.y = -center.y;
    model.position.z = -center.z;
    
    pivotGroup.add(model);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const initialScale = 5 / maxDim; 
    pivotGroup.scale.set(initialScale, initialScale, initialScale);
    
    console.log("✅ 路牌模型已精準置中");

    // ==========================================
    // 🌟 GSAP 滾動特效 (💡 確認 bgGroup 已宣告後才執行)
    // ==========================================
    // 動畫 1：背景當作封面，往上移出畫面
    gsap.to(bgGroup.position, {
        y: 50, 
        scrollTrigger: {
            trigger: ".concept-section", 
            start: "top bottom",         
            end: "top top",              
            scrub: 1,
        }
    });

    // 動畫 2：路牌放大，在第二區塊定格
    gsap.to(pivotGroup.scale, {
        x: initialScale * 10,
        y: initialScale * 10,
        z: initialScale * 10,
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top bottom",
            end: "top top",              
            scrub: 1,
        }
    });

    // 動畫 3：路牌在商品區塊跟著滾走
    gsap.to(pivotGroup.position, {
        y: 30, 
        scrollTrigger: {
            trigger: ".merch-section",   
            start: "top bottom",         
            end: "top top",
            scrub: 1,
        }
    });

}, undefined, (error) => {
    console.error("❌ 路牌載入錯誤：", error);
});

// 載入建築
loader.load('buildingcopy.glb', (gltf) => {
    const bgModel = gltf.scene;
    
    const box = new THREE.Box3().setFromObject(bgModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    bgModel.position.set(-center.x, -center.y, -center.z);
    
    bgGroup.add(bgModel);
    
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
    
    bgGroup.add(floorModel); // 💡 放進背景大紙箱，滾動時才會一起往上！
    
    console.log("✅ 地板模型已回到最初設定並加入背景");
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
    
    bgGroup.add(headPivot); // 💡 頭也是背景封面的一部分！
    
    console.log("✅ 頭部模型已載入");
});

// 5. 渲染與視窗縮放
function animate() {
    requestAnimationFrame(animate);
    
    // 💡 頭部的互動邏輯
    if (headPivot) {
        if (isMouseActive) {
            currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
            currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;
            
            headPivot.rotation.y = currentMouse.x * Math.PI * 0.25;  
            // 💡 修正 3：補上負號，解決上下相反的問題！
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