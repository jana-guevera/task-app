const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_CONNECTION);


// "mongodb+srv://admin:admin123@cluster0.tjrph.mongodb.net/task-manager-api?retryWrites=true&w=majority"


// Working between Development env and Production Env