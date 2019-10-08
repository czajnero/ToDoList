const Joi = require('joi');
const mongoose = require('mongoose');
const {Card} = require('../models/card');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  cards: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card'
  }]
});

listSchema.methods.removeWithContent = async function() {
  console.log(this);
  if(this.cards)
    for(x of this.cards) {
      console.log(x);
      await Card.findByIdAndRemove(x);
    }
  return await this.remove();
}

const List = mongoose.model('List', listSchema);

List.getElementsFromBody = (body) => _.pick(body, ['title', 'cards']);

List.findByIdAndRemoveWithContent = async function(id) {
  const list = await List.findById(id);
  if(!list) return [];
  return await list.removeWithContent();
}

function validateList(list) {
  const schema = {
    title: Joi.string().min(1).max(50).required(),
    cards: Joi.array().items(Joi.objectId())
  };

  return Joi.validate(list, schema);
}

function validateListUpdate(list) {

  const schema = {
    title: Joi.string().min(1).max(50),
    cards: Joi.array().items(Joi.alternatives(Joi.objectId(), Joi.object()))
  };

  return Joi.validate(list, schema);
}

exports.List = List; 
exports.validate = validateList;
exports.validateUpdate = validateListUpdate;