const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const validator = require("validator");
const bcryptjs = require("bcryptjs");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate: (value) => {
            if(!validator.isEmail(value)){
                throw new Error("The email is incorrect.");
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        validate: (value) => {
            if(value.toLowerCase().includes("password")){
                throw new Error("The password should not contain the word password!");
            }
        }
    },
    profileImage:{
        type: String,
        default: "profile.png"
    },
    confirm:{
        type: Boolean,
        default: false
    }
});

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
});

userSchema.pre("save", async function(next){
    const user = this;

    if(user.isModified("password")){
        user.password = await bcryptjs.hash(user.password, 8);
    }

    next();
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email: email});

    if(!user){
        return {error: "Invalid Credentials!"};
    }

    if(!user.confirm){
        return {error: "Please confirm your email account!"};
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if(isMatch){
        return user;
    }

    return {error: "Invalid Credentials!"};
}

userSchema.statics.getPublicData = (user) => {
    return {
        _id: user._id,
        name: user.name,
        age: user.age,
        email: user.email,
        profileImage: user.profileImage
    }
}

userSchema.statics.uploadImage = async (file) => {
    // Check if file type is allowed
    const allowedFiles = ["jpeg", "png", "JPEG", "gif", "jpg"];
    const ext = file.name.split(".").pop();

    if(!allowedFiles.includes(ext)){
        return {error: "Please upload image files!"};
    }

    // Limit the size of the uploaded file to 5mb 1024 * 5
    const fiveMbInBites = 5 * 1024 * 1024;

    if(file.size > fiveMbInBites){
        return {error: "Image file should be less than 5mb!"};
    }

    // Change the name of the file to a unique name
    const filename = new ObjectId().toString() + "." + ext;
    
    try{
        await file.mv(path.resolve("./public/images/" + filename));
        return {filename: filename};
    }catch(e){
        return {error: "Something went wrong. Unable to upload image!"}
    }
}

userSchema.statics.removeImage = (filename) => {
    try{
        fs.unlink("./public/images/" + filename, (e) => {
            if(e){
                return {error: "Something went wrong unable to remove image"}
            }

            return "File removed successfully!";
        });
        
    }catch(e){
        return {error: "Something went wrong. Unable to remove file."}
    }
}

const User = mongoose.model("User", userSchema);

module.exports = User;