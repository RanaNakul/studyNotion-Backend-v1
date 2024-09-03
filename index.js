
const express = require("express");
const app = express();

const userRouter = require("./routes/User");
const CourseRouter = require("./routes/Course");
const PaymentsRouter = require("./routes/Payments");
const ProfileRouter = require("./routes/Profile");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const agenda = require('./config/agenda');

const PORT = process.env.PORT || 4000;

database.connect();

app.use(cookieParser());
app.use(express.json());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials: true
    })
);

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)

cloudinaryConnect();

app.use("/api/v1/auth",userRouter);
app.use("/api/v1/course",CourseRouter);
app.use("/api/v1/payment",PaymentsRouter);
app.use("/api/v1/profile",ProfileRouter);

(async function() {
    await agenda.start();
    console.log('Agenda started');
})();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

app.get("/", (req,res) => {
    return res.json({
        success: true,
        message:"Your Server is up and running..."
    });
});
