/**
** author:YorkChan
** date:2016-12-18
**/
var Gazing=false,targetMesh;
function Index() {
	this.init();
}
Index.prototype = {
	init: function() {
		var self = this;
		// 初始化场景
		this.scene = new THREE.Scene();
		// 初始化相机
		this.camera = new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,4000);
		this.camera.position.set( 0, 0, 0 );
		this.scene.add(this.camera);
		// 创建准心
		this.createCrosshair();
		// 初始化渲染器
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setSize(window.innerWidth,window.innerHeight);
		this.renderer.setClearColor(0x519EcB);
		this.renderer.shadowMapEnabled = true;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		document.querySelector('.main-page').appendChild(this.renderer.domElement);

		// 创建光线
		this.createLight();
		// 创建地面
		this.createGround(1000,1000);

		this.initGaze();
		// 初始化VR视觉控件
		this.initVR();
		// 创建立方体
		this.createCube();
		// 事件绑定
		this.bindEvent();
		this.render();
	},
	initVR() {
		// 初始化VR视觉控件
  		this.effect = new THREE.VREffect(this.renderer);
  		this.controls = new THREE.VRControls(this.camera);
  		// this.controls.standing = true;

		// Initialize the WebVR manager.
		this.manager = new WebVRManager(this.renderer, this.effect);
	},
	bindEvent: function() {
		var self = this;
		window.addEventListener( 'resize', function() {
			// 窗口调整重新调整渲染器
			self.camera.aspect = window.innerWidth / window.innerHeight;
			self.camera.updateProjectionMatrix();
			self.effect.setSize(window.innerWidth, window.innerHeight);
		}, false );
	},
	createCube: function () {
		// 创建立方体
		var self = this;
		var geometry = new THREE.CubeGeometry( 20,20,20);
		var Cubematerial = new THREE.MeshLambertMaterial( { color: 0xef6500,needsUpdate: true,opacity:1,transparent:true} );
		this.Cube = new THREE.Mesh( geometry, Cubematerial );
		this.Cube.position.set(20,0,-50);
		this.Cube.castShadow = true;
		this.scene.add(this.Cube);
		this.MESHLIST.push(this.Cube);
		this.Cube.gazeEvent = function() {
			self.Cube.material.opacity = 0.5;
		}
		this.Cube.blurEvent = function() {
			self.Cube.material.opacity = 1;
		}
	},
	createLight: function() {
		// 创建光线
        this.scene.add(new THREE.AmbientLight(0xFFFFFF));
        var light = new THREE.DirectionalLight( 0xffffff, 0.3 );
		light.position.set( 50, 50, 50 );
		light.castShadow = true;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 512;
		light.shadow.camera.near = 100;
		light.shadow.camera.far = 1200;
		light.shadow.camera.left = -1000;
		light.shadow.camera.right = 1000;
		light.shadow.camera.top = 350;
		light.shadow.camera.bottom = -350;
		this.scene.add( light );
	},
	createGround: function(width,height) {
		// 创建地平面
		this.gg = new THREE.PlaneBufferGeometry( width, height );
		var gm = new THREE.MeshPhongMaterial( { color: 0xaaaaaa } );
		this.ground = new THREE.Mesh( this.gg, gm );
		this.ground.rotation.x = - Math.PI / 2;
		this.ground.position.y = -10;
		this.ground.receiveShadow = true;
		this.scene.add( this.ground );
	},
	initGaze: function() {
		// 初始化射线发射源
		this.raycaster = new THREE.Raycaster();
		this.center = new THREE.Vector2();
		this.MESHLIST= [];
	},
	createCrosshair: function () {
		// 创建准心
		var crosshair = new THREE.Mesh(new THREE.RingGeometry( 0.02, 0.04, 32 ),new THREE.MeshBasicMaterial( {
			color: 0xffffff,
			opacity: 0.5,
			transparent: true
		}));
		crosshair.position.z = -2;
		this.camera.add( crosshair );
	},
	gaze: function() { 
		//创建凝视器
	    this.raycaster.setFromCamera(this.center, this.camera);
	    var intersects = this.raycaster.intersectObjects(this.MESHLIST);
	    
	    if (intersects.length > 0) { //凝视触发
	    	if(Gazing) return; //只触发一次
	    	Gazing = true;
	      	targetMesh = intersects[0].object;
	      	targetMesh.gazeEvent();
	    } else{ 
	    	if(Gazing) targetMesh.blurEvent();
	    	Gazing = false;
	    }
	},
	render: function() {
		// 启动渲染
		var self = this;
		var render = function() {
			self.Cube.rotation.y += 0.01;
			self.gaze();
			self.controls.update();
			self.manager.render(self.scene, self.camera);
			requestAnimationFrame(render);
		}
		render();
	}
};

new Index();