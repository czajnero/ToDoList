const Joi = require('joi');
const mongoose = require('mongoose');
const {List} = require('./list');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    unique: true
  },
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 16384
  },
  admin: {
    type: String,
    minlength: 5,
    maxlength: 255
  },
  lists: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List'
  }]
});

boardSchema.methods.removeWithContent = async function() {
  for(x of this.lists) {
    await List.findByIdAndRemoveWithContent(x);
  }
  return await this.remove();
}

const Board = mongoose.model('Board', boardSchema);

Board.findByIdAndremoveWithContent = async function(id) {
  const board = await Board.findById(id);
  if(!board) return [];
  return await board.removeWithContent();
}

function validateBoard(board) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    title: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(16384),
    email: Joi.string().min(5).max(255).email(),
    lists: Joi.array().items(Joi.objectId())
  };

  return Joi.validate(board, schema);
}

function validateBoardUpdate(board) {

  const schema = {
    name: Joi.string().min(3).max(50),
    title: Joi.string().min(1).max(50),
    description: Joi.string().max(16384),
    lists: Joi.array().items(Joi.objectId())
  };

  return Joi.validate(board, schema);
}

exports.Board = Board; 
exports.validate = validateBoard;
exports.validateUpdate = validateBoardUpdate;