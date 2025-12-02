# EventEase - Web-Based Event Subcontractor Management and Reservation System

<p align="center">
  <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.icons8.com/?size=512&id=123603&format=png&color=61DAFB" width="100" alt="React">
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://spring.io/" target="_blank" rel="noopener noreferrer">
    <img width="100" src="https://img.icons8.com/?size=512&id=90519&format=png&color=000000" alt="Spring Boot">
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://aws.amazon.com/" target="_blank" rel="noopener noreferrer">
    <img width="100" src="https://img.icons8.com/color/480/amazon-web-services.png" alt="AWS">
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.docker.com/" target="_blank" rel="noopener noreferrer">
    <img width="100" src="https://img.icons8.com/?size=512&id=cdYUlRaag9G9&format=png&color=000000" alt="Docker">
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.mysql.com/" target="_blank" rel="noopener noreferrer">
    <img width="100" src="https://img.icons8.com/color/480/mysql-logo.png" alt="MySQL">
  </a>
</p>

<p align="center">
  <a href="https://npmjs.com/package/react"><img src="https://img.shields.io/badge/React-v18.3.1-61DAFB?logo=react&logoColor=white" alt="React version"></a>
  &nbsp;
  <a href="https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter"><img src="https://img.shields.io/badge/Spring%20Boot-v3.2.11-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot version"></a>
  &nbsp;
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-v18+-339933?logo=nodedotjs&logoColor=white" alt="Node.js"></a>
  &nbsp;
  <a href="https://www.npmjs.com/"><img src="https://img.shields.io/badge/npm-v9+-CB3837?logo=npm&logoColor=white" alt="npm"></a>
  &nbsp;
  <a href="https://www.oracle.com/java/"><img src="https://img.shields.io/badge/Java-17+-007396?logo=openjdk&logoColor=white" alt="Java"></a>
  &nbsp;
  <a href="https://maven.apache.org/"><img src="https://img.shields.io/badge/Maven-3.8+-C71A36?logo=apachemaven&logoColor=white" alt="Maven"></a>
  &nbsp;
  <a href="https://aws.amazon.com/s3/"><img src="https://img.shields.io/badge/AWS%20S3-Storage-FF9900?logo=amazons3&logoColor=white" alt="AWS S3"></a>
  &nbsp;
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Containerization-2496ED?logo=docker&logoColor=white" alt="Docker"></a>
  &nbsp;
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-v8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL"></a>
</p>

---


EventEase is a comprehensive web-based platform designed to streamline the entire event planning process from customer booking to subcontractor coordination. The system enables efficient management of event services, bookings, and subcontractor workflows while providing transparency and security for event organizers, customers, and subcontractors.

## 📑 Table of Contents

- [🎯 Overview](#-overview)
- [📖 User Guide](#-user-guide)
- [✨ Features](#-features)
  - [For Customers](#for-customers)
  - [For Admins (Event Organizers)](#for-admins-event-organizers)
  - [For Subcontractors](#for-subcontractors)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Backend Deployment](#backend-deployment-spring-boot)
  - [Frontend Deployment](#frontend-deployment-react--vite)
  - [Running with Docker](#running-with-docker-optional)
- [🔐 Authentication / Testing Credentials](#-authentication--testing-credentials)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [📝 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [👥 Developer Members](#-developer-members)
- [📧 Support](#-support)

---

## 🎯 Overview

EventEase serves three primary user roles:

- **Admins (Event Organizers)**: Manage events, subcontractors, bookings, and monitor overall business operations
- **Customers**: Browse and book event services, manage reservations, and track event progress
- **Subcontractors**: View assigned tasks, submit proof of work, manage availability, and track transactions

## 📖 User Guide

For detailed step-by-step instructions on how to use EventEase, please refer to the following user guides:

- **[Customer Guide](https://docs.google.com/document/d/17gsCR6r9NK4nvM1tg5vDh_CaSLxvtgD58sF8kmtvO7w/edit?tab=t.0)** - Complete guide for customers on browsing, booking, and managing events
- **[Subcontractor Guide](https://docs.google.com/document/d/1Uo6bb0YNuBaRs_4CkT-IpD939_5jzmYJDjNsvNGj9-U/edit?tab=t.0#heading=h.203ipuueam35)** - Instructions for subcontractors on task management and work submission
- **[Admin Guide](https://docs.google.com/document/d/1fuvmu7k2g9jWIHAchBigGSKkOYMq0_jqnI0Kt92NY_c/edit?tab=t.0)** - Comprehensive admin dashboard and management guide

## ✨ Features

### For Customers

- ✅ **Event Discovery & Booking**
  - Browse available event services
  - View detailed event descriptions, pricing, and availability
  - Book individual services
  - Interactive service selection with visual previews

- ✅ **Booking Management**
  - Input custom event details (date, location, requirements)
  - Preview booking summaries before confirmation
  - Upload payment proof with chunked file upload support
  - Track booking status and event progress
  - Receive real-time notifications about booking updates

- ✅ **Account Management**
  - Secure registration with OTP email verification
  - Profile management with customizable settings
  - View booking history and transaction records
  - Password reset functionality

### For Admins (Event Organizers)

- ✅ **Dashboard & Analytics**
  - Comprehensive business overview with key metrics
  - Visual analytics for bookings, revenue, and performance
  - Monitor active events and pending requests

- ✅ **Event Management**
  - Create, edit, and delete event services
  - Set pricing, availability, and service details
  - Upload showcase images and event portfolios
  - Manage service categories and customization options

- ✅ **Booking Operations**
  - View and manage all customer bookings
  - Review payment proofs and verify transactions
  - Approve or reject booking requests
  - Track event progress from booking to completion
  - Assign subcontractors to events

- ✅ **Subcontractor Management**
  - Add and manage subcontractor accounts
  - Assign tasks and events to subcontractors
  - Review submitted proof of work
  - Track subcontractor performance and availability

- ✅ **Customer Management**
  - View customer profiles

- ✅ **Communication System**
  - In-app notification system
  - Email notifications for important events
  - Real-time updates on booking status changes

### For Subcontractors

- ✅ **Task Management**
  - View assigned events and tasks
  - Access event details and requirements
  - Manage service availability
  - Track upcoming and completed assignments

- ✅ **Proof of Work Submission**
  - Upload work completion documentation
  - Submit photos and files for admin review
  - Track submission status and feedback

- ✅ **Transaction Tracking**
  - View payment history
  - Access transaction records

- ✅ **Profile Management**
  - Update availability status
  - Manage personal information

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Maps**: Maps React (`@react-google-maps/api`)
- **UI/Styling**: CSS Modules, Responsive Design
- **State Management**: React Context API
- **Form Handling**: Custom validation
- **File Upload**: Chunked upload implementation

### Backend

- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Security**: Spring Security with JWT
- **Database ORM**: Spring Data JPA / Hibernate
- **Email Service**: Spring Mail (SMTP)
- **File Storage**: AWS S3
- **API Architecture**: RESTful APIs
- **Authentication**: RSA public/private key pair for JWT

### Database

- **Primary Database**: MySQL 8.0+
- **Database Name**: `dbeventease`
- **ORM**: Hibernate with MySQL dialect
- **Connection Pooling**: HikariCP

### DevOps & Deployment

- **Containerization**: Docker
- **CI**: GitHub Actions
- **Container Registry**: Docker Hub
- **Web Server**: Nginx (reverse proxy)
- **DNS**: Cloudflare
- **Cloud Storage**: AWS S3 (ap-southeast-1 region)

## 🚀 Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Java** (JDK 17 or higher)
- **Maven** (for building Spring Boot backend)
- **MySQL** (8.0 or higher)
- **Git**

### Database Setup

1. **Install and start MySQL**

2. **Create the database**:

   ```sql
   CREATE DATABASE dbeventease;
   ```

3. **The application will automatically create tables** on first run using Hibernate DDL auto-update

### Backend Deployment (Spring Boot)

1. **Navigate to the backend directory**:

   ```bash
   cd backend/Backend
   ```

2. **Create a `.env` file or configure environment variables** with the following:

   ```properties
   # Database Configuration
   MYSQL_USERNAME=your_mysql_username
   MYSQL_PASSWORD=your_mysql_password
   
   # Email Configuration (Gmail SMTP)
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_FROM=your_email@gmail.com
   EMAIL_PASSWORD=your_app_specific_password
   
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=ap-southeast-1
   AWS_S3_BUCKET_NAME=your_bucket_name
   ```

   > **Note for Gmail**: If using Gmail for email notifications, you need to generate an App Password (not your regular Gmail password) from your Google Account settings.

3. **Generate RSA keys for JWT** (if not already present):

   Create a `certs` directory in `src/main/resources/`:

   ```bash
   mkdir -p src/main/resources/certs
   cd src/main/resources/certs
   ```

   Generate keys:

   ```bash
   # Generate private key
   openssl genrsa -out private.pem 2048
   
   # Generate public key
   openssl rsa -in private.pem -pubout -out public.pem
   ```

4. **Build and run the backend**:

   ```bash
   # Using Maven
   mvn clean install
   mvn spring-boot:run
   
   # OR using Maven wrapper
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

5. **The backend server will start on** `http://localhost:8080`

### Frontend Deployment (React + Vite)

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend/my-app-planease
   ```

2. **Create a `.env` file** with the following:

   ```properties
   VITE_APP_BACKEND_URL=http://localhost:8080
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **The frontend will be available at** `http://localhost:5173` (or the port shown in terminal)

### Running with Docker (Optional)

If you prefer using Docker:

1. **Ensure Docker and Docker Compose are installed**

2. **From the project root directory**:

   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: `http://localhost` (served via Nginx)
   - Backend API: `http://localhost:8080`

## 🔐 Authentication / Testing Credentials

To test the application, use the following sample credentials:

### Admin Account

- **Email**: `admin@eventease.com`
- **Password**: `Admin123!`
- **Role**: Administrator (full access to admin dashboard)

### Customer Account

- **Email**: `johnDoe@gmail.com`
- **Password**: `JohnDoe123`
- **Role**: Customer (booking and event management)

### Subcontractor Account

- **Email**: `subcontractor@eventease.com`
- **Password**: `Sub123!`
- **Role**: Subcontractor (task and work submission)

> **Note**: On first deployment, you may need to create these accounts manually through the registration process or seed them directly into the database. The customer account (<johnDoe@gmail.com>) is provided as a standard testing credential.

## 📁 Project Structure

```
EventEase/
├── backend/
│   └── Backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/Project/Backend/
│       │   │   │   ├── Controller/
│       │   │   │   ├── Service/
│       │   │   │   ├── Repository/
│       │   │   │   ├── Model/
│       │   │   │   ├── Security/
│       │   │   │   └── BackendApplication.java
│       │   │   └── resources/
│       │   │       ├── application.properties
│       │   │       └── certs/
│       │   └── test/
│       └── pom.xml
├── frontend/
│   └── my-app-planease/
│       ├── src/
│       │   ├── Components/
│       │   ├── Pages/
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── public/
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Backend Configuration (`application.properties`)

Key configurations in `src/main/resources/application.properties`:

- **Server Port**: `8080`
- **Database Connection**: MySQL on `localhost:3306`
- **File Upload Limits**: Max 15MB per file
- **JWT Security**: RSA key pair authentication
- **Email Service**: Gmail SMTP on port 587

### Frontend Configuration (`vite.config.js`)

The Vite configuration handles:

- Development server settings
- API proxy configuration
- Build optimizations
- Asset handling

## 📝 API Documentation

The backend exposes RESTful APIs for:

- **Authentication**: `/auth/login`, `/auth/register`
- **Events**: `/api/events`, `/api/packages`
- **Bookings**: `/api/bookings`
- **Users**: `/api/users`, `/api/customers`
- **Subcontractors**: `/api/subcontractors`
- **Notifications**: `/api/notifications`
- **File Upload**: `/api/upload`

All authenticated endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## 🤝 Contributing

This project is part of a capstone research project. For contributions or inquiries, please contact the development team.

## 👥 Developer Members

- Aeron Clyde Espina
- Ivan Jay Adoptante
- Miklos Kaiser Bolarde
- Dave Mark Crystal
- Mikael Lorenzo Cuyugan

## 📧 Support

For technical support or questions about EventEase, please contact the development team.

---

**EventEase** - Streamlining Event Management, One Booking at a Time 🎉
