import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { api } from "../../services/api"; // Assuming you have a configured axios instance

const AddItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    quantity: 1,
    is_negotiable: true,
    condition: "good",
    weight: "",
    dimensions: "",
    material: "",
    location: "",
    latitude: "",
    longitude: "",
    is_urgent: false,
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchCategories();

    // Get user location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => console.log("Location access denied")
      );
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/items/categories/");
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      showError("يمكن رفع 5 صور كحد أقصى");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        showError(`${file.name} ليس ملف صورة صحيح`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError(`${file.name} حجم الملف كبير جداً (أكثر من 5 ميجابايت)`);
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const analyzeWithAI = async () => {
    if (images.length === 0) {
      showError("يرجى رفع صورة أولاً للتحليل");
      return;
    }

    setAiAnalyzing(true);

    try {
      const formDataAI = new FormData();
      formDataAI.append("image", images[0]);

      const response = await api.get("/ai/analyze-image/", formDataAI);
      const result = response.data.result;

      // Apply AI suggestions
      if (result.category) {
        const suggestedCategory = categories.find((cat) =>
          cat.name.toLowerCase().includes(result.category.toLowerCase())
        );
        if (suggestedCategory) {
          setFormData((prev) => ({ ...prev, category: suggestedCategory.id }));
        }
      }

      if (result.condition) {
        setFormData((prev) => ({ ...prev, condition: result.condition }));
      }

      if (result.suggested_price) {
        setFormData((prev) => ({ ...prev, price: result.suggested_price }));
      }

      if (result.description && !formData.description) {
        setFormData((prev) => ({
          ...prev,
          description: result.description,
        }));
      }

      showSuccess("تم تحليل الصورة وتطبيق الاقتراحات");
    } catch (error) {
      console.error("Error analyzing image:", error);
      showError("فشل في تحليل الصورة");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          submitData.append(key, value);
        }
      });
      // Add images
      images.forEach((image, index) => {
        submitData.append("images", image);
      });
      console.log("Form data before submission:", formData);

      console.log("FormData as array:", Array.from(submitData.entries()));
      const response = await api.post("/items/create/", submitData);

      showSuccess("تم إضافة المنتج بنجاح");
      navigate(`/items/${response.data.id}`);
    } catch (error) {
      console.error("Error creating item:", error);
      showError(error.response?.data?.message || "فشل في إضافة المنتج");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const conditionOptions = [
    { value: "new", label: "جديد", icon: "star-fill", color: "success" },
    { value: "like_new", label: "شبه جديد", icon: "star", color: "info" },
    { value: "good", label: "جيد", icon: "check-circle", color: "primary" },
    { value: "fair", label: "مقبول", icon: "dash-circle", color: "warning" },
    { value: "poor", label: "سيء", icon: "x-circle", color: "secondary" },
  ];

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Progress Steps */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <div
                    className={`d-flex align-items-center justify-content-center ${
                      currentStep >= 1 ? "text-primary" : "text-muted"
                    }`}
                  >
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                        currentStep >= 1 ? "bg-primary text-white" : "bg-light"
                      }`}
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-info-circle"></i>
                    </div>
                    <span className="fw-bold">المعلومات الأساسية</span>
                  </div>
                </div>
                <div className="col-4">
                  <div
                    className={`d-flex align-items-center justify-content-center ${
                      currentStep >= 2 ? "text-primary" : "text-muted"
                    }`}
                  >
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                        currentStep >= 2 ? "bg-primary text-white" : "bg-light"
                      }`}
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-images"></i>
                    </div>
                    <span className="fw-bold">الصور والتفاصيل</span>
                  </div>
                </div>
                <div className="col-4">
                  <div
                    className={`d-flex align-items-center justify-content-center ${
                      currentStep >= 3 ? "text-primary" : "text-muted"
                    }`}
                  >
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                        currentStep >= 3 ? "bg-primary text-white" : "bg-light"
                      }`}
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <span className="fw-bold">المراجعة والنشر</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                إضافة منتج جديد
              </h3>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="fade-in-up">
                    <h5 className="fw-bold text-primary mb-4">
                      المعلومات الأساسية
                    </h5>

                    <div className="row">
                      <div className="col-md-8 mb-3">
                        <label className="form-label fw-bold">
                          عنوان المنتج *
                        </label>
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
                          {categories.map((category) => (
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
                        <label className="form-label fw-bold">
                          السعر (جنيه) *
                        </label>
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

                    <div className="mb-3">
                      <label className="form-label fw-bold">الحالة *</label>
                      <div className="row g-2">
                        {conditionOptions.map((option) => (
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
                              <i
                                className={`bi bi-${option.icon} d-block mb-1`}
                              ></i>
                              <small>{option.label}</small>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="row">
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
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="is_negotiable"
                          >
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
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="is_urgent"
                          >
                            بيع عاجل
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Images and Details */}
                {currentStep === 2 && (
                  <div className="fade-in-up">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold text-primary mb-0">
                        الصور والتفاصيل
                      </h5>
                      {images.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={analyzeWithAI}
                          disabled={aiAnalyzing}
                        >
                          {aiAnalyzing ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              جاري التحليل...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-robot me-2"></i>
                              تحليل ذكي
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="border-2 border-dashed border-primary rounded p-4 text-center mb-4 ">
                      <input
                        type="file"
                        className="visually-hidden"
                        id="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="images" className="cursor-pointer">
                        <i
                          className="bi bi-cloud-upload text-primary"
                          style={{ fontSize: "3rem" }}
                        ></i>
                        <h6 className="mt-2">اضغط لرفع الصور أو اسحبها هنا</h6>
                        <p className="text-muted small mb-0">
                          يمكن رفع 5 صور كحد أقصى (JPG, PNG - حد أقصى 5 ميجابايت
                          لكل صورة)
                        </p>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {/* {imagePreviews.length > 0 && (
                      <div className="row g-3 mb-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="col-md-3 col-6">
                            <div className="position-relative image-preview">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="img-thumbnail w-100"
                                style={{ height: "150px", objectFit: "cover" }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                onClick={() => removeImage(index)}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                              {index === 0 && (
                                <span className="position-absolute bottom-0 start-0 badge bg-primary m-1">
                                  الصورة الرئيسية
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )} */}

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
                  </div>
                )}

                {/* Step 3: Review and Submit */}
                {currentStep === 3 && (
                  <div className="fade-in-up">
                    <h5 className="fw-bold text-primary mb-4">مراجعة المنتج</h5>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="card bg-light">
                          <div className="card-body">
                            <h6 className="fw-bold mb-3">معاينة المنتج</h6>

                            {imagePreviews.length > 0 && (
                              <img
                                src={imagePreviews[0]}
                                alt="Preview"
                                className="img-fluid rounded mb-3"
                                style={{
                                  height: "200px",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            )}

                            <h6 className="fw-bold">{formData.title}</h6>
                            <p className="text-muted small mb-2">
                              {formData.description.substring(0, 100)}...
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="h5 text-primary mb-0">
                                {formData.price} جنيه
                              </span>
                              <span className="badge bg-secondary">
                                {
                                  categories.find(
                                    (c) => c.id == formData.category
                                  )?.name
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-primary">
                          <div className="card-body">
                            <h6 className="fw-bold mb-3">تفاصيل المنتج</h6>

                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>الفئة:</strong>
                              </div>
                              <div className="col-6">
                                {
                                  categories.find(
                                    (c) => c.id == formData.category
                                  )?.name
                                }
                              </div>
                            </div>

                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>الحالة:</strong>
                              </div>
                              <div className="col-6">
                                {
                                  conditionOptions.find(
                                    (c) => c.value === formData.condition
                                  )?.label
                                }
                              </div>
                            </div>

                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>الكمية:</strong>
                              </div>
                              <div className="col-6">{formData.quantity}</div>
                            </div>

                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>الموقع:</strong>
                              </div>
                              <div className="col-6">{formData.location}</div>
                            </div>

                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>قابل للتفاوض:</strong>
                              </div>
                              <div className="col-6">
                                {formData.is_negotiable ? "نعم" : "لا"}
                              </div>
                            </div>

                            {formData.weight && (
                              <div className="row mb-2">
                                <div className="col-6">
                                  <strong>الوزن:</strong>
                                </div>
                                <div className="col-6">
                                  {formData.weight} كيلو
                                </div>
                              </div>
                            )}

                            {formData.material && (
                              <div className="row mb-2">
                                <div className="col-6">
                                  <strong>المادة:</strong>
                                </div>
                                <div className="col-6">{formData.material}</div>
                              </div>
                            )}

                            <div className="row">
                              <div className="col-6">
                                <strong>عدد الصور:</strong>
                              </div>
                              <div className="col-6">{images.length}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={prevStep}
                      >
                        <i className="bi bi-arrow-right me-2"></i>
                        السابق
                      </button>
                    )}
                  </div>

                  <div>
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={nextStep}
                        disabled={
                          (currentStep === 1 &&
                            (!formData.title ||
                              !formData.category ||
                              !formData.description ||
                              !formData.price ||
                              !formData.location)) ||
                          (currentStep === 2 && images.length === 0)
                        }
                      >
                        التالي
                        <i className="bi bi-arrow-left ms-2"></i>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            جاري الإضافة...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-2"></i>
                            نشر المنتج
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Tips Card */}
          <div className="card mt-4 border-0 bg-light">
            <div className="card-body">
              <h6 className="fw-bold text-success mb-3">
                <i className="bi bi-lightbulb me-2"></i>
                نصائح لإضافة منتج ناجح
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      استخدم صوراً واضحة وعالية الجودة
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      اكتب وصفاً مفصلاً وصادقاً للمنتج
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      حدد سعراً مناسباً ومنافساً
                    </li>
                    <li className="mb-0">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      استخدم التصنيف الذكي لتحديد الفئة المناسبة
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
