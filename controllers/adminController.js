// api for add doctor

import validator from "validator"
import {v2 as cloudinary} from'cloudinary'
import bcrypt from 'bcryptjs'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
const addDoctor= async (req,res)=>{
    try{

        const {name ,email ,password , speciality, degree, experience,about , fees , address} =req.body
const imageFile=req.file
// console.log({name ,email ,password , speciality, degree, experience,about , fees , address});


//checking for all data add doc

if( !name || !email || !password ||!speciality || !degree || !experience || ! about || !fees || !address){

    return res.json({success:false,message:"missing Details"})

}

//validate eMAIL

if(!validator.isEmail(email)){
    return res.json({success:false,message:"please enter a valid email"})
}


//vaildate strong password

if(password.length < 8)
{
    return res.json({success:false,message:"please enter a strong password"})
}


//doctor password

const salt= await bcrypt.genSalt(10)
const hashedPassword =await bcrypt.hash(password , salt)
//uplaod pic cloud
const imageUpload =await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
const imageUrl=imageUpload.secure_url


const doctorData={
    name,
    email,
    image:imageUrl,
    password:hashedPassword,
    speciality,
    degree,
    experience,
    about,
    fees,
    address:JSON.parse(address),
    date:Date.now()
}


const newDoctor= new doctorModel(doctorData)
await newDoctor.save()

res.json({success:true,message:"physiotherapist Added"})

    }
    
    
    catch (error){ 
        console.log(error);
        res.json({success:false,message:error.message})
        

    }
}


//api admin login

const loginAdmin= async(req,res)=>{

    try{

const {email,password}=req.body

if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){


const token = jwt.sign(email+password,process.env.JWT_SECRET)

res.json({success:true,token})


}else{
    res.json({success:false,message:"invaild credentials"})
}

    }

    catch (error){ 
        console.log(error);
        res.json({success:false,message:error.message})
        

    }

}


//api to get doctors list

const allDoctors= async (req,res)=>{

    try{

        const doctors= await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})
   
        

    }catch (error){

        console.log(error);
        res.json({success:false,message: error.message})
        



    }

}

//api ro get all appointments list
const appointmentsAdmin=async (req,res) => {
    
    try {

        const appointments =await appointmentModel.find({})
        res.json({success:true,appointments})
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message: error.message})
    }
}

//api for cancell

const appointentCancel = async (req, res) => {
    try {

        const {appointmentId } = req.body

        const appoinmentData = await appointmentModel.findById(appointmentId)

     
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        //cancel slot

        const { docId, slotDate, slotTime } = appoinmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e != slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: "appointment cancelled" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


//api dashbord pannel

const adminDashboard= async (req,res) => {
    try {

const doctors =await doctorModel.find({})
const users= await userModel.find({})
const appoinments =await appointmentModel.find({})

const dashData ={
    doctors: doctors.length,
    appoinments: appoinments.length,
    patients: users.length,
    latestAppointments: appoinments.reverse().slice(0,5)
}

res.json({success:true,dashData})

        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export {addDoctor,loginAdmin,allDoctors,appointmentsAdmin ,appointentCancel,adminDashboard}