const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Create a notification
   */
  static async create({ recipient, sender, type, title, message, data }) {
    try {
      const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        data,
      });
      return notification;
    } catch (error) {
      console.error('[Notification Service] Error creating notification:', error.message);
    }
  }

  /**
   * Send reservation-related notifications
   */
  static async reservationCreated(userId, pharmacyOwnerId, reservationId, medicineName) {
    // Notify pharmacy owner
    await this.create({
      recipient: pharmacyOwnerId,
      sender: userId,
      type: 'reservation_created',
      title: 'New Reservation',
      message: `A new reservation has been made for ${medicineName}.`,
      data: { reservationId },
    });
  }

  static async reservationApproved(userId, pharmacyOwnerId, reservationId, medicineName) {
    await this.create({
      recipient: userId,
      sender: pharmacyOwnerId,
      type: 'reservation_approved',
      title: 'Reservation Approved',
      message: `Your reservation for ${medicineName} has been approved. Please pick it up within the specified time.`,
      data: { reservationId },
    });
  }

  static async reservationRejected(userId, pharmacyOwnerId, reservationId, medicineName, reason) {
    await this.create({
      recipient: userId,
      sender: pharmacyOwnerId,
      type: 'reservation_rejected',
      title: 'Reservation Rejected',
      message: `Your reservation for ${medicineName} was rejected. Reason: ${reason || 'Not specified'}`,
      data: { reservationId },
    });
  }

  static async reservationCancelled(pharmacyOwnerId, userId, reservationId, medicineName) {
    await this.create({
      recipient: pharmacyOwnerId,
      sender: userId,
      type: 'reservation_cancelled',
      title: 'Reservation Cancelled',
      message: `A reservation for ${medicineName} has been cancelled by the user.`,
      data: { reservationId },
    });
  }

  /**
   * Send low stock alert
   */
  static async lowStockAlert(pharmacyOwnerId, medicineId, medicineName, stock) {
    await this.create({
      recipient: pharmacyOwnerId,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${medicineName} is running low with only ${stock} units remaining.`,
      data: { medicineId },
    });
  }

  /**
   * Send new review notification
   */
  static async newReview(pharmacyOwnerId, userId, pharmacyId, rating) {
    await this.create({
      recipient: pharmacyOwnerId,
      sender: userId,
      type: 'new_review',
      title: 'New Review',
      message: `Your pharmacy received a new ${rating}-star review.`,
      data: { pharmacyId },
    });
  }

  /**
   * Pharmacy approval notification
   */
  static async pharmacyApproved(pharmacyOwnerId, pharmacyId) {
    await this.create({
      recipient: pharmacyOwnerId,
      type: 'pharmacy_approved',
      title: 'Pharmacy Approved',
      message: 'Your pharmacy registration has been approved! You can now manage your inventory.',
      data: { pharmacyId },
    });
  }

  static async pharmacyRejected(pharmacyOwnerId, pharmacyId) {
    await this.create({
      recipient: pharmacyOwnerId,
      type: 'pharmacy_rejected',
      title: 'Pharmacy Registration Rejected',
      message: 'Your pharmacy registration has been rejected. Please contact support for more information.',
      data: { pharmacyId },
    });
  }
}

module.exports = NotificationService;
