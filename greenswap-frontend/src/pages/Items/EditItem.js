import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {api} from '../../services/api'; // Assuming you have a configured axios instance


const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    quantity: 1,
    is_negotiable: true,
    condition: 'good',
    weight: '',
    dimensions: '',
    material: '',
    location: '',
    latitude: '',
    longitude: '',
    is_urgent: false
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchItem();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/items/categories/');
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItem = async () => {
    try {
      const response = await api.get(`/items/${id}/`);
      const item = response.data;
      
      // Check if user owns this item
      if (item.owner.id !== user.id) {
        showError('ليس لديك صلاحية لتعديل هذا المنتج');
        navigate('/items');
        return;
      }

      setFormData({
        title: item.title || '',
        description: item.description || '',
        category: item.category.id || '',
        price: item.price || '',
        quantity: item.quantity || 1,
        is_negotiable: item.is_negotiable || false,
        condition: item.condition || 'good',
        weight: item.weight || '',
        dimensions: item.dimensions || '',
        material: item.material || '',
        location: item.location || '',
        latitude: item.latitude || '',
        longitude: item.longitude || '',
        is_urgent: item.is_urgent || false
      });

      setExistingImages(item.images || []);
    } catch (error) {
      console.error('Error fetching item:', error);
      showError('فشل في تحميل بيانات المنتج');
      navigate('/items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + existingImages.length + newImages.length > 5) {
      showError('يمكن رفع 5 صور كحد أقصى');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showError(`${file.name} ليس ملف صورة صحيح`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError(`${file.name} حجم الملف كبير جداً (أكثر من 5 ميجابايت)`);
        return false;
      }
      return true;
    });

    setNewImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') {
          submitData.append(key, value);
        }
      });

      // Add new images
      newImages.forEach((image) => {
        submitData.append('images', image);
      });

      // Add images to delete
      if (imagesToDelete.length > 0) {
        submitData.append('delete_images', JSON.stringify(imagesToDelete));
      }

      const response = await api.put(`/items/${id}/update/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showSuccess('تم تحديث المنتج بنجاح');
      navigate(`/items/${id}`);
    } catch (error) {
      console.error('Error updating item:', error);
      showError(error.response?.data?.message || 'فشل في تحديث المنتج');
    } finally {
      setSubmitting(false);
    }
  };

  const conditionOptions = [
    { value: 'new', label: 'جديد', icon: 'star-fill', color: 'success' },
    { value: 'like_new', label: 'شبه جديد', icon: 'star', color: 'info' },
    { value: 'good', label: 'جيد', icon: 'check-circle', color: 'primary' },
    { value: 'fair', label: 'مقبول', icon: 'dash-circle', color: 'warning' },
    { value: 'poor', label: 'سيء', icon: 'x-circle', color: 'secondary' }
  ];

  if (loading) {
    return <LoadingSpinner centered text="جاري تحميل بيانات المنتج..." />;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-warning text-white">
              <h3 className="mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                تعديل المنتج
              </h3>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="form-label fw-bold">عنوان المنتج *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="أدخل عنوان واضح ومختصر للمنتج"
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">الفئة *</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">وصف المنتج *</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    required
                    placeholder="اكتب وصفاً مفصلاً للمنتج، حالته، وأي معلومات مهمة"
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">السعر (جنيه) *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">الكمية *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">الموقع *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="المدينة أو المنطقة"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div className="mb-3">
                  <label className="form-label fw-bold">الحالة *</label>
                  <div className="row g-2">
                    {conditionOptions.map(option => (
                      <div key={option.value} className="col-md-2 col-6">
                        <input
                          type="radio"
                          className="btn-check"
                          name="condition"
                          id={`condition-${option.value}`}
                          value={option.value}
                          checked={formData.condition === option.value}
                          onChange={handleInputChange}
                        />
                        <label 
                          className={`btn btn-outline-${option.color} w-100`} 
                          htmlFor={`condition-${option.value}`}
                        >
                          <i className={`bi bi-${option.icon} d-block mb-1`}></i>
                          <small>{option.label}</small>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images Section */}
                <div className="mb-4">
                  <h5 className="fw-bold text-primary mb-3">إدارة الصور</h5>
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">الصور الحالية:</h6>
                      <div className="row g-3">
                        {existingImages.map((image, index) => (
                          <div key={image.id} className="col-md-3 col-6">
                            <div className="position-relative">
                              <img
                                src={image.image_url}
                                alt={`صورة ${index + 1}`}
                                className="img-thumbnail w-100"
                                style={{ height: '150px', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                onClick={() => removeExistingImage(image.id)}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                              {image.is_primary && (
                                <span className="position-absolute bottom-0 start-0 badge bg-primary m-1">
                                  الصورة الرئيسية
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Upload */}
                  <div className="border-2 border-dashed border-primary rounded p-4 text-center mb-3">
                    <input
                      type="file"
                      className="d-none"
                      id="new-images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="new-images" className="cursor-pointer">
                      <i className="bi bi-cloud-upload text-primary" style={{ fontSize: '3rem' }}></i>
                      <h6 className="mt-2">إضافة صور جديدة</h6>
                      <p className="text-muted small mb-0">
                        اضغط لرفع صور إضافية (JPG, PNG - حد أقصى 5 ميجابايت لكل صورة)
                      </p>
                    </label>
                  </div>

                  {/* New Images Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">الصور الجديدة:</h6>
                      <div className="row g-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="col-md-3 col-6">
                            <div className="position-relative">
                              <img
                                src={preview}
                                alt={`صورة جديدة ${index + 1}`}
                                className="img-thumbnail w-100"
                                style={{ height: '150px', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                onClick={() => removeNewImage(index)}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <h6 className="fw-bold mb-3">تفاصيل إضافية (اختياري)</h6>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">الوزن (كيلو)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      placeholder="الوزن التقريبي"
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">الأبعاد</label>
                    <input
                      type="text"
                      className="form-control"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleInputChange}
                      placeholder="مثال: 50x30x20 سم"
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">المادة</label>
                    <input
                      type="text"
                      className="form-control"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      placeholder="نوع المادة"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="is_negotiable"
                        id="is_negotiable"
                        checked={formData.is_negotiable}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label fw-bold" htmlFor="is_negotiable">
                        السعر قابل للتفاوض
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="is_urgent"
                        id="is_urgent"
                        checked={formData.is_urgent}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label fw-bold" htmlFor="is_urgent">
                        بيع عاجل
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex gap-3">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <LoadingSpinner size="sm" text="جاري التحديث..." />
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(`/items/${id}`)}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditItem;