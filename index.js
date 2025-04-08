import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv'
import router from './route/userRoute.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({origin: "https://registerkaroo.netlify.app", methods: "GET,POST,PUT,DELETE", credentials: true}));
app.options('*', cors());


app.use('/api/users',router)

async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI)
        .then(()=> console.log('MongoDB connected'))
    } catch (error) {
        console.log(error,'MongoDB connection failed')
    }
}

connectDB();
app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})
