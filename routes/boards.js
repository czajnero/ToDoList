const auth = require('../middleware/auth');
const {Board, validate, validateUpdate} = require('../models/board');
const {List, validateList = validate, validateListUpdate = validateUpdate} = require('../models/list');
const express = require('express');
const _ = require('lodash');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;


router.get('/', auth, async (req, res) => {
  const board = await Board.find().populate({ 
    path: 'lists',
    populate: {
      path: 'cards',
      model: 'Card'
    } 
 });
  res.send(board);
});

router.get('/:id', auth, async (req, res) => {
  const board = await Board.findById(req.params.id).populate('lists');
  res.send(board);
});

router.post('/', auth,  async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  board = new Board(req.body);
  await board.save();

  res.send(board);
});

router.post('/:id', auth,  async (req, res) => {
  const { error } = validateList(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let board = await Board.findById(req.params.id);
  if(!board) return res.status(404).send("Board not found");

  let list = new List(req.body);
  list = await list.save();
  board.lists.push(list._id);
  board = await board.save();
  res.send(board);
});

router.put('/:id', auth,  async (req, res) => {
  const { error } = validateUpdate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).send('The board with the given ID was not found.');

  if(req.body.title) board.title = req.body.title;
  if(req.body.description) board.description = req.body.description;
  if(req.body.admin) board.admin = req.body.admin;

  for (const x of req.body.lists) {
    const {error} = validateList(x);
    const {errorUpdate} = validateListUpdate(x);
    // Valid list object with valid ID was given
    if(ObjectId.isValid(x._id) && !errorUpdate) {
      let list = await List.findByIdAndUpdate(x._id, x, { new: true });
      if(!board.lists.find(y => y == x._id) && list) board.lists.push(x._id);
    // Valid list object without valid ID was given (creates new list)
    } else if(!error) {
      let list = new List(x);
      list = await list.save();
      board.lists.push(list._id);
    // Nothing valid was given
    } else {
      await board.save();
      return res.status(400).send(error.details[0].message)
    }
  }
  
  await board.save();
  
  res.send(board);
});

// Removes board with all lists inside
router.delete('/:id', auth, async (req, res) => {
  let board = await Board.findByIdAndremoveWithContent(req.params.id);

  if (!board) return res.status(404).send('The board with the given ID was not found.');

  res.send(board);
});

// Deletes specified list inside specified board
router.delete('/:id/:listId', auth, async (req, res) => {
  let board = await Board.findById(req.params.id);
  if (!board) return res.status(404).send('The board with the given ID was not found.');

  board.lists = board.lists.filter(x => x != req.params.listId);
  board = board.save();
  let list = await List.findByIdAndremoveWithContent(req.params.listId);

  if (!list) return res.status(404).send('The list with the given ID was not found.');

  res.send(list);
});

module.exports = router;