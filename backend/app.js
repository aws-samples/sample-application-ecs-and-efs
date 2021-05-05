// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const Book = require('./models/book');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        description: book.description,
      })),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to load books.' });
  }
});

app.post('/books', async (req, res) => {
  const bookTitle = req.body.title;
  const bookDescription = req.body.description;


  if (!bookTitle || bookTitle.trim().length === 0 ||
       !bookDescription || bookDescription.trim().length === 0) {
    return res.status(422).json({ message: 'Invalid book entry' });
  }

  const book = new Book({
    title: bookTitle,
    description: bookDescription,
  });

  try {
    await book.save();
    res
      .status(201)
      .json({ message: 'Book saved with success' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to save the book.' });
  }
});

setTimeout(() => {
  mongoose.connect(
    `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}:27017/course-books?authSource=admin`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) {
        console.error('Connection to MongoDB has failed');
        console.error(err);
      } else {
        console.log('Connection to MongoDB has succeeded');
        app.listen(80);
      }
    }
  );
}, 6000);
