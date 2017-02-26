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
		// 创建背景
		var bgTexture = new THREE.TextureLoader().load( './textures/2294472375_24a3b8ef46_o.jpg' );
		bgTexture.mapping = THREE.SphericalReflectionMapping;
		this.createPanorama(1000,bgTexture);
		this.createBalls(20,bgTexture,200);

		this.initGaze();
		// 初始化VR视觉控件
		this.initVR();
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
	createPanorama: function(radius,bgTexture) {
		// 创建全景
		this.pg = new THREE.SphereGeometry(radius,60,40);
		this.pg.scale( - 1, 1, 1 );
		var pm = new THREE.MeshBasicMaterial( { map: bgTexture } );
		this.panorama = new THREE.Mesh( this.pg, pm );
		// this.ground.position.y = -10;
		this.scene.add( this.panorama );
	},
	createBalls: function (radius,bgTexture,num) {
		// 创建全景
		this.pg = new THREE.SphereGeometry(radius,60,40);
		var pm = new THREE.MeshBasicMaterial( {color: 0xffffff, envMap: bgTexture } );
		for(var i = 0;i<num;i++){
			var ball = new THREE.Mesh( this.pg, pm );
			ball.position.set(Math.random()*1000 - 500,Math.random()*1000 - 500,Math.random()*1000 - 500);
			this.scene.add( ball );
			var d = 1;
			if(ball.position.y>0) d = -1;
			var tween = new TWEEN.Tween(ball.position)
			.to({y:ball.position.y+d*200*Math.random() -200},5000)
			.easing(TWEEN.Easing.Sinusoidal.InOut);
			var tweenback = new TWEEN.Tween(ball.position)
			.to({y:ball.position.y-d*200*Math.random() - 200},5000)
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			tween.chain(tweenback);
			tweenback.chain(tween);
			tween.start();
		}
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
			self.gaze();
			self.controls.update();
			TWEEN.update();
			self.manager.render(self.scene, self.camera);
			requestAnimationFrame(render);
		}
		render();
	}
};

new Index();