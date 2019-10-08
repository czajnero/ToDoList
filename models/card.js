const Joi = require('joi');
const mongoose = require('mongoose');
const {List} = require('../models/list');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 16384,
  },
  tags: [{
    type: String,
    unique: true,
    minlength: 1,
    maxlength: 50
  }]
});

const Card = mongoose.model('Card', cardSchema);

Card.removeFromParentList = async function(id) {
  let listOld = await List.find({cards: id});
    if(listOld){
      for (const l of listOld) {
        l.cards = l.cards.filter(x => x != id);
        await l.save();
      }
    }
}

Card.getElementsFromBody = (body) => _.pick(body, ['title', 'description', 'tags']);

function validateCard(card) {
  const schema = {
    title: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(16384),
    tags: Joi.array().items(Joi.string().min(1).max(50))
  };

  return Joi.validate(card, schema);
}

function validateCardUpdate(card) {
  const schema = {
    title: Joi.string().min(1).max(50),
    description: Joi.string().max(16384),
    tags: Joi.array().items(Joi.string().min(1).max(50))
  };

  return Joi.validate(card, schema);
}

exports.Card = Card; 
exports.validate = validateCard;
exports.validateUpdate = validateCardUpdate;