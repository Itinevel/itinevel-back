import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  theme: { type: String, default: '' }
});

const ItemSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  price: { type: Number, default: 0 }
});

const LocationDetailSchema = new mongoose.Schema({
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  items: [ItemSchema],
  value: { type: String, default: '' },
  arrivalTime: { type: String, default: '' },  // New field
  departureTime: { type: String, default: '' } // New field
});

const LocationSchema = new mongoose.Schema({
  name: { type: String, default: '' },  // New field
  type: { type: String, default: '' },  // New field
  subtype: { type: String, default: '' },  // New field
  images: [{ type: String, default: '' }],  // New field (array of image URLs)
  notes: [NoteSchema],
  details: LocationDetailSchema
});

const TransportDetailSchema = new mongoose.Schema({
  destination: { type: String, default: '' },
  nameTo: { type: String, default: '' }, // Updated field
  priceTo: { type: Number, default: 0 }, // Updated field
  typeTo: { type: String, default: '' }, // Updated field
  nameFrom: { type: String, default: '' }, // New field
  priceFrom: { type: Number, default: 0 }, // New field
  typeFrom: { type: String, default: '' }  // New field
});

const TransportSchema = new mongoose.Schema({
  notes: [NoteSchema],
  details: [TransportDetailSchema]
});

const ItinerarySchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  locations: [LocationSchema],      // Direct inclusion of locations
  allTransports: [TransportSchema], // Direct inclusion of all transports
  suggestions: [{ type: String, default: '' }], // Assuming each itinerary might have suggestions directly
  itineraryId: { type: Number, required: true }, // Unique ID for each itinerary
  totalPrice: { type: Number, default: 0 } // New: Total price for the itinerary
});

const Itinerary = mongoose.model('Itinerary', ItinerarySchema);

export default Itinerary;
