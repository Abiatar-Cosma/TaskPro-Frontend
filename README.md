
# TaskPro – Frontend

## 🖼️ Screenshots

### 🏁 Welcome Page
The landing screen introduces **TaskPro**, encouraging users to register and start organizing their tasks.
![Welcome Page](src/docs/screens/Screenshot%202025-11-02%20171306.png)

---

### 🔐 Authentication
Modern registration and login forms with live validation and password strength indicator.
![Register Page](src/docs/screens/Screenshot%202025-11-02%20171437.png)

---

### 🧩 Kanban Dashboard
Organize your projects with drag-and-drop boards, columns, and task cards.
Each card supports priority, deadlines, and edit/delete actions.
![Kanban Board](src/docs/screens/Screenshot%202025-11-02%20171722.png)

---

### 🗂️ Add & Edit Cards
Quickly create or edit tasks using modal forms with clean validation and deadline picker.
![Add/Edit Card](src/docs/screens/Screenshot%202025-11-02%20171754.png)

---

### 🌙 Theme & Sidebar
Switch between **Light**, **Violet**, or **Dark** themes.  
Responsive sidebar allows easy navigation between boards and profile settings.
![Sidebar + Theme](src/docs/screens/Screenshot%202025-11-02%20171827.png)


[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![MUI](https://img.shields.io/badge/MUI-5-007FFF.svg)](https://mui.com)
[![i18n](https://img.shields.io/badge/i18n-i18next-26A69A.svg)](https://www.i18next.com/)
[![DnD](https://img.shields.io/badge/Drag%20%26%20Drop-dnd--kit%20%7C%20react--beautiful--dnd-8E44AD.svg)](https://github.com/atlassian/react-beautiful-dnd)

**TaskPro** is a Kanban-style task management app with authentication, theming
(Light/Violet/Dark), i18n, and drag-and-drop.

## 🔗 Live & Docs

- Live (GitHub Pages): https://abiatar-cosma.github.io/TaskPro-Frontend
- Backend: https://taskpro-backend-lybk.onrender.com
- API docs (Swagger): https://taskpro-backend-lybk.onrender.com/api-docs _(if
  enabled)_

## ✨ Features

- Sign up / Sign in with robust form validation (Formik + Yup)
- Boards → Columns → Cards with **drag & drop**
- Theme switcher: **Light / Violet / Dark**
- Internationalization (EN/RO) with language detection
- Optimized images (retina, lazy), icon sprites, favicon
- State with **Redux Toolkit** and persistence

## 🧱 Tech Stack

React 18, React Router 7, Redux Toolkit, MUI 5, styled-components 6, Framer
Motion, @dnd-kit / react-beautiful-dnd, i18next, Recharts, date-fns, axios.

## 📐 Responsive & Standards

- Breakpoints: `320–375` (mobile), `768` (tablet), `1440` (desktop)
- HTML5 semantics, W3C-valid CSS
- Fonts via `@font-face`

## 🚀 Getting Started

```bash
git clone https://github.com/Abiatar-Cosma/TaskPro-Frontend.git
cd TaskPro-Frontend
npm install
npm start
```
