//jshint esversion:6
const port = 3000;
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect to db via mongoose
// async function main(){
//     await 
    mongoose.connect("mongodb+srv://eferoghenej:ayoola123@cluster0.heabi.mongodb.net/todolistDB", {useNewUrlParser: true});

    //create items schema
    const itemsSchema = {
      name: {
        type: String,
        required: true
      }
    };

    const Item = mongoose.model("Item", itemsSchema);

    const code = new Item({
      name: "Code"
    });

    const eat = new Item({
      name: "Eat"
    });

    const campaignOffice = new Item({
      name: "Visit Campaign Office"
    });

    const defaultItems =[code, eat, campaignOffice];

    const listSchema = {
      name: {
        type: String,
        required: true
      },
      items: [itemsSchema]
    };

    const List = mongoose.model("List", listSchema);
    
// }


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", (req,res) => {

// const day = date.getDate();
  Item.find({}, (err, foundItems) => {
    
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, (err) =>{
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved new documents");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

  

});

app.get("/:customListName", (req,res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},(err, foundList) =>{
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      }else{
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

  
});

app.post("/", (req,res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newTask = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newTask.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(newTask);
      foundList.save();
      res.redirect("/" + listName);
    });
  };

  
});

app.post("/delete", (req,res) => {
  const checkedTask = req.body.checked;
  const listName = req.body.listName;

  if(listName === "Today"){
    const clearTask = Item.findByIdAndRemove(checkedTask, (err) => {
      if(err){
        console.log(err);
      }else{
        console.log("Task successfully removed");
      }
      res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedTask}}}, (err, foundList) =>{
      if(!err){
        res.redirect("/" + listName);
      }
    });

  }

  
});


app.get("/about", (req,res) => {
  res.render("about");
});

app.listen(process.env.PORT || port, () => {
  console.log("Server started on port 3000");
});
