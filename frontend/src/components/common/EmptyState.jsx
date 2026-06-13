import { motion } from 'framer-motion';
import { HiOutlineSearchCircle, HiOutlineClipboardList, HiOutlineHeart, HiOutlineBell } from 'react-icons/hi';

const icons = {
  search: HiOutlineSearchCircle,
  list: HiOutlineClipboardList,
  heart: HiOutlineHeart,
  bell: HiOutlineBell,
};

const EmptyState = ({ icon = 'search', title, message, action }) => {
  const Icon = icons[icon] || icons.search;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-surface-400" />
      </div>
      <h3 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">
        {title || 'Nothing here yet'}
      </h3>
      <p className="text-surface-500 dark:text-surface-400 max-w-md mb-6">
        {message || 'No items to display at the moment.'}
      </p>
      {action && action}
    </motion.div>
  );
};

export default EmptyState;
