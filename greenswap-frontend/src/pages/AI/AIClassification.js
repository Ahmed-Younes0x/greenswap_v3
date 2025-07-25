import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AIService from '../../services/aiService';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AIClassification = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [aiStats, setAiStats] = useState({});
  const [capabilities, setCapabilities] = useState({});
  const [activeTab, setActiveTab] = useState('classify');
  const [analysisType, setAnalysisType] = useState('basic');
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadAIData();
    loadAnalysisHistory();
  }, []);

  const loadAIData = async () => {
    try {
      const [statsData, capabilitiesData] = await Promise.all([
        AIService.getAIStats(),
        AIService.getAICapabilities()
      ]);
      setAiStats(statsData);
      setCapabilities(capabilitiesData);
    } catch (error) {
      console.error('Error loading AI data:', error);
    }
  };

  const loadAnalysisHistory = () => {
    const saved = localStorage.getItem('ai_analysis_history');
    if (saved) {
      try {
        setAnalysisHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  };

  const saveAnalysisHistory = (newAnalysis) => {
    const updated = [newAnalysis, ...analysisHistory.slice(0, 9)]; // Keep last 10
    setAnalysisHistory(updated);
    localStorage.setItem('ai_analysis_history', JSON.stringify(updated));
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        showError('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setResult(null);
    } else {
      showError('يرجى اختيار ملف صورة صحيح (JPG, PNG, WebP)');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClassify = async () => {
    if (!selectedFile) {
      showError('يرجى اختيار صورة أولاً');
      return;
    }

    setLoading(true);

    try {
      const classificationResult = await AIService.classifyWasteImage(selectedFile, {
        analysisType: analysisType
      });

      setResult(classificationResult);
      
      // إضافة للتاريخ
      const newAnalysis = {
        id: Date.now(),
        image: preview,
        result: classificationResult,
        timestamp: new Date(),
        type: analysisType
      };
      
      saveAnalysisHistory(newAnalysis);
      showSuccess('تم تصنيف المخلف بنجاح');
    } catch (error) {
      console.error('Classification error:', error);
      showError(error.message || 'فشل في تصنيف المخلف');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedAnalysis = async () => {
    if (!selectedFile) {
      showError('يرجى اختيار صورة أولاً');
      return;
    }

    setLoading(true);

    try {
      const analysisResult = await AIService.advancedImageAnalysis(selectedFile);
      setResult({
        ...result,
        advanced: analysisResult.result
      });
      showSuccess('تم التحليل المتقدم بنجاح');
    } catch (error) {
      console.error('Advanced analysis error:', error);
      showError('فشل في التحليل المتقدم');
    } finally {
      setLoading(false);
    }
  };

  const handleSustainabilityAnalysis = async () => {
    if (!result) {
      showError('يرجى تصنيف المخلف أولاً');
      return;
    }

    setLoading(true);

    try {
      const sustainabilityResult = await AIService.analyzeSustainability({
        category: result.category,
        quantity: 1,
        condition: result.condition
      });
      
      setResult({
        ...result,
        sustainability: sustainabilityResult
      });
      showSuccess('تم تحليل الاستدامة البيئية');
    } catch (error) {
      console.error('Sustainability analysis error:', error);
      showError('فشل في تحليل الاستدامة');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      plastic: 'cup-straw',
      metal: 'gear',
      paper: 'file-text',
      glass: 'cup',
      electronics: 'phone',
      textile: 'scissors',
      organic: 'flower1',
      hazardous: 'exclamation-triangle',
      mixed: 'collection',
      unknown: 'question-circle'
    };
    return icons[category] || 'box';
  };

  const getCategoryColor = (category) => {
    const colors = {
      plastic: '#2196F3',
      metal: '#9E9E9E',
      paper: '#8BC34A',
      glass: '#00BCD4',
      electronics: '#FF9800',
      textile: '#E91E63',
      organic: '#4CAF50',
      hazardous: '#F44336',
      mixed: '#9C27B0',
      unknown: '#607D8B'
    };
    return colors[category] || '#6c757d';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ar-EG');
  };

  const shareResults = async () => {
    if (!result) return;
    
    const shareData = {
      title: 'نتائج التصنيف الذكي - GreenSwap Egypt',
      text: `تم تصنيف المخلف كـ ${result.category} بدقة ${result.confidence}%`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        showSuccess('تم نسخ النتائج للحافظة');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="container py-5 page-container">
      <div className="row justify-content-center">
        <div className="col-lg-12">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" 
                 style={{ width: '100px', height: '100px' }}>
              <i className="bi bi-robot text-primary" style={{ fontSize: '3rem' }}></i>
            </div>
            <h1 className="display-5 fw-bold">التصنيف الذكي للمخلفات</h1>
            <p className="lead text-muted">
              تقنية ذكاء اصطناعي متقدمة لتصنيف وتحليل المخلفات بدقة عالية تصل إلى 95%
            </p>
          </div>

          {/* Stats Cards */}
          <div className="row mb-5">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card gradient-bg-1 text-white border-0 h-100 hover-lift-lg">
                <div className="card-body text-center">
                  <i className="bi bi-eye" style={{ fontSize: '2.5rem' }}></i>
                  <h4 className="mt-2 mb-1">{aiStats.total_analyses || 0}</h4>
                  <p className="mb-0 small">إجمالي التحليلات</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card gradient-bg-4 text-white border-0 h-100 hover-lift-lg">
                <div className="card-body text-center">
                  <i className="bi bi-check-circle" style={{ fontSize: '2.5rem' }}></i>
                  <h4 className="mt-2 mb-1">{aiStats.completed_analyses || 0}</h4>
                  <p className="mb-0 small">تحليلات ناجحة</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card gradient-bg-3 text-white border-0 h-100 hover-lift-lg">
                <div className="card-body text-center">
                  <i className="bi bi-speedometer" style={{ fontSize: '2.5rem' }}></i>
                  <h4 className="mt-2 mb-1">{aiStats.avg_processing_time?.toFixed(1) || 0}s</h4>
                  <p className="mb-0 small">متوسط وقت المعالجة</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card gradient-bg-5 text-white border-0 h-100 hover-lift-lg">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up" style={{ fontSize: '2.5rem' }}></i>
                  <h4 className="mt-2 mb-1">95%</h4>
                  <p className="mb-0 small">دقة التصنيف</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'classify' ? 'active' : ''}`}
                onClick={() => setActiveTab('classify')}
              >
                <i className="bi bi-camera me-2"></i>
                تصنيف الصور
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="bi bi-clock-history me-2"></i>
                تاريخ التحليلات ({analysisHistory.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'capabilities' ? 'active' : ''}`}
                onClick={() => setActiveTab('capabilities')}
              >
                <i className="bi bi-gear me-2"></i>
                القدرات المتاحة
              </button>
            </li>
          </ul>

          {/* Classification Tab */}
          {activeTab === 'classify' && (
            <div className="row">
              <div className="col-lg-8">
                <div className="card glass-card border-0">
                  <div className="card-body p-4">
                    {/* Analysis Type Selection */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">نوع التحليل:</label>
                      <div className="btn-group w-100" role="group">
                        <input
                          type="radio"
                          className="btn-check"
                          name="analysisType"
                          id="basic"
                          value="basic"
                          checked={analysisType === 'basic'}
                          onChange={(e) => setAnalysisType(e.target.value)}
                        />
                        <label className="btn btn-outline-primary" htmlFor="basic">
                          <i className="bi bi-lightning me-2"></i>
                          تحليل سريع
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="analysisType"
                          id="advanced"
                          value="advanced"
                          checked={analysisType === 'advanced'}
                          onChange={(e) => setAnalysisType(e.target.value)}
                        />
                        <label className="btn btn-outline-success" htmlFor="advanced">
                          <i className="bi bi-gear-wide-connected me-2"></i>
                          تحليل متقدم
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="analysisType"
                          id="comprehensive"
                          value="comprehensive"
                          checked={analysisType === 'comprehensive'}
                          onChange={(e) => setAnalysisType(e.target.value)}
                        />
                        <label className="btn btn-outline-info" htmlFor="comprehensive">
                          <i className="bi bi-stars me-2"></i>
                          تحليل شامل
                        </label>
                      </div>
                    </div>

                    {/* Upload Area */}
                    <div
                      className={`ai-upload-area ${dragOver ? 'dragover' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="d-none"
                      />
                      
                      {preview ? (
                        <div className="text-center">
                          <img
                            src={preview}
                            alt="Preview"
                            className="img-fluid rounded mb-3"
                            style={{ maxHeight: '300px' }}
                          />
                          <p className="text-muted">اضغط لتغيير الصورة أو اسحب صورة جديدة</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <i className="bi bi-cloud-upload text-primary" style={{ fontSize: '4rem' }}></i>
                          <h5 className="mt-3">اسحب الصورة هنا أو اضغط للاختيار</h5>
                          <p className="text-muted">
                            يدعم: JPG, PNG, WebP (حد أقصى 10 ميجابايت)
                          </p>
                          <div className="mt-3">
                            <span className="badge bg-primary me-2">دقة عالية</span>
                            <span className="badge bg-success me-2">سرعة فائقة</span>
                            <span className="badge bg-info">تحليل شامل</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="text-center mt-4">
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={handleClassify}
                          disabled={!selectedFile || loading}
                        >
                          {loading ? (
                            <LoadingSpinner size="sm" text="جاري التحليل..." />
                          ) : (
                            <>
                              <i className="bi bi-magic me-2"></i>
                              {analysisType === 'basic' ? 'تصنيف سريع' : 
                               analysisType === 'advanced' ? 'تحليل متقدم' : 'تحليل شامل'}
                            </>
                          )}
                        </button>
                        
                        {result && (
                          <button
                            className="btn btn-success btn-lg"
                            onClick={handleSustainabilityAnalysis}
                            disabled={loading}
                          >
                            <i className="bi bi-leaf me-2"></i>
                            تحليل الاستدامة
                          </button>
                        )}
                      </div>
                      
                      {(selectedFile || result) && (
                        <button
                          className="btn btn-outline-secondary btn-lg ms-3"
                          onClick={handleReset}
                        >
                          <i className="bi bi-arrow-clockwise me-2"></i>
                          إعادة تعيين
                        </button>
                      )}
                    </div>

                    {/* Results */}
                    {result && (
                      <div className="classification-result mt-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h4 className="fw-bold mb-0">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            نتائج التصنيف الذكي
                          </h4>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={shareResults}
                          >
                            <i className="bi bi-share me-2"></i>
                            مشاركة النتائج
                          </button>
                        </div>
                        
                        <div className="row">
                          {/* Basic Classification */}
                          <div className="col-md-6 mb-4">
                            <div className="card border-0 bg-light h-100">
                              <div className="card-body text-center">
                                <i 
                                  className={`bi bi-${getCategoryIcon(result.category)} mb-3`}
                                  style={{ 
                                    fontSize: '3rem', 
                                    color: getCategoryColor(result.category) 
                                  }}
                                ></i>
                                <h5 className="fw-bold">{result.category}</h5>
                                <p className="text-muted">{result.subcategory}</p>
                                
                                <div className="mt-3">
                                  <small className="text-muted">درجة الثقة</small>
                                  <div className="progress mt-1" style={{ height: '10px' }}>
                                    <div 
                                      className="progress-bar bg-success"
                                      style={{ width: `${result.confidence}%` }}
                                    ></div>
                                  </div>
                                  <small className="text-success fw-bold">{result.confidence}%</small>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Details */}
                          <div className="col-md-6 mb-4">
                            <div className="card border-0 bg-light h-100">
                              <div className="card-body">
                                <h6 className="fw-bold mb-3">
                                  <i className="bi bi-info-circle text-info me-2"></i>
                                  تفاصيل المخلف
                                </h6>
                                
                                <div className="mb-3">
                                  <strong>الوصف:</strong>
                                  <p className="text-muted mb-2">{result.description}</p>
                                </div>
                                
                                <div className="row mb-3">
                                  <div className="col-6">
                                    <strong>الحالة:</strong>
                                    <span className="badge bg-secondary ms-2">{result.condition}</span>
                                  </div>
                                  <div className="col-6">
                                    <strong>قابل للتدوير:</strong>
                                    <span className={`badge ms-2 ${result.recyclable ? 'bg-success' : 'bg-danger'}`}>
                                      {result.recyclable ? 'نعم' : 'لا'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="row mb-3">
                                  <div className="col-6">
                                    <strong>القيمة المقدرة:</strong>
                                    <span className="text-primary fw-bold ms-2">
                                      {result.estimated_value} جنيه
                                    </span>
                                  </div>
                                  <div className="col-6">
                                    <strong>الطلب في السوق:</strong>
                                    <span className={`badge ms-2 ${
                                      result.market_demand === 'high' ? 'bg-success' :
                                      result.market_demand === 'medium' ? 'bg-warning' : 'bg-secondary'
                                    }`}>
                                      {result.market_demand === 'high' ? 'عالي' :
                                       result.market_demand === 'medium' ? 'متوسط' : 'منخفض'}
                                    </span>
                                  </div>
                                </div>

                                {result.suggested_price_range && (
                                  <div className="mb-3">
                                    <strong>نطاق السعر المقترح:</strong>
                                    <span className="text-success fw-bold ms-2">
                                      {result.suggested_price_range.min} - {result.suggested_price_range.max} جنيه
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Material Composition */}
                        {result.material_composition && result.material_composition.length > 0 && (
                          <div className="card border-0 bg-info bg-opacity-10 mt-4">
                            <div className="card-body">
                              <h6 className="fw-bold text-info mb-3">
                                <i className="bi bi-layers me-2"></i>
                                تركيب المواد
                              </h6>
                              <div className="row">
                                {result.material_composition.map((material, index) => (
                                  <div key={index} className="col-md-4 mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                      <span className="fw-semibold">{material.name}</span>
                                      <span className="text-info fw-bold">{material.percentage}%</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                      <div 
                                        className="progress-bar bg-info"
                                        style={{ width: `${material.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Environmental Impact */}
                        {result.environmental_impact && Object.keys(result.environmental_impact).length > 0 && (
                          <div className="card border-0 bg-success bg-opacity-10 mt-4">
                            <div className="card-body">
                              <h6 className="fw-bold text-success mb-3">
                                <i className="bi bi-globe me-2"></i>
                                الأثر البيئي لإعادة التدوير
                              </h6>
                              <div className="row text-center">
                                <div className="col-md-4">
                                  <div className="bg-white rounded p-3">
                                    <i className="bi bi-cloud text-success" style={{ fontSize: '2rem' }}></i>
                                    <h5 className="text-success mt-2">{result.environmental_impact.carbon_footprint || 0}</h5>
                                    <small>كجم CO2 موفرة</small>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="bg-white rounded p-3">
                                    <i className="bi bi-droplet text-primary" style={{ fontSize: '2rem' }}></i>
                                    <h5 className="text-primary mt-2">{result.environmental_impact.water_saved || 0}</h5>
                                    <small>لتر مياه موفرة</small>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="bg-white rounded p-3">
                                    <i className="bi bi-lightning text-warning" style={{ fontSize: '2rem' }}></i>
                                    <h5 className="text-warning mt-2">{result.environmental_impact.energy_saved || 0}</h5>
                                    <small>كيلو واط موفرة</small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sustainability Analysis */}
                        {result.sustainability && (
                          <div className="card border-0 bg-warning bg-opacity-10 mt-4">
                            <div className="card-body">
                              <h6 className="fw-bold text-warning mb-3">
                                <i className="bi bi-award me-2"></i>
                                تحليل الاستدامة البيئية
                              </h6>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="text-center">
                                    <div className="position-relative d-inline-block">
                                      <svg width="120" height="120" className="transform-rotate-90">
                                        <circle
                                          cx="60"
                                          cy="60"
                                          r="50"
                                          fill="none"
                                          stroke="#e9ecef"
                                          strokeWidth="10"
                                        />
                                        <circle
                                          cx="60"
                                          cy="60"
                                          r="50"
                                          fill="none"
                                          stroke="#ffc107"
                                          strokeWidth="10"
                                          strokeDasharray={`${2 * Math.PI * 50}`}
                                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - result.sustainability.sustainability_score / 100)}`}
                                        />
                                      </svg>
                                      <div className="position-absolute top-50 start-50 translate-middle">
                                        <h4 className="fw-bold text-warning mb-0">{result.sustainability.sustainability_score}%</h4>
                                        <small className="text-muted">درجة الاستدامة</small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <h6 className="fw-semibold mb-2">التوصيات:</h6>
                                  <ul className="list-unstyled">
                                    {result.sustainability.recommendations?.map((rec, index) => (
                                      <li key={index} className="mb-1">
                                        <i className="bi bi-check-circle text-success me-2"></i>
                                        <small>{rec}</small>
                                      </li>
                                    ))}
                                  </ul>
                                  
                                  {result.sustainability.certification_eligible && (
                                    <div className="alert alert-success mt-3 py-2">
                                      <i className="bi bi-award me-2"></i>
                                      <small>مؤهل للحصول على شهادة الاستدامة!</small>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Processing Steps */}
                        {result.processing_steps && result.processing_steps.length > 0 && (
                          <div className="card border-0 bg-primary bg-opacity-10 mt-4">
                            <div className="card-body">
                              <h6 className="fw-bold text-primary mb-3">
                                <i className="bi bi-list-ol me-2"></i>
                                خطوات المعالجة والتدوير
                              </h6>
                              <div className="row">
                                {result.processing_steps.map((step, index) => (
                                  <div key={index} className="col-md-6 mb-2">
                                    <div className="d-flex align-items-start">
                                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                                           style={{ width: '30px', height: '30px', minWidth: '30px' }}>
                                        <span className="text-white fw-bold small">{index + 1}</span>
                                      </div>
                                      <span className="small">{step}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Recycling Tips */}
                        {result.recycling_tips && result.recycling_tips.length > 0 && (
                          <div className="card border-0 bg-success bg-opacity-10 mt-4">
                            <div className="card-body">
                              <h6 className="fw-bold text-success mb-3">
                                <i className="bi bi-lightbulb me-2"></i>
                                نصائح إعادة التدوير
                              </h6>
                              <div className="row">
                                {result.recycling_tips.map((tip, index) => (
                                  <div key={index} className="col-md-6 mb-2">
                                    <div className="d-flex align-items-start">
                                      <i className="bi bi-check-circle text-success me-2 mt-1"></i>
                                      <span className="small">{tip}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="text-center mt-4">
                          <div className="btn-group" role="group">
                            <Link 
                              to="/add-item" 
                              state={{ 
                                aiSuggestions: {
                                  category: result.category,
                                  condition: result.condition,
                                  price: result.estimated_value,
                                  description: result.description
                                }
                              }}
                              className="btn btn-primary"
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              إضافة كمنتج
                            </Link>
                            
                            <button 
                              className="btn btn-outline-success"
                              onClick={shareResults}
                            >
                              <i className="bi bi-share me-2"></i>
                              مشاركة النتائج
                            </button>
                            
                            <button 
                              className="btn btn-outline-info"
                              onClick={() => setActiveTab('history')}
                            >
                              <i className="bi bi-clock-history me-2"></i>
                              حفظ في التاريخ
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-lg-4">
                {/* How it works */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-question-circle text-primary me-2"></i>
                      كيف يعمل التصنيف الذكي؟
                    </h6>
                    
                    <div className="d-flex align-items-start mb-3">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '30px', height: '30px', minWidth: '30px' }}>
                        <span className="text-white fw-bold small">1</span>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">رفع الصورة</h6>
                        <p className="text-muted small mb-0">ارفع صورة واضحة للمخلف</p>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-start mb-3">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '30px', height: '30px', minWidth: '30px' }}>
                        <span className="text-white fw-bold small">2</span>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">التحليل الذكي</h6>
                        <p className="text-muted small mb-0">يحلل الذكاء الاصطناعي الصورة</p>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-start">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '30px', height: '30px', minWidth: '30px' }}>
                        <span className="text-white fw-bold small">3</span>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">النتائج والتوصيات</h6>
                        <p className="text-muted small mb-0">احصل على التصنيف والنصائح</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Types */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-gear text-success me-2"></i>
                      أنواع التحليل
                    </h6>
                    
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-lightning text-primary me-2"></i>
                        <strong>تحليل سريع</strong>
                      </div>
                      <p className="text-muted small">تصنيف أساسي سريع مع معلومات أساسية</p>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-gear-wide-connected text-success me-2"></i>
                        <strong>تحليل متقدم</strong>
                      </div>
                      <p className="text-muted small">تحليل مفصل مع تركيب المواد والأثر البيئي</p>
                    </div>
                    
                    <div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-stars text-info me-2"></i>
                        <strong>تحليل شامل</strong>
                      </div>
                      <p className="text-muted small">تحليل كامل مع الاستدامة وخطوات المعالجة</p>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="fw-bold text-success mb-3">
                      <i className="bi bi-lightbulb me-2"></i>
                      نصائح للحصول على أفضل النتائج
                    </h6>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        استخدم صوراً واضحة وعالية الجودة
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        تأكد من الإضاءة الجيدة
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        صور المخلف من زوايا مختلفة
                      </li>
                      <li className="mb-0">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        تجنب الخلفيات المعقدة
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-clock-history me-2"></i>
                  تاريخ التحليلات
                </h5>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    setAnalysisHistory([]);
                    localStorage.removeItem('ai_analysis_history');
                    showSuccess('تم مسح التاريخ');
                  }}
                >
                  <i className="bi bi-trash me-2"></i>
                  مسح التاريخ
                </button>
              </div>
              <div className="card-body">
                {analysisHistory.length > 0 ? (
                  <div className="row">
                    {analysisHistory.map(analysis => (
                      <div key={analysis.id} className="col-md-6 col-lg-4 mb-4">
                        <div className="card border-0 shadow-sm h-100 card-hover">
                          <img 
                            src={analysis.image} 
                            alt="تحليل سابق"
                            className="card-img-top"
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-2">
                              <i 
                                className={`bi bi-${getCategoryIcon(analysis.result.category)} me-2`}
                                style={{ color: getCategoryColor(analysis.result.category) }}
                              ></i>
                              <h6 className="mb-0 fw-bold">{analysis.result.category}</h6>
                            </div>
                            <p className="text-muted small mb-2">{analysis.result.description}</p>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="badge bg-success">{analysis.result.confidence}% دقة</span>
                              <span className="badge bg-info">{analysis.type}</span>
                            </div>
                            <small className="text-muted">{formatDate(analysis.timestamp)}</small>
                          </div>
                          <div className="card-footer bg-transparent">
                            <button
                              className="btn btn-outline-primary btn-sm w-100"
                              onClick={() => {
                                setResult(analysis.result);
                                setPreview(analysis.image);
                                setActiveTab('classify');
                              }}
                            >
                              <i className="bi bi-eye me-2"></i>
                              عرض النتائج
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-clock-history text-muted" style={{ fontSize: '4rem' }}></i>
                    <h5 className="mt-3 text-muted">لا يوجد تاريخ تحليلات</h5>
                    <p className="text-muted">ابدأ بتصنيف أول صورة لك</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('classify')}
                    >
                      <i className="bi bi-camera me-2"></i>
                      ابدأ التصنيف
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Capabilities Tab */}
          {activeTab === 'capabilities' && (
            <div className="row">
              {Object.entries(capabilities).map(([key, capability]) => (
                <div key={key} className="col-lg-6 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-robot text-primary fs-4"></i>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">{capability.name}</h5>
                          <p className="text-muted mb-0">{capability.description}</p>
                        </div>
                      </div>
                      
                      {capability.supported_formats && (
                        <div className="mb-3">
                          <strong>الصيغ المدعومة:</strong>
                          <div className="mt-1">
                            {capability.supported_formats.map(format => (
                              <span key={format} className="badge bg-secondary me-1">{format}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {capability.max_file_size && (
                        <div className="mb-3">
                          <strong>الحد الأقصى لحجم الملف:</strong>
                          <span className="ms-2">{capability.max_file_size}</span>
                        </div>
                      )}
                      
                      {capability.factors && (
                        <div className="mb-3">
                          <strong>العوامل المؤثرة:</strong>
                          <ul className="mt-1 mb-0">
                            {capability.factors.map((factor, index) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {capability.capabilities && (
                        <div>
                          <strong>القدرات:</strong>
                          <ul className="mt-1 mb-0">
                            {capability.capabilities.map((cap, index) => (
                              <li key={index}>{cap}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIClassification;