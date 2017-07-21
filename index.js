const makeOrb = imgSrc => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgSrc;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const w = 540;
      const h = 540;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);

      window.scene = scene;

      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(w, h);
      // document.body.appendChild(renderer.domElement);

      const light = new THREE.PointLight(0xff0000, 1, 100);
      light.position.set(50, 50, 50);
      scene.add(light);

      const loader = new THREE.TextureLoader();

      loader.crossOrigin = "";

      loader.load(
        // resource URL
        imgSrc, // Function when resource is loaded
        texture => {
          // do something with the texture
          const material = new THREE.MeshBasicMaterial({ map: texture });
          // const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
          const geometry = new THREE.SphereGeometry(1, 20, 20);
          const orb = new THREE.Mesh(geometry, material);

          scene.add(orb);

          camera.position.z = 2;

          const frames = [];
          const n = 34;
          const dirs = [["y"], ["y", "x"], ["y", "z"]];
          const dir = dirs[Math.floor(Math.random() * dirs.length)];
          const mag = Math.random() < 0.5 ? -1 : 1;

          for (let i = 0; i < n; i += 1) {
            dir.forEach(
              d => (orb.rotation[d] = orb.rotation[d] + Math.PI * 2 / n * mag)
            );
            renderer.render(scene, camera);
            const fCanv = document.createElement("canvas");
            fCanv.setAttribute("width", w);
            fCanv.setAttribute("height", h);
            fCanv.getContext("2d").drawImage(renderer.domElement, 0, 0);
            frames.push(fCanv);
          }

          scene.remove(orb);

          geometry.dispose();
          material.dispose();
          texture.dispose();

          const gif = new GIF({
            workers: 10,
            quality: 60,
            workerScript: "/gif.worker.js",
            debug: false
          });

          gif.on("finished", blob => {
            const reader = new FileReader();

            reader.onloadend = function() {
              resolve(reader.result);
            };

            reader.readAsDataURL(blob);
          });

          frames.forEach(f => gif.addFrame(f, { delay: 100 }));

          gif.render();
        },
        xhr => {
          console.log(xhr.loaded / xhr.total * 100 + "% loaded");
        },
        xhr => {
          console.log("An error happened");
        }
      );
    };
  });
};

const orb = document.getElementById("orb");
const input = document.getElementById("hey");

const renderImg = (src) => {
    orb.innerHTML = `<img src=${src} />`;
}

input.addEventListener("change", e => {
  const files = e.target.files;
  const file = files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = e => {
    const src = e.target.result;

    renderImg(src);
    makeOrb(src).then(orb => renderImg(orb));
  };

  reader.readAsDataURL(file);
});

window.makeOrb = makeOrb;
