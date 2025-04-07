import mongoose from 'mongoose';
import crypto from 'crypto';

const ticketSchema = new mongoose.Schema({
  code:              { type: String, required: true, unique: true, default: () => crypto.randomBytes(8).toString('hex') },
  purchase_datetime: { type: Date, default: Date.now },
  amount:            { type: Number, required: true },
  purchaser:         { type: String, required: true }
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;