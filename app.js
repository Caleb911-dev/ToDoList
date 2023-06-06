

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-caleb:caleb123@cluster0.kpb5jgh.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true,});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "bookss"
});

const item2 = new Item({
  name: "tech"
});

const item3 = new Item({
  name: "real estate"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){

    if( foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
        console.log("success, saved to DB");
      }).catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch(function(err){
    console.log(err);
  })
});

app.get("/:customListName",  function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  // let foundList= await List.findOne({name: customListName}).exec();
  // if(!foundList){
  //   const list = new List({
  //     name: customListName,
  //     items: defaultItems
  //   });
  
  //   list.save();
  //   console.log("its brand new");
  //   res.send("its brand new");
  // }else{
  //   console.log("it already exists");
  //   res.send("it already exists");
  // }

  List.findOne({name: customListName}).then(function(foundList){
      if(!foundList){
        // create the custom list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
      res.redirect("/" + customListName);
    }else{
      // show the existing list
      res.render("list",  {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(err){
    console.log(err);
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

    if(listName === "Today"){
    item.save();

    res.redirect("/");
    }else{
      List.findOne({name: listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }).catch(function(err){
        console.log(err);
      })
    }

  });

app.post("/delete", function(req, res){

  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem).then(function(){
      console.log("deleted");
      res.redirect("/");
    }).catch(function(err){
      console.log(err);
    })
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}).then(function(foundList){
      res.redirect("/" + listName);
    }).catch(function(err){
      console.log(err);
    })
  }
  
});


app.get("/about", function(req, res){
  res.render("about");
});

const port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Server started on port");
});
