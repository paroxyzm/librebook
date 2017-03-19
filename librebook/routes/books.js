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
    //POST a new book

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
