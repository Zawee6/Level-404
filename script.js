// 1. 初始化 Lenis (保留平滑滾動讓網頁好滑)
const lenis = new Lenis();
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Three.js 基礎設定
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 3. 燈光 (確保模型不是黑色的)
scene.add(new THREE.AmbientLight(0xffffff, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// 4. 載入模型
const loader = new THREE.GLTFLoader();
let model;

loader.load('level404-sign.glb', (gltf) => {
    model = gltf.scene;
    // 強制把模型放在畫面正中心
    model.position.set(0, 0, 0);
    // 稍微調整大小（如果不見了，試著把 1 改成 5 或 0.1）
    model.scale.set(1, 1, 1); 
    scene.add(model);
    console.log("模型已載入");
}, undefined, (e) => console.error(e));

// 5. 簡單的渲染循環 (讓模型原地自轉，確認它存在)
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.01; // 每幀轉一點點
    }
    renderer.render(scene, camera);
}
animate();

// 視窗縮放調整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});