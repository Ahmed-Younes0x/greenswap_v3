// وظائف مساعدة مشتركة

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'أمس';
  } else if (diffDays < 7) {
    return `منذ ${diffDays} أيام`;
  } else {
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatPrice = (price) => {
  if (!price && price !== 0) return '0';
  return parseFloat(price).toLocaleString('ar-EG');
};

export const getConditionBadge = (condition) => {
  const conditionConfig = {
    new: { class: 'bg-success', text: 'جديد', icon: 'star-fill' },
    like_new: { class: 'bg-info', text: 'شبه جديد', icon: 'star' },
    good: { class: 'bg-primary', text: 'جيد', icon: 'check-circle' },
    fair: { class: 'bg-warning', text: 'مقبول', icon: 'dash-circle' },
    poor: { class: 'bg-secondary', text: 'سيء', icon: 'x-circle' }
  };
  return conditionConfig[condition] || conditionConfig.good;
};

export const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { class: 'bg-warning', text: 'قيد الانتظار', icon: 'clock' },
    accepted: { class: 'bg-info', text: 'مقبول', icon: 'check-circle' },
    rejected: { class: 'bg-danger', text: 'مرفوض', icon: 'x-circle' },
    in_progress: { class: 'bg-primary', text: 'قيد التنفيذ', icon: 'arrow-repeat' },
    completed: { class: 'bg-success', text: 'مكتمل', icon: 'check-all' },
    cancelled: { class: 'bg-secondary', text: 'ملغي', icon: 'x' }
  };
  return statusConfig[status] || statusConfig.pending;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^01[0125]\d{8}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};