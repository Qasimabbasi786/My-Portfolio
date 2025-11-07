import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ContactForm } from '../../types';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export const Contact: React.FC = () => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('✅ Your message has been sent successfully!');
        reset();
      } else {
        alert('❌ Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ An error occurred. Please try again later.');
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'qasim.abbasi81755@gmail.com',
      href: 'mailto:qasim.abbasi81755@gmail.com',
      copyValue: 'qasim.abbasi81755@gmail.com'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+92 3440052943',
      href: 'tel:+923440052943',
      copyValue: '+923440052943'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Available Worldwide',
      href: null,
      copyValue: null
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Let's Work Together
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Ready to bring your digital vision to life? Get in touch with us and let's 
            discuss your next project.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Get In Touch
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  We'd love to hear about your project and discuss how we can help 
                  bring your ideas to life. Don't hesitate to reach out!
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                        <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-lg text-gray-900 dark:text-white">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {item.copyValue && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(item.copyValue!, item.label.toLowerCase())}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title={`Copy ${item.label}`}
                      >
                        {copiedField === item.label.toLowerCase() ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Quick Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 pt-6"
              >
                <motion.a
                  href="mailto:qasim.abbasi81755@gmail.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Email
                </motion.a>
                
                <motion.a
                  href="tel:+923440052943"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white transition-all duration-300"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Send us a Message
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 resize-none"
                    placeholder="Tell us about your project or inquiry..."
                  />
                  {errors.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {errors.message.message}
                    </motion.p>
                  )}
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactInfo: React.FC = () => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-600 dark:text-gray-400">
      {/* Email */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-3 group cursor-pointer"
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="flex items-center space-x-2">
          <a
            href="mailto:qasim.tanveer81755@gmail.com"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            qasim.tanveer81755@gmail.com
          </a>
          <button
            onClick={() => copyToClipboard('qasim.tanveer81755@gmail.com', 'email')}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
            title="Copy email"
          >
            {copiedField === 'email' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Phone */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-3 group cursor-pointer"
      >
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
          <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="flex items-center space-x-2">
          <a
            href="tel:+923440052943"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            +92 3440052943
          </a>
          <button
            onClick={() => copyToClipboard('+923440052943', 'phone')}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30"
            title="Copy phone"
          >
            {copiedField === 'phone' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export { ContactInfo };