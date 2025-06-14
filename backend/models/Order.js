const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  medicines: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: function(value) {
          return Number.isInteger(value) && value > 0;
        },
        message: 'Quantity must be a positive integer'
      }
    },
    priceAtOrder: {
      type: Number,
      required: [true, 'Price at order is required'],
      min: [0, 'Price cannot be negative']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processed', 'delivered', 'canceled'],
    default: 'pending',
    required: true
  },
  orderDate: {
    type: Date,
    required: [true, 'Order date is required'],
    default: Date.now
  },
  deliveryDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.orderDate;
      },
      message: 'Delivery date must be after order date'
    }
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required'],
    trim: true,
    maxlength: [500, 'Shipping address cannot exceed 500 characters']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ customerId: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

// Pre-save middleware to calculate total amount
orderSchema.pre('save', function(next) {
  if (this.medicines && this.medicines.length > 0) {
    this.totalAmount = this.medicines.reduce((total, medicine) => {
      return total + (medicine.quantity * medicine.priceAtOrder);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
