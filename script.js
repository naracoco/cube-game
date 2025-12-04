// ===== 基本セットアップ =====
let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const SIZE = 3;
const CELL = 0.9;
const GAP = 0.05;

let cells = [];
let currentPlayer = 'X';

// UI設定
let mode = 'mode1';   // mode1 = 3面連動 / mode2 = 6面独立
let winRule = 'A';    // 現在は表示用のみ
let aiSelect = 0;    // 角選択時、どの面を敵にするか

const statusEl = document.getElementById('status');

init();
animate();

// ===== 初期化 =====
function init(){
  const container = document.getElementById('canvasContainer');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(5, 5, 7);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // カメラ操作
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // ライト
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  createCube();

  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointerdown', onPointer);

  document.getElementById('gameMode').onchange = e => mode = e.target.value;
  document.getElementById('winRule').onchange = e => winRule = e.target.value;
  document.getElementById('aiSelect').onchange = e => aiSelect = Number(e.target.value);
  document.getElementById('newBtn').onclick = newGame;

  setStatus('新しいゲームを開始できます');
}

// ===== ルービックキューブ生成 =====
function createCube(){
  while(scene.children.length > 2){
    scene.remove(scene.children[2]);
  }
  cells = [];

  // 6面カラー
  const colors = {
    px: 0xff0000, // 赤
    nx: 0xff8800, // オレンジ
    py: 0xffffff, // 白
    ny: 0xffff00, // 黄
    pz: 0x00aa00, // 緑
    nz: 0x0000ff  // 青
  };

  const offset = (SIZE - 1) / 2 * (CELL + GAP);
  const geo = new THREE.BoxGeometry(CELL, CELL, CELL);

  for(let z = 0; z < 3; z++){
    for(let y = 0; y < 3; y++){
      for(let x = 0; x < 3; x++){
        const mats = [];
        mats.push(new THREE.MeshStandardMaterial({ color: x === 2 ? colors.px : 0x333333 }));
        mats.push(new THREE.MeshStandardMaterial({ color: x === 0 ? colors.nx : 0x333333 }));
        mats.push(new THREE.MeshStandardMaterial({ color: y === 2 ? colors.py : 0x333333 }));
        mats.push(new THREE.MeshStandardMaterial({ color: y === 0 ? colors.ny : 0x333333 }));
        mats.push(new THREE.MeshStandardMaterial({ color: z === 2 ? colors.pz : 0x333333 }));
        mats.push(new THREE.MeshStandardMaterial({ color: z === 0 ? colors.nz : 0x333333 }));

        const mesh = new THREE.Mesh(geo, mats);
        mesh.position.set(
          x * (CELL + GAP) - offset,
          y * (CELL + GAP) - offset,
          z * (CELL + GAP) - offset
        );

        mesh.userData = { x, y, z, mark: null };
        scene.add(mesh);
        cells.push(mesh);
      }
    }
  }
}

// ===== タップ・クリック =====
function onPointer(e){
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(cells);

  if(hit.length){
    handleInput(hit[0].object);
  }
}

// ===== マス選択処理 =====
function handleInput(cell){
  if(cell.userData.mark) return;

  cell.userData.mark = currentPlayer;
  addMark(cell, currentPlayer);

  // 角ルール（3面連動）
  if(mode === 'mode1' && isCorner(cell)){
    const faces = getCornerFaces(cell);
    const enemyFace = faces[aiSelect];
    setStatus('角ヒット：3面中「' + enemyFace + '」が敵扱い');
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

// ===== マーク描画 =====
function addMark(cell, player){
  const g = new THREE.SphereGeometry(0.25, 16, 16);
  const m = new THREE.MeshStandardMaterial({
    color: player === 'X' ? 0xff3333 : 0x3333ff
  });
  const s = new THREE.Mesh(g, m);
  cell.add(s);
}

// ===== 角判定 =====
function isCorner(c){
  const xs = [0, 2].includes(c.userData.x);
  const ys = [0, 2].includes(c.userData.y);
  const zs = [0, 2].includes(c.userData.z);
  return xs && ys && zs;
}

// ===== 角の3面取得 =====
function getCornerFaces(c){
  const faces = [];
  faces.push(c.userData.x === 2 ? '＋X' : '－X');
  faces.push(c.userData.y === 2 ? '＋Y' : '－Y');
  faces.push(c.userData.z === 2 ? '＋Z' : '－Z');
  return faces;
}

// ===== 新規ゲーム =====
function newGame(){
  currentPlayer = 'X';
  createCube();
  setStatus('新しいゲーム開始');
}

// ===== ステータス表示 =====
function setStatus(t){
  statusEl.textContent = t;
}

// ===== アニメーション =====
function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ===== リサイズ対応 =====
function onResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
