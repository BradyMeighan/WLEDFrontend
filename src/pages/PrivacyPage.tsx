import React from 'react';
import { ArrowLeft } from 'lucide-react';
import '../App.css';

interface PrivacyPageProps {
  handlePageChange: (page: string) => void;
  isTransitioning: boolean;
}

const PrivacyPage = ({ handlePageChange, isTransitioning }: PrivacyPageProps) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Full-height gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30"></div>
      
      <div className={`relative z-10 container mx-auto py-8 px-4 md:px-8 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <button 
          onClick={() => handlePageChange('home')}
          className="flex items-center text-slate-300 hover:text-purple-300 mb-8 transition-colors duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Home
        </button>
        
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-12 text-center">
              Privacy Policy
            </h1>
            
            <div className="space-y-8 text-slate-300">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <p className="text-lg leading-relaxed">
                  Welcome to WLED Studio! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </div>
              
              <section className="space-y-6">
                <h2 className="text-3xl font-bold text-purple-300 border-b-2 border-purple-500/30 pb-3 mb-6">
                  Collection of Your Information
                </h2>
                <p className="text-lg leading-relaxed mb-4">
                  We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                </p>
                <div className="bg-slate-700/20 rounded-lg p-6">
                  <ul className="space-y-4 text-base leading-relaxed">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                      <div>
                        <strong className="text-purple-200">Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                      <div>
                        <strong className="text-purple-200">Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                      <div>
                        <strong className="text-purple-200">Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor.
                      </div>
                    </li>
                  </ul>
                </div>
              </section>
              
              <section className="space-y-6">
                <h2 className="text-3xl font-bold text-purple-300 border-b-2 border-purple-500/30 pb-3 mb-6">
                  Use of Your Information
                </h2>
                <p className="text-lg leading-relaxed mb-4">
                  Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                </p>
                <div className="bg-slate-700/20 rounded-lg p-6">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base leading-relaxed">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Create and manage your account.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Email you regarding your account or order.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Enable user-to-user communications.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Fulfill and manage purchases and orders.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Generate a personal profile about you.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Monitor and analyze usage and trends.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Notify you of updates to the Site.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Offer new products and services.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Perform other business activities.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Prevent fraudulent transactions.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Process payments and refunds.
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Respond to customer service requests.
                    </li>
                  </ul>
                </div>
              </section>
              
              <section className="space-y-6">
                <h2 className="text-3xl font-bold text-purple-300 border-b-2 border-purple-500/30 pb-3 mb-6">
                  Disclosure of Your Information
                </h2>
                <p className="text-lg leading-relaxed mb-4">
                  We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                </p>
                <div className="bg-slate-700/20 rounded-lg p-6">
                  <ul className="space-y-4 text-base leading-relaxed">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                      <div>
                        <strong className="text-purple-200">By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                      <div>
                        <strong className="text-purple-200">Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                      <div>
                        <strong className="text-purple-200">Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
                      </div>
                    </li>
                  </ul>
                </div>
              </section>
              
              <section className="space-y-6">
                <h2 className="text-3xl font-bold text-purple-300 border-b-2 border-purple-500/30 pb-3 mb-6">
                  Security of Your Information
                </h2>
                <div className="bg-slate-700/20 rounded-lg p-6">
                  <p className="text-lg leading-relaxed">
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                  </p>
                </div>
              </section>
              
              <section className="space-y-6">
                <h2 className="text-3xl font-bold text-purple-300 border-b-2 border-purple-500/30 pb-3 mb-6">
                  Policy for Children
                </h2>
                <div className="bg-slate-700/20 rounded-lg p-6">
                  <p className="text-lg leading-relaxed">
                    We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-bold text-purple-300 border-b-2 border-purple-500/30 pb-3 mb-6">
                  Contact Us
                </h2>
                <div className="bg-slate-700/20 rounded-lg p-6">
                  <p className="text-lg leading-relaxed">
                    If you have questions or comments about this Privacy Policy, please contact us by using the{' '}
                    <button 
                      onClick={() => handlePageChange('contact')}
                      className="text-purple-400 hover:text-purple-300 underline font-medium transition-colors duration-300"
                    >
                      Contact Us
                    </button>{' '}
                    page on our website or by emailing us at [Your Contact Email Address].
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage; 