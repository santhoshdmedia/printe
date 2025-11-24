import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { removeMyShoppingCart } from '../../../helper/api_helper';
import { useSelector } from 'react-redux';
const PaymentSuccess = () => {
    const { user } = useSelector((state) => state.authSlice);
    
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const orderId = searchParams.get('order_id');
  const trackingId = searchParams.get('tracking_id');
  const amount = searchParams.get('amount');

const removeCart=async()=>{
  const result=await removeMyShoppingCart(user._id)
}

  useEffect(() => {
removeCart()


    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/account/my-orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your transaction has been completed successfully.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
          {orderId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Order ID:</span>
              <span className="text-gray-900 font-semibold">{orderId}</span>
            </div>
          )}
          {trackingId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Tracking ID:</span>
              <span className="text-gray-900 font-semibold">{trackingId}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Amount:</span>
              <span className="text-green-600 font-bold">₹{amount}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Redirecting to orders page in {countdown} seconds...
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/account/my-orders')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;