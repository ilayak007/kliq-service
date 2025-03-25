**Kliq Service** 🎯

A Node.js backend service built with Express.js, Prisma, and PostgreSQL, designed for campaign and creator management.
The service is deployed on Vercel with database hosting on Neon

🚀 **Features**

✅ CRUD APIs for managing campaigns and creators

✅ AWS S3 Integration for storing campaign and creator images

✅ PostgreSQL + Prisma ORM for database management

✅ Deployed on Vercel for easy sharing and access

✅ Automatic deployment via GitHub integration

🛠 **Tech Stack**

    Backend: Node.js, Express.js
    Database: PostgreSQL (Neon)
    ORM: Prisma
    Cloud Storage: AWS S3
    Deployment: Vercel

📂 **Project Structure**

kliq-service/
│── prisma/ # Prisma schema & migrations  
│── src/  
│ ├── controllers/ # API logic (Campaign & Creator)  
│ ├── routes/ # Route definitions  
│ ├── middleware/ # Middleware (if any)  
│ ├── utils/ # Helper functions  
│ ├── server.js # Main entry point  
│── .env # Environment variables  
│── vercel.json # Vercel deployment config  
│── package.json # Dependencies & scripts  
│── README.md # Documentation

🌍 **Live Demo**

🔗 Deployed URL: https://kliq-service.vercel.app
