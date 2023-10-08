import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { resolve, join } from 'path';
// import { spawn } from 'child_process';

dotenv.config();
const app = express();
app.use(cors());
const currentVersion = 'v1';

//Init Middleware
app.use(express.json({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


if (process.env.NODE_ENV === 'production') {
    const __dirname = resolve();
    app.use(express.static(join(__dirname, '/web/build')));
    app.get('*', (req, res) => {
        res.sendFile(resolve(__dirname, 'web', 'build', 'index.html'))
    })
} else {
    app.get(`/api/${currentVersion}`, async (req, res) => {
        res.send("API is running...")
    });
}

// app.get(`/api/${currentVersion}/:country/:count`, async (req, res) => {
//     try {
//         const country = req.params.country;
//         const count = req.params.count;
//         console.log("Tst", country, count);
//         const data_to_pass = { country, count };
//         const fetchCords_python = spawn('python', ['./server/link.py', JSON.stringify(data_to_pass)]);
//         fetchCords_python.stdout.on('data', (data) => {
//             res.send(JSON.parse(data));
//         })
//         fetchCords_python.stderr.on("data", (data) => {
//             console.log(`stderr ${data}`);
//         });
//     } catch (err) {
//         console.log(err);
//         res.send(err);
//     }
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running`));