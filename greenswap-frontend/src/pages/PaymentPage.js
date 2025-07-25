import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api"; // Adjust the import based on your API setup

const PaymentPage = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    amount: 0,
    reference: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [order, setOrder] = useState(null);

  // API endpoints
  const API = {
    makePayment: "/payment/create/",
    cancelPayment: "/payment/cancel/",
    completePayment: "/payment/verify/",
    getPaymentHistory: "/payment/user_paymentss/",
    getOrder: orderId ? `/orders/${orderId}/` : null,
  };

  // Fetch order details and payment history
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch order details if orderId exists
        if (orderId) {
          const orderResponse = await api.get(API.getOrder);
          setOrder(orderResponse.data);
          setFormData((prev) => ({
            ...prev,
            amount: orderResponse.data.total || orderResponse.data.price,
          }));
        }

        // Fetch payment history
        const historyResponse = await api.get(API.getPaymentHistory, {
          params: { limit: 5 }, // Get last 5 payments
        });
        setPaymentHistory(historyResponse.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser, orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log({
        amount: formData.amount,
        sender_phone: formData.phone,
        reference_number: formData.reference,
        order: orderId ? orderId : null,
      });

      try {
        await api.post(API.makePayment, {
          amount: formData.amount,
          sender_phone: formData.phone,
          reference_number: formData.reference,
          order: orderId ? orderId : null,
        });
      } catch (error) {
        if ("You can only pay for your own orders" in error) {
          setError("لا يمكنك دفع ثمن طلبات مستخدمين آخرين");
          navigate("/orders");
          return;
        }
      }

      setSubmitted(true);
      // Refresh payment history after successful payment
      const historyResponse = await api.get(API.getPaymentHistory);
      setPaymentHistory(historyResponse.data);
    } catch (err) {
      console.error("Payment failed:", err);
      setError(
        err.response?.data?.message || "Payment failed. Please try again."
      );
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && !order && orderId) {
    return <div className="p-4">Loading...</div>;
  }

  if (error && !order && orderId) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (submitted) {
    return (
      <div className="p-4 text-center">
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          <h3 className="text-xl font-semibold">تم تقديم الدفع بنجاح</h3>
          <p>في انتظار التحقق من الدفع</p>
        </div>
        <PaymentHistoryTable payments={paymentHistory} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          دفع فودافون كاش
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {order && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-medium text-lg mb-2">تفاصيل الطلب</h3>
            <p className="mb-1">رقم الطلب: {order.id}</p>
            <p className="font-semibold">المبلغ: {formData.amount} جنيه</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-medium">رقم الهاتف المرسل:</label>
          <input
            type="tel"
            name="phone"
            className="border rounded p-2 w-full"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="01XXXXXXXX"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">رقم المرجع:</label>
          <input
            type="text"
            name="reference"
            className="border rounded p-2 w-full"
            value={formData.reference}
            onChange={handleChange}
            required
            placeholder="أدخل رقم المرجع"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? "جاري التقديم..." : "تأكيد الدفع"}
        </button>
      </form>

      <PaymentHistoryTable payments={paymentHistory} />
    </div>
  );
};

// Payment history table component
const PaymentHistoryTable = ({ payments }) => {
  if (!payments || payments.length === 0) return null;
  console.log("Payment History:", payments);
  

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">سجل الدفعات السابقة</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">المبلغ</th>
              <th className="py-2 px-4 border">رقم المرجع</th>
              <th className="py-2 px-4 border">الحالة</th>
              <th className="py-2 px-4 border">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {payments.results.length ? payments.map((payment, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="py-2 px-4 border text-center">
                  {payment.amount} جنيه
                </td>
                <td className="py-2 px-4 border text-center">
                  {payment.reference_number}
                </td>
                <td className="py-2 px-4 border text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payment.status === "completed"
                      ? "مكتمل"
                      : payment.status === "pending"
                      ? "قيد الانتظار"
                      : "فشل"}
                  </span>
                </td>
                <td className="py-2 px-4 border text-center">
                  {new Date(payment.created_at).toLocaleDateString()}
                </td>
              </tr>
            )): null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentPage;
