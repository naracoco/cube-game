let scene, camera, renderer;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const SIZE = 3;
const CELL = 0.9;
const GAP = 0.05;

let cells = [];
let currentPlayer = 'X';

let mode = 'mode1';
let winRule = 'A';
let aiSelect = 0;

const statusEl = document.getElementById('status');

init();
animate();

function init(){
  const container = document.getElementById('canvasContainer');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(5,5,7);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(5,10,5);
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

function createCube(){
  while(scene.children.length > 2){
    scene.remove(scene.children[2]);
  }
  cells = [];

  const colors = {
    px: 0xff0000,
    nx: 0xff8800,
    py: 0xffffff,
    ny: 0xffff00,
    pz: 0x00aa00,
    nz: 0x0000ff
  };

  const offset = (SIZE-1)/2*(CELL+GAP);
  const geo = new THREE.BoxGeometry(CELL, CELL, CELL);

  for(let z=0; z<3; z++){
    for(let y=0; y<3; y++){
      for(let x=0; x<3; x++){
        const mats = [];
        mats.push(new THREE.MeshStandardMaterial({color: x===2 ? colors.px : 0x333333}));
        mats.push(new THREE.MeshStandardMaterial({color: x===0 ? colors.nx : 0x333333}));
        mats.push(new THREE.MeshStandardMaterial({color: y===2 ? colors.py : 0x333333}));
        mats.push(new THREE.MeshStandardMaterial({color: y===0 ? colors.ny : 0x333333}));
        mats.push(new THREE.MeshStandardMaterial({color: z===2 ? colors.pz : 0x333333}));
        mats.push(new THREE.MeshStandardMaterial({color: z===0 ? colors.nz : 0x333333}));

        const mesh = new THREE.Mesh(geo, mats);
        mesh.position.set(
          x*(CELL+GAP)-offset,
          y*(CELL+GAP)-offset,
          z*(CELL+GAP)-offset
        );
        mesh.userData = {x,y,z, mark:null};
        scene.add(mesh);
        cells.push(mesh);
      }
    }
  }
}

function onPointer(e){
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(cells);
  if(hit.length){
    handleInput(hit[0].object);
  }
}

function handleInput(cell){
  if(cell.userData.mark) return;

  cell.userData.mark = currentPlayer;
  addMark(cell, currentPlayer);

  if(mode === 'mode1' && isCorner(cell)){
    const faces = getCornerFaces(cell);
    const enemyFace = faces[aiSelect];
    setStatus('角ヒット：3面中「'+enemyFace+'」が敵扱い');
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function addMark(cell, player){
  const g = new THREE.SphereGeometry(0.25,16,16);
  const m = new THREE.MeshStandardMaterial({color: player==='X'?0xff3333:0x3333ff});
  const s = new THREE.Mesh(g,m);
  cell.add(s);
}

function isCorner(c){
  const xs = [0,2].includes(c.userData.x);
  const ys = [0,2].includes(c.userData.y);
  const zs = [0,2].includes(c.userData.z);
  return xs && ys && zs;
}

function getCornerFaces(c){
  const faces = [];
  faces.push(c.userData.x===2?'＋X':'－X');
  faces.push(c.userData.y===2?'＋Y':'－Y');
  faces.push(c.userData.z===2?'＋Z':'－Z');
  return faces;
}

function newGame(){
  currentPlayer = 'X';
  createCube();
  setStatus('新しいゲーム開始');
}

function setStatus(t){
  statusEl.textContent = t;
}

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
