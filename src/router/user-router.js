const path = require("path");
const express = require("express");
const User = require("../models/user.js");

const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/api-auth.js");

const email = require("../utils/email.js");

const router = express.Router();

// ======================================== Page Routes ======================================
router.get("/", (req, res) => {
    if(req.session.user){
        req.session.user = undefined;
    }

    res.render("index", {msg: req.query.msg});
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/profile", auth, (req, res) => {
    res.render("profile", {user: req.session.user});
});

router.get("/confirm_account", async (req, res) => {
    const id = req.query.userid;

    try{
        const user = await User.findByIdAndUpdate(id, {confirm: true});

        if(!user){
            return res.redirect("/");
        }

        res.redirect("/?msg=Email confirmed successfully. Please login");
    }catch(e){
        res.redirect("/");
    }
});

// ======================================== API Endpoints =====================================

// Login Route
router.post("/api/users/login", async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);

        if(user.error){
            return res.send(user);
        }

        req.session.user = User.getPublicData(user);
        return res.send(User.getPublicData(user));
    }catch(e){
        res.send({error: "Unable to login. Please try again!"});
    }
});

// Create User
router.post("/api/users", async (req, res) => {
    const user = new User(req.body);
    try{
        await user.save();
        await email.sendConfirmEmail(user);
        res.send(User.getPublicData(user));
    }catch(e){
        res.send({error: e.message});
    }
});

// Read all users
router.get("/api/users", async (req, res) => {

    try{
        const users = await User.find({}, {password:0});
        res.send(users);
    }catch(e){
        res.send({error: e.message});
    }
});

// Read single user
router.get("/api/users/:id", async (req, res) => {
    const id = req.params.id;

    try{
        const user = await User.findById(id, {password: 0});

        if(user){
            return res.send(user);
        }
 
        res.send({error: "User not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

// Update a User
router.patch("/api/users/", apiAuth, async (req, res) => {
    const id = req.session.user._id;

    // check if file exist and upload file
    if(req.files){
        const result = await User.uploadImage(req.files.profileImage);

        if(result.error){
            return res.send(result);
        }

        req.body.profileImage = result.filename; 
    }
    
    // Update the user profile
    const allowedUpdates = ["name", "age", "password", "profileImage"]; 
    const updates = Object.keys(req.body);

    const isValid = updates.every((key) => {
        return allowedUpdates.includes(key);
    });

    if(!isValid){
        return res.send({error: "Invalid Updates!"});
    }

    try{
        const user = await User.findById(id);
        const prevImage = user.profileImage;

        if(!user){
            return res.send({error: "User not found!"});
        }

        updates.forEach((update) => {
            user[update] = req.body[update];
        });

        await user.save();
        req.session.user = User.getPublicData(user);
        res.send(User.getPublicData(user));

        if(req.body.profileImage && prevImage !== "profile.png"){
            const result = User.removeImage(prevImage);
        }
    }catch(e){
        res.send({error: e.message});
    }
});

// Delete User
router.delete("/api/users/:id", async (req, res) => {
    const id = req.params.id;

    try{
        const user = await User.findByIdAndDelete(id, {password: 0});

        if(user){
            return res.send(user);
        }

        res.send({error: "Unable to remove user. The user is not found!"});

    }catch(e){
        res.send({error: e.message});
    }
});


module.exports = router;