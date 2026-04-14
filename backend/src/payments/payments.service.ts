import { Injectable, InternalServerErrorException } from "@nestjs/common";
import Razorpay from "razorpay";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay | null;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    } else {
      this.razorpay = null;
    }
  }

  async checkout(data: CreatePaymentDto) {
    if (data.paymentMethod === "cod") {
      // For COD, no payment gateway needed
      return {
        status: "pending",
        orderId: null,
        clientSecret: null,
        method: "cod",
      };
    }

    if (this.razorpay) {
      try {
        const order = await this.razorpay.orders.create({
          amount: data.amount * 100, // Razorpay expects amount in paisa
          currency: data.currency || "INR",
          receipt: `receipt_${Date.now()}`,
          payment_capture: true,
        });
        return {
          status: order.status,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
        };
      } catch (error) {
        throw new InternalServerErrorException("Payment provider error");
      }
    }

    return {
      status: "succeeded",
      orderId: null,
      clientSecret: null,
    };
  }
}
