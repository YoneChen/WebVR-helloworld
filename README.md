# WebVR-helloworld
a webVR 'hello world' project base in three.js
![WebVR未来新潮](http://upload-images.jianshu.io/upload_images/1939855-947df10d4260d1fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

去年谷歌和火狐针对WebVR提出了WebVR API的标准，顾名思义，WebVR即web + VR的体验方式，我们可以戴着头显享受沉浸式的网页，新的API标准让我们可以使用js语言来开发。今天，约克先森将介绍如何开发一个WebVR网页，在此之前，我们有必要了解WebVR的体验方式。

###WebVR体验模式
---

![体验WebVR的方式](http://upload-images.jianshu.io/upload_images/1939855-e2070b8dec8ba830.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
***WebVR的体验方式可以分为VR模式和裸眼模式***
#####VR模式
***1.滑配式HMD + 移动端浏览器***
如使用cardboard眼镜来体验手机浏览器的webVR网页，浏览器将根据水平陀螺仪的参数来获取用户的头部倾斜和转动的朝向，并告知页面需要渲染哪一个朝向的场景。

***2.分离式HMD + PC端浏览器***
通过佩戴Oculus Rift的分离式头显浏览连接在PC主机端的网页，现支持WebVR API的浏览器主要是火狐的 [Firefox Nightly](https://nightly.mozilla.org/)和设置VR enabled的谷歌chrome beta。
#####裸眼模式
除了VR模式下的体验方式，这里还考虑了裸眼下的体验浏览网页的方式，在PC端如果探测的用户选择进入VR模式，应让用户可以使用鼠标拖拽场景，而在智能手机上则应让用户可以使用touchmove或旋转倾斜手机的方式来改变场景视角。
WebVR的概念大概就如此，这次我们将采用cardboard + mobile的方式来测试我们的WebVR场景，现在踏上我们的开发之旅。
###准备工作
---
>技术和框架：three.js for WebGL

[Three.js](http://threejs.org)是构建3d场景的框架，它封装了WebGL函数，简化了创建场景的代码成本，利用three.js我们可以更优雅地创建出三维场景和三维动画。
>测试工具：智能手机 + 滑配式头显

推荐使用cardboard或者某宝上三十块钱的高仿货。当然，如果你练就了裸眼就能将手机双屏画面看成单屏的能力也可以忽略。


> 需要引入的js插件：
  1.[three.min.js](https://github.com/mrdoob/three.js/blob/dev/build/three.min.js)
  2.[webvr-polyfill.js](https://github.com/googlevr/webvr-polyfill/)
  3.[VRcontrols.js](https://github.com/mrdoob/three.js/blob/master/examples/js/controls/VRControls.js)
  4.[VReffect.js](https://github.com/mrdoob/three.js/blob/master/examples/js/effects/VREffect.js)
5.[webvr-manager.js](https://github.com/borismus/webvr-boilerplate/blob/master/build/webvr-manager.js)

######webvr-polyfill.js
由于[WebVR API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebVR_API)还没被各大主流浏览器支持，因此需要引入webvr-polyfill.js来支持WebVR网页，它提供了大量VR相关的API，比如Navigator.getVRDevices()获取VR头显信息的方法。

######VRControls.js
VR控制器，是three.js的一个相机控制器对象，引入VRcontrols.js可以根据用户在空间的朝向渲染场景，它通过调用WebVR API的orientation值控制camera的rotation属性。

######VREffect.js
VR分屏器，这是three.js的一个场景分屏的渲染器，提供戴上VR头显的显示方式，VREffect.js重新创建了左右两个相机，对场景做二次渲染，产生双屏效果。

######webvr-manager.js
这是WebVR的方案适配插件，它提供PC端和移动端的两种适配方式，通过new WebVRManager()可以生成一个VR图标，提供VR模式和裸眼模式的不同体验，当用户在移动端点击按钮进入VR模式时，WebVRManager便会调用VREffect分屏器进行分屏，而退出VR模式时，WebVRManager便用回renderer渲染器进行单屏渲染。
具体使用方法我们将在下文说明。
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
<script src="./vendor/VRControls.js"></script>
<script src="./vendor/VREffect.js"></script>
<script src="./vendor/webvr-manager.js"></script>
<script src="./main.js"></script>
</html>
```
接下来编写js脚本，开始创建我们的3d场景。
######1.创建场景

Three.js中的scene场景是绘制我们3d对象的整个容器
```
var scene = new THREE.Scene();
```

######2.添加相机

![Three.js的相机](http://upload-images.jianshu.io/upload_images/1939855-c08215f1d0ce4f7c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Three.js中的camera相机代表用户的眼睛，我们通过设置FOV确定视野范围，
```
//定义一个60°的视角，视线范围在1到1000的透视相机
var camera = new THREE. new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1000);
scene.add(camera);
```

######3.添加渲染器

Three.js的渲染器用来渲染camera所看到的画面

```
//初始化渲染器 antialias参数为ture表示开启抗锯齿策略
var renderer = new THREE.WebGLRenderer({ antialias: true } );
//设置渲染器渲染尺寸
renderer.setSize(window.innerWidth,window.innerHeight);
//设置渲染背景为白色
renderer.setClearColor(0xeeeeee);
//将渲染场景的canvas放入body标签里
document.body.appendChild(renderer.domElement);
```

######4.添加一个立方体网格

```
// 创建立方体
var geometry = new THREE.CubeGeometry( 10,10,10);
var cubematerial = new THREE.MeshLambertMaterial( { color: 0xef6500,needsUpdate: true,opacity:1,transparent:true} );
var cube = new THREE.Mesh( geometry, Cubematerial );
cube.position.set(0,100,-50);
cube.rotation.set(Math.PI/6,Math.PI/4,0);
scene.add(cube);
```

###### 5.启动动画

产生动画的原理就是让camera持续连拍，同时每一次改变物体的属性，通过requestAnimationFrame()方法递归的方式来持续更新场景对象属性，你可以将它理解为setTimeout的优化版。相比setTimeout函数，requestAnimationFrame可以保证动画渲染不会因为主线程的阻塞而造成跳帧。
```
function animate() {
    //让立方体旋转
    cube.rotation.y += 0.01;
    //渲染器渲染场景，等同于给相机按下快门
    renderer.render(scene, camera);
    //递归运行该函数
    requestAnimationFrame( animate );
}
animate();//启动动画
```


![基本的3d场景](http://upload-images.jianshu.io/upload_images/1939855-360784613bdb2134.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

至此，我们已经绘制了一个简单的3d场景并且让它动了起来，接下来，我们需要让我们的场景可以支持WebVR模式。

 #WebVR场景开发
---
WebVR网页的基本原理其实是通过浏览器的WebVR API获取用户输入，进而控制相机的视角，在VR模式下通过VR控制器和VR分屏器以二分屏+gyroscope(使用水平陀螺仪)的方式显示画面，裸眼情况下提供全屏+touchmove/gyroscope。
![WebVR网页分屏](http://upload-images.jianshu.io/upload_images/1939855-1dcc4cb9af23b8be.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

现在我们开始分别创建上文所说的VR控制器和VR分屏器
```
//初始化VR控制器需要传入场景相机
var vrControls = new THREE.VRControls(camera);
//初始化VR渲染器需要传入场景渲染器
var vrEffect = new THREE.VREffect(renderer);
//初始化VR适配器，传入渲染器和分屏器
var vrManager = new WebVRManager(renderer, vrEffect);
```
然后在前面创建的场景渲染函数里调用
```
function animate() {
    cube.rotation.y += 0.01;
    //实时更新相机的位置和转角
    vrControls.update(); 
    vrManager.render(scene, camera);
    //递归运行该函数
    requestAnimationFrame( animate );
}
```


至此，我们已经完成了一个基本的webVR网页，不过少了点交互效果好像，敬请期待Web开发的新世界---WebVR之交互事件。

![添加分屏效果](http://upload-images.jianshu.io/upload_images/1939855-a11072a1eea3550e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

>+ [完整代码](https://github.com/YorkChan94/WebVR-helloworld)：在文章基础上添加了天空和地面相关代码，以及下篇文章将讲到VR凝视交互事件。
+ [demo演示地址](https://yorkchan94.github.io/WebVR-helloworld/) ：手机浏览需设置允许横屏。

结语：目前，国外的谷歌、火狐、Facebook和国内百度已推出支持WebVR浏览器的版本，微软也宣布将推出自己的VR浏览器，随着后期5g网络极速时代的到来以及HMD头显的价格和平台的成熟，WebVR的体验方式将是革命性的，用户通过WebVR浏览网上商店，线上教学可进行“面对面”师生交流等，基于这种种应用场景，我们可以找到一个更好的动力去学习WebVR。

参考链接：
[responisve WebVR](http://smus.com/responsive-vr/): 探讨WebVR在不同头显(HMD)的适配方案
[MolizaVR example](https://mozvr.com/#showcase): 火狐WebVR示例
[webvr-boilerplate](https://github.com/borismus/webvr-boilerplate): A starting point for web-based VR experiences that work on all VR headsets.
[how to build webvr](https://www.sitepoint.com/how-to-build-vr-on-the-web-today/): How to Build VR on the Web Today
