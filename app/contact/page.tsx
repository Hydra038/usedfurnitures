'use client';

import { useState } from 'react';
import { Phone, MapPin, Send } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name,
            email,
            message,
            status: 'unread'
          }
        ]);

      if (submitError) throw submitError;

      setSubmitted(true);
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting message:', err);
      setError('Failed to send message. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Send Us a Message</h2>
            
            {submitted && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-4">
                Thank you! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field"
                  rows={5}
                  required
                  placeholder="Ask about custom furniture, availability, or anything else..."
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <a href="tel:2352001489" className="text-primary-600 hover:underline">
                      (235) 200-1489
                    </a>
                    <p className="text-sm text-gray-500">Mon-Fri: 9AM - 6PM EST</p>
                    <div className="flex gap-3 mt-2">
                      <a href="sms:2352001489" className="text-sm text-primary-600 hover:underline">
                        Text
                      </a>
                      <a href="https://wa.me/12352001489" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-gray-600">Serving customers across</p>
                    <p className="text-gray-600">the United States</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Looking for Custom Furniture?</h3>
              <p className="text-gray-700 mb-3">
                We occasionally take custom requests. Send us a message describing what you're looking for!
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Specific dimensions or styles</li>
                <li>• Furniture restoration services</li>
                <li>• Bulk purchases for businesses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
