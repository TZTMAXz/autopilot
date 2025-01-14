/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import carModel from "@/assets/models/su7.glb";
import carModelWithDraco from "@/assets/models/su7-draco.glb";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Freespace from "./freespace";
import {
  arrowData1,
  cubeData1,
  freespaceData1,
  freespaceData2,
  polygonCylinderData1,
  polygonCylinderData2,
  polygonCylinderData3,
  polygonCylinderData4,
} from "../mock/freespace";
import Cube from "./cube";
import Text from "./text";
import Arrow from "./arrow";
import PolygonCylinder from "./polygonCylinder";
import Line from "./line";
import { lineData1, lineData2, lineData3, lineData4 } from "../mock/line";
import { loadDracoGLTFWithPromise, loadGLTFWithPromise } from "../helper";
import { abortWrapper } from "../helper/promise";
import { EViewType } from "../types/renderer";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const manager = new THREE.LoadingManager();
manager.onLoad = () => {
  console.log("===Loading complete!");
};
manager.onProgress = (url, loaded, total) => {
  console.log("===loading", url, loaded, total);
};
// const gltfLoader = new GLTFLoader();

class Renderer {
  egoCar = null;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();
  controls: any = null;
  renderer = new THREE.WebGLRenderer();
  // 场景尺寸
  dimensions = [0, 0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderers: Record<string, any> = {};

  constructor() {
    this.renderers = {
      freespace: () => new Freespace(this.scene),
      cube: () => new Cube(this.scene),
      text: () => new Text(this.scene),
      arrow: () => new Arrow(this.scene),
      polygonCylinder: () => new PolygonCylinder(this.scene),
      line: () => new Line(this.scene),
    };
  }

  loadEgoCar() {
    const loadEgoCar = abortWrapper(
      loadDracoGLTFWithPromise(carModelWithDraco)
    );
    loadEgoCar.then((gltf) => {
      const car = gltf.scene;
      car.scale.set(0.1, 0.1, 0.1);
      car.rotateX(Math.PI / 2);
      car.rotateY(Math.PI);
      this.scene.add(car);
      const target1 = new THREE.Object3D();
      target1.position.set(0.1, -0.2, 0.3);
      const light1 = new THREE.SpotLight("#fff", 1.2, 3, Math.PI / 6, 0.1);
      light1.position.set(0.1, 0.2, 0.3);
      light1.castShadow = true;
      light1.target = target1;
      this.scene.add(target1);
      this.scene.add(light1);
      const target2 = new THREE.Object3D();
      target2.position.set(-0.1, -0.2, 0.3);
      const light2 = new THREE.SpotLight("#fff", 1.2, 2, Math.PI / 6, 0.1);
      light2.position.set(-0.1, 0.2, 0.3);
      light2.castShadow = true;
      light2.target = target2;
      this.scene.add(target2);
      this.scene.add(light2);
      // const light2 = new THREE.SpotLight("#fff", 1.6, 20, Math.PI / 6, 0.1);
      // light2.position.set(0, -0.1, 0.2);
      // light2.castShadow = true;
      // this.scene.add(light2);
      // 可能某个信号触发中断，直接调用abort
      // setTimeout(() => {
      // @ts-ignore
      // loadEgoCar.abort();
      // }, 10);
    });
  }
  initialize() {
    const container = document.getElementById("my-canvas")!;
    const width = container.offsetWidth,
      height = container.offsetHeight;
    this.dimensions = [width, height];
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.up.set(0, 0, 1);
    camera.position.set(-0.4, 4, 1.4);
    this.camera = camera;
    const scene = this.scene;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    this.renderer = renderer;
    // 设置背景色(颜色值，透明度)
    renderer.setClearColor(0x000000, 0.8);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    this.controls = controls;
    // light
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    // 平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
    directionalLight.position.set(60, 80, 40);
    // 方向光指向对象，默认指向是0,0,0
    // directionalLight.target = mesh;
    scene.add(directionalLight);
    // const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5,0xff0000);
    // scene.add(dirLightHelper);
    // const axes = new THREE.AxesHelper(0.6);
    // axes.position.z = 0.05;
    // this.scene.add(axes);
    // 50表示网格模型的尺寸大小，25表示纵横细分线条数量
    const gridHelper = new THREE.GridHelper(50, 20);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);
    this.loadEgoCar();
    this.registerDefaultEvents();
    // this.switchCameraView(EViewType.Overlook);
    setTimeout(() => {
      this.mockData();
    }, 5000);

    function animate() {
      controls.update();
      renderer.render(scene, camera);
    }
  }

  mockData() {
    this.renderers.freespace().draw(freespaceData1);
    this.renderers.freespace().draw(freespaceData2);
    this.renderers.cube().draw(cubeData1);
    // this.renderers.arrow().draw(arrowData1);
    // this.renderers.polygonCylinder().draw(polygonCylinderData1);
    // this.renderers.polygonCylinder().draw(polygonCylinderData2);
    // this.renderers.polygonCylinder().draw(polygonCylinderData3);
    // this.renderers.polygonCylinder().draw(polygonCylinderData4);
    this.renderers.line().draw(lineData1);
    this.renderers.line().draw(lineData2);
    this.renderers.line().draw(lineData3);
    // this.renderers.line().draw(lineData4);
  }

  registerDefaultEvents() {
    window.addEventListener("resize", this.onResize.bind(this), false);
  }
  unmountDefaultEvents() {
    window.removeEventListener("resize", this.onResize.bind(this), false);
  }
  onResize() {
    const container = document.getElementById("my-canvas")!;
    const width = container.offsetWidth,
      height = container.offsetHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  cameraView = EViewType.FollowCar;
  switchCameraView(view: EViewType) {
    this.cameraView = view;
    switch (view) {
      case EViewType.FollowCar: {
        // 确保平滑过渡
        // this.controls.enabled = false;
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(-0.4, 4, 1.4);
        break;
      }
      case EViewType.Overlook: {
        this.camera.position.set(0, 0, 20);
        this.camera.up.set(0, -1, 0);
        break;
      }
      case EViewType.OverlookVertical: {
        this.camera.position.set(0, 0, 20);
        this.camera.up.set(1, 0, 0);
        break;
      }
      default:
        break;
    }
  }
}

export const myRenderer = new Renderer();
