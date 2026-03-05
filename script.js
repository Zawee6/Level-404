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
camera.position.set(0, 0, 10); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 3. 燈光
scene.add(new THREE.AmbientLight(0xffffff, 2)); 
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(10, 10, 10);
scene.add(light);

// 4. 載入模型與動畫
const loader = new THREE.GLTFLoader();
let model;

// 🌟 注意：這裡已修正為您的實體檔名 level404_sign.glb
loader.load('level404_sign.glb', (gltf) => {
    model = gltf.scene;
    
    // 自動置中與初始縮放
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const initialScale = 3 / maxDim; // 初始大小
    
    model.scale.set(initialScale, initialScale, initialScale);
    model.position.sub(center.multiplyScalar(initialScale)); 
    
    scene.add(model);
    
    // 🌟 核心：隨著滑動放大的動畫 🌟
    gsap.to(model.scale, {
        x: initialScale * 8, // 放大 8 倍
        y: initialScale * 8,
        z: initialScale * 8,
        scrollTrigger: {
            trigger: ".concept-section", // 以「專輯概念」區塊作為觸發點
            start: "top bottom",        // 當區塊頂部進入視窗底部時開始
            end: "bottom top",          // 當區塊底部離開視窗頂部時結束
            scrub: 1,                   // 讓動畫跟隨手指捲動的速度
        }
    });

}, undefined, (error) => {
    console.error("❌ 模型載入失敗：", error);
});

// 5. 渲染循環
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