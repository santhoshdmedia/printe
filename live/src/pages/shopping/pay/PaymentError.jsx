import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const PaymentError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <FaExclamationTriangle className="w-20 h-20 text-orange-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Error
        </h1>

        <p className="text-gray-600 mb-6">
          An error occurred while processing your payment. Please try again.
        </p>

        {message && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-700 text-sm">{decodeURIComponent(message)}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
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

export default PaymentError;