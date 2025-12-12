import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useClassStore from '@/stores/useClassStore';

/**
 * BackToContent: Custom back button to return to /mycontent/:classId
 * Usage: <BackToContent />
 */
const BackToContent = ({ className = '' }) => {
  const navigate = useNavigate();
  const classId = useClassStore(state => state.classId);

  const handleBack = () => {
    if (classId) {
      navigate(`/mycontent/${classId}`);
    } else {
      // Fallback to browser back if classId not available
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 transition ${className}`}
      title="Quay lại nội dung khóa học"
    >
      <ArrowLeft size={20} />
      <span>Quay lại</span>
    </button>
  );
};

export default BackToContent;
