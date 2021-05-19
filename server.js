var connectionString = 'mongodb+srv://fabz:admin@cluster0.pe6mh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const bodyParser = require('body-parser');
const express = require('express');
const mongo = require('mongodb');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const mongoObjId = require('mongodb').ObjectID;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
var nodemailer = require('nodemailer');
app.use(bodyParser.json())

/**
var transporter = nodemailer.createTransport({
  service: 'smtp.gmail.com',
  auth: {
    user: 'do.not.reply.emailbot.fabio@gmail.com',
    pass: 'Sitel123!'
  }
});
*/


MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {

    //Server logs message when server turns on successfully
    console.log('Connected to Database')

    //Connects to DB
    const db = client.db('todolist')

    //Connects to collection list-items
    const listCollection = db.collection('list-items')

    //Authenticates user
    app.post('/login', async (req, res, next) => {
      if (req.body.username == "admin" && req.body.password == "admin") {
        console.log("correct pasword")
        res.redirect('/show-ordered')
      } else {
        res.redirect('/')
      }
    });

    //Renders template in EJS file
    app.get('/show', (req, res) => {
      listCollection.find().toArray()
        .then(results => {
          res.render('index.ejs', { items: results })
        }).catch(error => console.error(error))
    })

    //Renders template in EJS file, ordere chronologically
    app.get('/show-ordered', (req, res) => {
      listCollection.find({}).sort({ date: 1 }).toArray()
        .then(results => {
          res.render('index.ejs', { items: results })
        }).catch(error => console.error(error));
    })


    //Renders template in EJS file, daily events
    app.get('/show-ordered-daily', (req, res) => {

      let today = new Date().toISOString().slice(0, 10)

      listCollection.find({ date: today }).sort({ date: 1 }).toArray()
        .then(results => {
          res.render('index.ejs', { items: results })
        })
        .catch(error => console.error(error));
    })


    //Renders template in EJS file, weekly events
    app.get('/show-ordered-weekly', (req, res) => {

      let today = new Date().toISOString().slice(0, 10)

      listCollection.find({ "date": { "$gte": today, "$lt": "2021-05-24" } }).sort({ date: 1 }).toArray()
        .then(results => {
          res.render('index.ejs', { items: results })
        })
        .catch(error => console.error(error));
    })


    //Renders template in EJS file, monthly events
    app.get('/show-ordered-monthly', (req, res) => {

      let today = new Date().toISOString().slice(0, 10)

      listCollection.find({ "date": { "$gte": today, "$lt": "2021-06-01" } }).sort({ date: 1 }).toArray()
        .then(results => {
          res.render('index.ejs', { items: results })
        })
        .catch(error => console.error(error));
    })


    //POST that adds new items to collection
    app.post('/add_list_item', (req, res) => {
      /** 
      console.log(req.body.participants)

      let emailsArray = req.body.participants.split(",");

      
       for (var i = 0 ; i < emailsArray; i++) {
        var mailOptions = {
          from: 'do.not.reply.emailbot.fabio@gmail.com',
          to: req.body.participants,
          subject: req.body.title,
          text: req.body.description
        }

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

       }
       */

      listCollection.insertOne(req.body)
        .then(result => {
          console.log(result)
          res.redirect('/show-ordered')

        })
        .catch(error => console.error(error))
    })

    //prints current items in db to terminal
    app.get('/test', (req, res) => {
      listCollection.find().toArray()
        .then(results => {
          console.log(results)
        })
        .catch(error => console.error(error))
    })

    //delete item from within web ui;
    app.get('/delete/:id', function (req, res) {
      let id = req.params.id;
      listCollection.deleteOne({ _id: new mongo.ObjectId(id) }, function (err, results) { });
      res.redirect('/show-ordered')
      res.json({ success: id })
    });

    //updates existing item
    app.post('/edit/:id', async (req, res, next) => {
      let id = req.params.id;
      let updatedItem = { title: req.body.title, description: req.body.description, date: req.body.date, participants: req.body.participants };
      listCollection.updateOne({ "_id": mongoObjId(id) }, { $set: updatedItem });
      res.redirect('/show-ordered')
    });

    //delete item API;
    app.delete('/api/delete/:id', function (req, res) {
      let id = req.params.id;
      listCollection.deleteOne({ _id: new mongo.ObjectId(id) }, function (err, results) { });
      res.json({ success: id })
    });

    //API that returns all items in collection
    app.get('/api/all_items', (req, res) => {
      listCollection.find().toArray()
        .then(results => {
          res.json({ items: results })
        })
        .catch(error => console.error(error))
    })

    //API to update users
    app.put('/api/edit/:id', async (req, res, next) => {
      let id = req.params.id;
      let newvalues = req.body;
      listCollection.updateOne({ "_id": mongoObjId(id) }, { $set: newvalues });

    });

  })

  
//for use in cloud
app.listen(process.env.PORT, function () {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
  }
  console.log('listening on 3000')
})

app.get('*', (request, response) => {
	response.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});


/** for use in local machine 
app.listen(3000, function () {
  console.log('listening on 3000')
})
*/

//start page, loads log-in screen;
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

