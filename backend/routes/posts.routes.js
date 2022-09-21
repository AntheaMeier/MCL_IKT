const express = require('express');
const router = express.Router();
const Post = require('../models/posts')
const upload = require('../middleware/upload')
const mongoose = require('mongoose')
const webpush = require('web-push'); //anstelle von import! zeile 11
require('dotenv').config()

/* ----------------- Für Push-Nachrichten----------------------- */

//import webpush from 'web-push'; // Terminal, backend nodemon crashed due to cannot import outside a module

const publicVapidKey = 'BOdbH2QnVdRiADUU_WV5jp4yLhOC-i6q9HC57vlKPb2oe5YQu1XM4ALBR-u-lrnzI39ajMZaGz8agAYtYm_yQyo';
const privateVapidKey = 'E6aT0hALVbVvuhiyz2FkSY5D4HS91JOjP7mxkf0ZuY4';

//!! Muss ich noch austauschen mit meinen Werten
const pushSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/cMdUtRW4H9o:APA91bG8p3o-Ta31e1yMrqdvonJCyf3xbPfIFtpS2UbX9PcJwkeNKoQjZhEAWo5nad7eR3NgRQR8__3wk591j7DKWJLGzwWgJYm_GgipU0gTvMRpWA6TpmCtrD9OCo1mB0jZQrTj5a_5',
    keys: {
        auth: 'fJRvyO_fnPXsYeDkMy_jAA',
        p256dh: 'BDhH_TBG4l-PU3wJnT6wHqsPeYusbPqOiw7VvJvupXDC3JZOIIOiz2Ml8ZaZD9wJuGnXs9BFqINEzrFStsjkk6c',
    }
};

function sendNotification() {
    webpush.setVapidDetails('mailto:anthea.meier@htw-berlin.de', publicVapidKey, privateVapidKey);
    const payload = JSON.stringify({
        title: 'New Push Notification',
        content: 'New data in database!',
        openUrl: ' /help'
    });
    webpush.sendNotification(pushSubscription,payload)
        .catch(err => console.error(err));
    console.log('push notification sent');
    // res.status(201).json({ message: 'push notification sent'});
}

/* ----------------- POST ---------------------------- */

// POST one post
router.post('/', upload.single('file'), async(req, res) => {
    if(req.file === undefined)
    {
        return res.send({
            "message": "no file selected"
        })
    } else {
        const newPost = new Post({
            title: req.body.title,
            purpose: 'Anlass: ' + req.body.purpose,
            checklist_item1: '- ' + req.body.checklist_item1,
            checklist_item2: '- ' + req.body.checklist_item2,
            checklist_item3: '- ' + req.body.checklist_item3,
            location: 'Diese Checkliste wurde in '  + req.body.location +' erstellt.',
            image_id: req.file.filename
        })
        console.log('newPost', newPost)
        sendNotification();           //Push-Nachricht
        await newPost.save();
        res.send(newPost)
    }
})

/* ----------------- GET ---------------------------- */

const connect = mongoose.createConnection(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const collectionFiles = connect.collection('posts.files');
const collectionChunks = connect.collection('posts.chunks');

function getOnePost(id) {
    return new Promise( async(resolve, reject) => {
        try {
            const post = await Post.findOne({ _id: id });
            let fileName = post.image_id;

            collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {

                // sort({n: 1}) --> die chunks nach Eigenschaft n aufsteigend sortieren
                collectionChunks.find({files_id : docs[0]._id}).sort({n: 1}).toArray( (err, chunks) => {
                    
                    const fileData = [];
                    for(let chunk of chunks)
                    {
                        // console.log('chunk._id', chunk._id)
                        fileData.push(chunk.data.toString('base64'));
                    }

                    let base64file = 'data:' + docs[0].contentType + ';base64,' + fileData.join('');
                    let getPost = new Post({
                        "_id": post._id,
                        "title": post.title,
                        "purpose": post.purpose, 
                        "checklist_item1": post.checklist_item1, 
                        "checklist_item2": post.checklist_item2, 
                        "checklist_item3": post.checklist_item3, 
                        "location": post.location,
                        "image_id": base64file
                    });

                    resolve(getPost)
                })

            }) // toArray find filename

        } catch {
            reject(new Error("Post does not exist!"));
        }
    })
}

function getAllPosts() {
    return new Promise( async(resolve, reject) => {
        const sendAllPosts = [];
        const allPosts = await Post.find();
        try {
            for(const post of allPosts) {
                console.log('post', post)
                const onePost = await getOnePost(post._id);
                sendAllPosts.push(onePost);
            }
            // console.log('sendAllPosts', sendAllPosts)
            resolve(sendAllPosts)
        } catch {
                reject(new Error("Posts do not exist!"));
        }
    });
}

// GET one post via id
router.get('/:id', async(req, res) => {
    getOnePost(req.params.id)
    .then( (post) => {
        console.log('post', post);
        res.send(post);
    })
    .catch( () => {
        res.status(404);
        res.send({
            error: "Post does not exist!"
        });
    })
});

// GET all posts
router.get('/', async(req, res) => {
    
    getAllPosts()
    .then( (posts) => {
        res.send(posts);
    })
    .catch( () => {
        res.status(404);
        res.send({
            error: "Post do not exist!"
        });
    })
});


/* ----------------- DELETE ---------------------------- */

// DELETE one post via id
router.delete('/:id', async(req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id })
        let fileName = post.image_id;
        await Post.deleteOne({ _id: req.params.id });
        await collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {
            await collectionChunks.deleteMany({files_id : docs[0]._id});
        })
        await collectionFiles.deleteOne({filename: fileName});
        res.status(204).send()
    } catch {
        res.status(404)
        res.send({ error: "Post does not exist!" })
    }
});

module.exports = router;