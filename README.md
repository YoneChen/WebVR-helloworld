# WebVR-helloworld
a webVR 'hello world' project base in three.js

![WebVR未来新潮](http://upload-images.jianshu.io/upload_images/1939855-947df10d4260d1fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

去年谷歌和火狐针对WebVR提出了WebVR API的标准，顾名思义，WebVR即web + VR的体验方式，我们可以戴着头显享受沉浸式的网页，新的API标准让我们可以使用js语言来开发。今天，约克先森将介绍如何开发一个WebVR网页，在此之前，我们有必要了解WebVR的体验方式。

### WebVR体验模式
---

![体验WebVR的方式](http://upload-images.jianshu.io/upload_images/1939855-e2070b8dec8ba830.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
***WebVR的体验方式可以分为VR模式和裸眼模式***

##### VR模式

***1.Mobile VR***

如使用cardboard眼镜来体验手机浏览器的webVR网页，浏览器将根据水平陀螺仪的参数来获取用户的头部倾斜和转动的朝向，并告知页面需要渲染哪一个朝向的场景。

***2.PC VR***

通过佩戴Oculus Rift的分离式头显浏览连接在PC主机端的网页，现支持WebVR API的浏览器主要是火狐的 [Firefox Nightly](https://nightly.mozilla.org/)和设置VR enabled的谷歌chrome beta。

##### 裸眼模式

除了VR模式下的体验方式，这里还考虑了裸眼下的体验浏览网页的方式，在PC端如果探测的用户选择进入VR模式，应让用户可以使用鼠标拖拽场景，而在智能手机上则应让用户可以使用touchmove或旋转倾斜手机的方式来改变场景视角。
WebVR的概念大概就如此，这次我们将采用cardboard + mobile的方式来测试我们的WebVR场景，现在踏上我们的开发之旅。

### 准备工作
---
>测试工具：智能手机 + cardboard式头显 + chrome beta 60+（需开启WebVR选项）

如果你练就了裸眼就能将手机双屏画面看成单屏的能力也可以省下头显。

>技术和框架：three.js for WebGL

[Three.js](http://threejs.org)是构建3d场景的框架，它封装了WebGL函数，简化了创建场景的代码成本，利用three.js我们可以更优雅地创建出三维场景和三维动画，这里我使用的是0.86版本。
如果想了解纯WebGL开发WebVR应用以及WebVR具体环境配置，可以参考 [webvr教程--深度剖析](https://zhuanlan.zhihu.com/p/28324884)。

> 需要引入的js插件：
  1.[three.min.js](https://github.com/mrdoob/three.js/blob/dev/build/three.min.js)
  2.[webvr-polyfill.js](https://github.com/googlevr/webvr-polyfill/)

###### webvr-polyfill.js
由于[WebVR API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebVR_API)还没被各大主流浏览器支持，因此需要引入webvr-polyfill.js来支持WebVR网页，它提供了大量VR相关的API，比如Navigator.getVRDisplay()获取VR头显信息的方法。

# 3D场景构建
---
首先我们创建一个HTML文件
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0, shrink-to-fit=no">
    <title>webVR-helloworld</title>
    <style type="text/css">
    * {
	    margin: 0;
	    padding: 0;
    }
    html,body {
        height: 100%;
        overflow: hidden;
    }
    </style>
</head>
<body>
</body>
<script src="./vendor/three.min.js"></script>
<script src="./vendor/webvr-polyfill.js"></script>
<script></script>
</html>
```
接下来编写js脚本，开始创建我们的3d场景。
###### 1.创建场景

Three.js中的scene场景是绘制我们3d对象的整个容器
```
var scene = new THREE.Scene();
```

###### 2.添加相机

![Three.js的相机](http://upload-images.jianshu.io/upload_images/1939855-c08215f1d0ce4f7c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Three.js中的camera相机代表用户的眼睛，我们通过设置FOV确定视野范围，
```
//定义一个60°的视角，视线范围在1到1000的透视相机
var camera = new THREE. new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1000);
scene.add(camera);
```

###### 3.添加渲染器

Three.js的渲染器用来渲染camera所看到的画面

```
//初始化渲染器 antialias参数为ture表示开启抗锯齿策略
const renderer = new THREE.WebGLRenderer({ antialias: true } );
//设置渲染器渲染尺寸
renderer.setSize(window.innerWidth,window.innerHeight);
//设置渲染背景为白色
renderer.setClearColor(0xeeeeee);
//将渲染场景的canvas放入body标签里
document.body.appendChild(renderer.domElement);
```

###### 4.添加一个立方体网格

```
// 创建立方体
const geometry = new THREE.CubeGeometry( 10,10,10);
const material = new THREE.MeshLambertMaterial( { color: 0xef6500,needsUpdate: true,opacity:1,transparent:true} );
const cube = new THREE.Mesh( geometry, material );
cube.position.set(0,100,-50);
cube.rotation.set(Math.PI/6,Math.PI/4,0);
scene.add(cube);
```

###### 5.启动动画

动画渲染的原理：渲染器的持续调用绘制方法，方法里动态改变物体的属性。
旧版的three.js需要手动调用requestAnimationFrame()方法递归的方式来渲染动画，新版three.js已经封装了该属性，因此只需要通过渲染器`renderer.animate(callback)`。

```
function update() {
    //让立方体旋转
    cube.rotation.y += 0.01;
    //渲染器渲染场景，等同于给相机按下快门
    renderer.render(scene, camera);
}
renderer.animate(update);//启动动画
```


![基本的3d场景](http://upload-images.jianshu.io/upload_images/1939855-360784613bdb2134.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

至此，我们已经绘制了一个简单的3d场景并且让它动了起来，接下来，我们需要让我们的场景可以支持WebVR模式。

 # WebVR场景开发
---
WebVR网页开发的基本原理是通过WebVR API获取VR动态数据（VR Display frameData），渲染器根据VR数据来分别绘制左右屏场景，具体步骤如下：
1. 使用`navigator.getVRDisplays`获取vr设备示例
![WebVR网页分屏](http://upload-images.jianshu.io/upload_images/1939855-1dcc4cb9af23b8be.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
vrdisplay是vr设备的实例，我们需要将它传给当前运行的renderer渲染器。
```
function initVR(renderer) {
    renderer.vr.enabled = true;
    navigator.getVRDisplays().then( display => {
        renderer.vr.setDevice(display[0]);
        const button = document.querySelector('.vr-btn');
        VRbutton(display[0],renderer,button,() => button.textContent = '退出VR',() => button.textContent = '进入VR');
    }).catch(err => console.warn(err));
}

```
这里需要通过按钮来控制当前的渲染模式：
1. 当点击按钮时，根据`display.isPresenting`判断当前是否是使用vr设备下进行渲染，如果false，进入2，否则true进入3
2. 当前非VR模式，点击按钮进入VR模式，此时调用`display.requestPresent()`，`display.isPresenting`被设置为true，触发window的`vrdisplaypresentchange`事件
3. 当前为VR模式，点击按钮退出模式，此时调用`display.exitPresent()`，`display.isPresenting`被设置为false，触发window的`vrdisplaypresentchange`事件
```
// VR按钮控制
const VRbutton = {
	/** 
	 * @param {VRDisplay} display VRDisplay实例
	 * @param {THREE.WebGLRenderer} renderer 渲染器
	 * @param {HTMLElement} button VR控制按钮
	 * @param {Function} enterVR 点击进入VR模式时回调
	 * @param {Function} exitVR 点击退出VR模式时回调
	 **/
    init(display,renderer,button,enterVR = () => {},exitVR = () => {}) {
        
        if ( display ) {
            button.addEventListener('click', e => {
                // 点击vr按钮控制`isPresenting`状态
                display.isPresenting ? display.exitPresent() : display.requestPresent( [ { source: renderer.domElement } ] );

            });

            window.addEventListener( 'vrdisplaypresentchange', e => {
                // 是否处于vr体验模式中，是则触发enterVR，否则触发exitVR
                display.isPresenting ? enterVR() : exitVR();
            }, false );

        } else {
            // 找不到vr设备实例，则移除按钮
            button.remove();

        }
    }
}

```
我们可以在`vrdisplaypresentchange`事件中根据`isPresenting`的值来改变按钮的UI，而three.js将根据`isPresenting`的值来决定是常规渲染还是vr模式渲染，在vr模式下，three.js将创建两个camera进行渲染。


最后，将WebVR应用写成一个class，具体代码如下：
```
class WebVRApp {
	constructor() {
		// 初始化场景
		this.scene = new THREE.Scene();
		// 初始化相机
		this.camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000);
		this.scene.add(this.camera);

		// 初始化渲染器
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setSize(window.innerWidth,window.innerHeight);
		this.renderer.setClearColor(0x519EcB);
		this.renderer.shadowMapEnabled = true;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		document.querySelector('.main-page').appendChild(this.renderer.domElement);

		this.clock = new THREE.Clock();
		// VR初始化
		this.initVR();
		// 往场景添加3d物体
		this.start();
		// 窗口大小调整监听
		window.addEventListener( 'resize', this.resize.bind(this), false );
		// 渲染动画
		this.renderer.animate(this.update.bind(this));
	}
    // 创建3d物体
	start() {
		const {scene,camera} = this;
		// 创建光线
		scene.add(new THREE.AmbientLight(0xFFFFFF));
		scene.add(this.createLight());
		// 创建地面
		scene.add(this.createGround(1000,1000));
		// 创建立方体
		this.cube = this.createCube(2,2,2, 2,-1,-3);
	}
    // VR模式初始化
	initVR() {
		const {renderer} = this;
		renderer.vr.enabled = true;
		// 获取VRDisplay实例
		navigator.getVRDisplays().then( display => {
			// 将display实例传给renderer渲染器
			renderer.vr.setDevice(display[0]);
			const button = document.querySelector('.vr-btn');
			VRButton.init(display[0],renderer,button,() => button.textContent = '退出VR',() => button.textContent = '进入VR');
		}).catch(err => console.warn(err));
	}
    // 窗口调整监听
	resize() {
		const {camera,renderer} = this;
		// 窗口调整重新调整渲染器
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	createCube(width=2,height=2,depth=2, posX,posY,posZ) {
		// 创建立方体
		const geometry = new THREE.CubeGeometry(width,height,depth);
		const material = new THREE.MeshLambertMaterial({ 
			color: 0xef6500,
			needsUpdate: true,
			opacity:1,
			transparent:true
		});
		const cube = new THREE.Mesh( geometry, material );
        cube.position.set({
            x: posX,
            y: posY,
            z: posZ
        });
		cube.castShadow = true;
		return cube;
	}
	createLight() {
		// 创建光线
        const light = new THREE.DirectionalLight( 0xffffff, 0.3 );
		light.position.set( 50, 50, -50 );
		light.castShadow = true;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 512;
		return light;
	}
	createGround(width,height) {
		// 创建地平面
		const geometry = new THREE.PlaneBufferGeometry( width, height );
		const material = new THREE.MeshPhongMaterial( { color: 0xaaaaaa } );
		const ground = new THREE.Mesh( geometry, material );
		ground.rotation.x = - Math.PI / 2;
		ground.position.y = -10;
		ground.receiveShadow = true;
		return ground;
	}
    // 动画更新
	update() {
		const {scene,camera,renderer,clock} = this;
		const delta = clock.getDelta() * 60;
		// 启动渲染
		this.cube.rotation.y += 0.1 * delta;
		renderer.render(scene, camera);
	}
}
new WebVRApp();
```
![demo示例](http://upload-images.jianshu.io/upload_images/1939855-a11072a1eea3550e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

完整代码：[github.com/YoneChen/WebVR-helloworld](https://github.com/YoneChen/WebVR-helloworld)。

结语：目前，国外的谷歌、火狐、Facebook和国内百度已推出支持WebVR浏览器的版本，微软也宣布将推出自己的VR浏览器，随着后期5g网络极速时代的到来以及HMD头显的价格和平台的成熟，WebVR的体验方式将是革命性的，用户通过WebVR浏览网上商店，线上教学可进行“面对面”师生交流等，基于这种种应用场景，我们可以找到一个更好的动力去学习WebVR。

参考链接：
[responisve WebVR](http://smus.com/responsive-vr/): 探讨WebVR在不同头显(HMD)的适配方案
[MolizaVR example](https://mozvr.com/#showcase): 火狐WebVR示例
[webvr-boilerplate](https://github.com/borismus/webvr-boilerplate): A starting point for web-based VR experiences that work on all VR headsets.
[how to build webvr](https://www.sitepoint.com/how-to-build-vr-on-the-web-today/): How to Build VR on the Web Today
