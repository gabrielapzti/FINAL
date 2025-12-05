import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

let camera, scene, renderer;

let objects = [];

let velCubo = 0.001;

let parametrosGui;

var mixer;
var animationActions = [];
var activeAnimation;
var lastAnimation;
var loadFinished = false;
var clock = new THREE.Clock();

// Novas variáveis para movimento e luz
let mainLight = null;
let walkAction = null;
let idleAction = null;
let moving = false;
let moveSpeed = 5; // unidades por segundo
let moveDirectionSign = 1; // 1 = frente, -1 = trás

var criaIluminacao = function () {
  luzAmbiente();
  // cria luz principal padrão (Directional)
  setLight("Directional");
};

var luzSolar = function () {
  let sol = new THREE.DirectionalLight(0xffffff, 1);
  sol.castShadow = true;

  sol.position.y = 900;

  sol.shadow.mapSize.width = 2024;
  sol.shadow.mapSize.height = 2024;

  //camera de sombra
  sol.shadow.camera.far = 950;
  sol.shadow.camera.left = -100;
  sol.shadow.camera.right = 100;
  sol.shadow.camera.top = 100;
  sol.shadow.camera.bottom = -100;

  scene.add(sol);
};

var luzAmbiente = function () {
  let amb = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(amb);
};

// Função para criar/atualizar luz principal conforme tipo
function setLight(type) {
  if (mainLight) {
    scene.remove(mainLight);
    if (mainLight.target) scene.remove(mainLight.target);
    mainLight = null;
  }

  if (type === "Directional") {
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(50, 80, 50);
    dir.castShadow = true;
    dir.shadow.mapSize.width = dir.shadow.mapSize.height = 1024;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 500;
    mainLight = dir;
    scene.add(mainLight);
  } else if (type === "SpotLight") {
    const spot = new THREE.SpotLight(0xffffff, 1);
    spot.position.set(30, 60, 30);
    spot.angle = Math.PI / 6;
    spot.penumbra = 0.2;
    spot.decay = 2;
    spot.distance = 200;
    spot.castShadow = true;
    spot.shadow.mapSize.width = spot.shadow.mapSize.height = 1024;
    mainLight = spot;
    scene.add(mainLight);
  } else if (type === "Point") {
    const point = new THREE.PointLight(0xffffff, 1, 200);
    point.position.set(30, 40, 30);
    point.castShadow = true;
    point.shadow.mapSize.width = point.shadow.mapSize.height = 512;
    mainLight = point;
    scene.add(mainLight);
  }
}

var setAction = function (animacao) {
  if (!animacao) return;
  if (animacao !== activeAnimation) {
    // fade out old, fade in new
    if (activeAnimation) {
      activeAnimation.fadeOut(0.2);
    }
    animacao.reset();
    animacao.fadeIn(0.2);
    animacao.play();
    lastAnimation = activeAnimation;
    activeAnimation = animacao;
  }
};

var createGui = function () {
  const gui = new GUI();

  parametrosGui = {
    scale: 1,
    positionX: 0,
    lobaoScale: 30,
    lobaoRotationY: 0,
    opt: "Origem",
    lightType: "Directional", // nova opção
  };

  let scale = gui
    .add(parametrosGui, "scale")
    .min(0.1)
    .max(10)
    .step(0.3)
    .name("Scale");
  scale.onChange(function (value) {
    objects["ombro"].scale.x =
      objects["ombro"].scale.y =
      objects["ombro"].scale.z =
        value;
  });

  let position = gui.addFolder("Position");

  let lobao = gui.addFolder("Lobao");
  lobao
    .add(parametrosGui, "lobaoScale")
    .min(0)
    .max(40)
    .step(1)
    .name("Scale")
    .onChange(function (value) {
      objects["pug"].scale.x =
        objects["pug"].scale.y =
        objects["pug"].scale.z =
          value;
    });
  lobao
    .add(parametrosGui, "lobaoRotationY")
    .min(-2)
    .max(2)
    .step(0.1)
    .name("Rotation")
    .onChange(function (value) {
      objects["pug"].rotation.y = value;
    });
  let options = ["Origem", "Lobao"];
  lobao
    .add(parametrosGui, "opt")
    .options(options)
    .name("Look")
    .onChange(function (value) {
      console.log(value);
      if (value == "Lobao") camera.lookAt(objects["lobao"].position);
      else camera.lookAt(objects["pug"].position);
    });

  position
    .add(parametrosGui, "positionX")
    .min(-4)
    .max(4)
    .step(0.1)
    .name("X")
    .onChange(function (value) {
      objects["ombro"].position.x = value;
    });

  // GUI para tipo de iluminação
  gui
    .add(parametrosGui, "lightType")
    .options(["Directional", "SpotLight", "Point"])
    .name("Light Type")
    .onChange(function (value) {
      setLight(value);
    });
};

var loadObj = function () {
  let objLoader = new OBJLoader();
  let fbxLoader = new FBXLoader();
  let textLoader = new THREE.TextureLoader();

  objLoader.load(
    "assets/Wolf.obj",
    function (obj) {
      obj.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshNormalMaterial();
        }
      });
      scene.add(obj);
      objects["lobao"] = obj;
      obj.position.x = 90;
      obj.scale.x = obj.scale.y = obj.scale.z = 30;
    },
    function (progress) {
      console.log("ta vivo! " + (progress.loaded / progress.total) * 100 + "%");
    },
    function (error) {
      console.log("Deu merda " + error);
    }
  );

  fbxLoader.load(
    "assets/fbx/Dragon3.fbx",
    function (obj) {
      obj.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          console.log(child);

          let texture = textLoader.load("assets/fbx/Dragon_ground_color.jpg");
          child.material = new THREE.MeshStandardMaterial({ map: texture });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(obj);
      objects["pug"] = obj;
      obj.position.x = -10;
      obj.scale.x = obj.scale.y = obj.scale.z = 0.01;
      obj.position.y -= 5.8;

      //Animation stuff
      let animation;

      mixer = new THREE.AnimationMixer(obj);

      //voando  <- animations[1] no fbx
      animation = mixer.clipAction(obj.animations[1]);
      animationActions.push(animation);

      //andando <- animations[0]
      animation = mixer.clipAction(obj.animations[0]);
      animationActions.push(animation);

      //idle <- animations[2]
      animation = mixer.clipAction(obj.animations[2]);
      animationActions.push(animation);

      //apertado banheiro
      animation = mixer.clipAction(obj.animations[3]);
      animationActions.push(animation);

      // organizar referências claras
      // Conforme ordem em que foram empurradas:
      // animationActions[0] = voando, [1] = andando, [2] = idle
      walkAction = animationActions[1];
      idleAction = animationActions[2];

      // começa em idle
      activeAnimation = idleAction;
      activeAnimation.play();

      loadFinished = true;
    },
    function (progress) {
      console.log("ta vivo! " + (progress.loaded / progress.total) * 100 + "%");
    },
    function (error) {
      console.log("Deu merda " + error);
    }
  );
};

export function init() {
  camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  //cria o mundo
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcce0ff);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  criaIluminacao();
  //criaSer();
  createGui();
  loadObj();

  console.log("QUALER COISA");
  camera.position.z = 60;
  //necessário se queremos fazer algo com animação
  renderer.setAnimationLoop(nossaAnimacao);

  document.body.appendChild(renderer.domElement);

  renderer.render(scene, camera);

  //CHAO DO AMBIENTE - GABI

  let textLoader = new THREE.TextureLoader();
  let textGround = textLoader.load("assets/piso.jpg");
  textGround.wrapS = textGround.wrapT = THREE.RepeatWrapping;
  textGround.repeat.set(25, 25);
  textGround.anisotropy = 16;

  let materialGround = new THREE.MeshStandardMaterial({ map: textGround });

  let ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    materialGround
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y -= 6;

  ground.receiveShadow = true;

  scene.add(ground);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  document.addEventListener("mousemove", makeMove);
  document.addEventListener("mouseup", clickOn);
  document.addEventListener("mousedown", ClickOff);

  window.addEventListener("resize", onWindowResize);
}

var nossaAnimacao = function () {
  let delta = clock.getDelta();
  if (loadFinished) {
    mixer.update(delta);
    // movimentacao do objeto quando 'moving' true
    if (moving && objects["pug"]) {
      // move ao longo da direção para a qual o modelo está apontando
      let dir = new THREE.Vector3();
      objects["pug"].getWorldDirection(dir); // direção do -Z local em world space
      objects["pug"].position.addScaledVector(
        dir,
        moveSpeed * delta * moveDirectionSign
      );
    }
  }

  renderer.render(scene, camera);
};

/**
 * Section of mouse mouve
 *
 */
var click = false;
var mousePosition = {
  x: 0,
  y: 0,
  z: 0,
};

var makeMove = function (e) {
  if (click) {
    let deltaX = mousePosition.x - e.offsetX;
    let deltaY = mousePosition.y - e.offsetY;

    let eulerMat = new THREE.Euler(0, toRadians(deltaX) * 0.1, 0, "YXZ");
    let quater = new THREE.Quaternion().setFromEuler(eulerMat);
    camera.quaternion.multiplyQuaternions(quater, camera.quaternion);
  }
  mousePosition = {
    x: e.offsetX,
    y: e.offsetY,
  };
};

var ClickOff = function (e) {
  click = true;
};
var clickOn = function (e) {
  click = false;
};

var toRadians = function (value) {
  return value * (Math.PI / 180);
};

// Moves
var velOmbro = 0.01;
var velCotovelo = 0.01;

var onKeyDown = function (e) {
  if (e.keyCode == 187) {
    // +
    objects["ombro"].scale.x += 0.01;
    objects["ombro"].scale.y += 0.01;
    objects["ombro"].scale.z += 0.01;
  }

  if (e.keyCode == 189) {
    //-
    objects["cubo1"].scale.x -= 0.01;
    objects["cubo1"].scale.y -= 0.01;
    objects["cubo1"].scale.z -= 0.01;
  }

  if (e.keyCode == 82) {
    //R
    objects["pivoOmbro"].rotation.x -= velOmbro;
    if (
      objects["pivoOmbro"].rotation.x < -1.62 ||
      objects["pivoOmbro"].rotation.x > 0.9
    )
      velOmbro *= -1;
  }
  if (e.keyCode == 32)
    // space
    velCubo = velCubo == 0 ? 0.001 : 0;

  // Iniciar locomoção: W (87) ou seta para cima (38)
  if ((e.keyCode == 87 || e.keyCode == 38) && loadFinished) {
    if (!moving) {
      moving = true;
      moveDirectionSign = 1;
      if (walkAction) {
        setAction(walkAction);
      }
    }
  }

  // Andar para trás: S (83) ou seta para baixo (40)
  if ((e.keyCode == 83 || e.keyCode == 40) && loadFinished) {
    if (!moving) {
      moving = true;
      moveDirectionSign = -1;
      if (walkAction) {
        setAction(walkAction);
      }
    }
  }
};

var onKeyUp = function (e) {
  // Parar locomoção quando W/S ou setas forem soltas
  if (
    (e.keyCode == 87 ||
      e.keyCode == 38 ||
      e.keyCode == 83 ||
      e.keyCode == 40) &&
    loadFinished
  ) {
    if (moving) {
      moving = false;
      if (idleAction) {
        setAction(idleAction);
      }
    }
  }
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
