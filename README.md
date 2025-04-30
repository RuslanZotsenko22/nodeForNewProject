
# 🛠️ RRPBackend

🔗 [Website link](https://rrp-it.cz)

## 📌 Description
This is the backend part of a system for managing repair and renovation projects (**Repair & Renovation Projects**). The service provides full CRUD functionality for managing team members and completed projects, ensures secure access to the admin panel via token-based authentication, and supports image uploading to Cloudinary.

## 🧰 Tech Stack
- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **Multer** — for file handling
- **Cloudinary** — for image storage
- **JWT (Access + Refresh tokens)** — for authentication
- **CORS, dotenv, cookie-parser** — utility libraries

## 📁 Main Features
- 🔐 **Admin authentication** using JWT (access + refresh tokens)
- 👥 **Team management** (CRUD: create, update, delete, view)
- 🏗️ **Project management** (CRUD: create, update, delete, view)
- 🖼️ Support for **image uploads** via URL or local file
- ☁️ **Cloudinary integration**
- 🛡️ Secure `/admin` route with token protection

## 📦 Project Structure
```
/controllers
  - adminController.js
  - projectController.js
  - teamController.js

/routes
  - adminRoutes.js
  - projectRoutes.js
  - teamRoutes.js

/middlewares
  - authMiddleware.js
  - uploadMiddleware.js

/models
  - Admin.js
  - Project.js
  - Team.js

/utils
  - cloudinary.js
  - tokenService.js

.env (environment variables)
```

## 🔐 Authentication
- Login with password generates **JWT access-token** and **refresh-token**
- **Refresh-token** is stored in **HttpOnly cookie**
- Includes `/refresh-token` route to update access token

## 🚀 How to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/RuslanZotsenko22/RRPBackend.git
```

2. Navigate to the project folder:
```bash
cd RRPBackend
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file and add the environment variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_PASSWORD=your_admin_password
```

5. Run the server:
```bash
npm run dev
```

---

Author: [Ruslan Zotsenko](https://github.com/RuslanZotsenko22) 🚀
