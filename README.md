# Express REST API with Sequelize, Caching & Authentication

This is a Node.js RESTful API built with **Express**, **Sequelize**, and **MySQL**, featuring:

- Basic Authentication middleware
- Route-level caching using a custom cache manager
- Static file serving for image uploads
- Scheduled cache refresh using `node-cron`
- Modular routing for entities like `navbar`, `sidebar`, `quiz`, etc.

---

## 📦 Features

- **Express** as the web framework
- **Sequelize** ORM for database interaction
- **dotenv** for environment variables
- **CORS** enabled
- **Body-parser** for parsing JSON requests
- **Basic Auth** middleware for route protection
- **Node-cron** for daily cache refresh
- **Static files** served via `/images`
- **Route-specific cache injection**

---

## 🛠 Installation

```bash

# Install dependencies
npm install
