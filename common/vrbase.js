
class VRBase {
	constructor({ renderElement,buttonElement }) {
		this.renderElement = renderElement;
		this.buttonElement = buttonElement;
		// 初始化场景
		this.scene = new THREE.Scene();
		// 初始化相机
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.scene.add(this.camera);

		// 初始化渲染器
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMapEnabled = true;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		renderElement.appendChild(this.renderer.domElement);

		this.clock = new THREE.Clock();
		// VR初始化
		this._initVR();
		// 往场景添加3d物体
		this.start();
		// 窗口大小调整监听
		window.addEventListener('resize', this._resize.bind(this), false);
		// 渲染动画
		this.renderer.animate(this._animate.bind(this));
	}
	start() {}
	update() {}
	_initVR() {
		const { renderer, buttonElement} = this;
		renderer.vr.enabled = true;
		// 获取VRDisplay实例
		navigator.getVRDisplays().then(display => {
			// 将display实例传给renderer渲染器
			renderer.vr.setDevice(display[0]);
			VRButton.init(display[0], renderer, buttonElement, () => buttonElement.textContent = '退出VR', () => buttonElement.textContent = '进入VR');
		}).catch(err => console.warn(err));
	}
	_resize() {
		const { camera, renderer } = this;
		// 窗口调整重新调整渲染器
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	_animate() {
		const { scene, camera, renderer } = this;
		// 启动渲染
		this.update();
		renderer.render(scene, camera);
	}
}
// VR按钮控制
const VRButton = {
	/** 
	 * @param {VRDisplay} display VRDisplay实例
	 * @param {THREE.WebGLRenderer} renderer 渲染器
	 * @param {HTMLElement} button VR控制按钮
	 * @param {Function} enterVR 点击进入VR模式时回调
	 * @param {Function} exitVR 点击退出VR模式时回调
	 **/
	init(display, renderer, button, enterVR, exitVR) {
		if (display) {
			button.addEventListener('click', e => {
				display.isPresenting ? display.exitPresent() : display.requestPresent([{ source: renderer.domElement }]);
			});
			window.addEventListener('vrdisplaypresentchange', e => {
				display.isPresenting ? enterVR() : exitVR();
			}, false);
		} else {
			button.remove();
		}
	}
}