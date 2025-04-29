# ZeroTrace

## 🚀 Overview
ZeroTrace is a **highly secure, token-based file-sharing platform** designed for **temporary file transfers** with **privacy, encryption, and automatic deletion**. Share files effortlessly without leaving digital footprints.

---

## ✨ Features
### 🔹 **Fast & Secure File Sharing**
- Upload **1 to 5 files** simultaneously (**Max: 20MB per file**).
- Each upload generates a **unique token**.
- Share the token with recipients for **quick & easy access**.

### 🔹 **Token-Based Access System**
- Files are only accessible via a **secure, unique URL**.
- Retrieve files by entering the **token** on the website.

### 🔹 **Automated File Deletion**
- Files automatically **expire after 24 hours**.
- Users can manually delete files when needed.
- The system ensures **secure deletion from storage & logs**.

### 🔹 **Rock-Solid Security**
- 🔐 **HTAccess rules** restrict unauthorized access.
- 🔒 **Let's Encrypt SSL** encrypts all communications.
- 🔑 **Environment variables** keep credentials safe.

### 🔹 **Magic File Sharing Link** 🔮
- Share a direct link that **instantly retrieves files**.

### 🔹 **Admin Dashboard (Upcoming Feature)** 🛠️
- **Monitor active uploads & storage.**
- **View system logs & manage user activities.**

### 🔹 **Progressive Web App (PWA) Support** 📱💻
- **Installable on Android, iOS, and Desktop**.
- Provides an **app-like experience** with offline capabilities.
- Seamless performance with **push notifications** and **background sync** *(where supported)*.
- Users can add ZeroTrace to their **home screen or desktop** with one tap.


---

## 🏗️ Technology Stack
| Component        | Technology Used |
|-----------------|----------------|
| **Frontend**    | HTML, CSS, JavaScript |
| **Backend**     | Node.js, Express.js, PHP |
| **Database**    | MySQL (Hostinger) |
| **Storage**     | Local Server (Uploads Directory) |
| **Hosting**     | Railway, AWS, IONOS |
| **Security**    | Let's Encrypt SSL, HTAccess |
| **File Handling** | Multer (Node.js) |

---

## ⚡ Installation & Setup
### 📥 **Clone the Repository**
```bash
git clone https://github.com/BrokenShadow/zerotrace.git
cd zerotrace
```

### 🔧 **Install Dependencies**
```bash
npm install
```

### 🔑 **Set Up Environment Variables**
Create a `.env` file in the project root and configure:
```ini
DB_HOST=your_DB_host
DB_USER=your_DB_user
DB_PASSWORD=your_DB_password
DB_NAME=your_DB_name
DB_PORT=3306
PORT=3000
UPLOAD_DIR=uploads
```

### ▶️ **Run the Server**
```bash
node server.js
```
Your application will be live at **`http://localhost:3000/`**

---

## 🛠️ Database Schema
```sql
CREATE TABLE p_log_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    files TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_files TEXT NOT NULL
);

CREATE TABLE uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    files TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_files TEXT NOT NULL
);

CREATE TABLE upload_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    upload_time DATETIME,
    token VARCHAR(255),
    FOREIGN KEY (token) REFERENCES uploads(token) ON DELETE CASCADE
);
```

---
---
---

## 📡 API Endpoints
### 🔼 **Upload Files**
```http
POST /api/upload
```
**Request:** `FormData` with files.
**Response:** `{ "token": "abcd1234" }`

### 🔽 **Retrieve Files**
```http
GET /api/download/:token
```
**Response:** List of files associated with the token.

### 🔽 **Magic Share Link**
```http
GET /:token
```
**Response:** Redirect to download section automaticaly for the respective file.

### ❌ **Delete Files**
```http
DELETE /api/delete-files/:token
```
**Effect:** Deletes files from `uploads/`, `upload_logs`, and `uploads` table.

---
---
---
---

## 🚀 Future Enhancements
✅ **Drag-and-Drop File Upload**
✅ **User Authentication & File Encryption**
✅ **Advanced File Expiry Settings**

---

## 👨‍💻 Contributors
### **🚀 Developed by @iBrokenShadow**  
🔗 [GitHub Profile](https://github.com/iBrokenShadow)  

