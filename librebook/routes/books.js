var express = require('express');

var router = express.Router();

var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');


router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function (req, res) {
    if(req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._mehtod;
        delete req.body._method;
        return method;
    }
}))

//build the REST operations at the base for books
//this will be accessible from http://127.0.0.1:3000/books if the default route for / is left unchanged
router.route('/')
    .get(function (req, res, next) {
        //retrieve all books from Monogo
        mongoose.model('Book').find({}, function (err, books) {
            if(err) {
                return console.error(err);
            } else {
                //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
                    //HTML response will render the index.jade file in the views/books folder. We are also setting "books" to be an accessible variable in our jade view
                    html: function () {
                        res.render('books/index', {
                            title: 'All my Books',
                            "books": books
                        });
                    },
                    //JSON response will show all books in JSON format
                    json: function () {
                        res.json(books);
                    }
                });
            }
        });
    })
// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Book').findById(id, function (err, book) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {

            console.log('ELSE');

            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(book);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});
//POST a new book
router.route('/:id')
    .get(function (req, res) {
        console.log("req.id:", req.id);
        mongoose.model('Book').findById(req.id, function (err, book) {
            console.log("book._id:", book._id);

            if(err){
                console.log('There was a problem retrieving book ' + book._id);
            } else {
                console.log("GET retrieving ID:" + book._id);
                res.format({
                    html: function() {
                        res.render('books/show', {
                            'book': book
                        })
                    },
                    json: function(){
                        res.json(book)
                    }
                })
            }

            console.log("book:", book);
        })

    })

router.route('/new')
    .get(function (req, res) {
        // res.send('about page')
        res.render('books/new', { title: 'Add new book' })
    })
    .post(function (req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms

        var title = req.body.title;
        var qty = req.body.qty;

        //call the create function for our database
        mongoose.model('Book').create({
            title: title,
            qty: qty
        }, function (err, book) {
            if(err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //book has been created
                console.log('POST creating new book: ' + book);
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function () {
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("books");
                        // And forward to success page
                        res.redirect("/books");
                    },
                    //JSON response will show the newly created book
                    json: function () {
                        res.json(book);
                    }
                });
            }
        })
    });

module.exports = router;
