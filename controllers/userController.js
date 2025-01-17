import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
//api reg user

const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body

        if (!name || !password || !email) {

            return res.json({ success: false, message: "missing details" })



        }
        // validating email format

        if (!validator.isEmail(email)) {

            return res.json({ success: false, message: "Enter a Valid email" })

        }

        // validating strong pass

        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })

        }

        // hashing user password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)


        const userData = {
            name,
            email,
            password : hashedPassword
        }


        const newUser = new userModel(userData)
        const user = await newUser.save()


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {

        console.log(error);
        res.json({ success: false, message: error.message })

    }
}




//api log user


const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "user does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


//api to get user ptofile

const getProfile = async (req, res) => {
    try {

        const { userId } = req.body

        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// api update

const updateProfile = async (req, res) => {
    try {


        const { userId, name, phone, address, dob, gender } = req.body

        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {

            return res.json({ success: false, message: "data missing" })



        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload img to cloudinary


            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageURL = imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId, { image: imageURL })


        }


        res.json({ success: true, message: "profile updated" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}



// api to book appoinment

const bookAppointment = async (req, res) => {
    try {

        const { userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select('-password')
        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not Available' })


        }

        let slots_booked = docData.slots_booked

        // check slots avali-

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'slot not Available' })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appoinmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appoinmentData)
        await newAppointment.save()

        //save new slots data in docData

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: "Appointment booked" })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


// api to get user appointments

const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }


}


//cancel appointment

const cancelAppointent = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body

        const appoinmentData = await appointmentModel.findById(appointmentId)

        //verify appointment user
        if (appoinmentData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" })
        }

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


//api payment razor
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})
const paymentRazorpay = async (req, res) => {

    try {

        const { appointmentId } = req.body
        const appoinmentData = await appointmentModel.findById(appointmentId)

        if (!appoinmentData || appoinmentData.cancelled) {
            return res.json({ success: false, message: "appointment cancelled or not found" })
        }

        // creating options
        const options = {
            amount: appoinmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }
        //creation order
        const order = await razorpayInstance.orders.create(options)
        res.json({ success: true, order })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }



}

//api to verify payment
const verifyRazorpay= async (req,res) => {
    try {
        
const {razorpay_order_id} =req.body
const orderInfo =await razorpayInstance.orders.fetch(razorpay_order_id)

// console.log(orderInfo);
if (orderInfo.status==='paid') {
await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
res.json({success:true,message:"payment successful"})

    
}else{
    res.json({success:false,message:"payment failed"}) 
}



    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


export { registerUser, getProfile, loginUser, updateProfile, bookAppointment, listAppointment, cancelAppointent,paymentRazorpay,verifyRazorpay }