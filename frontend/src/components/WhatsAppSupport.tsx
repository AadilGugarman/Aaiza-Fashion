import React from "react";
import { MessageCircle } from "lucide-react";

export const WhatsAppSupport: React.FC = () => {
  const phoneNumber = "918866162889";
  const message = encodeURIComponent("Hi, I need help regarding your products");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group touch-button"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute right-16 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none dark:bg-white dark:text-slate-900">
        Chat with us
      </span>
    </a>
  );
};
