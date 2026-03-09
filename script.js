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