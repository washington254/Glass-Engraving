# 🪶 React Three Fiber Engraver

A **React Three Fiber** application that allows users to **upload a PNG or SVG logo** (or type text) and automatically **engrave it onto a 3D model** using **Constructive Solid Geometry (CSG)** operations.  

The app combines **Three.js**, **React Three Fiber**, and **Tailwind CSS** to create an interactive 3D experience with a sleek, responsive UI.

---

## ✨ Features

- 🖼️ Upload **SVG** or **PNG** images and have them **engraved** directly onto a 3D cylinder.
- 🔠 Option to engrave **custom text** using Three.js fonts.
- ⚙️ Uses **three-bvh-csg** for accurate and performant boolean subtraction.
- 🧠 Automatically converts PNG/JPG to SVG via **Potrace** before engraving.
- 💎 Realistic glass-like rendering using **MeshTransmissionMaterial**.
- 🎨 Styled using **Tailwind CSS** for a clean and responsive layout.
- ⚡ Built with **React Three Fiber** and **Drei** for declarative 3D scene management.

---

## 🧱 Tech Stack

| Category | Tools Used |
|-----------|-------------|
| 3D Graphics | [Three.js](https://threejs.org/), [React Three Fiber](https://github.com/pmndrs/react-three-fiber), [Drei](https://github.com/pmndrs/drei) |
| Boolean Operations | [three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) |
| Image Tracing | [Potrace](https://github.com/tooolbox/potrace) |
| UI / Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Font Handling | [Three.js FontLoader](https://threejs.org/docs/#api/en/loaders/FontLoader) |
| Geometry Utils | [BufferGeometryUtils](https://threejs.org/docs/#examples/en/utils/BufferGeometryUtils) |

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/washington254/Glass-Engraving.git

2️⃣ Install dependencies

npm install
# or
yarn install

3️⃣ Start the development server

npm run dev
# or
yarn dev

Your app should now be running at:
👉 http://localhost:5173
(or as shown in your terminal)
# Glass-Engraving
# Glass-Engraving
