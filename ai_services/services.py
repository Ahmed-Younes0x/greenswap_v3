import time
import json
import base64
import os
from django.conf import settings
from django.core.files.storage import default_storage
from .models import AIAnalysis, AIModel, ChatBot, ChatBotMessage
import openai
from PIL import Image
import io
import requests
# from .reports import .
# تكوين OpenAI
if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
    openai.api_key = settings.OPENAI_API_KEY

class AIService:
    """خدمة الذكاء الاصطناعي المتقدمة"""
    
    @staticmethod
    def classify_waste_image(analysis):
        """تصنيف المخلفات من الصورة بدقة عالية"""
        start_time = time.time()
        analysis.start_processing()
        
        try:
            # استخدام OpenAI الحقيقي إذا كان المفتاح متاحاً
            if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != 'your-openai-api-key-here':
                result_data = AIService._classify_with_openai(analysis)
            else:
                # محاكاة ذكية متقدمة
                result_data = AIService._simulate_advanced_classification(analysis)
            
            processing_time = time.time() - start_time
            confidence_score = result_data.get('confidence', 0) / 100
            
            analysis.complete_processing(result_data, confidence_score, processing_time)
            
            return result_data
            
        except Exception as e:
            analysis.fail_processing(str(e))
            raise e
    
    @staticmethod
    def _classify_with_openai(analysis):
        """تصنيف باستخدام OpenAI الحقيقي"""
        try:
            image_path = analysis.input_image.path
            
            # تحضير الصورة
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            response = openai.ChatCompletion.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """
                                حلل هذه الصورة وصنف نوع المخلف الموجود فيها بدقة عالية:
                                
                                الفئات المتاحة:
                                1. بلاستيك (plastic) - زجاجات، أكياس، حاويات
                                2. معادن (metal) - علب، أسلاك، قطع معدنية
                                3. ورق وكرتون (paper) - صحف، كتب، صناديق
                                4. زجاج (glass) - زجاجات، مرايا، نوافذ
                                5. إلكترونيات (electronics) - هواتف، حاسوب، أجهزة
                                6. نسيج (textile) - ملابس، أقمشة، سجاد
                                7. عضوي (organic) - طعام، نباتات، خشب
                                8. خطير (hazardous) - بطاريات، كيماويات
                                9. مختلط (mixed) - خليط من مواد مختلفة
                                10. غير محدد (unknown) - غير واضح
                                
                                أجب بصيغة JSON تحتوي على:
                                - category: الفئة الرئيسية
                                - subcategory: الفئة الفرعية المحددة
                                - confidence: درجة الثقة (0-100)
                                - description: وصف دقيق للمخلف
                                - recyclable: هل قابل لإعادة التدوير (true/false)
                                - recycling_tips: نصائح إعادة التدوير (array)
                                - estimated_value: القيمة المقدرة بالجنيه المصري
                                - condition: حالة المخلف (new/good/fair/poor)
                                - material_composition: تركيب المواد (array of objects)
                                - environmental_impact: الأثر البيئي (object)
                                - processing_steps: خطوات المعالجة (array)
                                - market_demand: الطلب في السوق (high/medium/low)
                                - suggested_price_range: نطاق السعر المقترح (object)
                                """
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1500
            )
            
            result_text = response.choices[0].message.content
            # تنظيف النص واستخراج JSON
            json_start = result_text.find('{')
            json_end = result_text.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                json_text = result_text[json_start:json_end]
                return json.loads(json_text)
            else:
                raise ValueError("لم يتم العثور على JSON صحيح في الاستجابة")
                
        except Exception as e:
            print(f"خطأ في OpenAI: {e}")
            # العودة للمحاكاة في حالة الخطأ
            return AIService._simulate_advanced_classification(analysis)
    
    @staticmethod
    def _simulate_advanced_classification(analysis):
        """محاكاة تصنيف متقدمة وذكية"""
        # تحليل اسم الملف للحصول على تلميحات
        filename = analysis.input_image.name.lower()
        
        # قاموس التصنيف الذكي
        classification_hints = {
            'plastic': ['bottle', 'bag', 'container', 'cup', 'زجاجة', 'كيس', 'بلاستيك'],
            'metal': ['can', 'wire', 'aluminum', 'steel', 'علبة', 'معدن', 'حديد'],
            'paper': ['paper', 'cardboard', 'book', 'newspaper', 'ورق', 'كرتون', 'كتاب'],
            'glass': ['glass', 'bottle', 'mirror', 'window', 'زجاج', 'مرآة'],
            'electronics': ['phone', 'computer', 'tv', 'electronic', 'هاتف', 'حاسوب', 'إلكتروني'],
            'textile': ['cloth', 'fabric', 'shirt', 'textile', 'قماش', 'ملابس', 'نسيج'],
            'organic': ['food', 'plant', 'wood', 'organic', 'طعام', 'نبات', 'خشب']
        }
        
        # تحديد الفئة بناءً على اسم الملف
        detected_category = 'mixed'
        confidence = 75
        
        for category, hints in classification_hints.items():
            if any(hint in filename for hint in hints):
                detected_category = category
                confidence = 92
                break
        
        # بيانات متقدمة حسب الفئة
        category_data = {
            'plastic': {
                'subcategory': 'زجاجات بلاستيكية',
                'description': 'زجاجات مياه بلاستيكية شفافة قابلة لإعادة التدوير',
                'recyclable': True,
                'estimated_value': 15,
                'condition': 'good',
                'material_composition': [
                    {'name': 'PET', 'percentage': 95},
                    {'name': 'ملصقات ورقية', 'percentage': 3},
                    {'name': 'غطاء بلاستيكي', 'percentage': 2}
                ],
                'environmental_impact': {
                    'carbon_footprint': 2.1,
                    'water_saved': 180,
                    'energy_saved': 85
                },
                'processing_steps': [
                    'إزالة الأغطية والملصقات',
                    'غسيل وتنظيف الزجاجات',
                    'فرز حسب اللون والنوع',
                    'تقطيع إلى رقائق صغيرة',
                    'صهر وإعادة تشكيل'
                ],
                'recycling_tips': [
                    'تنظيف الزجاجات قبل إعادة التدوير',
                    'إزالة الأغطية والملصقات',
                    'فصل الألوان المختلفة',
                    'تجنب الضغط الشديد'
                ],
                'market_demand': 'high',
                'suggested_price_range': {'min': 12, 'max': 18}
            },
            'metal': {
                'subcategory': 'علب الألومنيوم',
                'description': 'علب مشروبات من الألومنيوم عالية القيمة',
                'recyclable': True,
                'estimated_value': 25,
                'condition': 'good',
                'material_composition': [
                    {'name': 'ألومنيوم', 'percentage': 98},
                    {'name': 'طلاء', 'percentage': 2}
                ],
                'environmental_impact': {
                    'carbon_footprint': 1.8,
                    'water_saved': 220,
                    'energy_saved': 120
                },
                'processing_steps': [
                    'جمع وفرز العلب',
                    'إزالة الملصقات',
                    'ضغط وتكديس',
                    'صهر في أفران خاصة',
                    'تشكيل منتجات جديدة'
                ],
                'recycling_tips': [
                    'تنظيف العلب من البقايا',
                    'ضغط العلب لتوفير المساحة',
                    'فصل عن المواد الأخرى',
                    'تجميع كميات كبيرة لسعر أفضل'
                ],
                'market_demand': 'high',
                'suggested_price_range': {'min': 20, 'max': 30}
            },
            'paper': {
                'subcategory': 'ورق وكرتون مختلط',
                'description': 'أوراق وكرتون مكتبي قابل لإعادة التدوير',
                'recyclable': True,
                'estimated_value': 8,
                'condition': 'fair',
                'material_composition': [
                    {'name': 'ألياف ورقية', 'percentage': 85},
                    {'name': 'حبر', 'percentage': 10},
                    {'name': 'مواد لاصقة', 'percentage': 5}
                ],
                'environmental_impact': {
                    'carbon_footprint': 1.2,
                    'water_saved': 150,
                    'energy_saved': 60
                },
                'processing_steps': [
                    'فرز وإزالة المواد غير الورقية',
                    'نقع في الماء لتكوين عجينة',
                    'إزالة الحبر والشوائب',
                    'تشكيل أوراق جديدة',
                    'تجفيف وتقطيع'
                ],
                'recycling_tips': [
                    'إزالة الدبابيس والمشابك',
                    'فصل الورق الملون عن الأبيض',
                    'تجنب الورق المبلل أو الملوث',
                    'تجميع كميات كبيرة'
                ],
                'market_demand': 'medium',
                'suggested_price_range': {'min': 5, 'max': 12}
            },
            'electronics': {
                'subcategory': 'أجهزة إلكترونية صغيرة',
                'description': 'هواتف وأجهزة إلكترونية تحتوي على معادن ثمينة',
                'recyclable': True,
                'estimated_value': 150,
                'condition': 'fair',
                'material_composition': [
                    {'name': 'معادن ثمينة', 'percentage': 15},
                    {'name': 'بلاستيك', 'percentage': 40},
                    {'name': 'معادن عادية', 'percentage': 35},
                    {'name': 'مواد أخرى', 'percentage': 10}
                ],
                'environmental_impact': {
                    'carbon_footprint': 5.2,
                    'water_saved': 300,
                    'energy_saved': 200
                },
                'processing_steps': [
                    'تفكيك الأجهزة بعناية',
                    'فصل المكونات المختلفة',
                    'استخراج المعادن الثمينة',
                    'معالجة البلاستيك',
                    'التخلص الآمن من المواد الخطرة'
                ],
                'recycling_tips': [
                    'إزالة البطاريات قبل التدوير',
                    'حذف البيانات الشخصية',
                    'تجميع أجهزة متشابهة',
                    'التعامل مع مراكز متخصصة'
                ],
                'market_demand': 'high',
                'suggested_price_range': {'min': 100, 'max': 200}
            }
        }
        
        # الحصول على البيانات المناسبة أو استخدام افتراضية
        data = category_data.get(detected_category, {
            'subcategory': 'مخلفات متنوعة',
            'description': 'مخلفات متنوعة تحتاج لفرز وتصنيف',
            'recyclable': True,
            'estimated_value': 10,
            'condition': 'fair',
            'material_composition': [
                {'name': 'مواد مختلطة', 'percentage': 100}
            ],
            'environmental_impact': {
                'carbon_footprint': 2.0,
                'water_saved': 100,
                'energy_saved': 50
            },
            'processing_steps': [
                'فرز المواد المختلفة',
                'تنظيف وتحضير',
                'معالجة حسب نوع المادة'
            ],
            'recycling_tips': [
                'فصل المواد المختلفة',
                'تنظيف من الشوائب',
                'تجميع كميات مناسبة'
            ],
            'market_demand': 'medium',
            'suggested_price_range': {'min': 5, 'max': 15}
        })
        
        return {
            'category': detected_category,
            'subcategory': data['subcategory'],
            'confidence': confidence,
            'description': data['description'],
            'recyclable': data['recyclable'],
            'recycling_tips': data['recycling_tips'],
            'estimated_value': data['estimated_value'],
            'condition': data['condition'],
            'material_composition': data['material_composition'],
            'environmental_impact': data['environmental_impact'],
            'processing_steps': data['processing_steps'],
            'market_demand': data['market_demand'],
            'suggested_price_range': data['suggested_price_range']
        }
    
    @staticmethod
    def analyze_text(analysis):
        """تحليل النصوص المتقدم"""
        start_time = time.time()
        analysis.start_processing()
        
        try:
            text = analysis.input_text
            
            if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != 'your-openai-api-key-here':
                result_data = AIService._analyze_text_with_openai(text)
            else:
                result_data = AIService._simulate_text_analysis(text)
            
            processing_time = time.time() - start_time
            confidence_score = result_data.get('confidence', 80) / 100
            
            analysis.complete_processing(result_data, confidence_score, processing_time)
            
            return result_data
            
        except Exception as e:
            analysis.fail_processing(str(e))
            raise e
    
    @staticmethod
    def _analyze_text_with_openai(text):
        """تحليل النص باستخدام OpenAI"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "user",
                        "content": f"""
                        حلل النص التالي وأعطني تحليلاً شاملاً:
                        
                        النص: "{text}"
                        
                        أريد التحليل في صيغة JSON يحتوي على:
                        - sentiment: المشاعر (positive/negative/neutral)
                        - keywords: الكلمات المفتاحية (array)
                        - category_suggestion: اقتراح الفئة المناسبة
                        - quality_score: درجة جودة النص (0-10)
                        - suggestions: اقتراحات للتحسين (array)
                        - language: اللغة المكتشفة
                        - readability: سهولة القراءة (easy/medium/hard)
                        - topics: المواضيع الرئيسية (array)
                        - confidence: درجة الثقة (0-100)
                        """
                    }
                ],
                max_tokens=800
            )
            
            result_text = response.choices[0].message.content
            json_start = result_text.find('{')
            json_end = result_text.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                json_text = result_text[json_start:json_end]
                return json.loads(json_text)
            else:
                raise ValueError("لم يتم العثور على JSON صحيح")
                
        except Exception as e:
            print(f"خطأ في تحليل النص: {e}")
            return AIService._simulate_text_analysis(text)
    
    @staticmethod
    def _simulate_text_analysis(text):
        """محاكاة تحليل النص المتقدم"""
        # تحليل بسيط للنص
        words = text.lower().split()
        
        # تحديد المشاعر
        positive_words = ['جيد', 'ممتاز', 'رائع', 'مفيد', 'نظيف', 'جديد']
        negative_words = ['سيء', 'قديم', 'متسخ', 'مكسور', 'تالف']
        
        positive_count = sum(1 for word in words if any(pos in word for pos in positive_words))
        negative_count = sum(1 for word in words if any(neg in word for neg in negative_words))
        
        if positive_count > negative_count:
            sentiment = 'positive'
        elif negative_count > positive_count:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # استخراج الكلمات المفتاحية
        recycling_keywords = ['تدوير', 'بيئة', 'استدامة', 'نظافة', 'طبيعة']
        found_keywords = [word for word in recycling_keywords if any(word in w for w in words)]
        
        # اقتراح الفئة
        category_hints = {
            'plastic': ['بلاستيك', 'زجاجة', 'كيس'],
            'metal': ['معدن', 'حديد', 'علبة'],
            'paper': ['ورق', 'كرتون', 'كتاب'],
            'electronics': ['هاتف', 'حاسوب', 'إلكتروني']
        }
        
        suggested_category = 'mixed'
        for category, hints in category_hints.items():
            if any(hint in text for hint in hints):
                suggested_category = category
                break
        
        return {
            'sentiment': sentiment,
            'keywords': found_keywords,
            'category_suggestion': suggested_category,
            'quality_score': min(10, len(words) / 5),
            'suggestions': [
                'إضافة المزيد من التفاصيل',
                'تحسين الوصف',
                'إضافة الكلمات المفتاحية',
                'توضيح حالة المنتج'
            ],
            'language': 'ar',
            'readability': 'easy' if len(words) < 20 else 'medium',
            'topics': ['إعادة تدوير', 'بيئة'],
            'confidence': 85
        }
    
    @staticmethod
    def suggest_price(analysis):
        """اقتراح السعر الذكي المتقدم"""
        start_time = time.time()
        analysis.start_processing()
        
        try:
            item_data = analysis.input_data
            
            if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != 'your-openai-api-key-here':
                result_data = AIService._suggest_price_with_ai(item_data)
            else:
                result_data = AIService._simulate_smart_pricing(item_data)
            
            processing_time = time.time() - start_time
            confidence_score = result_data.get('confidence', 75) / 100
            
            analysis.complete_processing(result_data, confidence_score, processing_time)
            
            return result_data
            
        except Exception as e:
            analysis.fail_processing(str(e))
            raise e
    
    @staticmethod
    def _simulate_smart_pricing(item_data):
        """محاكاة تسعير ذكي متقدم"""
        # أسعار أساسية حسب الفئة
        base_prices = {
            'plastic': 15,
            'metal': 25,
            'paper': 8,
            'glass': 12,
            'electronics': 150,
            'textile': 20,
            'organic': 5
        }
        
        category = item_data.get('category', 'mixed')
        base_price = base_prices.get(category, 10)
        
        # عوامل التسعير
        condition_multipliers = {
            'new': 1.0,
            'like_new': 0.9,
            'good': 0.8,
            'fair': 0.6,
            'poor': 0.4
        }
        
        # عوامل السوق
        market_factors = {
            'plastic': {'demand': 'high', 'supply': 'medium', 'trend': 'up'},
            'metal': {'demand': 'high', 'supply': 'low', 'trend': 'up'},
            'paper': {'demand': 'medium', 'supply': 'high', 'trend': 'stable'},
            'electronics': {'demand': 'high', 'supply': 'low', 'trend': 'up'}
        }
        
        condition = item_data.get('condition', 'good')
        quantity = int(item_data.get('quantity', 1))
        
        # حساب السعر
        suggested_price = base_price * condition_multipliers.get(condition, 0.8)
        
        # تعديل حسب الكمية
        if quantity > 10:
            suggested_price *= 1.1  # خصم كمية
        elif quantity > 50:
            suggested_price *= 1.2
        
        # تعديل حسب السوق
        market = market_factors.get(category, {'demand': 'medium', 'supply': 'medium', 'trend': 'stable'})
        if market['demand'] == 'high':
            suggested_price *= 1.15
        if market['supply'] == 'low':
            suggested_price *= 1.1
        
        return {
            'suggested_price': round(suggested_price, 2),
            'price_range': {
                'min': round(suggested_price * 0.8, 2),
                'max': round(suggested_price * 1.2, 2)
            },
            'confidence': 88,
            'factors': [
                f'فئة المنتج: {category}',
                f'حالة المنتج: {condition}',
                f'الكمية: {quantity}',
                'الطلب في السوق',
                'الأسعار المماثلة',
                'الموقع الجغرافي'
            ],
            'market_analysis': market,
            'pricing_strategy': 'competitive',
            'seasonal_factor': 1.0,
            'location_factor': 1.0,
            'recommendations': [
                'السعر مناسب للسوق الحالي',
                'يمكن زيادة السعر 10% للتفاوض',
                'مراقبة أسعار المنافسين',
                'تحديث السعر شهرياً'
            ]
        }
    
    @staticmethod
    def moderate_content(analysis):
        """مراجعة المحتوى المتقدمة"""
        start_time = time.time()
        analysis.start_processing()
        
        try:
            content = analysis.input_text
            
            if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != 'your-openai-api-key-here':
                result_data = AIService._moderate_with_openai(content)
            else:
                result_data = AIService._simulate_content_moderation(content)
            
            processing_time = time.time() - start_time
            confidence_score = result_data.get('confidence', 90) / 100
            
            analysis.complete_processing(result_data, confidence_score, processing_time)
            
            return result_data
            
        except Exception as e:
            analysis.fail_processing(str(e))
            raise e
    
    @staticmethod
    def _simulate_content_moderation(content):
        """محاكاة مراجعة المحتوى المتقدمة"""
        # كلمات غير مناسبة
        inappropriate_words = [
            'سيء', 'فظيع', 'احتيال', 'نصب', 'خداع', 'مزيف',
            'غش', 'كذب', 'سرقة', 'حرام', 'ممنوع'
        ]
        
        # كلمات إيجابية
        positive_words = [
            'ممتاز', 'رائع', 'جيد', 'نظيف', 'جديد', 'مفيد',
            'صحي', 'آمن', 'موثوق', 'أصلي'
        ]
        
        content_lower = content.lower()
        
        # فحص الكلمات غير المناسبة
        found_inappropriate = [word for word in inappropriate_words if word in content_lower]
        found_positive = [word for word in positive_words if word in content_lower]
        
        # حساب درجة السمية
        toxicity_score = len(found_inappropriate) / max(len(content.split()), 1)
        is_appropriate = toxicity_score < 0.1 and len(found_inappropriate) == 0
        
        # تحليل المحتوى
        issues = []
        if found_inappropriate:
            issues.extend([f'كلمات غير مناسبة: {", ".join(found_inappropriate)}'])
        
        if len(content) < 10:
            issues.append('المحتوى قصير جداً')
        
        if content.isupper():
            issues.append('استخدام أحرف كبيرة بشكل مفرط')
        
        return {
            'is_appropriate': is_appropriate,
            'confidence': 92,
            'toxicity_score': min(toxicity_score, 1.0),
            'issues': issues,
            'suggestions': [
                'استخدم لغة مهذبة ومحترمة',
                'تجنب الكلمات المسيئة أو المثيرة للجدل',
                'كن واضحاً ومفيداً في الوصف',
                'اكتب محتوى إيجابي وبناء',
                'تأكد من صحة المعلومات'
            ],
            'sentiment_analysis': {
                'positive_words': found_positive,
                'negative_words': found_inappropriate,
                'overall_sentiment': 'positive' if len(found_positive) > len(found_inappropriate) else 'neutral'
            },
            'content_quality': {
                'length': len(content),
                'word_count': len(content.split()),
                'readability': 'good' if 10 <= len(content.split()) <= 100 else 'needs_improvement'
            }
        }
    
    @staticmethod
    def process_chatbot_message(session, message):
        """معالجة رسالة البوت الذكي المتقدم"""
        start_time = time.time()
        
        try:
            if True:
                print('rag activated')
                response_content = AIService._chatbot_with_openai(session, message)
            else:
                response_content = AIService._simulate_smart_chatbot(session, message)
            
            processing_time = time.time() - start_time
            
            return {
                'content': response_content,
                'processing_time': processing_time,
                'metadata': {
                    'model': 'greenbot-v2',
                    'confidence': 0.92,
                    'session_type': session.session_type,
                    'context_aware': True
                }
            }
            
        except Exception as e:
            return {
                'content': 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.',
                'processing_time': time.time() - start_time,
                'metadata': {'error': str(e)}
            }
    
    @staticmethod
    def _simulate_smart_chatbot(session, message):
        """محاكاة بوت ذكي متقدم"""
        message_lower = message.lower()
        
        # قاعدة معرفة متقدمة
        knowledge_base = {
            'تحية': {
                'keywords': ['مرحبا', 'السلام', 'أهلا', 'صباح', 'مساء'],
                'responses': [
                    'مرحباً بك في جرين بوت! أنا هنا لمساعدتك في كل ما يتعلق بإعادة التدوير والاستدامة البيئية. كيف يمكنني مساعدتك اليوم؟',
                    'أهلاً وسهلاً! أنا مساعدك الذكي في رحلة إعادة التدوير. ما الذي تود معرفته؟'
                ]
            },
            'تصنيف': {
                'keywords': ['تصنيف', 'نوع', 'فئة', 'كيف أعرف'],
                'responses': [
                    'يمكنني مساعدتك في تصنيف المخلفات! ارفع صورة للمخلف وسأحلله لك فوراً. أو اوصف لي المخلف وسأساعدك في تحديد فئته.',
                    'التصنيف سهل! الفئات الرئيسية هي: بلاستيك، معادن، ورق، زجاج، إلكترونيات، نسيج، وعضوي. أي نوع تريد معرفة المزيد عنه؟'
                ]
            },
            'سعر': {
                'keywords': ['سعر', 'ثمن', 'قيمة', 'كم يساوي'],
                'responses': [
                    'أسعار المخلفات تعتمد على عدة عوامل: نوع المادة، الحالة، الكمية، والطلب في السوق. يمكنني اقتراح سعر مناسب إذا أخبرتني بتفاصيل المخلف.',
                    'لتحديد السعر المناسب، أحتاج معرفة: نوع المخلف، حالته، الكمية، وموقعك. هذا سيساعدني في إعطائك تقدير دقيق.'
                ]
            },
            'تدوير': {
                'keywords': ['تدوير', 'إعادة', 'معالجة', 'كيف'],
                'responses': [
                    'إعادة التدوير عملية رائعة للبيئة! كل مادة لها طريقة معالجة خاصة. البلاستيك يُقطع ويُصهر، المعادن تُصهر وتُعاد تشكيلها، والورق يُنقع ويُعاد تكوينه.',
                    'عملية إعادة التدوير تمر بمراحل: الجمع، الفرز، التنظيف، المعالجة، ثم التصنيع. أي مرحلة تريد معرفة المزيد عنها؟'
                ]
            },
            'بيئة': {
                'keywords': ['بيئة', 'طبيعة', 'تلوث', 'نظافة'],
                'responses': [
                    'إعادة التدوير تساهم بشكل كبير في حماية البيئة! توفر الطاقة، تقلل التلوث، وتحافظ على الموارد الطبيعية. كل طن معاد تدويره ينقذ الكوكب!',
                    'البيئة تستفيد من إعادة التدوير بطرق عديدة: تقليل النفايات، توفير المياه والطاقة، تقليل انبعاثات الكربون، والحفاظ على الموائل الطبيعية.'
                ]
            },
            'مساعدة': {
                'keywords': ['مساعدة', 'help', 'ساعدني', 'أحتاج'],
                'responses': [
                    'بالطبع! يمكنني مساعدتك في: تصنيف المخلفات، اقتراح الأسعار، نصائح إعادة التدوير، معلومات بيئية، وإرشادات الاستدامة. ما الذي تحتاج مساعدة فيه؟',
                    'أنا هنا لمساعدتك! خدماتي تشمل: التصنيف الذكي، تقدير الأسعار، نصائح التدوير، معلومات بيئية، وإجابات على أسئلتك. كيف يمكنني خدمتك؟'
                ]
            }
        }
        
        # البحث عن أفضل استجابة
        best_match = None
        max_matches = 0
        
        for category, data in knowledge_base.items():
            matches = sum(1 for keyword in data['keywords'] if keyword in message_lower)
            if matches > max_matches:
                max_matches = matches
                best_match = data
        
        if best_match and max_matches > 0:
            import random
            return random.choice(best_match['responses'])
        
        # استجابات افتراضية ذكية
        default_responses = [
            'شكراً لك على سؤالك! يمكنني مساعدتك في تصنيف المخلفات، اقتراح الأسعار، ونصائح إعادة التدوير. هل تريد معرفة المزيد عن أي من هذه الخدمات؟',
            'سؤال رائع! أنا متخصص في إعادة التدوير والاستدامة البيئية. يمكنني مساعدتك في تحديد نوع المخلفات، تقدير قيمتها، وإرشادك لأفضل طرق التدوير.',
            'أقدر اهتمامك بإعادة التدوير! لمساعدتك بشكل أفضل، يمكنك سؤالي عن: أنواع المخلفات، طرق التدوير، تقدير الأسعار، أو أي معلومات بيئية تحتاجها.',
            'ممتاز! إعادة التدوير خطوة مهمة للبيئة. يمكنني إرشادك خلال عملية تصنيف مخلفاتك، تحديد قيمتها، وإعطائك نصائح لتحقيق أفضل عائد منها.'
        ]
        
        import random
        return random.choice(default_responses)
    
    @staticmethod
    def _chatbot_with_openai(session, message):
        import openai
        import os

        messages = [
            {
                "role": "system",
                "content": "أنت جرين بوت، مساعد ذكي متخصص في إعادة التدوير والاستدامة البيئية. أجب باحترافية وباللغة العربية."
            }
        ]

        # Optional: load session history if context-aware
        if getattr(settings, "ENABLE_CONTEXT_AWARE_CHAT", True):
            history = ChatBotMessage.objects.filter(session=session).order_by('created_at')[:10]
            for msg in history:
                messages.append({
                    "role": "user" if msg.message_type == "user" else "assistant",
                    "content": msg.content
                })

        # Always add the new user message
        messages.append({"role": "user", "content": message})
        
        # Load context from local info.txt file
        try:
            base_dir = os.path.dirname(__file__)  # directory of the current file
            info_path = os.path.join(base_dir, "info.txt")
            with open(info_path, "r", encoding="utf-8") as f:
                file_context = f.read()
            # if message.includes("تقرير") and message.includes("إعادة التدوير"):
            #     file_context = file_context.replace("تقرير", "تقرير إعادة التدوير")
            messa={
                "role": "system",
                "content": f"المعلومات التالية قد تساعدك في الإجابة على الأسئلة:\n{file_context}"
            }
        except Exception as e:
            print("Failed to load info.txt:", e)
        # api_key = "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"
            # system_prompt = (
            #     "You are a helpful assistant. Use the following document as context to answer the user's question.\n\n"
            #     f"Document:\n{file_content[:2000]}\n\n"
            #     "Answer the user's question based on the document above."
            # )
        client = openai.OpenAI(api_key="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")  # No "Bearer" here
        response = client.chat.completions.create(
            model="gpt-4o-mini",
                                messages=[
                                    {
                "role": "system",
                "content": "أنت جرين بوت، مساعد ذكي متخصص في إعادة التدوير والاستدامة البيئية. أجب باحترافية وباللغة العربية."
            },
                                    messa,
                        {"role": "user", "content": message}
                    ],
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()

    @staticmethod
    def _retrieve_documents(query):
        print(f"Retrieving documents for query: {query}")
        from .my_rag import search_documents
        return search_documents(query)  # returns list of dicts with "content"

    @staticmethod
    def analyze_sustainability(item_data):
        """تحليل الاستدامة البيئية"""
        try:
            category = item_data.get('category', 'mixed')
            quantity = float(item_data.get('quantity', 1))
            condition = item_data.get('condition', 'good')
            
            # معاملات الاستدامة حسب الفئة
            sustainability_factors = {
                'plastic': {
                    'carbon_reduction': 2.1,
                    'water_saving': 180,
                    'energy_saving': 85,
                    'landfill_diversion': 0.95
                },
                'metal': {
                    'carbon_reduction': 1.8,
                    'water_saving': 220,
                    'energy_saving': 120,
                    'landfill_diversion': 0.98
                },
                'paper': {
                    'carbon_reduction': 1.2,
                    'water_saving': 150,
                    'energy_saving': 60,
                    'landfill_diversion': 0.85
                },
                'electronics': {
                    'carbon_reduction': 5.2,
                    'water_saving': 300,
                    'energy_saving': 200,
                    'landfill_diversion': 0.90
                }
            }
            
            factors = sustainability_factors.get(category, {
                'carbon_reduction': 2.0,
                'water_saving': 100,
                'energy_saving': 50,
                'landfill_diversion': 0.80
            })
            
            # حساب التأثير الإجمالي
            total_impact = {
                'carbon_footprint_reduced': factors['carbon_reduction'] * quantity,
                'water_saved_liters': factors['water_saving'] * quantity,
                'energy_saved_kwh': factors['energy_saving'] * quantity,
                'waste_diverted_kg': quantity * factors['landfill_diversion']
            }
            
            # درجة الاستدامة
            sustainability_score = min(100, (
                factors['carbon_reduction'] * 10 +
                factors['water_saving'] / 10 +
                factors['energy_saving'] / 5 +
                factors['landfill_diversion'] * 50
            ))
            
            return {
                'sustainability_score': round(sustainability_score, 1),
                'environmental_impact': total_impact,
                'recommendations': [
                    'استمر في إعادة التدوير لتحقيق أثر إيجابي أكبر',
                    'شارك تجربتك مع الآخرين لنشر الوعي',
                    'ابحث عن طرق لتقليل النفايات من المصدر',
                    'اختر منتجات قابلة لإعادة التدوير عند الشراء'
                ],
                'certification_eligible': sustainability_score > 70,
                'carbon_credits': round(total_impact['carbon_footprint_reduced'] * 0.1, 2)
            }
            
        except Exception as e:
            return {
                'error': f'فشل في تحليل الاستدامة: {str(e)}',
                'sustainability_score': 0
            }
    
    @staticmethod
    def generate_recycling_report(user_data):
        """توليد تقرير إعادة التدوير الشخصي"""
        try:
            # حساب الإحصائيات
            total_items = user_data.get('total_items', 0)
            total_value = user_data.get('total_value', 0)
            categories = user_data.get('categories', {})
            
            # حساب الأثر البيئي الإجمالي
            total_carbon_saved = sum(categories.get(cat, {}).get('carbon_saved', 0) for cat in categories)
            total_water_saved = sum(categories.get(cat, {}).get('water_saved', 0) for cat in categories)
            total_energy_saved = sum(categories.get(cat, {}).get('energy_saved', 0) for cat in categories)
            
            return {
                'summary': {
                    'total_items_recycled': total_items,
                    'total_value_generated': total_value,
                    'environmental_impact': {
                        'carbon_footprint_reduced': total_carbon_saved,
                        'water_saved': total_water_saved,
                        'energy_saved': total_energy_saved
                    }
                },
                'achievements': [
                    f'أعدت تدوير {total_items} منتج',
                    f'وفرت {total_carbon_saved:.1f} كجم من انبعاثات الكربون',
                    f'وفرت {total_water_saved:.0f} لتر من المياه',
                    f'حققت عائد {total_value:.0f} جنيه'
                ],
                'recommendations': [
                    'استمر في إعادة التدوير لتحقيق أثر أكبر',
                    'جرب تدوير فئات جديدة من المخلفات',
                    'شارك تجربتك مع الأصدقاء والعائلة',
                    'ابحث عن طرق لتقليل النفايات'
                ],
                'next_goals': [
                    f'هدف الشهر القادم: {total_items + 5} منتج',
                    f'هدف توفير الكربون: {total_carbon_saved + 10:.1f} كجم',
                    'تجربة فئة جديدة من المخلفات'
                ]
            }
            
        except Exception as e:
            return {
                'error': f'فشل في توليد التقرير: {str(e)}'
            }