import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import reservationService from '../services/reservationService';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDate, formatPrice } from '../utils/helpers';
import { STATUS_COLORS } from '../utils/constants';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data } = await reservationService.getMyReservations();
      setReservations(data.data);
    } catch (error) {
      console.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await reservationService.cancel(id);
      toast.success('Reservation cancelled successfully');
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  if (loading) return <LoadingSkeleton type="list" count={4} />;

  if (reservations.length === 0) {
    return (
      <EmptyState 
        icon="list"
        title="No reservations found"
        message="You haven't made any medicine reservations yet."
        action={<Link to="/search" className="btn-primary mt-4">Find Medicines</Link>}
      />
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">My Reservations</h1>
      
      <div className="space-y-4">
        {reservations.map(reservation => (
          <div key={reservation._id} className="glass-card p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-surface-200 dark:border-surface-700 pb-4 mb-4">
              <div>
                <p className="text-sm text-surface-500 mb-1">Reservation #{reservation._id.slice(-6).toUpperCase()}</p>
                <h3 className="text-lg font-bold">{reservation.medicine?.name || 'Unknown Medicine'}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className={STATUS_COLORS[reservation.status]}>{reservation.status.toUpperCase()}</span>
                <div className="text-right">
                  <p className="text-sm text-surface-500">Total Price</p>
                  <p className="font-bold">{formatPrice(reservation.totalPrice)}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-surface-500 mb-1">Pharmacy</p>
                <p className="font-medium">{reservation.pharmacy?.name}</p>
                <p className="text-surface-600 dark:text-surface-400">{reservation.pharmacy?.address?.street}</p>
              </div>
              <div>
                <p className="text-surface-500 mb-1">Details</p>
                <p>Quantity: <span className="font-medium">{reservation.quantity}</span></p>
                <p>Date: <span className="font-medium">{formatDate(reservation.createdAt)}</span></p>
              </div>
            </div>
            
            {reservation.status === 'pending' && (
              <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-700 text-right">
                <button 
                  onClick={() => handleCancel(reservation._id)} 
                  className="btn-ghost text-red-500"
                >
                  Cancel Reservation
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reservations;
