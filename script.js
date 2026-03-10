// ==========================================
// 🌟 設定頭部模型的互動變數 🌟
// ==========================================
let headPivot; // 用來控制頭部旋轉與位置的容器
let targetMouse = { x: 0, y: 0 };
let currentMouse = { x: 0, y: 0 };
let isMouseActive = false;
let mouseTimeout;
let idleTime = 0;

// 監聽滑鼠移動事件
window.addEventListener('mousemove', (event) => {
    // 1. 將滑鼠螢幕座標轉換為 -1 到 1 的 3D 空間座標
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // 2. 標記滑鼠正在移動
    isMouseActive = true;
    
    // 3. 如果滑鼠停下超過 0.5 秒，就切換回「閒置狀態」
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => {
        isMouseActive = false;
    }, 500);
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

// 4. 載入模型並設定「置中容器」
const loader = new THREE.GLTFLoader();
let pivotGroup = new THREE.Group(); // 🌟 建立一個置中容器
scene.add(pivotGroup);

loader.load('level404_sign.glb', (gltf) => {
    const model = gltf.scene;
    
    // 💡 步驟 A：計算模型的原始幾何中心
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // 💡 步驟 B：將模型內部的內容往反方向移動，使其中心點剛好落在 (0,0,0)
    model.position.x = -center.x;
    model.position.y = -center.y;
    model.position.z = -center.z;
    
    // 💡 步驟 C：把模型放進容器中，後續只對容器做縮放
    pivotGroup.add(model);
    
    // 設定初始縮放比例
    const maxDim = Math.max(size.x, size.y, size.z);
    const initialScale = 5 / maxDim; 
    pivotGroup.scale.set(initialScale, initialScale, initialScale);
    
    console.log("✅ 模型已精準置中");

    // 🌟 步驟 D：設定隨著滑動放大的動畫 🌟
    gsap.to(pivotGroup.scale, {
        x: initialScale * 10, // 放大倍數，可根據需求調整
        y: initialScale * 10,
        z: initialScale * 10,
        scrollTrigger: {
            trigger: ".concept-section", 
            start: "top bottom",        
            end: "bottom center",       
            scrub: 1,                   
        }
    });

}, undefined, (error) => {
    console.error("❌ 載入錯誤：", error);
});


// ==========================================
// 🌟 載入第二個背景模型 (修正區塊) 🌟
// ==========================================
// 💡 修正：必須先建立 bgGroup 並加入場景中！
let bgGroup = new THREE.Group();
scene.add(bgGroup);

loader.load('buildingcopy.glb', (gltf) => {
    const bgModel = gltf.scene;
    
    // 1. 計算幾何中心並強制置中
    const box = new THREE.Box3().setFromObject(bgModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    bgModel.position.set(-center.x, -center.y, -center.z);
    
    bgGroup.add(bgModel);
    
    // ==========================================
    // 💡 調整重點在這裡 👇
    // ==========================================
    
    // 2. 往後推得更深：從 -20 改成 -80 (數字越負，離我們越遠)
    bgGroup.position.z = -30; 
    
    // 3. 縮小模型倍數：把原本的 100 改成 15 或 20
    const maxDim = Math.max(size.x, size.y, size.z);
    const bgScale = 80 / maxDim; // 👈 這裡的 15 可以慢慢微調，覺得太大就改 10，太小就改 25
    bgGroup.scale.set(bgScale, bgScale, bgScale);
    
    console.log("✅ 背景圖層模型已載入");

}, undefined, (error) => {
    console.error("❌ 背景模型載入失敗：", error);
});

// ... 前面是 loader.load('buildingcopy.glb', ...) 的區塊 ...

// ==========================================
// 🌟 載入第三個模型：同圖層的地板
// ==========================================
// 🚨 請把 'YOUR_FLOOR_MODEL.glb' 換成您的地板模型檔名
loader.load('grasscopy.glb', (gltf) => {
    const floorModel = gltf.scene;
    
    // 1. 計算幾何中心並強制置中
    const box = new THREE.Box3().setFromObject(floorModel);
    const center = box.getCenter(new THREE.Vector3());
    
    // 2. 將地板置中
    floorModel.position.set(-center.x, -center.y, -center.z);
    
    // 3. 高度微調 (維持您剛剛調好的高度)
    floorModel.position.y -= 10; 
    
    // ==========================================
    // 💡 放大地板的關鍵在這裡 👇
    // ==========================================
    // 第一個數字是 X軸(寬度)，第二個是 Y軸(厚度)，第三個是 Z軸(深度)
    // 試著把它放大 5 倍或 10 倍！
    floorModel.scale.set(20, 20, 20); 
    
    // 5. 將地板加入與建築物同一個背景容器
    bgGroup.add(floorModel);
    
    console.log("✅ 地板模型已載入並放大");

}, undefined, (error) => {
    console.error("❌ 地板模型載入失敗：", error);
});

// ==========================================
// 🌟 載入第四個模型：互動頭部
// ==========================================
loader.load('headcopy.glb', (gltf) => {
    const headModel = gltf.scene;
    
    // 1. 計算幾何中心並取得這顆頭的「原始大小」
    const box = new THREE.Box3().setFromObject(headModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()); // 💡 取得模型原始尺寸
    
    // 2. 建立頭部的控制容器
    headPivot = new THREE.Group();
    headModel.position.set(-center.x, -center.y, -center.z);
    headPivot.add(headModel);
    
    // 3. 💡 設定位置到「右上角」
    // (數值可以等大小正常後再來微調)
    headPivot.position.set(15, 12, 0); 
    
    // 4. 💡 關鍵修正：抵銷雙重放大，精準設定大小！
    const maxDim = Math.max(size.x, size.y, size.z);
    const headScale = 6 / maxDim; // 👈 這裡設定頭部的最終大小！現在設定為 2。
    headPivot.scale.set(headScale, headScale, headScale); 
    
    // 5. 將頭部加入與建築物同一個背景圖層 (bgGroup)
    bgGroup.add(headPivot);
    
    console.log("✅ 頭部模型已載入並修正大小");

}, undefined, (error) => {
    console.error("❌ 頭部模型載入失敗：", error);
});

// 5. 渲染與視窗縮放
function animate() {
    requestAnimationFrame(animate);
    // 💡 頭部的互動邏輯 💡
    if (headPivot) {
        if (isMouseActive) {
            // === 狀態 1：滑鼠移動中 (盯著滑鼠) ===
            // 讓當前角度平滑過渡到目標角度 (Lerp)
            currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
            currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;
            
            // 計算看向滑鼠的旋轉角度 (乘以 Math.PI 控制轉頭幅度)
            headPivot.rotation.y = currentMouse.x * Math.PI * 0.5; // 左右看
            headPivot.rotation.x = currentMouse.y * -Math.PI * 0.25; // 上下看
            headPivot.rotation.z = 0; // 回正頭部的傾斜
            
        } else {
            // === 狀態 2：閒置中 (隨機旋轉) ===
            idleTime += 0.01; // 增加時間基數
            
            // 使用 sin/cos 產生滑順的隨機轉動值
            const randomRotY = Math.sin(idleTime) * Math.PI;      // 左右亂轉
            const randomRotX = Math.cos(idleTime * 0.7) * 0.5;    // 微微點頭/抬頭
            const randomRotZ = Math.sin(idleTime * 0.5) * 0.3;    // 微微歪頭
            
            // 讓頭部平滑地過渡到隨機旋轉的軌跡上
            headPivot.rotation.y += (randomRotY - headPivot.rotation.y) * 0.02;
            headPivot.rotation.x += (randomRotX - headPivot.rotation.x) * 0.02;
            headPivot.rotation.z += (randomRotZ - headPivot.rotation.z) * 0.02;
        }
    }

    // 渲染場景
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});