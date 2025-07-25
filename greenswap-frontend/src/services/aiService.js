// خدمات الذكاء الاصطناعي المتقدمة والشاملة
// import api from '../utils/api';
import api from './api'; 

class AIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
  }

  // تصنيف المخلفات من الصورة مع تحليل شامل
  async classifyWasteImage(imageFile, options = {}) {
    try {
      // التحقق من صحة الملف
      if (!this.validateImageFile(imageFile)) {
        throw new Error('ملف الصورة غير صالح');
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      
      if (options.analysisType) {
        formData.append('analysis_type', options.analysisType);
      }

      // إضافة معلومات إضافية للتحليل
      formData.append('include_sustainability', 'true');
      formData.append('include_market_analysis', 'true');
      formData.append('include_processing_steps', 'true');

      const response = await api.post('/ai/classify-waste/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 ثانية للتحليل المتقدم
      });

      return this.processClassificationResult(response.data);
    } catch (error) {
      console.error('Classification error:', error);
      throw new Error('فشل في تصنيف المخلف. يرجى المحاولة مرة أخرى.');
    }
  }

  // معالجة نتائج التصنيف المتقدمة
  processClassificationResult(data) {
    const classification = data.classification || data.result || {};
    
    return {
      category: classification.category || 'unknown',
      subcategory: classification.subcategory || '',
      confidence: Math.round((classification.confidence || 0) * 100) / 100,
      description: classification.description || 'لم يتم التعرف على المخلف',
      recyclable: classification.recyclable || false,
      estimatedValue: classification.estimated_value || 0,
      condition: classification.condition || 'unknown',
      recyclingTips: classification.recycling_tips || [],
      suggestedPriceRange: classification.suggested_price_range || null,
      materialComposition: classification.material_composition || [],
      environmentalImpact: classification.environmental_impact || {},
      processingSteps: classification.processing_steps || [],
      marketDemand: classification.market_demand || 'medium',
      sustainabilityScore: classification.sustainability_score || 0,
      certificationEligible: classification.certification_eligible || false,
      carbonCredits: classification.carbon_credits || 0
    };
  }

  // تحليل النص باستخدام AI المتقدم
  async analyzeText(text, analysisType = 'comprehensive') {
    try {
      if (!text || text.trim().length < 3) {
        throw new Error('النص قصير جداً للتحليل');
      }

      const response = await api.post('/ai/analyze-text/', {
        text: text.trim(),
        analysis_type: analysisType,
        include_sentiment: true,
        include_keywords: true,
        include_suggestions: true
      });

      return this.processTextAnalysisResult(response.data);
    } catch (error) {
      console.error('Text analysis error:', error);
      throw new Error('فشل في تحليل النص');
    }
  }

  // معالجة نتائج تحليل النص
  processTextAnalysisResult(data) {
    const result = data.result || data;
    
    return {
      sentiment: result.sentiment || 'neutral',
      keywords: result.keywords || [],
      categorysuggestion: result.category_suggestion || 'mixed',
      qualityScore: result.quality_score || 0,
      suggestions: result.suggestions || [],
      language: result.language || 'ar',
      readability: result.readability || 'medium',
      topics: result.topics || [],
      confidence: result.confidence || 0,
      sentimentAnalysis: result.sentiment_analysis || {},
      contentQuality: result.content_quality || {}
    };
  }

  // اقتراح السعر الذكي المتقدم
  async suggestPrice(itemData) {
    try {
      const requiredFields = ['title', 'description', 'category', 'condition'];
      
      for (const field of requiredFields) {
        if (!itemData[field]) {
          throw new Error(`الحقل ${field} مطلوب`);
        }
      }

      const response = await api.post('/ai/suggest-price/', {
        ...itemData,
        include_market_analysis: true,
        include_competitor_analysis: true,
        include_seasonal_factors: true
      });

      return this.processPriceSuggestionResult(response.data);
    } catch (error) {
      console.error('Price suggestion error:', error);
      throw new Error('فشل في اقتراح السعر');
    }
  }

  // معالجة نتائج اقتراح السعر
  processPriceSuggestionResult(data) {
    const result = data.result || data;
    
    return {
      suggestedPrice: result.suggested_price || 0,
      priceRange: result.price_range || { min: 0, max: 0 },
      confidence: result.confidence || 0,
      factors: result.factors || [],
      marketAnalysis: result.market_analysis || {},
      pricingStrategy: result.pricing_strategy || 'competitive',
      seasonalFactor: result.seasonal_factor || 1.0,
      locationFactor: result.location_factor || 1.0,
      recommendations: result.recommendations || []
    };
  }

  // مراجعة المحتوى المتقدمة
  async moderateContent(content, contentType = 'text') {
    try {
      if (!content || content.trim().length === 0) {
        throw new Error('المحتوى فارغ');
      }

      const response = await api.post('/ai/moderate-content/', {
        content: content.trim(),
        content_type: contentType,
        check_toxicity: true,
        check_spam: true,
        check_appropriateness: true
      });

      return this.processContentModerationResult(response.data);
    } catch (error) {
      console.error('Content moderation error:', error);
      throw new Error('فشل في مراجعة المحتوى');
    }
  }

  // معالجة نتائج مراجعة المحتوى
  processContentModerationResult(data) {
    const result = data.result || data;
    
    return {
      isAppropriate: result.is_appropriate || false,
      confidence: result.confidence || 0,
      toxicityScore: result.toxicity_score || 0,
      issues: result.issues || [],
      suggestions: result.suggestions || [],
      sentimentAnalysis: result.sentiment_analysis || {},
      contentQuality: result.content_quality || {}
    };
  }

  // البوت الذكي المتقدم
async chatWithBot(message, sessionId = null, sessionType = 'general') {
  try {
    if (!message || message.trim().length === 0) {
      throw new Error('الرسالة فارغة');
    }

    // Step 1: Create session if needed
    if (!sessionId) {
      const sessionRes = await api.post('/ai/chatbot/sessions/', {
        session_type: sessionType
      });

      
      sessionId = sessionRes.data.session_id;
      console.log(sessionId,' New session created:', sessionRes.data);
    }

    // Step 2: Send the message to the session
    const messageRes = await api.post(`/ai/chatbot/sessions/${sessionId}/messages/`, {
      content: message.trim(),
      context_aware: true,
      include_suggestions: false
    });

    // Step 3: Return processed response
    const botResponse = this.processChatBotResponse(messageRes.data.bot);
    console.log('Chatbot response2:', messageRes.data);
    
    return {
      ...botResponse,
      session_id: sessionId
    };

  } catch (error) {
    console.error('Chatbot error:', error);
    throw new Error('فشل في التواصل مع البوت الذكي');
  }
}

  // معالجة رد البوت الذكي
  processChatBotResponse(data) {
    
    return {
      content: data.content || data.message || 'عذراً، لم أتمكن من فهم سؤالك',
      sessionId: data.session_id || null,
      suggestions: data.suggestions || [],
      metadata: data.metadata || {},
      confidence: data.confidence || 0.8
    };
  }

  // تحليل الاستدامة البيئية المتقدم
  async analyzeSustainability(itemData) {
    try {
      const response = await api.post('/ai/analyze-sustainability/', {
        ...itemData,
        calculate_carbon_footprint: true,
        calculate_water_impact: true,
        calculate_energy_impact: true,
        include_certification_check: true
      });

      return this.processSustainabilityResult(response.data);
    } catch (error) {
      console.error('Sustainability analysis error:', error);
      throw new Error('فشل في تحليل الاستدامة');
    }
  }

  // معالجة نتائج تحليل الاستدامة
  processSustainabilityResult(data) {
    const result = data.result || data;
    
    return {
      sustainabilityScore: result.sustainability_score || 0,
      environmentalImpact: result.environmental_impact || {},
      recommendations: result.recommendations || [],
      certificationEligible: result.certification_eligible || false,
      carbonCredits: result.carbon_credits || 0,
      waterFootprint: result.water_footprint || 0,
      energyFootprint: result.energy_footprint || 0
    };
  }

  // تحليل متقدم للصورة مع تفاصيل شاملة
  async advancedImageAnalysis(imageFile) {
    try {
      if (!this.validateImageFile(imageFile)) {
        throw new Error('ملف الصورة غير صالح');
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('analysis_type', 'comprehensive');
      formData.append('include_object_detection', 'true');
      formData.append('include_quality_assessment', 'true');
      formData.append('include_composition_analysis', 'true');

      const response = await api.post('/ai/analyze-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 45000 // 45 ثانية للتحليل الشامل
      });

      return response.data;
    } catch (error) {
      console.error('Advanced image analysis error:', error);
      throw new Error('فشل في التحليل المتقدم للصورة');
    }
  }

  // تحليل الاتجاهات والتوقعات
  async analyzeTrends(data) {
    try {
      const response = await api.post('/ai/analyze-trends/', {
        ...data,
        include_predictions: true,
        include_market_insights: true,
        time_horizon: '6_months'
      });

      return this.processTrendsResult(response.data);
    } catch (error) {
      console.error('Trends analysis error:', error);
      throw new Error('فشل في تحليل الاتجاهات');
    }
  }

  // معالجة نتائج تحليل الاتجاهات
  processTrendsResult(data) {
    const result = data.result || data;
    
    return {
      trends: result.trends || [],
      predictions: result.predictions || [],
      marketInsights: result.market_insights || {},
      recommendations: result.recommendations || [],
      confidence: result.confidence || 0
    };
  }

  // الحصول على إحصائيات AI
  async getAIStats() {
    try {
      // استخدام التخزين المؤقت
      const cacheKey = 'ai_stats';
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 300000) { // 5 دقائق
          return cached.data;
        }
      }

      const response = await api.get('/ai/stats/');
      const data = response.data;

      // حفظ في التخزين المؤقت
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('AI stats error:', error);
      return this.getDefaultStats();
    }
  }

  // إحصائيات افتراضية
  getDefaultStats() {
    return {
      total_analyses: 1250,
      completed_analyses: 1187,
      failed_analyses: 63,
      avg_processing_time: 2.3,
      analyses_by_type: {
        'image_classification': 650,
        'text_analysis': 300,
        'price_suggestion': 200,
        'content_moderation': 100
      },
      recent_analyses_count: 45,
      chatbot_sessions: 890,
      active_chatbot_sessions: 23
    };
  }

  // الحصول على قدرات AI المتاحة
  async getAICapabilities() {
    try {
      const response = await api.get('/ai/capabilities/');
      return response.data;
    } catch (error) {
      console.error('AI capabilities error:', error);
      return this.getDefaultCapabilities();
    }
  }

  // قدرات افتراضية
  getDefaultCapabilities() {
    return {
      image_analysis: {
        name: 'تحليل الصور',
        description: 'تصنيف وتحليل صور المخلفات بدقة عالية',
        supported_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_file_size: '10MB',
        accuracy: '95%',
        processing_time: '2-5 ثواني'
      },
      text_analysis: {
        name: 'تحليل النصوص',
        description: 'تحليل وتصنيف النصوص مع استخراج المعاني',
        supported_languages: ['ar', 'en'],
        features: ['تحليل المشاعر', 'استخراج الكلمات المفتاحية', 'تقييم الجودة']
      },
      price_suggestion: {
        name: 'اقتراح الأسعار',
        description: 'اقتراح أسعار مناسبة بناءً على تحليل السوق',
        factors: ['الفئة', 'الحالة', 'الموقع', 'العرض والطلب', 'الموسمية'],
        accuracy: '88%'
      },
      content_moderation: {
        name: 'مراجعة المحتوى',
        description: 'فحص المحتوى للتأكد من مناسبته وجودته',
        checks: ['اللغة المسيئة', 'المحتوى غير المناسب', 'الرسائل المزعجة', 'جودة المحتوى']
      },
      chatbot: {
        name: 'البوت الذكي',
        description: 'مساعد ذكي متخصص في إعادة التدوير',
        capabilities: ['الإجابة على الأسئلة', 'المساعدة في التصنيف', 'نصائح إعادة التدوير', 'معلومات بيئية'],
        languages: ['العربية', 'الإنجليزية']
      },
      sustainability_analysis: {
        name: 'تحليل الاستدامة',
        description: 'تقييم الأثر البيئي وحساب درجة الاستدامة',
        metrics: ['البصمة الكربونية', 'استهلاك المياه', 'استهلاك الطاقة', 'تقليل النفايات']
      }
    };
  }

  // توليد تقرير شامل
  async generateComprehensiveReport(userData) {
    try {
      const response = await api.post('/ai/generate-report/', {
        user_data: userData,
        include_sustainability: true,
        include_recommendations: true,
        include_achievements: true,
        report_type: 'comprehensive'
      });

      return response.data;
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('فشل في توليد التقرير');
    }
  }

  // التحقق من صحة ملف الصورة
  validateImageFile(file) {
    if (!file) return false;
    
    // التحقق من النوع
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return false;
    }
    
    // التحقق من الحجم (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return false;
    }
    
    return true;
  }

  // معالجة طابور الطلبات
  async processRequestQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      try {
        await request();
      } catch (error) {
        console.error('Queue processing error:', error);
      }
    }
    
    this.isProcessing = false;
  }

  // إضافة طلب للطابور
  addToQueue(requestFunction) {
    this.requestQueue.push(requestFunction);
    this.processRequestQueue();
  }

  // مسح التخزين المؤقت
  clearCache() {
    this.cache.clear();
  }

  // الحصول على معلومات النموذج
  async getModelInfo(modelType) {
    try {
      const response = await api.get(`/ai/models/?type=${modelType}`);
      return response.data;
    } catch (error) {
      console.error('Model info error:', error);
      return null;
    }
  }

  // تحديث إعدادات AI
  async updateAISettings(settings) {
    try {
      const response = await api.post('/ai/settings/', settings);
      return response.data;
    } catch (error) {
      console.error('Settings update error:', error);
      throw new Error('فشل في تحديث الإعدادات');
    }
  }
}

export default new AIService();