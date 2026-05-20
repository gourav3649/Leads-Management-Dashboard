# Smart Leads Dashboard

A full-stack Lead Management Dashboard built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with clean architecture, scalable code practices, and a premium user experience.

## 🚀 Features & Technical Specs

- **Tech Stack:** React 18, Node.js, Express, MongoDB, TypeScript across the entire stack.
- **Modern UI:** Built with TailwindCSS featuring dynamic widgets, SVG visual charts, responsive layouts, and a beautifully curated Obsidian Dark Mode (Bonus Feature completed).
- **Authentication:** JWT-based stateless auth, password hashing via bcrypt, with RBAC (Role-Based Access Control) for `admin` and `sales` users.
- **Advanced Data Table:** Server-side pagination, combined multi-filtering (Status, Source, Date Sorting), and **Debounced Search**.
- **Data Export:** Built-in CSV export functionality for leads.
- **Docker Ready:** Includes `Dockerfile` and `docker-compose.yml` for instant, containerized deployment.
- **Robust API:** RESTful structure, centralized error handling middleware, Zod request validation, and strict typing.

---

## 🛠️ Setup Instructions (Local)

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory (refer to `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```
Start the backend server:
```bash
npm run dev
# The server will run on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
# The application will run on http://localhost:5173
```

---

## 🐳 Setup Instructions (Docker)

To run the entire stack (Frontend, Backend, and MongoDB) via Docker:

```bash
# From the root directory
docker-compose up --build
```
- The Dashboard will be accessible at `http://localhost:5173`
- The API will be accessible at `http://localhost:5000`

---

## 📖 API Documentation

The backend exposes a RESTful API structured under `/api`.

### Auth Endpoints
- **POST** `/api/auth/register` - Register a new user (admin/sales).
- **POST** `/api/auth/login` - Login and receive JWT token.
- **GET** `/api/auth/me` - Get current authenticated user profile.

### Leads Endpoints
- **POST** `/api/leads` - Create a new lead.
- **GET** `/api/leads` - Get paginated leads with filters (status, source, search, sort).
- **GET** `/api/leads/stats` - Get global aggregate statistics for the dashboard visualization.
- **GET** `/api/leads/export/csv` - Export filtered leads as a CSV file.
- **GET** `/api/leads/:id` - Get a single lead by ID.
- **PUT** `/api/leads/:id` - Update a lead.
- **DELETE** `/api/leads/:id` - Delete a lead (Admin role only).

*Note: All `/api/leads` routes require a valid JWT Bearer token in the `Authorization` header.*

---

## 👨‍💻 Author
**Gourav** - MERN Internship Assignment Submission
