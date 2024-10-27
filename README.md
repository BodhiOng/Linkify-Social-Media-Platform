# Social Media Platform (MERN & Next.js)
Welcome to the Social Media Platform project! This application allows users to connect, share posts, comment, like, and follow other users.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Installation](#installation)
- [Running the Application](#running-the-application)

## Technologies Used

- **Frontend**: React, Next.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **State Management**: Redux
- **Styling**: Tailwind CSS

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete posts
- Comment on posts
- Like posts
- Follow/unfollow users
- Notifications for new interactions

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/BodhiOng/Social-Media-Platform-MERN-NextJS.git
   cd Social-Media-Platform-MERN-NextJS
   ```

2. **Install dependencies**

     ```bash
     npm install
     ```

3. **Environment Variables**: Create a `.env` file in the `server` directory and add your environment variables. Example:

   ```bash
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

## Running the Application

1. **Start the backend server**:

   ```bash
   npm start
   ```

2. **Access the application**:

   Open your browser and go to `http://localhost:3000`.
