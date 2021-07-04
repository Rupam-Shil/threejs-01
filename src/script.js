import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import gsap from 'gsap';
import { Plane } from 'three';
// Debug
const gui = new dat.GUI();
gui.hide();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

const geometry = {};
geometry.width = 19;
geometry.height = 14;
geometry.widthSegments = 30;
geometry.heightSegments = 18;

// Objects
let planeGeometry = new THREE.PlaneGeometry(
	geometry.width,
	geometry.height,
	geometry.widthSegments,
	geometry.heightSegments
);
const planeMaterial = new THREE.MeshStandardMaterial({
	vertexColors: true,
	flatShading: true,
	side: THREE.DoubleSide,
	metalness: 0.5,
	roughness: 0.4,
});
let plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

// const updateSphere = () => {
// 	planeGeometry.dispose();
// 	scene.remove(plane);
// 	planeGeometry = new THREE.PlaneGeometry(
// 		geometry.width,
// 		geometry.height,
// 		geometry.widthSegments,
// 		geometry.heightSegments
// 	);
// 	plane = new THREE.Mesh(planeGeometry, planeMaterial);
// 	scene.add(plane);

// 	const count = planeGeometry.attributes.position.count;
// 	const colorArray = new Float32Array(count * 3);

// 	for (let i = 0; i < count; i++) {
// 		const i3 = i * 3;
// 		const { array } = planeGeometry.attributes.position;
// 		array[i3 + 2] = Math.random();
// 		colorArray[i3] = 0;
// 		colorArray[i3 + 1] = 0.18;
// 		colorArray[i3 + 2] = 0.255;
// 	}

// 	planeGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
// };

// gui.add(geometry, 'width').min(5).max(20).step(1).onChange(updateSphere);
// gui.add(geometry, 'height').min(5).max(20).step(1).onChange(updateSphere);
// gui
// 	.add(geometry, 'widthSegments')
// 	.min(5)
// 	.max(50)
// 	.step(1)
// 	.onChange(updateSphere);
// gui
// 	.add(geometry, 'widthSegments')
// 	.min(5)
// 	.max(50)
// 	.step(1)
// 	.onChange(updateSphere);

/**
 * Add depth and colors
 */
const count = planeGeometry.attributes.position.count;
const colorArray = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {
	const i3 = i * 3;
	const { array } = planeGeometry.attributes.position;
	array[i3 + 2] = Math.random();
	colorArray[i3] = 0;
	colorArray[i3 + 1] = 0.18;
	colorArray[i3 + 2] = 0.255;
}
planeGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

planeGeometry.attributes.position.originalPosition =
	planeGeometry.attributes.position.array;
/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

//Mouse
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Lights

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 2, 3);
scene.add(directionalLight);
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight1.position.set(0, 0, -3);
scene.add(directionalLight1);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const clock = new THREE.Clock();

//vertexColors

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update raycaster
	raycaster.setFromCamera(mouse, camera);
	const object = raycaster.intersectObject(plane);
	if (object.length > 0) {
		for (const obj of object) {
			const { color } = obj.object.geometry.attributes;
			const initialColor = {
				r: 0,
				g: 0.18,
				b: 0.255,
			};
			const hoverColor = {
				r: 1,
				g: 0,
				b: 1,
			};
			gsap.to(hoverColor, {
				duration: 1,
				r: initialColor.r,
				g: initialColor.g,
				b: initialColor.b,
				onUpdate: () => {
					//vertex1
					color.setX(obj.face.a, hoverColor.r);
					color.setY(obj.face.a, hoverColor.g);
					color.setZ(obj.face.a, hoverColor.b);
					//vertex2
					color.setX(obj.face.b, hoverColor.r);
					color.setY(obj.face.b, hoverColor.g);
					color.setZ(obj.face.b, hoverColor.b);
					//vertex3
					color.setX(obj.face.c, hoverColor.r);
					color.setY(obj.face.c, hoverColor.g);
					color.setZ(obj.face.c, hoverColor.b);
					color.needsUpdate = true;
				},
			});
		}
	}

	// plane.rotation.z = elapsedTime * 0.05;

	for (let i = 0; i < count; i++) {
		const i3 = i * 3;
		const { array, originalPosition } = planeGeometry.attributes.position;
		array[i3 + 0] =
			originalPosition[i3 + 0] +
			Math.sin(Math.random() - 0.5 + elapsedTime * 0.5) * 0.01;
		array[i3 + 1] =
			originalPosition[i3 + 1] +
			Math.cos(Math.random() - 0.5 + elapsedTime) * 0.01;
	}
	planeGeometry.attributes.position.needsUpdate = true;

	// Update Orbital Controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
