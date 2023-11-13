import {
	EventDispatcher,
	MOUSE,
	Quaternion,
	Spherical,
	TOUCH,
	Vector2,
	Vector3
} from 'three';

// import { EffectComposer } from '../postprocessing/EffectComposer.js';


// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

class OrbitControls extends EventDispatcher {

	constructor(object, domElement) {

		super();

		this.object = object;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none'; // disable touch scroll

		// Set to false to disable this control
		this.enabled = true;

		// "target" sets the location of focus, where the object orbits around
		this.target = new Vector3();

		// this.composer;

		// How far you can dolly in and out ( PerspectiveCamera only )
		this.minDistance = 0;
		this.maxDistance = Infinity;

		// How far you can zoom in and out ( OrthographicCamera only )
		this.minZoom = 0;
		this.maxZoom = Infinity;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
		this.minAzimuthAngle = - Infinity; // radians
		this.maxAzimuthAngle = Infinity; // radians

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.enableDamping = false;
		this.dampingFactor = 0.05;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		this.enableZoom = true;
		this.zoomSpeed = 1.0;

		// Set to false to disable rotating
		this.enableRotate = true;
		this.rotateSpeed = 1.0;

		// Set to false to disable panning
		this.enablePan = true;
		this.panSpeed = 1.0;
		this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

		// Set to true to automatically rotate around the target
		// If auto-rotate is enabled, you must call controls.update() in your animation loop
		this.autoRotate = false;
		this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

		// The four arrow keys
		this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

		// Mouse buttons
		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

		// Touch fingers
		this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();
		this.zoom0 = this.object.zoom;

		// the target DOM element for key events
		this._domElementKeyEvents = null;

		//
		// public methods
		//

		this.getPolarAngle = function () {

			return spherical.phi;

		};

		this.getAzimuthalAngle = function () {

			return spherical.theta;

		};

		this.getDistance = function () {

			return this.object.position.distanceTo(this.target);

		};

		this.listenToKeyEvents = function (domElement) {

			domElement.addEventListener('keydown', onKeyDown);
			this._domElementKeyEvents = domElement;

		};

		this.stopListenToKeyEvents = function () {

			this._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
			this._domElementKeyEvents = null;

		};

		this.saveState = function () {

			scope.target0.copy(scope.target);
			scope.position0.copy(scope.object.position);
			scope.zoom0 = scope.object.zoom;

		};

		this.reset = function () {

			scope.target.copy(scope.target0);
			scope.object.position.copy(scope.position0);
			scope.object.zoom = scope.zoom0;

			scope.object.updateProjectionMatrix();
			scope.dispatchEvent(_changeEvent);

			scope.update();

			state = STATE.NONE;

		};

		// 转动正面/背面函数主入口，direction定义要转到正面还是背面
		this.rotateAngle = function (direction) {

			const element = scope.domElement;

			//当前不在转动，并且朝向位置和要转向的位置相反，再响应鼠标的点击事件
			//向背面转动 
			if (!onRotationAnimChange && direction == "back") {
				onRotationAnimChange = true; //开始动画
				rotationChangeTo[0] = false;
				rotationChangeTo[1] = true; //变化到背面
				rotationChangeTo[2] = false;
				rotationChangeTo[3] = false;


				// 设置开始转动的位置
				startRotationAngle = spherical.theta;

				//设置转动的方向
				if (spherical.theta <= rotateToFront && spherical.theta > rotateToBack) {
					rotateClockwise = false
				}
				else {
					rotateClockwise = true
				}

				rotateToAngleAnim(); // 转到背面
				// console.log(onRotationAnimChange)
			}

			//当前不在转动，并且朝向位置和要转向的位置相反，再响应鼠标的点击事件
			//向正面转动
			if (!onRotationAnimChange && direction == "front") {
				onRotationAnimChange = true; //开始动画
				rotationChangeTo[0] = true; //变化到前面
				rotationChangeTo[1] = false;
				rotationChangeTo[2] = false;
				rotationChangeTo[3] = false;

				// 设置开始转动的位置
				startRotationAngle = spherical.theta;

				//设置转动的方向
				if (spherical.theta <= rotateToFront && spherical.theta > rotateToBack) {
					rotateClockwise = true
				}
				else {
					rotateClockwise = false
				}

				rotateToAngleAnim(); // 转到正面
				// console.log(spherical.theta)
			}

			//当前不在转动，并且朝向位置和要转向的位置相反，再响应鼠标的点击事件
			//向左面转动
			if (!onRotationAnimChange && direction == "left") {
				onRotationAnimChange = true; //开始动画
				rotationChangeTo[0] = false;
				rotationChangeTo[1] = false;
				rotationChangeTo[2] = true; //变化到左面
				rotationChangeTo[3] = false;

				// 设置开始转动的位置
				startRotationAngle = spherical.theta;

				//设置转动的方向
				if (spherical.theta <= rotateToLeft && spherical.theta > rotateToRight) {
					rotateClockwise = true
				}
				else {
					rotateClockwise = false
				}

				rotateToAngleAnim(); // 转到左面
				// console.log(spherical.theta)
			}

			//向右面转动
			if (!onRotationAnimChange && direction == "right") {
				onRotationAnimChange = true; //开始动画
				rotationChangeTo[0] = false;
				rotationChangeTo[1] = false;
				rotationChangeTo[2] = false;
				rotationChangeTo[3] = true; //变化到右面

				// 设置开始转动的位置
				startRotationAngle = spherical.theta;

				//设置转动的方向
				if (spherical.theta <= rotateToLeft && spherical.theta > rotateToRight) {
					rotateClockwise = false
				}
				else {
					rotateClockwise = true
				}

				rotateToAngleAnim(); // 转到右面
				// console.log(spherical.theta)
			}


		};

		// this method is exposed, but perhaps it would be better if we can make it private...
		this.update = function () {

			const offset = new Vector3();

			// so camera.up is the orbit axis
			const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
			const quatInverse = quat.clone().invert();

			const lastPosition = new Vector3();
			const lastQuaternion = new Quaternion();

			const twoPI = 2 * Math.PI;

			return function update() {

				const position = scope.object.position;

				offset.copy(position).sub(scope.target);

				// rotate offset to "y-axis-is-up" space
				offset.applyQuaternion(quat);

				// angle from z-axis around y-axis
				spherical.setFromVector3(offset);

				if (scope.autoRotate && state === STATE.NONE) {

					rotateLeft(getAutoRotationAngle());

				}

				if (scope.enableDamping) {

					spherical.theta += sphericalDelta.theta * scope.dampingFactor;
					spherical.phi += sphericalDelta.phi * scope.dampingFactor;

				} else {

					spherical.theta += sphericalDelta.theta;
					spherical.phi += sphericalDelta.phi;

				}

				// restrict theta to be between desired limits

				let min = scope.minAzimuthAngle;
				let max = scope.maxAzimuthAngle;

				if (isFinite(min) && isFinite(max)) {

					if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;

					if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;

					if (min <= max) {

						spherical.theta = Math.max(min, Math.min(max, spherical.theta));

					} else {

						spherical.theta = (spherical.theta > (min + max) / 2) ?
							Math.max(min, spherical.theta) :
							Math.min(max, spherical.theta);

					}

				}

				// restrict phi to be between desired limits
				spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

				spherical.makeSafe();

				spherical.radius *= scale;

				// restrict radius to be between desired limits
				spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

				// move target to panned location

				if (scope.enableDamping === true) {

					scope.target.addScaledVector(panOffset, scope.dampingFactor);

				} else {

					scope.target.add(panOffset);

				}

				offset.setFromSpherical(spherical);

				// rotate offset back to "camera-up-vector-is-up" space
				offset.applyQuaternion(quatInverse);

				position.copy(scope.target).add(offset);

				scope.object.lookAt(scope.target);

				if (scope.enableDamping === true) {

					sphericalDelta.theta *= (1 - scope.dampingFactor);
					sphericalDelta.phi *= (1 - scope.dampingFactor);

					panOffset.multiplyScalar(1 - scope.dampingFactor);

				} else {

					sphericalDelta.set(0, 0, 0);

					panOffset.set(0, 0, 0);

				}

				scale = 1;

				// update condition is:
				// min(camera displacement, camera rotation in radians)^2 > EPS
				// using small-angle approximation cos(x/2) = 1 - x^2 / 8

				if (zoomChanged ||
					lastPosition.distanceToSquared(scope.object.position) > EPS ||
					8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

					scope.dispatchEvent(_changeEvent);

					lastPosition.copy(scope.object.position);
					lastQuaternion.copy(scope.object.quaternion);
					zoomChanged = false;

					return true;

				}

				return false;

			};

		}();

		this.dispose = function () {

			scope.domElement.removeEventListener('contextmenu', onContextMenu);

			scope.domElement.removeEventListener('pointerdown', onPointerDown);
			scope.domElement.removeEventListener('pointercancel', onPointerCancel);
			scope.domElement.removeEventListener('wheel', onMouseWheel);

			scope.domElement.removeEventListener('pointermove', onPointerMove);
			scope.domElement.removeEventListener('pointerup', onPointerUp);


			if (scope._domElementKeyEvents !== null) {

				scope._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
				scope._domElementKeyEvents = null;

			}

			//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

		};

		//
		// internals
		//

		const scope = this;

		const STATE = {
			NONE: - 1,
			ROTATE: 0,
			DOLLY: 1,
			PAN: 2,
			TOUCH_ROTATE: 3,
			TOUCH_PAN: 4,
			TOUCH_DOLLY_PAN: 5,
			TOUCH_DOLLY_ROTATE: 6
		};

		let state = STATE.NONE;

		const EPS = 0.000001;

		// current position in spherical coordinates
		const spherical = new Spherical();
		const sphericalDelta = new Spherical();

		let scale = 1;
		const panOffset = new Vector3();
		let zoomChanged = false;

		const rotateStart = new Vector2();
		const rotateEnd = new Vector2();
		const rotateDelta = new Vector2();

		const panStart = new Vector2();
		const panEnd = new Vector2();
		const panDelta = new Vector2();

		const dollyStart = new Vector2();
		const dollyEnd = new Vector2();
		const dollyDelta = new Vector2();

		const pointers = [];
		const pointerPositions = {};

		//新增变量：帮助旋转动画
		let onRotationAnimChange = false;

		// let rotationChangeToBack = false; //是否要转到背面
		// let rotationChangeToFront = false; //是否要转到前面
		// let rotationChangeToLeft = false; //是否要转到左边
		// let rotationChangeToRight = false; //是否要转到右边
		// 要变换到哪个位置，四个布尔值分别对应“前”，“后”，“左”，“右”
		let rotationChangeTo = [false, false, false, false];

		let rotateClockwise = true; // 转的方向
		let startRotationAngle; // 开始转动的位置
		let rotateToBack = -0.75 * Math.PI
		let rotateToFront = 0.25 * Math.PI
		let rotateToLeft = 0.75 * Math.PI
		let rotateToRight = -0.25 * Math.PI



		function getAutoRotationAngle() {

			return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

		}

		// function getZoomScale() {

		// 	return Math.pow( 0.95, scope.zoomSpeed );

		// }

		function rotateLeft(angle) {

			sphericalDelta.theta -= angle;

		}

		// 比例映射函数，类似d3的map
		function mapRatio(minR, maxR, index) {
			if(minR>maxR)
			{
				let temp = minR;
				minR=maxR;
				maxR=temp;
			}
			// 把index在minR到maxR的比例映射到[-1，1]
			return (index - minR) / (maxR - minR) * 2 - 1;

		}

		// 按照当前位置，定义不同最大速度的缓进缓出速度映射函数
		function easeInOutSpeed() {
			// 缓动函数：(cos(pi*x) + 1) / 2 *（maxSpeed - minSpeed）+ minSpeed
			let minSpeed = 0.006;
			let maxSpeed = 0.05;

			//如果转动的幅度不大，maxSpeed变小
			//如果转到前面并且是小幅度
			if (rotationChangeTo[0] && startRotationAngle <= 0.75 * Math.PI && startRotationAngle >= -0.25 * Math.PI) {
				maxSpeed = 0.03;
			}
			//如果转到前面并且是非常小幅度
			if (rotationChangeTo[0] && startRotationAngle <= 0.5 * Math.PI && startRotationAngle >= 0 * Math.PI) {
				maxSpeed = 0.01;
			}
			//如果转到后面并且是小幅度
			if (rotationChangeTo[1] && ((startRotationAngle <= -0.25 * Math.PI && startRotationAngle >= -Math.PI) || (startRotationAngle <= Math.PI && startRotationAngle >= 0.75 * Math.PI))) {
				maxSpeed = 0.03;
			}
			//如果转到后面并且是非常小幅度
			if (rotationChangeTo[1] && startRotationAngle <= -0.5 * Math.PI && startRotationAngle >= -Math.PI) {
				maxSpeed = 0.01;
			}
			//如果转到左边并且是小幅度
			if (rotationChangeTo[2] && ((startRotationAngle >= 0.25 * Math.PI && startRotationAngle <= Math.PI) || (startRotationAngle <= -0.75 * Math.PI && startRotationAngle >= -Math.PI))) {
				maxSpeed = 0.03;
			}
			//如果转到左边并且是小幅度
			if (rotationChangeTo[2] && startRotationAngle >= 0.5 * Math.PI && startRotationAngle <= Math.PI) {
				maxSpeed = 0.01;
			}
			//如果转到右边并且是小幅度
			if (rotationChangeTo[3] && ((startRotationAngle <= 0 * Math.PI && startRotationAngle >= -0.75 * Math.PI) || (startRotationAngle >= 0 * Math.PI && startRotationAngle <= 0.25 * Math.PI))) {
				maxSpeed = 0.03;
			}
			//如果转到右边并且是小幅度
			if (rotationChangeTo[3] && startRotationAngle <= 0 * Math.PI && startRotationAngle >= -0.5 * Math.PI) {
				maxSpeed = 0.01;
			}

			// 需要转到的位置：rotateToBack / rotateToFront
			// 起始位置：startRotationAngle
			// 当前位置：spherial.theta

			// 需要转到的位置：rotateToBack
			// 起始位置：startRotationAngle
			// 当前位置：spherial.theta
			// mapRatio操作：先把已经转动的度数占总共要转多少度的比例映射到缓动函数的定义域[-1,1]上（因为有-1,1的越变，所以需要分类讨论），再给这个函数传递这个值求函数值，求出的就是根据当前位置需要缓动多少的[0,1]的值，再把这个值映射到[minSpeed, maxSpeed]上
			if (rotationChangeTo[1]) {
				if (startRotationAngle <= rotateToFront && startRotationAngle >= rotateToBack) {
					let ratio = mapRatio(rotateToBack, startRotationAngle, spherical.theta)
					// console.log(ratio)
					return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
				}
				else {
					if (startRotationAngle > 0) {
						if (spherical.theta > 0) {
							let ratio = mapRatio(startRotationAngle - 2 * Math.PI, rotateToBack, spherical.theta - 2 * Math.PI)
							// console.log(ratio)
							return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
						}
						else {

							let ratio = mapRatio(startRotationAngle - 2 * Math.PI, rotateToBack, spherical.theta)
							// console.log(ratio)
							return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
						}
					} else {
						let ratio = mapRatio(startRotationAngle, rotateToBack, spherical.theta)
						return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
					}
				}

			}
			// 需要转到的位置：rotateToFront
			else if (rotationChangeTo[0]) {
				if (startRotationAngle <= rotateToFront && startRotationAngle >= rotateToBack) {
					let ratio = mapRatio(startRotationAngle, rotateToFront, spherical.theta)
					// console.log(ratio)
					return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
				}
				else {
					if (startRotationAngle < 0) {
						if (spherical.theta < 0) {
							let ratio = mapRatio(rotateToFront, startRotationAngle + 2 * Math.PI, spherical.theta + 2 * Math.PI)
							// console.log(ratio)
							return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
						}
						else {

							let ratio = mapRatio(rotateToFront, startRotationAngle + 2 * Math.PI, spherical.theta)
							// console.log(ratio)
							return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
						}
					} else {
						let ratio = mapRatio(rotateToFront, startRotationAngle, spherical.theta)
						return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
					}
				}
			}
			else if (rotationChangeTo[2]) // 如果是转到左边
			{
				if (startRotationAngle <= rotateToLeft && startRotationAngle >= rotateToRight) {
					let ratio = mapRatio(startRotationAngle, rotateToLeft, spherical.theta)
					// console.log(ratio)
					return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
				}
				else {
					if (startRotationAngle < 0) {
						if (spherical.theta < 0) {
							let ratio = mapRatio(rotateToLeft, startRotationAngle + 2 * Math.PI, spherical.theta + 2 * Math.PI)
							// console.log(ratio)
							return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
						}
						else {

							let ratio = mapRatio(rotateToLeft, startRotationAngle + 2 * Math.PI, spherical.theta)
							// console.log(ratio)
							return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
						}
					} else {
						let ratio = mapRatio(rotateToLeft, startRotationAngle, spherical.theta)
						return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
					}
				}
			}
			else if (rotationChangeTo[3]) // 如果是转到右边
			{
				if (startRotationAngle <= rotateToLeft && startRotationAngle >= rotateToRight) {
					let ratio = mapRatio(rotateToRight, startRotationAngle, spherical.theta)
					// console.log(ratio)
					return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
				}
				else {
					if (startRotationAngle > 0) {
						if (spherical.theta > 0) {
							let ratio = mapRatio(startRotationAngle - 2 * Math.PI, rotateToRight,  spherical.theta - 2 * Math.PI)
							// console.log(ratio)
							return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
						}
						else {

							let ratio = mapRatio(startRotationAngle - 2 * Math.PI, rotateToRight, spherical.theta)
							// console.log(ratio)
							return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
						}
					} else {
						let ratio = mapRatio(startRotationAngle, rotateToRight, spherical.theta)
						return (Math.cos(Math.PI * ratio) + 1) / 2 * (maxSpeed - minSpeed) + minSpeed
					}
				}
			}


			// return 0.05;
		}

		// 转动动画的主要函数，通过每秒60帧不断重复调用自己，形成转动的动画
		function rotateToAngleAnim() {
			// 当前是sphetical.theta，要变到 -spherical.theta + angleTo

			//判定是否需要转动/是否已经转到目标位置了
			if (onRotationAnimChange) {
				if (rotationChangeTo[1]) // 如果是向后转动
				{
					// console.log(Math.abs(spherical.theta - rotateToBack))
					if (Math.abs(spherical.theta - rotateToBack) < 0.04) { //如果已经到达背面了

						//完全转到背面
						sphericalDelta.theta = -spherical.theta + rotateToBack;
						scope.update();

						onRotationAnimChange = false;
						rotationChangeTo[1] = false;
					}
				}
				else if (rotationChangeTo[0]) { // 如果是向前转动
					if (Math.abs(spherical.theta - rotateToFront) < 0.04) { //如果已经到达前面了

						//完全转到正面
						sphericalDelta.theta = -spherical.theta + rotateToFront;
						scope.update();

						onRotationAnimChange = false;
						rotationChangeTo[0] = false;
						// console.log(spherical.theta)
					}
				}
				else if (rotationChangeTo[2]) // 如果是向左转
				{
					if (Math.abs(spherical.theta - rotateToLeft) < 0.04) { //如果已经到达前面了

						//完全转到正面
						sphericalDelta.theta = -spherical.theta + rotateToLeft;
						scope.update();

						onRotationAnimChange = false;
						rotationChangeTo[2] = false;
						// console.log(spherical.theta)
					}
				}
				else if (rotationChangeTo[3]) // 如果是向右转
				{
					if (Math.abs(spherical.theta - rotateToRight) < 0.04) { //如果已经到达前面了

						//完全转到正面
						sphericalDelta.theta = -spherical.theta + rotateToRight;
						scope.update();

						onRotationAnimChange = false;
						rotationChangeTo[3] = false;
						// console.log(spherical.theta)
					}
				}
			}


			if (onRotationAnimChange) {
				// 固定步长：sphericalDelta.theta = 0.05;
				// 下面增加ease-in-out效果
				// console.log(easeInOutSpeed())
				if (rotateClockwise) {
					sphericalDelta.theta = easeInOutSpeed();
				}
				else {
					sphericalDelta.theta = -easeInOutSpeed();
				}
				// scope.composer.render();
				scope.update(); // 更新位置信息，渲染画面
				requestAnimationFrame(rotateToAngleAnim); //重新执行一次本函数
			}


		}

		// function rotateUp( angle ) {

		// 	sphericalDelta.phi -= angle;

		// }

		// const panLeft = function () {

		// 	const v = new Vector3();

		// 	return function panLeft( distance, objectMatrix ) {

		// 		v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
		// 		v.multiplyScalar( - distance );

		// 		panOffset.add( v );

		// 	};

		// }();

		// const panUp = function () {

		// 	const v = new Vector3();

		// 	return function panUp( distance, objectMatrix ) {

		// 		if ( scope.screenSpacePanning === true ) {

		// 			v.setFromMatrixColumn( objectMatrix, 1 );

		// 		} else {

		// 			v.setFromMatrixColumn( objectMatrix, 0 );
		// 			v.crossVectors( scope.object.up, v );

		// 		}

		// 		v.multiplyScalar( distance );

		// 		panOffset.add( v );

		// 	};

		// }();

		// deltaX and deltaY are in pixels; right and down are positive
		// const pan = function () {

		// 	const offset = new Vector3();

		// 	return function pan( deltaX, deltaY ) {

		// 		const element = scope.domElement;

		// 		if ( scope.object.isPerspectiveCamera ) {

		// 			// perspective
		// 			const position = scope.object.position;
		// 			offset.copy( position ).sub( scope.target );
		// 			let targetDistance = offset.length();

		// 			// half of the fov is center to top of screen
		// 			targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

		// 			// we use only clientHeight here so aspect ratio does not distort speed
		// 			panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
		// 			panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

		// 		} else if ( scope.object.isOrthographicCamera ) {

		// 			// orthographic
		// 			panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
		// 			panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

		// 		} else {

		// 			// camera neither orthographic nor perspective
		// 			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
		// 			scope.enablePan = false;

		// 		}

		// 	};

		// }();

		// function dollyOut( dollyScale ) {

		// 	if ( scope.object.isPerspectiveCamera ) {

		// 		scale /= dollyScale;

		// 	} else if ( scope.object.isOrthographicCamera ) {

		// 		scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
		// 		scope.object.updateProjectionMatrix();
		// 		zoomChanged = true;

		// 	} else {

		// 		console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
		// 		scope.enableZoom = false;

		// 	}

		// }

		// function dollyIn( dollyScale ) {

		// 	if ( scope.object.isPerspectiveCamera ) {

		// 		scale *= dollyScale;

		// 	} else if ( scope.object.isOrthographicCamera ) {

		// 		scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
		// 		scope.object.updateProjectionMatrix();
		// 		zoomChanged = true;

		// 	} else {

		// 		console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
		// 		scope.enableZoom = false;

		// 	}

		// }

		//
		// event callbacks - update the object state
		//

		function handleMouseDownRotate(event) {

			rotateStart.set(event.clientX, event.clientY);

		}

		// function handleMouseDownDolly( event ) {

		// 	dollyStart.set( event.clientX, event.clientY );

		// }

		// function handleMouseDownPan( event ) {

		// 	panStart.set( event.clientX, event.clientY );

		// }

		function handleMouseMoveRotate(event) {

			rotateEnd.set(event.clientX, event.clientY);

			rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

			const element = scope.domElement;

			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

			// rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight ); // 删除上下旋转的维度
			// console.log(sphericalDelta.theta)

			rotateStart.copy(rotateEnd);

			// console.log(spherical.theta / Math.PI)

			scope.update();

		}

		// function handleMouseMoveDolly( event ) {

		// 	dollyEnd.set( event.clientX, event.clientY );

		// 	dollyDelta.subVectors( dollyEnd, dollyStart );

		// 	if ( dollyDelta.y > 0 ) {

		// 		dollyOut( getZoomScale() );

		// 	} else if ( dollyDelta.y < 0 ) {

		// 		dollyIn( getZoomScale() );

		// 	}

		// 	dollyStart.copy( dollyEnd );

		// 	scope.update();

		// }

		// function handleMouseMovePan( event ) {

		// 	panEnd.set( event.clientX, event.clientY );

		// 	panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

		// 	pan( panDelta.x, panDelta.y );

		// 	panStart.copy( panEnd );

		// 	scope.update();

		// }

		// function handleMouseWheel( event ) {

		// 	if ( event.deltaY < 0 ) {

		// 		dollyIn( getZoomScale() );

		// 	} else if ( event.deltaY > 0 ) {

		// 		dollyOut( getZoomScale() );

		// 	}

		// 	scope.update();

		// }

		function handleKeyDown(event) {

			let needsUpdate = false;

			switch (event.code) {

				case scope.keys.UP:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						rotateUp(2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);

					} else {

						pan(0, scope.keyPanSpeed);

					}

					needsUpdate = true;
					break;

				case scope.keys.BOTTOM:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						rotateUp(- 2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);

					} else {

						pan(0, - scope.keyPanSpeed);

					}

					needsUpdate = true;
					break;

				case scope.keys.LEFT:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						rotateLeft(2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);

					} else {

						pan(scope.keyPanSpeed, 0);

					}

					needsUpdate = true;
					break;

				case scope.keys.RIGHT:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						rotateLeft(- 2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);

					} else {

						pan(- scope.keyPanSpeed, 0);

					}

					needsUpdate = true;
					break;

			}

			if (needsUpdate) {

				// prevent the browser from scrolling on cursor keys
				event.preventDefault();

				scope.update();

			}


		}

		function handleTouchStartRotate() {

			if (pointers.length === 1) {

				rotateStart.set(pointers[0].pageX, pointers[0].pageY);

			} else {

				const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
				const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

				rotateStart.set(x, y);

			}

		}

		// function handleTouchStartPan() {

		// 	if ( pointers.length === 1 ) {

		// 		panStart.set( pointers[ 0 ].pageX, pointers[ 0 ].pageY );

		// 	} else {

		// 		const x = 0.5 * ( pointers[ 0 ].pageX + pointers[ 1 ].pageX );
		// 		const y = 0.5 * ( pointers[ 0 ].pageY + pointers[ 1 ].pageY );

		// 		panStart.set( x, y );

		// 	}

		// }

		// function handleTouchStartDolly() {

		// 	const dx = pointers[ 0 ].pageX - pointers[ 1 ].pageX;
		// 	const dy = pointers[ 0 ].pageY - pointers[ 1 ].pageY;

		// 	const distance = Math.sqrt( dx * dx + dy * dy );

		// 	dollyStart.set( 0, distance );

		// }

		// function handleTouchStartDollyPan() {

		// 	if ( scope.enableZoom ) handleTouchStartDolly();

		// 	if ( scope.enablePan ) handleTouchStartPan();

		// }

		// function handleTouchStartDollyRotate() {

		// 	if ( scope.enableZoom ) handleTouchStartDolly();

		// 	if ( scope.enableRotate ) handleTouchStartRotate();

		// }

		// function handleTouchMoveRotate( event ) {

		// 	if ( pointers.length == 1 ) {

		// 		rotateEnd.set( event.pageX, event.pageY );

		// 	} else {

		// 		const position = getSecondPointerPosition( event );

		// 		const x = 0.5 * ( event.pageX + position.x );
		// 		const y = 0.5 * ( event.pageY + position.y );

		// 		rotateEnd.set( x, y );

		// 	}

		// 	rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

		// 	const element = scope.domElement;

		// 	rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

		// 	rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

		// 	rotateStart.copy( rotateEnd );

		// }

		// function handleTouchMovePan( event ) {

		// 	if ( pointers.length === 1 ) {

		// 		panEnd.set( event.pageX, event.pageY );

		// 	} else {

		// 		const position = getSecondPointerPosition( event );

		// 		const x = 0.5 * ( event.pageX + position.x );
		// 		const y = 0.5 * ( event.pageY + position.y );

		// 		panEnd.set( x, y );

		// 	}

		// 	panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

		// 	pan( panDelta.x, panDelta.y );

		// 	panStart.copy( panEnd );

		// }

		// function handleTouchMoveDolly( event ) {

		// 	const position = getSecondPointerPosition( event );

		// 	const dx = event.pageX - position.x;
		// 	const dy = event.pageY - position.y;

		// 	const distance = Math.sqrt( dx * dx + dy * dy );

		// 	dollyEnd.set( 0, distance );

		// 	dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, scope.zoomSpeed ) );

		// 	dollyOut( dollyDelta.y );

		// 	dollyStart.copy( dollyEnd );

		// }

		// function handleTouchMoveDollyPan( event ) {

		// 	if ( scope.enableZoom ) handleTouchMoveDolly( event );

		// 	if ( scope.enablePan ) handleTouchMovePan( event );

		// }

		// function handleTouchMoveDollyRotate( event ) {

		// 	if ( scope.enableZoom ) handleTouchMoveDolly( event );

		// 	if ( scope.enableRotate ) handleTouchMoveRotate( event );

		// }

		//
		// event handlers - FSM: listen for events and reset state
		//

		function onPointerDown(event) {

			if (scope.enabled === false) return;

			if (pointers.length === 0) {

				scope.domElement.setPointerCapture(event.pointerId);

				scope.domElement.addEventListener('pointermove', onPointerMove);
				scope.domElement.addEventListener('pointerup', onPointerUp);

			}

			//

			addPointer(event);

			if (event.pointerType === 'touch') {

				onTouchStart(event);

			} else {

				onMouseDown(event);

			}

		}

		function onPointerMove(event) {

			if (scope.enabled === false) return;

			if (event.pointerType === 'touch') {

				onTouchMove(event);

			} else {

				onMouseMove(event);

			}

		}

		function onPointerUp(event) {

			removePointer(event);

			if (pointers.length === 0) {

				scope.domElement.releasePointerCapture(event.pointerId);

				scope.domElement.removeEventListener('pointermove', onPointerMove);
				scope.domElement.removeEventListener('pointerup', onPointerUp);

			}

			scope.dispatchEvent(_endEvent);

			state = STATE.NONE;

		}

		function onPointerCancel(event) {

			removePointer(event);

		}

		function onMouseDown(event) {

			let mouseAction;

			switch (event.button) {

				case 0:

					mouseAction = scope.mouseButtons.LEFT;
					break;

				// case 1:

				// 	mouseAction = scope.mouseButtons.MIDDLE;
				// 	break;

				// case 2:

				// 	mouseAction = scope.mouseButtons.RIGHT;
				// 	break;

				default:

					mouseAction = - 1;

			}

			switch (mouseAction) {

				// case MOUSE.DOLLY:

				// 	if ( scope.enableZoom === false ) return;

				// 	handleMouseDownDolly( event );

				// 	state = STATE.DOLLY;

				// 	break;

				case MOUSE.ROTATE:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						// if ( scope.enablePan === false ) return;

						// handleMouseDownPan( event );

						// state = STATE.PAN;

					} else {

						if (scope.enableRotate === false) return;

						handleMouseDownRotate(event);

						state = STATE.ROTATE;

					}

					break;

				// case MOUSE.PAN:

				// 	if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

				// 		if ( scope.enableRotate === false ) return;

				// 		handleMouseDownRotate( event );

				// 		state = STATE.ROTATE;

				// 	} else {

				// 		if ( scope.enablePan === false ) return;

				// 		handleMouseDownPan( event );

				// 		state = STATE.PAN;

				// 	}

				// 	break;

				default:

					state = STATE.NONE;

			}

			if (state !== STATE.NONE) {

				scope.dispatchEvent(_startEvent);

			}

		}

		function onMouseMove(event) {

			switch (state) {

				case STATE.ROTATE:

					if (scope.enableRotate === false) return;

					handleMouseMoveRotate(event);

					break;

				case STATE.DOLLY:

					if (scope.enableZoom === false) return;

					handleMouseMoveDolly(event);

					break;

				case STATE.PAN:

					if (scope.enablePan === false) return;

					handleMouseMovePan(event);

					break;

			}

		}

		// function onMouseWheel(event) {

		// 	if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE) return;

		// 	event.preventDefault();

		// 	scope.dispatchEvent(_startEvent);

		// 	handleMouseWheel(event);

		// 	scope.dispatchEvent(_endEvent);

		// }

		function onKeyDown(event) {

			if (scope.enabled === false || scope.enablePan === false) return;

			handleKeyDown(event);

		}

		function onTouchStart(event) {

			trackPointer(event);

			switch (pointers.length) {

				case 1:

					switch (scope.touches.ONE) {

						case TOUCH.ROTATE:

							if (scope.enableRotate === false) return;

							handleTouchStartRotate();

							state = STATE.TOUCH_ROTATE;

							break;

						case TOUCH.PAN:

							if (scope.enablePan === false) return;

							handleTouchStartPan();

							state = STATE.TOUCH_PAN;

							break;

						default:

							state = STATE.NONE;

					}

					break;

				case 2:

					switch (scope.touches.TWO) {

						case TOUCH.DOLLY_PAN:

							if (scope.enableZoom === false && scope.enablePan === false) return;

							handleTouchStartDollyPan();

							state = STATE.TOUCH_DOLLY_PAN;

							break;

						case TOUCH.DOLLY_ROTATE:

							if (scope.enableZoom === false && scope.enableRotate === false) return;

							handleTouchStartDollyRotate();

							state = STATE.TOUCH_DOLLY_ROTATE;

							break;

						default:

							state = STATE.NONE;

					}

					break;

				default:

					state = STATE.NONE;

			}

			if (state !== STATE.NONE) {

				scope.dispatchEvent(_startEvent);

			}

		}

		function onTouchMove(event) {

			trackPointer(event);

			switch (state) {

				case STATE.TOUCH_ROTATE:

					if (scope.enableRotate === false) return;

					handleTouchMoveRotate(event);

					scope.update();

					break;

				case STATE.TOUCH_PAN:

					if (scope.enablePan === false) return;

					handleTouchMovePan(event);

					scope.update();

					break;

				case STATE.TOUCH_DOLLY_PAN:

					if (scope.enableZoom === false && scope.enablePan === false) return;

					handleTouchMoveDollyPan(event);

					scope.update();

					break;

				case STATE.TOUCH_DOLLY_ROTATE:

					if (scope.enableZoom === false && scope.enableRotate === false) return;

					handleTouchMoveDollyRotate(event);

					scope.update();

					break;

				default:

					state = STATE.NONE;

			}

		}

		function onContextMenu(event) {

			if (scope.enabled === false) return;

			event.preventDefault();

		}

		function addPointer(event) {

			pointers.push(event);

		}

		function removePointer(event) {

			delete pointerPositions[event.pointerId];

			for (let i = 0; i < pointers.length; i++) {

				if (pointers[i].pointerId == event.pointerId) {

					pointers.splice(i, 1);
					return;

				}

			}

		}

		function trackPointer(event) {

			let position = pointerPositions[event.pointerId];

			if (position === undefined) {

				position = new Vector2();
				pointerPositions[event.pointerId] = position;

			}

			position.set(event.pageX, event.pageY);

		}

		function getSecondPointerPosition(event) {

			const pointer = (event.pointerId === pointers[0].pointerId) ? pointers[1] : pointers[0];

			return pointerPositions[pointer.pointerId];

		}

		//

		scope.domElement.addEventListener('contextmenu', onContextMenu);

		scope.domElement.addEventListener('pointerdown', onPointerDown);
		scope.domElement.addEventListener('pointercancel', onPointerCancel);
		// scope.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

		// force an update at start

		this.update();

	}

}


// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move

class MapControls extends OrbitControls {

	constructor(object, domElement) {

		super(object, domElement);

		this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up

		// this.mouseButtons.LEFT = MOUSE.PAN;
		this.mouseButtons.RIGHT = MOUSE.ROTATE;

		// this.touches.ONE = TOUCH.PAN;
		// this.touches.TWO = TOUCH.DOLLY_ROTATE;

	}

}

export { OrbitControls, MapControls };
