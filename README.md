#GIT url: https://github.com/dirtylooks1306/wad2
# CradleCare 

This project is a web app built with **Vue.js** and **Firebase** using **Vite** as the build tool. It allows you to fetch and display data from Firebase Firestore, with the flexibility to add Firebase Authentication, Cloud Functions, and other Firebase services.

Visit the live site: [https://cradlecare4smu.com/](https://cradlecare4smu.com/)

## Project Setup

### Prerequisites

- **[Node.js](https://nodejs.org/en/)** (v14 or higher)
- **[Firebase Account](https://firebase.google.com/)** with Firestore database enabled

### 1. Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dirtylooks1306/wad2.git
### 2. Project Setup
Open a terminal or command prompt and run the following command to navigate into your project directory:

1. **Navigate into the Project Directory**:
   ```bash
   cd CradleCare
2. **Navigate into the Project Directory**:
Run the following command to install all required dependencies for the project:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
Copy the .env file provided and place it in the root directory and add your Firebase configuration like this:
   ```plaintext
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID= 
   VITE_GOOGLE_MAPS_API_KEY= 
   VITE_GOOGLE_MAPS_MAP_ID=
   ```
### 3. Running the Project
   1. **Start the development server**:
      ```bash
      npm run dev
      ```
   
   2. **Build for production**:
      ```bash
      npm run build
      ```

### 4. Miscellanous


### Project Structure
- `src/`: Contains all source code for the application.
- `public/`: Static assets and files.
- `.env`: Environment variables for Firebase configuration (not included in the repo).

### Built With
- [Vue.js](https://vuejs.org/) - The JavaScript framework used for building the user interface.
- [Firebase](https://firebase.google.com/) - Backend services like Firestore for data storage.
- [Vite](https://vitejs.dev/) 

### Deployed Using
- **Amazon S3 (Simple Storage Service)** - For hosting and storing static assets of the web application.
- **Amazon CloudFront** - A Content Delivery Network (CDN) for fast and secure delivery of content.
- **Amazon Route 53** 
- **AWS ACM (AWS Certificate Manager)** 

### APIs Used
- **OpenAI ChatGPT API** - For chatbot functionality and natural language processing.
- **Google Maps API** - For displaying location-based data and mapping services.
- **Firebase API** - For database management, authentication, and real-time data handling.

### User acccounts
- **Test Email** - testing@gmail.com
- **Test password** - 123456
- **Admin Email** - admin@gmail.com
- **Admin password** - admin123

