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
// 🌟 核心容器宣告 (重要架構改動) 🌟
// ==========================================

// 1. 🌟 主組裝箱：把告示牌、竿子、Walkman 都裝進這裡，方便一起滑走
let mainAssemblyGroup = new THREE.Group(); 
scene.add(mainAssemblyGroup);

// 2. 🌟 告示牌的獨立箱子 (維持縮放邏輯)
let signpostGroup = new THREE.Group(); 
mainAssemblyGroup.add(signpostGroup);

// 3. 🌟 延伸竿子箱子 (這是我們要在 Three.js 裡生長的竿子)
let extendingPolePivot = new THREE.Group(); 
extendingPolePivot.visible = false; // 一開始隱形
// 💡 Z 設為 -0.1 讓竿子稍微在告示牌後面一點，看起來銜接比較自然
extendingPolePivot.position.set(0, -2.5, -0.1); 
mainAssemblyGroup.add(extendingPolePivot);

// 4. 🌟 Walkman 獨立箱子
let walkmanGroup = new THREE.Group(); 
walkmanGroup.visible = false; // 一開始隱形
mainAssemblyGroup.add(walkmanGroup);

// 5. 建築與頭部 (背景) 容器
let bgGroup = new THREE.Group(); 
bgGroup.position.z = -30; 
scene.add(bgGroup);

// ==========================================
// 🌟 生長魔法：建立要在 Three.js 裡長大的竿子 🌟
// ==========================================
// 使用圓柱體 (CylinderGeometry) 
// 參數：上半徑0.1, 下半徑0.1, 長度設為非常長(20), 圓周分段16
const poleLength = 20;
const cylinderGeo = new THREE.CylinderGeometry(0.1, 0.1, poleLength, 16);
// 💡 關鍵步驟：將圓柱體的幾何中心上移到它的頂端 (Y軸移動-長度的一半)
// 這樣在對它的Mesh做 scale.y 的時候，它就會從頂端單向往下長，而不是從中間雙向放大！
cylinderGeo.translate(0, -poleLength / 2, 0);

// 材質：白色 (跟專輯封面竿子一樣色)
const cylinderMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const extendingPoleMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
extendingPoleMesh.scale.y = 0.001; // 初始長度設為趨近於 0
extendingPolePivot.add(extendingPoleMesh);


// ==========================================
// 🌟 核心動畫控制 🌟
// ==========================================

// 動畫 A：背景(建築) 往上移 (不變)
gsap.to(bgGroup.position, {
    y: 150, 
    scrollTrigger: {
        trigger: ".concept-section", 
        start: "top bottom",         
        end: "top top",              
        scrub: 1,
    }
});

// 動畫 B：🌟 全新「竿子生長與同步連接」時間軸 🌟
let connectingTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".concept-section",
        start: "top bottom", 
        end: "bottom center", // 💡 在滑到區塊中間前完成連接，不要拖太晚
        scrub: 1
    }
});

// 時機 1：當區塊剛升上來時，把竿子跟 Walkman 變出來
connectingTl.to([extendingPolePivot, walkmanGroup], { visible: true, duration: 0.1 });

// 時機 2：🌟 「竿子生長」與「Walkman 移動」完全同步 🌟
// 1. 竿子單向往下延伸 (scale.y 1)
connectingTl.to(extendingPoleMesh.scale, { y: 1, duration: 3, ease: "power1.inOut" }, "synchronize");

// 2. Walkman 垂直下移 (y: 從竿子頂部(-2.5) 移動到底部(-2.5-長度))
// 💡 計算：-2.5 偏移量，加上竿子原本的長度 20。最終位置在 y=-22.5
connectingTl.to(walkmanGroup.position, { y: -2.5 - poleLength, duration: 3, ease: "power1.inOut" }, "synchronize");


// 動畫 C：💡 告示牌自己的動作 (维持不變)
// 🎬 動作 C-1：告示牌先放大
loader.load('level404_sign.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    
    // 💡 關鍵修正：放到 signpostGroup 裡！
    signpostGroup.add(model);
    
    const initialScale = 5 / Math.max(size.x, size.y, size.z); 
    signpostGroup.scale.set(initialScale, initialScale, initialScale);
    
    // 告示牌放大動畫 (佔據網頁剛滑到第二區塊的前半段)
    gsap.to(signpostGroup.scale, {
        x: initialScale * 5,
        y: initialScale * 5,
        z: initialScale * 5,
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top bottom",     
            end: "top 40%",          
            scrub: 1,
        }
    });

    // 🎬 動作 C-2：告示牌滑走動畫 (改成移動整個 mainAssemblyGroup！)
    gsap.to(mainAssemblyGroup.position, {
        y: 60, 
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top 40%",        
            end: "top top",          
            scrub: 1,
        }
    });
});


// ==========================================
// 🌟 載入 Walkman 與背景模型 (不變) 🌟
// ==========================================

// 2. 載入 Walkman
loader.load('walkmancopy.glb', (gltf) => {
    const walkmanModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(walkmanModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    walkmanModel.position.set(-center.x, -center.y, -center.z);
    
    // 💡 維持上下顛倒
    walkmanModel.rotation.z = Math.PI; 
    
    // 💡 加入 Walkman 箱子
    walkmanGroup.add(walkmanModel); 

    const maxDim = Math.max(size.x, size.y, size.z);
    // 💡 這裡設定 Walkman 的最終大小倍率
    const targetScale = 5 / maxDim; 
    walkmanGroup.scale.set(targetScale, targetScale, targetScale); 
    
    // 💡 初始 Z 軸往前凸出一點 (在竿子前面)，Y 軸初始在竿子最頂端(-2.5)
    walkmanGroup.position.set(0, -2.5, 0);
    
    console.log("✅ Walkman 已預備好連接生長");
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

// 渲染迴圈與視窗縮放 (不變)
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