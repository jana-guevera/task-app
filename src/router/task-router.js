const express = require("express");
const Task = require("../models/task.js");

const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/api-auth.js");

const router = express.Router();

router.get("/tasks", auth, (req, res) => {
    res.render("tasks", {user: req.session.user});
});

// ---------------------------------------- API Endpoints ----------------------------------------

// Create Task
router.post("/api/tasks", apiAuth, async (req, res) => {
    req.body.owner = req.session.user._id;
    const task = new Task(req.body);

    try{
        await task.save();
        res.send(task);
    }catch(e){
        res.send({error: e.message});
    }
});

// Read all tasks
router.get("/api/tasks", apiAuth, async (req, res) => {
    try{
        var tasks = [];

        if(req.query.search){
            tasks = await Task.find({owner: req.session.user._id, description: {$regex: req.query.search, $options: "i"}});
        }else{
            tasks = await Task.find({owner: req.session.user._id});
        }
        
        res.send(tasks);
    }catch(e){
        res.send({error: e.message});
    }
});

// Read single task
router.get("/api/tasks/:id", apiAuth, async (req, res) => {
    const id = req.params.id;

    try{
        const task = await Task.findOne({_id: id, owner: req.session.user._id});

        if(task){
            return res.send(task);
        }
 
        res.send({error: "Task not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

// Update a Task
router.patch("/api/tasks/:id", apiAuth, async (req, res) => {
    const id = req.params.id;
    const owner = req.session.user._id;
    
    const allowedUpdates = ["description", "completed"];
    const updates = Object.keys(req.body);

    const isValid = updates.every((key) => {
        return allowedUpdates.includes(key);
    });

    if(!isValid){
        return res.send({error: "Invalid Updates!"});
    }

    try{
        const task = await Task.findOneAndUpdate({_id: id, owner: owner}, req.body, {new: true});

        if(task){
            return res.send(task);
        }
        
        res.send({error: "Unable to update task. Task not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

// Delete Task
router.delete("/api/tasks/:id", apiAuth, async (req, res) => {
    const id = req.params.id;

    try{
        const task = await Task.findOneAndDelete({_id: id, owner: req.session.user._id});

        if(task){
            return res.send(task);
        }

        res.send({error: "Unable to remove task. The task is not found!"});

    }catch(e){
        res.send({error: e.message});
    }
});

module.exports = router;

