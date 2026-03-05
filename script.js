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
camera.position.set(0, 0, 10); // 將相機稍微拉遠

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 3. 強力燈光
scene.add(new THREE.AmbientLight(0xffffff, 2)); 
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(10, 10, 10);
scene.add(light);

// 4. 載入模型並自動調整大小
const loader = new THREE.GLTFLoader();
let model;

loader.load('level404_sign.glb', (gltf) => {
    model = gltf.scene;
    
    // 💡 保險機制：自動計算模型的尺寸並將其置中，避免模型太小或太大看不見
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDim; // 強制將模型縮放到適合的大小
    model.scale.set(scale, scale, scale);
    model.position.sub(center.multiplyScalar(scale)); 
    
    scene.add(model);
    console.log("✅ 模型載入成功並自動調整比例");
}, undefined, (error) => {
    console.error("❌ 模型載入失敗，錯誤訊息：", error);
});

// 5. 渲染與原地旋轉 (測試用)
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.0; // 讓它自轉，確認它活著
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});