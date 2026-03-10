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

let walkmanGroup = new THREE.Group(); 
// 先把它藏在鏡頭非常下方的位置 (-30)，這樣一開始就不會看到它
walkmanGroup.position.y = -30; 
// 可以讓它稍微往後退一點，才不會跟專輯圖片撞在一起
walkmanGroup.position.z = -5; 
scene.add(walkmanGroup);

// ==========================================
// 🌟 全新 GSAP 滾動特效 🌟
// ==========================================

// 動畫 1：整個背景(建築+草地+頭) 當作封面，往上滑出畫面
// 💡 猛藥：把 y 從 50 改成 150，把深厚的草地徹底拉出畫面！
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
    
    console.log("✅ 路牌模型已載入");
    
    // ==========================================
    // 💡 拆解動畫：精準控制放大與上滑的時機！
    // ==========================================

    // 🎬 動畫 A：路牌先放大 (佔據網頁剛滑到第二區塊的前半段)
    gsap.to(pivotGroup.scale, {
        x: initialScale * 5,
        y: initialScale * 5,
        z: initialScale * 5,
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top bottom",     // 當區塊頂部剛碰到畫面底部時開始
            end: "top 40%",          // 當區塊滑到畫面中間偏上 (這時 Album 圖片已經清楚出現) 時停止放大
            scrub: 1,
        }
    });

    // 🎬 動畫 B：專輯圖片出現後，路牌才開始往上滑走
    gsap.to(pivotGroup.position, {
        y: 40, 
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top 40%",        // 👈 完美銜接！剛好從上面放大結束的地方開始
            end: "top top",          // 當區塊頂部貼齊螢幕頂端時，路牌徹底滑出畫面
            scrub: 1,
        }
    });

    // 排隊動作 1：路牌先放大 (佔用前半段進度)
    signTl.to(pivotGroup.scale, {
        x: initialScale * 10,
        y: initialScale * 10,
        z: initialScale * 10,
        duration: 1
    })
    // 排隊動作 2：接著往上滑走 (佔用後半段進度)
    .to(pivotGroup.position, {
        y: 40, 
        duration: 1
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

// ==========================================
// 🌟 載入第五個模型：Walkman (上下顛倒，在 Section 2 出現)
// ==========================================
loader.load('walkmancopy.glb', (gltf) => {
    const walkmanModel = gltf.scene;
    
    // 1. 計算幾何中心並強制置中
    const box = new THREE.Box3().setFromObject(walkmanModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    walkmanModel.position.set(-center.x, -center.y, -center.z);
    
    // ==========================================
    // 💡 關鍵 1：上下顛倒！(旋轉 180 度 = Math.PI)
    // ==========================================
    // 使用 Z 軸旋轉可以讓它保持正面面對鏡頭，但上下翻轉
    walkmanModel.rotation.z = Math.PI; 
    
    // 如果您發現它是用側面看您，可以加上 Y 軸轉正 (視模型原始方向而定)
    // walkmanModel.rotation.y = Math.PI / 2; 

    walkmanGroup.add(walkmanModel);
    
    // ==========================================
    // 💡 關鍵 2：精準放大 5 倍！
    // ==========================================
    // 先算出它的基準大小，再強制設定為 5 倍大
    const maxDim = Math.max(size.x, size.y, size.z);
    const finalScale = 5 / maxDim; 
    walkmanGroup.scale.set(finalScale, finalScale, finalScale);
    
    console.log("✅ Walkman 模型已載入、顛倒並放大 5 倍");

    // ==========================================
    // 💡 關鍵 3：讓它在第二區塊升上來的 GSAP 動畫
    // ==========================================
    // 當進入 concept-section 時，從下方 (-30) 升到畫面中間 (0)
    gsap.to(walkmanGroup.position, {
        y: 0, 
        scrollTrigger: {
            trigger: ".concept-section",
            start: "top bottom",     // 當區塊剛出現時開始升起
            end: "top 20%",          // 區塊快到畫面頂端時，它剛好就位在正中央
            scrub: 1,
        }
    });

    // (加碼) 當繼續往下滑到周邊商品區塊時，讓它也跟著往上滑走
    gsap.to(walkmanGroup.position, {
        y: 40, // 往上飛出鏡頭
        scrollTrigger: {
            trigger: ".merch-section",
            start: "top bottom",
            end: "top top",
            scrub: 1,
        }
    });

}, undefined, (error) => {
    console.error("❌ Walkman 模型載入失敗：", error);
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