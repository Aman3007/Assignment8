require("dotenv").config();
const express = require("express")
const bodyparser = require("body-parser")
const mongoose = require("mongoose")
const methodOverride = require("method-override");

const app = express();
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyparser.urlencoded({ extended: true }))
app.use(methodOverride("_method")); 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

const TodoSchema = new mongoose.Schema({
    name: String,
    priority:String
})
const Todo = mongoose.model("Todo", TodoSchema)

// const todo = new Todo({
//     name: "do your homework",
//     priority:"High"
// })
// todo.save();

app.get("/", async (req, res) => {
    try {
        const data = await Todo.find({});
        res.render("list", { exej: data ,alertMsg:null});
    } catch (err) {
        console.log(err);

    }
});

app.post("/add", async (req, res) => {
    try {
        const { todo, priority } = req.body;
     if(!todo||todo.trim()===""){
  return res.render("list", {
            exej: await Todo.find({}),      
            alertMsg: " Todo field cannot be empty."
        });
     }else{
await Todo.insertOne({name:todo,priority:priority});
        res.redirect("/");
     }
        
    } catch (err) {
        console.error(err);
        
    }
});


app.get("/filter", async(req, res) => {
  const filter = req.query.priority ;
let filteredTodos;
  if (!filter||filter=="") {
    filteredTodos = await Todo.find({});
  } else {
    filteredTodos = await Todo.find({ priority: filter });
  }
  res.render("list", { exej: filteredTodos ,alertMsg:null});
});

app.get("/edit/:id", async(req, res) => {
  const edittodo =  await Todo.findById(req.params.id)
  res.render("edit", {task:edittodo});
});

app.put("/update/:id", async(req, res) => {
  const { todo, priority } =  req.body;
  await Todo.updateOne({_id:req.params.id},{$set:{name:todo,
    priority:priority}
  }) 
  res.redirect("/");
});


app.delete("/delete/:id", async (req, res) => {
  
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});


app.listen(3000, () => {
    console.log("server started")
})
