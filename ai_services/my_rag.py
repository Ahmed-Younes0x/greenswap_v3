# my_rag/vector_store.py
import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Path for FAISS index persistence
INDEX_FILE = "rag_index.faiss"
DOCS_FILE = "rag_docs.npy"

# Load multilingual embeddings
embedder = SentenceTransformer("intfloat/multilingual-e5-base")

# In-memory doc list
docs = []


def build_index(documents):
    """
    Create FAISS index from documents.
    documents: list of strings
    """
    global docs
    docs = documents

    embeddings = embedder.encode(documents, convert_to_numpy=True)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    faiss.write_index(index, INDEX_FILE)
    np.save(DOCS_FILE, documents)


def load_index():
    """
    Load FAISS index and docs from disk.
    """
    global docs
    if not os.path.exists(INDEX_FILE):
        raise FileNotFoundError("Index not found, build it first.")

    index = faiss.read_index(INDEX_FILE)
    docs = np.load(DOCS_FILE, allow_pickle=True).tolist()
    return index


def search_documents(query, top_k=3):
    """
    Search FAISS index for relevant documents.
    Returns a list of dicts with 'content'.
    """
    print(f"Searching for query: {query}")
    index = load_index()
    query_embedding = embedder.encode([query])
    D, I = index.search(np.array(query_embedding), top_k)
    return [{"content": docs[i]} for i in I[0]]

# build_index([
#     "GreenSwap هو منصة إلكترونية تربط بين الأفراد الذين يمتلكون نفايات قابلة للبيع والمُجمّعين المهتمين بشرائها. يمكن للمستخدمين عرض مخلفاتهم مثل البلاستيك أو المعادن أو الأجهزة القديمة، ويتواصل المشترون مباشرة لتقديم عروض وشراء هذه النفايات.",
#     "تشمل أنواع المخلفات المقبولة في GreenSwap: البلاستيك، الورق، الزجاج، المعادن، النسيج، الأجهزة الإلكترونية، والمخلفات العضوية. يجب على المستخدم تصنيف المخلف بشكل صحيح لزيادة فرص البيع وتسعيره بدقة.",
#     "لإنشاء إعلان، يقوم المستخدم بتسجيل الدخول، ثم يرفع صور للمخلف، يحدد نوعه، وزنه أو حجمه، ويكتب وصفاً مختصراً. بعد النشر، يظهر الإعلان في الصفحة الرئيسية ويصبح مرئياً للمجمعين.",
#     "قيمة المخلف تعتمد على نوعه، حالته، وزنه، وحجمه. على سبيل المثال: البلاستيك النظيف قد يُباع بسعر 4 إلى 5 جنيهات للكيلو، المعادن مثل الألومنيوم يمكن أن تصل إلى 15 جنيه، والورق النظيف بسعر أقل. المنصة توفر تقديرات أولية بعد إدخال البيانات.",
#     "بعد نشر المخلف، يمكن للمجمعين إرسال عروضهم. يرى المستخدم جميع العروض ويمكنه قبول الأنسب له. يتم التواصل داخل المنصة لتحديد موعد ومكان الاستلام.",
#     "عند الاتفاق، يذهب المجمع إلى العنوان الذي حدده المستخدم، ويستلم المخلف بعد الفحص. يتم الدفع مباشرة عند الاستلام نقداً أو بتحويل رقمي حسب الاتفاق.",
#     "GreenSwap لا تفرض أي عمولة على المستخدمين العاديين حالياً. الخدمة مجانية لجانبي الصفقة لتشجيع إعادة التدوير والتقليل من المخلفات.",

#     "يوفر الموقع لوحة تقارير شخصية تعرض إجمالي الأرباح، عدد مرات عرض كل إعلان، وعدد المخلفات المباعة حسب النوع. يمكن للمستخدم الوصول لهذه التقارير من صفحة الحساب.",
#     "في تقاريرك، يمكنك معرفة أكثر أنواع المخلفات التي قمت ببيعها خلال فترة زمنية، مثل البلاستيك أو الأجهزة الإلكترونية، مما يساعدك على فهم سلوكك البيئي وربما تحسينه.",
#     "كل إعلان يعرض عدد المشاهدات التي حصل عليها، وهو مؤشر جيد لاهتمام المجمعين. الإعلان الذي يحصل على عدد مشاهدات كبير دون عروض قد يحتاج لتعديل في الوصف أو الصور.",
#     "تُوصي GreenSwap بالتعامل داخل التطبيق وعدم مشاركة معلومات شخصية خارج المنصة. يتم التحقق من هوية المجمعين للحفاظ على بيئة آمنة وموثوقة لجميع الأطراف.",
#     "إذا كان لديك 10 كيلوجرام من البلاستيك النظيف، وكان السعر المتداول 4.5 جنيه للكيلوجرام، فإنك قد تكسب 45 جنيه. أما 5 كيلوجرام من النحاس قد تصل أرباحها إلى أكثر من 100 جنيه.",
#     "من الأسئلة الشائعة: كم يمكنني أن أربح؟ كيف يتم الاستلام؟ هل يجب أن أفرز المخلفات؟ الإجابة: الأرباح تعتمد على النوع والكمية، الاستلام يتم بالاتفاق، والفرز يزيد السعر.",
#     "البوت الذكي في GreenSwap يمكنه مساعدتك في معرفة نوع مخلفك، تقدير قيمته، شرح خطوات العملية، وحتى إعطائك ملخص عن تقاريرك البيعية. فقط ابدأ بكتابة سؤالك.",
#     "تسعى GreenSwap إلى تحقيق بيئة أنظف وتقليل كمية النفايات في الشوارع والمكبات. من خلال تسهيل عملية البيع للمخلفات، نُساهم في بناء مجتمع مستدام وواعٍ بيئياً.",

# ])
# print("RAG index built and saved.")