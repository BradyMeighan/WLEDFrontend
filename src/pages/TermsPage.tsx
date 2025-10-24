import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  handlePageChange: (page: string) => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ handlePageChange }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 -z-10" />
      
      {/* Header */}
      <motion.header 
        className="relative z-20 w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => handlePageChange('home')}
            className="flex items-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </nav>
      </motion.header>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-slate-400 mb-8">Last updated: October 24, 2025</p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using WLED Studio ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="mb-4">
                WLED Studio provides software tools for controlling and managing WLED devices. The Service is available in two tiers:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Free Tier:</strong> Basic LED control, simple effects, and limited presets</li>
                <li><strong>Pro Tier:</strong> Advanced features including cloud access, unlimited presets, priority support, and remote control capabilities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
              <p className="mb-4">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Billing</h2>
              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.1 Pro Subscription</h3>
              <p className="mb-4">
                The Pro tier requires a paid subscription. Subscriptions are billed on a recurring basis (monthly or annually) 
                until canceled.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.2 Free Trials</h3>
              <p className="mb-4">
                We may offer free trial periods for new Pro subscribers. Your payment method will be charged automatically 
                at the end of the trial period unless you cancel before the trial ends.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.3 Referral Program</h3>
              <p className="mb-4">
                Users may participate in our referral program. Both the referrer and the new user receive a 14-day Pro trial. 
                After the trial, subscriptions convert to paid monthly subscriptions unless canceled.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.4 Cancellation</h3>
              <p className="mb-4">
                You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. 
                No refunds are provided for partial subscription periods.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
              <p className="mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Reverse engineer, decompile, or disassemble the software</li>
                <li>Use the Service to transmit viruses, malware, or harmful code</li>
                <li>Abuse the referral program through fraudulent signups or automated accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p>
                All content, features, and functionality of the Service are owned by WLED Studio and are protected by 
                international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy</h2>
              <p>
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to 
                understand our practices regarding your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WLED STUDIO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold WLED Studio harmless from any claims, damages, losses, liabilities, and expenses 
                arising out of your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes via email 
                or through the Service. Continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any 
                reason, including breach of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
                WLED Studio operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us through our Contact page or at support@wledstudio.com.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-700">
            <button
              onClick={() => handlePageChange('home')}
              className="btn btn-primary"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;

