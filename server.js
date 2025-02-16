// Fix Loading when clicked on delete file
// Fix Loading in Sending Error Report loading starting very late


require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");
const JSZip = require("jszip");
const moment = require("moment");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true); // Trust the first proxy

// Enable CORS for frontend requests
app.use(cors({ origin: "*" }));
app.use(cors());
// Create upload directory if not exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Destination directory
    },
    filename: (req, file, cb) => {
        // Replace spaces with hyphens in the original file name
        const sanitizedFileName = file.originalname.replace(/\s+/g, '-');
        // Use timestamp and sanitized filename
        cb(null, Date.now() + "-" + sanitizedFileName);
    },
});

const upload = multer({ storage, limits: { fileSize: 30 * 1024 * 1024 } }); // 30MB limit (adjusted)


// MySQL Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST || "xxx",
    user: process.env.DB_USER || "xxx",
    password: process.env.DB_PASSWORD || "xxx",
    database: process.env.DB_NAME || "xxx",
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10, // Set the connection limit
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("👾 Connected to MySQL Database.");
    connection.release(); // Always release the connection after using it
});
const checkConnection = () => {
    if (db.state === 'disconnected') {
        db.connect((err) => {
            if (err) {
                console.error("Database connection failed:", err);
                return;
            }
            console.log("âœ… Reconnected to MySQL Database.");
        });
    }
};


checkConnection();

// Check Upload Count API
app.get("/api/check-upload-count", (req, res) => {
    checkConnection();
    const ipAddress = req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'].split(',')[0].trim() // Get the first IP
        : req.connection.remoteAddress;
    const timeLimit = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss'); // 24 hours ago

    // Query to count uploads by this IP address in the last 24 hours
    db.query(
        "SELECT COUNT(*) AS uploadCount, MAX(upload_time) AS recentUploadTime FROM upload_logs WHERE ip_address = ? AND upload_time > ?",
        [ipAddress, timeLimit],
        (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Database error." });
            }
            const uploadCount = result[0].uploadCount;
            const recentUploadTime = result[0].recentUploadTime;

            // Return both the count and the recent upload time
            res.json({
                uploadCount: uploadCount,
                recentUploadTime: recentUploadTime ? new Date(recentUploadTime).toISOString() : null
            });
        }
    );
});

// File Upload API with Check for Total Files Uploaded in Last 24 Hours
app.post("/api/upload", upload.array("files", 10), (req, res) => {
    checkConnection();
    console.log("Files received:", req.files); // Log files
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded." });
    }

    console.log("\n\n\nFiles received:", req.files);

    const ipAddress = req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'].split(',')[0].trim() // Get the first IP
        : req.connection.remoteAddress;
    const timeLimit = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss'); // 24 hours ago

    // Query to count total files uploaded by this IP address in the last 24 hours
    db.query(
        "SELECT COUNT(*) AS fileCount FROM upload_logs WHERE ip_address = ? AND upload_time > ?",
        [ipAddress, timeLimit],
        (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Database error." });
            }

            // If the user has already uploaded 5 or more files in the last 24 hours, reject the upload
            if (result[0].fileCount >= 10) {
                return res.status(400).json({ error: "You can only upload up to 10 files within 24 hours." });
            }

            // Proceed with the file upload if the count is less than 5
            const token = crypto.randomBytes(6).toString("hex"); // Generate random 6-character token
            const fileNames = req.files.map(file => file.filename);  // File names already sanitized
            const originalFileNames = req.files.map(file => file.originalname);

            // Insert into MySQL for files
            db.query(
                "INSERT INTO uploads (token, ip_address, files, original_files) VALUES (?, ?, ?, ?)",
                [token, ipAddress, JSON.stringify(fileNames), JSON.stringify(originalFileNames)],
                (err, result) => {
                    if (err) {
                        console.error("Database Insert Error:", err);
                        return res.status(500).json({ error: "Database error." });
                    }

                    // Permanent Log for Admin
                    db.query(
                        "INSERT INTO p_log_admin (token, ip_address, files, original_files) VALUES (?, ?, ?, ?)",
                        [token, ipAddress, JSON.stringify(fileNames), JSON.stringify(originalFileNames)],
                        (err) => {
                            if (err) {
                                console.error("Error logging admin record:", err);
                            }
                        }
                    );


                    // Log each file upload separately in upload_logs with the user's IP and token
                    req.files.forEach(file => {
                        db.query(
                            "INSERT INTO upload_logs (ip_address, upload_time, token) VALUES (?, NOW(), ?)",
                            [ipAddress, token],
                            (err) => {
                                if (err) {
                                    console.error("Error logging upload:", err);
                                }
                            }
                        );
                    });

                    res.json({ token });
                }
            );
        }
    );
});




// File Download API
app.get("/api/download/:token", (req, res) => {
    checkConnection();
    const token = req.params.token;

    db.query("SELECT files FROM uploads WHERE token = ?", [token], (err, result) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ error: "Database error." });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Invalid token or files not found." });
        }

        const files = JSON.parse(result[0].files);
        res.json({ files });
    });
});

// Serve Uploaded Files
app.get("/api/files/:filename", (req, res) => {
    checkConnection();
    const filePath = path.join(uploadDir, req.params.filename);
    res.download(filePath, (err) => {
        if (err) {
            console.error("Download error:", err);
            res.status(500).send("Unable to download the file.");
        }
    });
});































// Set CORS headers properly for all responses
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
});

// Zip Download API
app.get("/api/zip-download/:token", (req, res) => {
    const token = req.params.token;
    console.log("Processing zip for token:", token);

    db.query("SELECT files FROM uploads WHERE token = ?", [token], (err, result) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ error: "Database error." });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Invalid token or files not found." });
        }

        const fileNames = JSON.parse(result[0].files);
        console.log("Files to zip:", fileNames);

        const zip = new JSZip();
        let filesProcessed = 0;
        let fileAdded = false;

        fileNames.forEach((file) => {
            const decodedFileName = decodeURIComponent(file);
            const filePath = path.join(uploadDir, decodedFileName);

            fs.stat(filePath, (err, stats) => {
                if (err || !stats.isFile()) {
                    console.error(`File not found: ${filePath}`);
                } else {
                    const fileContent = fs.readFileSync(filePath);
                    zip.file(decodedFileName, fileContent);
                    fileAdded = true;
                }

                filesProcessed++;

                if (filesProcessed === fileNames.length) {
                    if (!fileAdded) {
                        return res.status(400).json({ error: "No files were added to the zip." });
                    }

                    const now = new Date();
                    const day = String(now.getDate()).padStart(2, '0');
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const year = String(now.getFullYear()).slice(-2);
                    const hour = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const zipFileName = `ZeroTrace-${month}${day}${year}-${hour}${minutes}.zip`;

                    // Set correct headers
                    res.setHeader("Content-Type", "application/zip");
                    res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);

                    // Stream the zip file
                    zip.generateNodeStream({ type: "nodebuffer", streamFiles: true })
                        .pipe(res)
                        .on("finish", () => console.log("Zip file successfully sent."))
                        .on("error", (err) => {
                            console.error("Error streaming zip:", err);
                            res.status(500).json({ error: "Failed to stream zip file." });
                        });
                }
            });
        });
    });
});




















// DELETE route to delete files and associated database records
app.delete("/api/delete-files/:token", (req, res) => {
    const token = req.params.token;

    // Query to get the file names associated with the token
    db.query("SELECT files, original_files FROM uploads WHERE token = ?", [token], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error." });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Token not found." });
        }

        const { files, original_files } = result[0];
        const fileNames = JSON.parse(files); // Array of file names
        const originalFileNames = JSON.parse(original_files); // Original file names (if needed)

        // Delete the files from the server
        fileNames.forEach(fileName => {
            const filePath = path.join(uploadDir, fileName);
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error deleting file: ${filePath}`, err);
                    } else {
                        console.log(`File deleted: ${filePath}`);
                    }
                });
            }
        });

        // Remove the database records related to this token
        db.query("DELETE FROM uploads WHERE token = ?", [token], (err) => {
            if (err) {
                console.error("Error deleting upload record:", err);
                return res.status(500).json({ error: "Failed to delete upload records." });
            }

            // Optionally, delete records from the upload_logs table
            db.query("DELETE FROM upload_logs WHERE token = ?", [token], (err) => {
                if (err) {
                    console.error("Error deleting log records:", err);
                    return res.status(500).json({ error: "Failed to delete upload logs." });
                }

                res.json({ success: true, message: "Files and records deleted successfully." });
            });
        });
    });
});





// Middleware to parse JSON bodies
app.use(express.json());  // Ensure this line is here
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Allow cross-origin requests if necessary


// Configure SMTP Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SSL_TLS || true,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Email Sending API
app.post("/api/send-email", async (req, res) => {
    // console.log("Received request body:", req.body); // Debugging log 

    const { emailMessage } = req.body; // Get emailMessage from request

    if (!emailMessage) {
        return res.status(400).json({ success: false, error: "Missing emailMessage in request body" });
    }

    const mailOptions = {
        from: '"ZeroTrace Report Error" <zerotrace@ibrokenshadow.com>',
        to: "zerotrace@ibrokenshadow.com",
        subject: "Error Reported",
        // You can pass the `emailMessage` (the HTML formatted message)
        text: "Error details in HTML format", // Fallback text version of the email
        html: `${emailMessage}`, // The HTML message that is passed from the client
    };    

    try {
        let info = await transporter.sendMail(mailOptions);
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});




app.listen(PORT, () => {
    console.log(`👾 Server running on http://localhost:${PORT}`);
});