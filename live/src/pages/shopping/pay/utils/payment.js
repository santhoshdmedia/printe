export const initiateCCAvenuePayment = async (paymentData) => {
  try {
    const apiUrl = import.meta.env.VITE_BASE_API_URL || 'http://localhost:8080';
    

    const response = await fetch(`${apiUrl}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment order');
    }

    const data = await response.json();
    const paymentResponse = data.data;

    if (!paymentResponse.encrypted_data || !paymentResponse.access_code) {
      throw new Error('Invalid payment response from server');
    }

    submitPaymentForm(paymentResponse);
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw error;
  }
};

const submitPaymentForm = (paymentResponse) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentResponse.gateway_url;
  form.style.display = 'none';

  const fields = {
    encRequest: paymentResponse.encrypted_data,
    access_code: paymentResponse.access_code,
  };

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);

  console.log('Submitting payment form to CCAvenue');
  form.submit();
};