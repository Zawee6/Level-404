// 1. 初始化 Lenis 平滑捲動
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
camera.position.set(0, 0, 10); // 相機位置

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 3. 燈光
scene.add(new THREE.AmbientLight(0xffffff, 1.5)); 
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

// 4. 載入模型並設定置中放大動畫
const loader = new THREE.GLTFLoader();
let model;

// 🌟 請確保 GitHub 上的檔名是 level404_sign.glb
loader.load('level404_sign.glb', (gltf) => {
    model = gltf.scene;
    
    // 💡 精準置中邏輯
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // 將模型的幾何中心移動到 (0,0,0)
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);
    
    // 設定初始大小 (適應視窗大小)
    const maxDim = Math.max(size.x, size.y, size.z);
    const initialScale = 4 / maxDim; 
    model.scale.set(initialScale, initialScale, initialScale);
    
    scene.add(model);
    console.log("✅ 模型已置中載入");

    // 🌟 隨著滑動放大的動畫 🌟
    gsap.to(model.scale, {
        x: initialScale * 12, // 放大到 12 倍 (可根據需求調整)
        y: initialScale * 12,
        z: initialScale * 12,
        scrollTrigger: {
            trigger: ".concept-section", // 觸發區塊
            start: "top bottom",        // 區塊頂部進入視窗底部時開始
            end: "bottom center",       // 區塊底部到達視窗中間時結束
            scrub: 1,                   // 動畫隨捲動進度變化
        }
    });

}, undefined, (error) => {
    console.error("❌ 載入錯誤：", error);
});

// 5. 渲染與視窗縮放
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});