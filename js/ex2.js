import * as THREE from 'three';

let camera, scene, renderer;

let  elements = [];

let velCubo = 0.001;



var criaMonstro = function(){

	let red = 	new THREE.Color(1,0,0);
	let green = new THREE.Color(0,1,0);
	let blue = 	new THREE.Color(0,0,1);
	let cores = [red, green, blue];

	let materials = [
		new THREE.MeshBasicMaterial({color: red}),
		new THREE.MeshBasicMaterial({color: green}),
		new THREE.MeshBasicMaterial({color: blue}),
		new THREE.MeshBasicMaterial({color: red}),
		new THREE.MeshBasicMaterial({color: green}),
		new THREE.MeshBasicMaterial({color: blue})
	];	

	

	
	let ombroEsq = new THREE.Mesh(new THREE.SphereGeometry(1,32, 32), new THREE.MeshBasicMaterial({color: 0xffffff})); // 0,10,5
	ombroEsq.position.x = -2.6;
	ombroEsq.position.y = 3.3;

	let pivoObroEsq = new THREE.Group();

	ombroEsq.add(pivoObroEsq);
	elements["pivoOmbroEsq"] = pivoObroEsq;

	let bracoEsqP1 = new THREE.Mesh(new THREE.BoxGeometry(1,5, 1), new THREE.MeshBasicMaterial({color: 0x00ff00})); // 0,10,5
	bracoEsqP1.position.x -= 0.2;
	bracoEsqP1.position.y = -2;
	pivoObroEsq.add(bracoEsqP1);


    let cotoveloEsq = new THREE.Mesh(new THREE.SphereGeometry(0.7,32, 32), new THREE.MeshBasicMaterial({color: 0xffffff})); // 0,10,5
	bracoEsqP1.add(cotoveloEsq);
    cotoveloEsq.position.y -= 2.5;

    let pivoCotoveloEsq = new THREE.Group();
    elements["pivoCotoveloEsq"] = pivoCotoveloEsq;
    cotoveloEsq.add(pivoCotoveloEsq)


	let bracoEsqP2 = new THREE.Mesh(new THREE.BoxGeometry(1,5, 1), new THREE.MeshBasicMaterial({color: 0x00ff00})); // 0,10,5
	bracoEsqP2.position.x -= 0.3;
	bracoEsqP2.position.y = -2.8;
	pivoCotoveloEsq.add(bracoEsqP2);




	//cubo.add(cubo1);
	
	scene.add(ombroEsq);
	//scene.add(pivo);
}


export function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 100 );
   // camera.position.z = -20;
    
    //cria o mundo
    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer( );
    renderer.setSize( window.innerWidth, window.innerHeight );

    criaMonstro();

    camera.position.z = 15;
    //necessário se queremos fazer algo com animação
    renderer.setAnimationLoop( nossaAnimacao );
    
    document.body.appendChild( renderer.domElement );

    renderer.render( scene, camera );


    window.addEventListener( 'resize', onWindowResize );

    document.addEventListener('keydown', onKeyDown);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

var rotacaoPivoOmbEsq = 0.01;

var onKeyDown = function (e){
    if (e.keyCode == 81){ // q
		if (elements["pivoOmbroEsq"].rotation.x < -2.8 || elements["pivoOmbroEsq"].rotation.x > 0.1)
			rotacaoPivoOmbEsq*=-1;

		
		elements["pivoOmbroEsq"].rotation.x-= rotacaoPivoOmbEsq;
        elements["pivoCotoveloEsq"].rotation.x-= 0.02;
		
		console.log("Rot "+ elements["pivoOmbroEsq"].rotation.x);
	}

}

var nossaAnimacao = function () {

   // objects["cubo1"].position.x+= velCubo;

    renderer.render( scene, camera );

}
