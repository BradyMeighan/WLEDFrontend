import React, { useState } from 'react';
import { ArrowLeft, Send, Bug, User, MessageSquare, CheckCircle, AlertCircle, Upload, File, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface BugReportPageProps {
  handlePageChange: (page: string) => void;
  isTransitioning: boolean;
}

interface BugReportFormData {
  name: string;
  email: string;
  title: string;
  subject: string;
  message: string;
  image: File | null;
  consoleLogs: File | null;
}

interface AlertState {
  type: 'success' | 'error';
  message: string;
}

const BugReportPage: React.FC<BugReportPageProps> = ({ handlePageChange, isTransitioning }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<BugReportFormData>({
    name: user?.fullName || '',
    email: user?.email || '',
    title: '',
    subject: '',
    message: '',
    image: null,
    consoleLogs: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'consoleLogs') => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      if (formData.consoleLogs) {
        formDataToSend.append('consoleLogs', formData.consoleLogs);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/bug-report`, {
        method: 'POST',
        headers: {
          ...(isAuthenticated && { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` })
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({
          type: 'success',
          message: 'Your bug report has been submitted successfully! We\'ll investigate and get back to you soon.'
        });
        // Reset form
        setFormData({
          name: user?.fullName || '',
          email: user?.email || '',
          title: '',
          subject: '',
          message: '',
          image: null,
          consoleLogs: null
        });
        // Reset file inputs
        const imageInput = document.getElementById('image-upload') as HTMLInputElement;
        const logsInput = document.getElementById('logs-upload') as HTMLInputElement;
        if (imageInput) imageInput.value = '';
        if (logsInput) logsInput.value = '';
      } else {
        setAlert({
          type: 'error',
          message: result.error || 'Failed to submit bug report. Please try again.'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30"></div>
      
      <div className={`relative z-10 container mx-auto px-6 py-12 min-h-screen transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => handlePageChange('home')}
            className="flex items-center text-slate-400 hover:text-white transition-colors mr-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Bug Report
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Found a bug or experiencing issues? Help us improve WLED Studio by reporting the problem.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-white">Reporting Guidelines</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Bug className="w-6 h-6 text-red-400 mr-4 mt-1" />
                    <div>
                      <p className="text-white font-medium">Describe the Issue</p>
                      <p className="text-slate-400 text-sm">Provide a clear and concise description of what went wrong</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">What to Include:</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Steps to reproduce the issue</li>
                  <li>• Expected behavior vs actual behavior</li>
                  <li>• Screenshots or images if applicable</li>
                  <li>• Console logs or error messages</li>
                  <li>• Your system information (OS, version, etc.)</li>
                  <li>• WLED device information if relevant</li>
                </ul>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Bug Report Process</h3>
                <p className="text-slate-300 text-sm mb-3">
                  1. We'll review your report within 24-48 hours<br/>
                  2. Our team will investigate and attempt to reproduce the issue<br/>
                  3. You'll receive updates on the progress via email<br/>
                  4. Once fixed, the update will be included in the next release
                </p>
                <p className="text-slate-400 text-xs">
                  Critical bugs affecting security or data integrity are prioritized for immediate attention.
                </p>
              </div>
            </div>

            {/* Bug Report Form */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-6 text-white">Submit Bug Report</h2>
              
              {alert && (
                <div className={`p-4 rounded-lg border mb-6 ${
                  alert.type === 'success' 
                    ? 'bg-green-900/50 border-green-500 text-green-100' 
                    : 'bg-red-900/50 border-red-500 text-red-100'
                }`}>
                  <div className="flex items-center">
                    {alert.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    <p>{alert.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bug Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Brief title describing the bug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject/Category
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select a category</option>
                    <option value="UI/UX Issue">UI/UX Issue</option>
                    <option value="Performance Issue">Performance Issue</option>
                    <option value="Crash/Error">Crash/Error</option>
                    <option value="Connection Issue">Connection Issue</option>
                    <option value="Feature Not Working">Feature Not Working</option>
                    <option value="Installation Issue">Installation Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Detailed Description
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Please describe the bug in detail. Include steps to reproduce, expected behavior, and actual behavior..."
                  />
                </div>

                {/* File Uploads */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Image className="w-4 h-4 inline mr-1" />
                      Screenshot/Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-red-500 transition-all duration-200 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.image ? formData.image.name : 'Choose image...'}
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <File className="w-4 h-4 inline mr-1" />
                      Console Logs
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="logs-upload"
                        accept=".txt,.log,.json"
                        onChange={(e) => handleFileChange(e, 'consoleLogs')}
                        className="hidden"
                      />
                      <label
                        htmlFor="logs-upload"
                        className="flex items-center justify-center w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-red-500 transition-all duration-200 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.consoleLogs ? formData.consoleLogs.name : 'Choose log file...'}
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Bug Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugReportPage; 