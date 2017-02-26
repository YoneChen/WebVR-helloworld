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
		this.camera = new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,10000);
		this.camera.position.set( 0, 0, 5000 );
		this.scene.add(this.camera);
		// this.scene.fog	= new THREE.FogExp2( 0xd0e0f0, 0.001 );
		// 创建准心
		this.createCrosshair();
		// 初始化渲染器
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setSize(window.innerWidth,window.innerHeight);
		this.renderer.setClearColor(0x111111);
		this.renderer.shadowMapEnabled = true;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		document.querySelector('.main-page').appendChild(this.renderer.domElement);

		// 创建光线
		this.createLight();

		this.initGaze();
		// 初始化VR视觉控件
		this.initVR();
		this.createEarth();
		this.createParticles(100000,2,5000);
		this.createAudio();
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
	createAudio: function() {
		// 初始化一个侦听器
		var audioListener = new THREE.AudioListener();

		// 添加该侦听器到相机中
		this.camera.add( audioListener );

		// 实例化一个音频（环境音）对象
		var sound = new THREE.Audio( audioListener );

		// 把该对象添加到场景中去
		this.scene.add( sound );

		// 实例化一个加载器
		var loader = new THREE.AudioLoader();
		loader.load(
			// 资源链接
			'./audio/space.wav',
			// 资源加载完成后的回调函数
			function ( audioBuffer ) {
				// set the audio object buffer to the loaded object
				sound.setBuffer( audioBuffer );

				// 播放音频
				sound.play();
				sound.setLoop(true);
			},
			// 资源加载过程中的回调函数
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// 资源下载错误的回调函数
			function ( xhr ) {
				console.log( 'An error happened' );
			}
		);
	},
	createEarth: function() {
		// 创建立方体
		var self = this;
		var geometry = new THREE.SphereGeometry( 100,50,50);
		var map = new THREE.TextureLoader().load("./textures/marsmap.jpg");
		var bumpmap = new THREE.TextureLoader().load("./textures/marsbump.jpg");
		// var specularmap = new THREE.TextureLoader().load("./textures/earthspec.jpg");
		var material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			map:map,
			bumpMap:bumpmap,bumpScale: 5,	
			// specularMap	: specularmap,specular: new THREE.Color('grey'),
			needsUpdate: true,
			// opacity:1,transparent:true
			});
		this.Earth = new THREE.Mesh( geometry, material );
		this.Earth.position.set(10,100,-300);
		this.scene.add(this.Earth);
		// this.MESHLIST.push(this.Earth);
		// this.Cube.gazeEvent = function() {
		// 	self.Cube.material.opacity = 0.5;
		// }
		// this.Cube.blurEvent = function() {
		// 	self.Cube.material.opacity = 1;
		// }
	},
	createParticles: function(num,size,area) {
		var drawArc = function() {
			// body...
			var canvas = document.createElement('canvas');
			canvas.width	= 100;
			canvas.height	= 100;
			var ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.arc(50,50,50, 0 ,2*Math.PI,true);
			ctx.fillStyle = "#ffffff";
			ctx.fill();
			return canvas;
		};
		var texture = new THREE.Texture(drawArc());
		texture.needsUpdate	= true;
		var geometry = new THREE.Geometry();
		for ( i = 0; i < num; i ++ ) {

			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * 1000 - 500;
			vertex.y = Math.random() * 1000 - 500;
			vertex.z = Math.random() * 10000 - 5000;

			geometry.vertices.push( vertex );

		}
		var material = new THREE.PointsMaterial( { size: 1,color: 0xffffff ,sizeAttenuation:false, transparent: true } );
		var stars = new THREE.Points(geometry,material);
		this.scene.add(stars);
		// 		var texture = new THREE.Texture(drawArc());
		// texture.needsUpdate	= true;
		// var geometry = new THREE.BufferGeometry();
		// var positions = new Float32Array( num * 3 );
		// for ( i = 0; i < positions.length; i ++ ) {
		// 	positions[i] = Math.random() * 500 - 250;
		// 	positions[i+1] = Math.random() * 250;
		// 	positions[i+2] = Math.random() * 500 - 500;

		// }
		// geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		// var material = new THREE.PointsMaterial( { size: 0.5,map: texture } );
		// // body...
		// var star = new THREE.Points(geometry,material);
		// this.scene.add(star);
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
			self.camera.position.z -= 5;
			self.Earth.rotation.y += 0.1;
			self.gaze();
			self.controls.update();
			self.manager.render(self.scene, self.camera);
			requestAnimationFrame(render);
		}
		render();
	}
};

new Index();