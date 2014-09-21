<script src="http://threejs.org/examples/js/Detector.js"></script>
  <script src="http://threejs.org/build/three.min.js"></script>
  <script src="http://threejs.org/examples/js/controls/OrbitControls.js"></script>
  <script>


function GraphicEqualizer(width, height) {
    this.size = 3;
    this.res = 512;
    this.sizeres = this.size * this.res;
    this.halfsizeres = this.sizeres / 2;
    this.positions = [];
    this.scene;
    this.camera;
    this.light;
    this.light2;
    this.renderer;
    this.geometry;
    this.material;
    this._width = width;
    this._height = height;
    this.inited = false;
    return this;
}

GraphicEqualizer.prototype.init = function (bam) {
    if (!Detector.webgl) {
        document.body.appendChild(Detector.getWebGLErrorMessage());
        return;
    }

    this.projector = new THREE.Projector();

    this.camera = new THREE.PerspectiveCamera(35, this._width / this._height, 1, 5000);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 3000;
    //this.camera.target = new THREE.Vector3(0,0,0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.scene = new THREE.Scene();
    this.scene.add(this.camera);
    this.scene.add(new THREE.AmbientLight(0x808080));

    this.light = new THREE.SpotLight(0x4400ff, 1.25);
    this.light.position.set(-500, 500, 1200);
    this.light.target.position.set(-200, 0, 0);
    //this.light.castShadow = true;
    this.scene.add(this.light);

    this.light2 = new THREE.SpotLight(0xff0022, 1.5);
    this.light2.position.set(500, -500, 1200);
    this.light2.target.position.set(200, 0, 0);
    //this.light2.castShadow = true;
    this.scene.add(this.light2);

    this.geometry = new THREE.BoxGeometry(this.size, this.size, this.size + 50);

    this.material = new THREE.MeshLambertMaterial({
        ambient: 0x909090,
        color: 0x9922aa,
        specular: 0x2200aa,
        shininess: 30,
        shading: THREE.FlatShading
    });

    var startXPos = -((this.size + 2) * 256) / 2;
    var xPos = startXPos;
    for (var i = 0, l = this.res; i < l; i++) {
        var cube = new THREE.Mesh(this.geometry, this.material);
        if (i == 256) {
            xPos = startXPos; // reset x for right channel levels
        } else {
            xPos += this.size + 2;
        }
        if (i > 255) {
            cube.position.y = -150; // shift y down for right channel
        } else {
            cube.position.y = 150;
        }
        cube.position.x = xPos;
        // cube.position.z = 0;
        this.scene.add(cube);
        this.positions.push(cube);
    }

    this.renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.renderer.setSize(this._width, this._height);

    var container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(this.renderer.domElement);

    this.inited = true;
};

GraphicEqualizer.prototype.render = function (data) {
    if (!this.inited) {
        return;
    };
    for (var i = 0, l = this.res; i < l; i++) {
        this.positions[i].scale.y += (Math.max(0.1, +data[i] * 100) - this.positions[i].scale.y) * 0.1;
    }
    this.renderer.render(this.scene, this.camera);
};

  </script>