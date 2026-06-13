import { useAuth } from '../context/AuthContext';
import { HiUser, HiMail, HiPhone } from 'react-icons/hi';
import { getInitials } from '../utils/helpers';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-8">My Profile</h1>
      
      <div className="glass-card p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-surface-200 dark:border-surface-700">
          <div className="w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center text-white text-3xl font-bold shadow-glow">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
            <p className="text-surface-500 capitalize">{user?.role} Account</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-surface-500 flex items-center gap-2 mb-1">
              <HiMail className="w-4 h-4" /> Email Address
            </label>
            <p className="text-lg font-medium">{user?.email}</p>
          </div>
          
          {user?.phone && (
            <div>
              <label className="text-sm font-medium text-surface-500 flex items-center gap-2 mb-1">
                <HiPhone className="w-4 h-4" /> Phone Number
              </label>
              <p className="text-lg font-medium">{user?.phone}</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
          <button className="btn-secondary">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
