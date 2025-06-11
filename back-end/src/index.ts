import express from 'express';
import router from './router';
import dotenv from 'dotenv';
import cors from "cors";
import fileUpload from 'express-fileupload';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.urlencoded({ extended: true }));

 // Middleware to parse JSON requests
// app.use(express.static('public'));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
}));
app.use(cors())
app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});  