import express from 'express'

import cors from 'cors'
import 'dotenv/config'
import connectCloudinary from './config/cloudinary.js'
import connectDB from './config/mongodb.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import blogRoute from './routes/blogRoute.js'


import path from'path'
import userRouter from './routes/userRoute.js'

//APPCONFIG

const app =express()
const port= process.env.PORT || 4000
connectDB()
connectCloudinary()
//middelwares

app.use(express.json())
app.use(cors())

app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));
//api end point
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/blogs',blogRoute)







//local host port/api/admin/add-doc


app.get('/',(req,res)=>{

    res.send('API working')

})

app.listen(port, ()=> console.log('server started',port))