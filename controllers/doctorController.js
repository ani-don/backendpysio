
import doctorModel from "../models/doctorModel.js";

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js";
const changeAvailablity= async (req,res)=>{

    try{

        const {docId} = req.body


        const docData =await doctorModel.findById(docId)

        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true,message:'availability changed'})

    }catch(error){


        console.log(error);
        res.json({success:false,message:error.message})
        
    }




}

const doctorList=async(req,res)=>{
    try {
        const doctors =await doctorModel.find({}).select(['-password','-email'])


        res.json({success:true,doctors})
        
    } catch (error) {

        console.log(error);
        res.json({success:false,message:error.message})
        
    }
}


//api for doc login
const loginDoctor= async (req,res) => {

    try {
        
const {email,password}= req.body

const doctor=await doctorModel.findOne({email})

if (!doctor) {
    return res.json({success:false,message:"invalid credentails"})
}

const isMatch=await bcrypt.compare(password,doctor.password)


if (isMatch) {
    
const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)

res.json({success:true,token})


}else{
    return res.json({success:false,message:"invalid credentails"})
}
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
    
}



//api to get doctor appointments

const appointmentsDoctor=async (req,res) => {
    try {

        const {docId}=req.body
        const appointments =await appointmentModel.find({docId})
        res.json({success:true,appointments})

      
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}
//api to mark appintment 

const appointmentComplete=async (req,res) => {
    
    try {
        
const {docId,appointmentId}=req.body

const appoinmentData =await appointmentModel.findById(appointmentId)

if (appoinmentData && appoinmentData.docId === docId) {
    
    await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})
    return res.json({success:true,message:"appointment completed"})
}else{
    return res.json({success:false,message:'mark failed'})
}


    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message}) 
    }
}

//api to cancell
const appointmentCancel=async (req,res) => {
    
    try {
        
const {docId,appointmentId}=req.body

const appoinmentData =await appointmentModel.findById(appointmentId)

if (appoinmentData && appoinmentData.docId === docId) {
    
    await appointmentModel.findByIdAndUpdate(appointmentId,{Cancelled:true})
    return res.json({success:true,message:"appointment cancelled"})
}else{
    return res.json({success:false,message:'cancel failed'})
}


    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message}) 
    }
}



//api to doc pannel

const doctorDashboard =async (req,res) => {
    try {

        const {docId} =req.body
        const appointments = await appointmentModel.find({docId})

        let earnings = 0

        appointments.map((item)=>{
if (item.isCompleted || item.payment) {
    earnings += item.amount
}
        })

        let patients = []

        appointments.map((item)=>{
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData ={
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }
        res.json({success:true,dashData})
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message}) 
    }
}
//api to doctor profile

const doctorProfile =async (req,res) => {
    try {

        const {docId}=req.body
const profileData=await doctorModel.findById(docId).select('-password')
res.json({success:true,profileData}


)      
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message}) 
    }
}

//api to update doc pro

const updateDoctorProfile=async (req,res) => {
    try {

        const {docId,fees,address,available}=req.body
        await doctorModel.findByIdAndUpdate(docId,{fees,address,available})

        res.json({success:true,message:"profile Updated"})
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message}) 
    }
}

export {changeAvailablity,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
}