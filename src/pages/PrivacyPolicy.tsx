import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl prose prose-slate">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to Vocero ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience when using our social media management platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Profile information</li>
            <li>Content you create, upload, or share</li>
            <li>Social media account connections</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process and schedule your social media posts</li>
            <li>Analyze and improve our services</li>
            <li>Communicate with you about our services</li>
            <li>Protect against fraudulent or illegal activity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
          <p>
            We do not sell your personal information. We may share your information with:
          </p>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Social media platforms you choose to connect with</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            privacy@vocero.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;