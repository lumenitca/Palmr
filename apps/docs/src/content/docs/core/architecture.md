---
title: Architecture of Palmr.
---

##### Overview of the core architecture components of Palmr.  
  

Understanding the architecture of Palmr. is crucial for both deploying and scaling the application. Below is a diagram illustrating the main components:

![Palmr Banner](/src/assets/general/architecture.png)

## **Technologies Used**  

Each component in the Palmr. architecture plays a vital role in ensuring reliability, performance, and scalability:  

### **PostgreSQL**  
Palmr. uses **PostgreSQL** as the primary database solution. It provides reliable and secure data storage, ensuring consistency and high performance for all database operations. PostgreSQL's powerful indexing, query optimization, and support for complex data types make it an ideal choice for handling large amounts of data.  

### **React + TypeScript + Vite**  
The frontend of Palmr. is built using **React** and **TypeScript**, bundled with **Vite** for fast development and optimized builds.  
- **React** enables the creation of a dynamic and responsive user interface with a component-based architecture.  
- **TypeScript** adds static typing, enhancing code quality and reducing runtime errors.  
- **Vite** provides a fast and efficient development environment with hot module replacement (HMR) and optimized production builds.  

### **MinIO**  
Palmr. uses **MinIO** for object storage. MinIO is a high-performance, S3-compatible object storage solution designed for large-scale data infrastructure.  
- Supports high-throughput file storage and retrieval.  
- Ensures data integrity and redundancy.  
- Compatible with AWS S3 APIs, making integration seamless.  

### **Fastify**  
The backend of Palmr. is powered by **Fastify**, a high-performance, low-overhead web framework for Node.js.  
- Provides fast request handling with a lightweight core.  
- Built-in schema-based validation for secure and reliable API handling.  
- Supports plugin-based architecture for easy extensibility.  

### **How It Works**  
1. **Frontend** — React + TypeScript + Vite handle the user interface and user interactions.  
2. **Backend** — Fastify processes requests and communicates with the database and storage layers.  
3. **Database** — PostgreSQL stores metadata and transactional data.  
4. **Object Storage** — MinIO stores the actual files and ensures scalable, high-performance storage.  

---

### **Useful Links**
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [MinIO Documentation](https://min.io/docs/minio/container/index.html)
- [Fastify Documentation](https://fastify.dev/docs/latest/)

---

