# Kartetris

A WebSocket-based 1v1 Tetris app with special effects inspired by Mario Kart.

![kartetris_landing](https://github.com/user-attachments/assets/093d177c-135f-40bc-98a2-60cc48e840d1)

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Contributors](#contributors)
- [License](#license)

---

## About

**Kartetris** is a real-time, competitive Tetris game where two players face off in a 1v1 match. Special effects and power-ups, inspired by Mario Kart, add a fun and unpredictable twist to the classic gameplay.


---

## Features

- Real-time 1v1 Tetris matches via WebSockets
- Special effects and power-ups to influence gameplay
- Modern, responsive UI
- Smooth multiplayer experience

---

## Tech Stack

![react](https://github.com/user-attachments/assets/c364b5d8-4e8e-47ca-be86-bd88d6537dae) 
![expressnode](https://github.com/user-attachments/assets/8e554fbf-03a7-40aa-9e55-cfe3b6166150)
![mongodb](https://github.com/user-attachments/assets/8dacb2bd-6d41-49bd-afbc-706609144e4c)

**Frontend:**
- [React](https://react.dev/) (TypeScript)
- [TailwindCSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

**Backend:**
- [Express.js](https://expressjs.com/)
- WebSocket for real-time communication


**Database:**
- [MongoDb](https://www.mongodb.com/)


---

## Project Structure

### React (TypeScript) app
/frontend

### Express.js server
/backend    

### mongodb 

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/kartetris.git
    cd kartetris
    ```

2. **Install dependencies:**

    - **Frontend:**
        ```bash
        cd frontend
        npm install
        ```

    - **Backend:**
        ```bash
        cd ../backend
        npm install
        ```

3. **Start the development servers:**

    - **Backend:**
        ```bash
        npm run dev
        ```

    - **Frontend:**
        ```bash
        cd ../frontend
        npm run dev
        ```

4. **Open your browser and navigate to** [http://localhost:3000](http://localhost:5173/)

---

## Development

- **Frontend:**  
  Located in `/frontend`.
  
  Built with React (TypeScript), styled with TailwindCSS, and uses shadcn/ui for components.

- **Backend:**  
  Located in `/backend`.
  
  Built with Express.js and handles WebSocket connections for real-time gameplay.
  
  Also connect to mongodb for persisting high-scores and allowing for ranking.

---

## Contributors

- Marco Ruch
- Mathis Hermann
- Jorge Gaetano Lopez Diaz

---

## License

This project is for educational purposes.
