var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mongoose = require("mongoose");
const encrypt = require("bcryptjs");
const Cryptr=require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.Promise = Promise;

var dbUrl='mongodb+srv://1234:1234@cluster0.1aehx.mongodb.net/chatdata?retryWrites=true&w=majority';

var Message = mongoose.model("Message", {
  name: String,
  message: String,
});

app.get("/getmessages", (req, res) => {
  let decryptedmessage=[]; 
  try {
    Message.find({}, (err, messages) => {
      console.log(messages);
      messages.map(curr=>(

        decryptedmessage.push(cryptr.decrypt(curr.message))
      ))
      console.log(decryptedmessage);
      res.send(messages);
      
    });
  } catch (err) {
    res.json(err);
    console.log(err);
  }
});

app.post("/postmessages", async (req, res) => {
  let plaintext = req.body.message;
  let hashedpassword;
  let encryptedString;
  try {
    console.log(req.body);
    // hashedpassword = await encrypt.hash(plaintext, 10);
     encryptedString = cryptr.encrypt(plaintext);
    console.log(encryptedString);
  } catch (err) {
    console.log(err);
  }
  try {
    var message = await new Message({
      name: req.body.name,
      message: encryptedString,
    });

    var savedMessage = await message.save();

    console.log("saved");

    var censored = await Message.findOne({ message: "badword" });

    if (censored) await Message.deleteOne({ _id: censored.id });
    else io.emit("message", req.body);

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  } finally {
    console.log("message post called");
  }
});

mongoose
  .connect(
  'mongodb+srv://1234:1234@cluster0.1aehx.mongodb.net/chatdata?retryWrites=true&w=majority'
  )
  .then(() => {
    var server = http.listen(3000, () => {
      console.log(`Server listening on 3000`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
