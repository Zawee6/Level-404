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
// 🌟 核心容器宣告 (三個獨立物件，互不綁定) 🌟
// ==========================================
// 1. 告示牌
let signpostGroup = new THREE.Group(); 
scene.add(signpostGroup);

// 2. Walkman (固定在畫面下方)
let walkmanGroup = new THREE.Group(); 
walkmanGroup.position.set(0, -6, -0.1); // 停在畫面底部
walkmanGroup.visible = false; // 初始隱形
scene.add(walkmanGroup);

// 3. 延伸白竿子的出發點 (固定在畫面最頂端，鏡頭外)
let polePivot = new THREE.Group(); 
polePivot.position.set(0, 15, 0.1); // y:15 確保從螢幕上面長下來
polePivot.visible = false; // 初始隱形
scene.add(polePivot);

// 4. 背景(建築與頭)
let bgGroup = new THREE.Group(); 
bgGroup.position.z = -30; 
scene.add(bgGroup);

// 5. 旋轉木馬容器
let carouselGroup = new THREE.Group();
carouselGroup.visible = false; // 先設為隱形，等滑到 section 再出現
scene.add(carouselGroup);

// 6. 溜滑梯容器
let slideGroup = new THREE.Group();
slideGroup.visible = false; 
scene.add(slideGroup);

// ==========================================
// 🌟 建立生長竿子 🌟
// ==========================================
// 從頂部(15) 長到底部(-6)，總長度為 21
const poleLength = 20; 
const cylinderGeo = new THREE.CylinderGeometry(0.7, 0.7, poleLength, 16); 

const cylinderMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5, metalness: 0.1 });
const poleMesh = new THREE.Mesh(cylinderGeo, cylinderMat);

// 💡 關鍵修改：直接設為 1 (全滿狀態)，不要設為 0.001
poleMesh.scale.y = 1; 
polePivot.add(poleMesh);

polePivot.position.set(-0.1, 0, 0);

// ==========================================
// 🌟 核心動畫控制 (完美接力時間軸) 🌟
// ==========================================

// 動畫 1：背景往上移離開畫面
gsap.to(bgGroup.position, {
    y: 150, 
    scrollTrigger: { trigger: ".concept-section", start: "top bottom", end: "top top", scrub: 1 }
});

// 動畫 2-A：長竿子的顯示時機 (早點生成)
ScrollTrigger.create({
    trigger: ".concept-section",
    // 💡 數字調大 = 提早出現 (例如 60% 或 70%)
    start: "top 68%", 
    onEnter: () => { polePivot.visible = true; },
    onLeaveBack: () => { polePivot.visible = false; }
});

// 動畫 2-B：Walkman 的顯示時機 (改為綁定 albumdemo 圖片)
ScrollTrigger.create({
    trigger: ".concept-image", // 💡 直接瞄準 albumdemo 圖片的 class
    start: "top 50%",          // 當圖片頂部進入螢幕下方 80% 時，Walkman 瞬間出現
    onEnter: () => { walkmanGroup.visible = true; },
    onLeaveBack: () => { walkmanGroup.visible = false; }
});

// 動畫 3：整個組合一起往上飛走 (前往周邊商品頁)
gsap.to([walkmanGroup.position, polePivot.position], {
    y: "+=40", 
    scrollTrigger: { trigger: ".merch-section", start: "top bottom", end: "top top", scrub: 1 }
});

// 動畫 4：整個組合一起往上飛走 (前往周邊商品頁)
gsap.to([walkmanGroup.position, polePivot.position], {
    y: "+=40", // 相對位移飛出畫面
    scrollTrigger: { trigger: ".merch-section", start: "top bottom", end: "top top", scrub: 1 }
});

// 木馬與溜滑梯的滑入動畫
ScrollTrigger.create({
    trigger: ".concept-image",
    start: "top 80%",
    onEnter: () => { 
        carouselGroup.visible = true; 
        slideGroup.visible = true; 
        
        // ⬅️ 木馬從左滑入到 -12
        gsap.to(carouselGroup.position, { x: -12, duration: 1.5, ease: "power2.out" }); 
        
        // ➡️ 溜滑梯從右滑入到 12
        gsap.to(slideGroup.position, { x: 12, duration: 1.5, ease: "power2.out" }); 
    },
    onLeaveBack: () => { 
        // 木馬往左退回 -30，溜滑梯往右退回 30
        gsap.to(carouselGroup.position, { x: -30, duration: 1, ease: "power2.in" });
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
    
    signpostGroup.add(model);
    
    const initialScale = 10 / Math.max(size.x, size.y, size.z); 
    signpostGroup.scale.set(initialScale, initialScale, initialScale);
    
    // 🎬 動作 1-A：告示牌放大 (剛滑動時)
    gsap.to(signpostGroup.scale, {
        x: initialScale * 3, y: initialScale * 3, z: initialScale * 3,
        scrollTrigger: { trigger: ".concept-section", start: "top bottom", end: "top 70%", scrub: 1 }
    });

    // 🎬 動作 1-B：告示牌往上飛走！(在 Album 出現前完全消失)
    gsap.to(signpostGroup.position, {
        y: 40, 
        scrollTrigger: { trigger: ".concept-section", start: "top 70%", end: "top 50%", scrub: 1 }
    });
});

// 2. 載入 Walkman
loader.load('walkmancopy.glb', (gltf) => {
    const walkmanModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(walkmanModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    walkmanModel.position.set(-center.x, -center.y, -center.z);
    
    // 🎯 完美套用您的微調座標 (把竿子推到正中央)
    walkmanModel.position.x = 1.784; 
    walkmanModel.position.y = -1.6; 
    walkmanModel.position.z = 8.55; 
    walkmanModel.rotation.z = Math.PI; // 上下顛倒
    
    walkmanGroup.add(walkmanModel); 

    const targetScale = 24 / Math.max(size.x, size.y, size.z); 
    walkmanGroup.scale.set(targetScale, targetScale, targetScale); 
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

// 6. 載入旋轉木馬 (Carousel)
loader.load('carouselcopy.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // 幾何置中
    model.position.set(-center.x, -center.y, -center.z);
    carouselGroup.add(model);
    
    // 🎯 大小微調 (根據模型實際比例調整 8 這個數字)
    const s = 8 / Math.max(size.x, size.y, size.z);
    carouselGroup.scale.set(s, s, s);
    
    // 🎯 位置設定：放在左側 (x: -12)，高度與 Walkman 差不多 (y: -6)
    carouselGroup.position.set(-30, 0, 0); 
});

// 7. 載入溜滑梯 (Slide)
loader.load('slidecopy.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    model.position.set(-center.x, -center.y, -center.z);
    slideGroup.add(model);
    
    // 設定大小
    const s = 6 / Math.max(size.x, size.y, size.z);
    slideGroup.scale.set(s, s, s);
    
    // 🎯 初始位置：設在右側外面 (x: 30)
    // 高度設為 -6 (與 Walkman 平行) 或自訂高度
    slideGroup.position.set(30, 0, 0); 
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
        // 🎯 讓旋轉木馬水平旋轉 (y軸)
        if (carouselGroup&& carouselGroup.visible) {
            carouselGroup.rotation.y += 0.01; // 數字越大轉越快
        }
        // 🎯 溜滑梯也旋轉 (做一樣的事)
         if (slideGroup && slideGroup.visible) {
            slideGroup.rotation.y -= 0.01; 
        }
        if (headPivot) {
            // ... 原有的頭部轉動代碼
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