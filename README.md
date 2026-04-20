# MyCockpit — Backend API

## Summary
- **Project type**: Backend API for web application - Internal tool
- **Status**: V1 ongoing - Target : MVP
- **Built with**: Node.js, Express, MongoDB, Mongoose
- **Purpose**: Backend API for a web application designed to help methods engineers to manage their projects.

## Overview
This repository contains the backend of **MyCockpit**. <br>
The aim of this project is to develop an MVP to fix an issue met in my last job regarding project management. <br>
Thus, this is meant to be an internal company tool that helps methods engineers especially, even if the scope could be extended to additionnal jobs. <br>
The version deployed currently is the version 1 which is still under construction. Some features are still missing to get the final V1.

## Main Features
- User authentication using JWT stored in cookie and password hashing
- Protected routes using authentication middleware
- Provides endpoints for the frontend to support frontend features

## Tech Stack
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt

## Prerequisites
Before running the project locally, make sure the frontend is installed and configured. <br>
See frontend repository : https://github.com/Thomas-Thomas-2/myCockpit-frontend.git <br>
Also make sure to have a MongoDB database configured and connected to the backend. <br>

## Installation
Clone the repository and install dependencies: <br>
git clone https://github.com/Thomas-Thomas-2/myCockpit-backend.git <br>
cd myteacher-backend <br>
npm install <br>
npm run start

## Environment variables
Create a .env file at the root of the project. <br>
For local launch, set these with your own values: <br>
CONNECTION_STRING=mongodb+srv://... <br>
JWT_SECRET=your_secret <br>
FRONT_URL=http://localhost:3001 <br>

## Deployment
This backend is deployed on Render : https://mycockpit-backend.onrender.com

## Demo
Watch the demonstration : <br>
COMING SOON
