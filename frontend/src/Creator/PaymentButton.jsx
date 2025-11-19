// Example: PaymentButton.jsx
import axios from "axios";
import { toast } from "sonner";
import { Button } from '@/components/ui/button'
import { useNavigate } from "react-router-dom";

const PaymentButton = ({ amount,email }) => {
    const navigate = useNavigate();
  const handlePayment = async () => {
    try {
      const res = await axios.post("https://api.skillnestco.xyz/api/payment/create-order/", //can give the user id 
        { amount },
      );

      const { order_id, key, amount: orderAmount, currency } = res.data;

      const options = {
        key,
        amount: orderAmount,
        currency,
        name: "SkillNest",
        description: "Creator Subscription",
        order_id,
        handler: async (response) => {
          // Step 6: Send verification data to backend
          await axios.post("https://api.skillnestco.xyz/api/payment/verify/", {...response,email,amount});
          toast.success("Payment successful!  You can log in after admin accept");
          navigate('/login')
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order");
    }
  };

  return <Button variant="custom" onClick={handlePayment}>Pay ₹{amount}</Button>;
};

export default PaymentButton;
