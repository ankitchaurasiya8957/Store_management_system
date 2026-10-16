import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, FileText, Scale } from 'lucide-react';

const Disclaimer = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-extrabold text-[#0d3863] mb-6 tracking-tight">Disclaimer</h2>
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 border-l-4 border-[#0d3863] pl-3">General</h3>
      <p className="text-gray-600 leading-relaxed text-[15px]">
        This website and its contents herein are provided as a convenience to you on "as is" basis in good faith. AK Solutions Retail does not warrant that its website shall either be error-free or that it shall be available on uninterrupted basis. AK Solutions Retail does not accept any warranty or claims whatsoever whether explicit or implied for the material presented or for the usage of or reference to the material presented on this website. AK Solutions Retail reserves the right to revise the pages or withdraw access to them at any time.
      </p>
    </div>

    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-bold text-gray-800 border-l-4 border-[#0d3863] pl-3">Products and services</h3>
      <p className="text-gray-600 leading-relaxed text-[15px]">
        The information on the company's products and services presented herein, while true and accurate to the best of our knowledge, is provided in good faith and on "as is" basis. AK Solutions Retail does not warranty or guarantee whether explicitly or in any manner implied, the accuracy of such information.
      </p>
      <p className="text-gray-600 leading-relaxed text-[15px]">
        This information is not intended to be all-inclusive and complete. The visitor should confirm the conditions of use, handling, storage and other factors that may be involved or additional safety or performance considerations directly from the company's product teams or from other literature such as technical data sheets or MSDS. AK Solutions Retail does not accept any responsibility or liability whatsoever on account of the above on the basis of the information provided in the website.
      </p>
      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mt-6">
        <p className="text-blue-800 leading-relaxed text-[15px] font-medium italic">
          No information provided in this website shall be construed as a recommendation to infringe any existing patents or to violate any laws in force.
        </p>
      </div>
    </div>
  </div>
);

const Copyright = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-extrabold text-[#0d3863] mb-6 tracking-tight">Copyright</h2>

    <p className="text-gray-600 leading-relaxed text-[15px] font-medium text-lg text-gray-800">
      By accessing AK Solutions Retail website you agree to the following copyright requirements. If you do not agree to the following terms, you may be liable to remedies for infringement of AK Solutions Retail copyrights.
    </p>

    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
      <p className="text-gray-600 leading-relaxed text-[15px]">
        The contents of AK Solutions Retail website are the copyright of AK Solutions Retail as created in 2002. Any rights not expressly granted herein are reserved. Reproduction, transfer, distribution, or storage of part or all of the contents in any form without the prior written permission of AK Solutions Retail is prohibited except in accordance with the following terms:
      </p>
      <ul className="list-disc pl-5 space-y-3 text-gray-600 text-[15px]">
        <li>
          AK Solutions Retail consents to you browsing AK Solutions Retail website on your computer or printing copies of extracts from these pages for your personal use only and not for redistribution unless consented to in writing by AK Solutions Retail.
        </li>
        <li>
          Material from individual pages in our website may be subject to additional terms &amp; conditions as indicated in those documents.
        </li>
        <li>
          The use of this website and the content therein, is permitted for private, non-commercial use. The use of press releases and other public documents is permitted for public communication provided the source for the information has been expressly stated. AK Solutions Retail however takes no responsibility or liability on account of accuracy of such documents or reference or for its usage.
        </li>
      </ul>
    </div>

    <p className="text-gray-600 leading-relaxed text-[15px]">
      This website and its contents herein are provided as a convenience to you on "as is" basis in good faith. AK Solutions Retail does not warrant that its website shall be error-free or that it shall be available on uninterrupted basis. AK Solutions Retail does not accept any warranty or claims whatsoever whether explicit or implied for the material presented or for the usage or reference to of such material as present on this website. AK Solutions Retail reserves the right to revise the pages or withdraw access to them at any time.
    </p>
  </div>
);

const PrivacyPolicy = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-extrabold text-[#0d3863] mb-6 tracking-tight">Privacy Policy</h2>

    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Welcome to the AK Solutions Retail website.</h3>
      <p className="text-gray-600 leading-relaxed text-[15px]">
        We at AK Solutions Retail are committed to maintaining the privacy and security of the Personal Information of all the visitors to this website. If you do not agree with this Privacy Policy, please do not use this site. By accessing and using this site, you consent to the terms of this Privacy Policy.
      </p>
    </div>

    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-bold text-gray-800 border-l-4 border-[#0d3863] pl-3">At this website</h3>

      <p className="text-gray-600 leading-relaxed text-[15px]">
        AK Solutions Retail does not actively initiate any collection of any visitor's individual information. We passively receive information that is automatically sent to us by your web browser. This information typically includes your domain name (the site after the @ in your e-mail address). It may also contain your user name (the name before the @ in your e-mail address). The amount of information sent depends on the settings you have on your web browser; please refer to your browser if you want to learn what information it sends. We however do not actively seek to identify any individual visitor, with the exception of investigating security breaches or cooperating with authorities pursuant to a legal matter.
      </p>
      <p className="text-gray-600 leading-relaxed text-[15px]">
        AK Solutions Retail will not use or share, either within AK Solutions Retail or with a third party, any information collected at this page for direct marketing purposes. The information we automatically receive from your web browser is used to see which pages you visit within our site, which site you visited before coming to ours, and where you go after you leave. We at AK Solutions Retail can then develop statistics that are helpful to understanding how our visitors use our site. This statistical data is interpreted by AK Solutions Retail in its continuing effort to present the website content that visitors are seeking in a format they find most helpful.
      </p>
      <p className="text-gray-600 leading-relaxed text-[15px]">
        If you register with one of AK Solutions Retail's business units online, they may use this information to provide you with custom information in support of your business needs. A technology called cookies may be used to provide you with tailored information. A cookie is a tiny element of data that a Web site can send to your browser, which may then be stored on your hard drive so we can recognize you when you return. You may set your browser to notify you when you receive a cookie.
      </p>
      <p className="text-gray-600 leading-relaxed text-[15px]">
        When you e-mail us, you voluntarily release information of personal nature to us. Your e-mail address will be used by AK Solutions Retail to respond to you. We will however not actively seek to collect or use the information that you have sent to us that can identify you, such as your e-mail address, for direct marketing purposes.
      </p>
      <p className="text-gray-600 leading-relaxed text-[15px]">
        For your convenience, this site may contain certain hyperlinks to other AK Solutions Retail sites as well as to websites outside AK Solutions Retail. While we at AK Solutions Retail have posted an appropriate Privacy Policy statement throughout our website, we can not guarantee the same on the hyperlinked pages and sites that are not owned by AK Solutions Retail. We, therefore, recommend that you carefully read the privacy policy/statement for each site you visit.
      </p>
      <p className="text-gray-600 leading-relaxed text-[15px]">
        We may change this Privacy Policy, change, modify or withdraw access to this website, and/or the content of these pages at any time without notice.
      </p>
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-6 flex items-start gap-4">
        <div className="bg-white p-2 rounded-full shadow-sm">
          <Shield className="w-6 h-6 text-[#0d3863]" />
        </div>
        <div>
          <p className="text-gray-700 leading-relaxed text-[15px] font-medium">
            If you require any clarifications on the use of your Personal Information by AK Solutions Retail, please contact us at <a href="mailto:[EMAIL_ADDRESS]" className="text-blue-600 hover:underline">legalteam@AK Solutions.com</a>, with the subject line, "privacy."
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Policies = () => {
  const [activeTab, setActiveTab] = useState('privacy');
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when loaded
    window.scrollTo(0, 0);
    // Support routing to a specific tab via hash
    if (location.hash === '#disclaimer') setActiveTab('disclaimer');
    else if (location.hash === '#copyright') setActiveTab('copyright');
    else if (location.hash === '#privacy') setActiveTab('privacy');
  }, [location]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Hero Section */}
      <div className="relative pt-32 pb-28 bg-[#0d3863] overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[130%] rounded-full bg-gradient-to-br from-[#15538e] to-[#0a2745] opacity-50 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[80%] rounded-full bg-gradient-to-tr from-[#1a5b9c] to-transparent opacity-40 blur-2xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">
            Legal &amp; Policies
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto font-light">
            Everything you need to know about how we operate, protect your data, and manage our intellectual property.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 max-w-6xl -mt-16 mb-20 relative z-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[650px]">

          {/* Sidebar */}
          <div className="w-full md:w-80 bg-gray-50/80 p-6 md:p-8 flex flex-col space-y-3 border-r border-gray-100 shrink-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Select a Policy</h3>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-semibold group ${activeTab === 'privacy' ? 'bg-[#0d3863] text-white shadow-lg shadow-blue-900/20 transform scale-[1.02]' : 'text-gray-600 hover:bg-white hover:shadow-md'}`}
            >
              <Shield className={`w-5 h-5 ${activeTab === 'privacy' ? 'text-blue-200' : 'text-gray-400 group-hover:text-[#0d3863]'} transition-colors`} />
              Privacy Policy
            </button>

            <button
              onClick={() => setActiveTab('disclaimer')}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-semibold group ${activeTab === 'disclaimer' ? 'bg-[#0d3863] text-white shadow-lg shadow-blue-900/20 transform scale-[1.02]' : 'text-gray-600 hover:bg-white hover:shadow-md'}`}
            >
              <FileText className={`w-5 h-5 ${activeTab === 'disclaimer' ? 'text-blue-200' : 'text-gray-400 group-hover:text-[#0d3863]'} transition-colors`} />
              Disclaimer
            </button>

            <button
              onClick={() => setActiveTab('copyright')}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-semibold group ${activeTab === 'copyright' ? 'bg-[#0d3863] text-white shadow-lg shadow-blue-900/20 transform scale-[1.02]' : 'text-gray-600 hover:bg-white hover:shadow-md'}`}
            >
              <Scale className={`w-5 h-5 ${activeTab === 'copyright' ? 'text-blue-200' : 'text-gray-400 group-hover:text-[#0d3863]'} transition-colors`} />
              Copyright
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 md:p-12 lg:p-16 bg-white overflow-y-auto relative">
            {/* Fade in transition wrapper */}
            <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
              {activeTab === 'privacy' && <PrivacyPolicy />}
              {activeTab === 'disclaimer' && <Disclaimer />}
              {activeTab === 'copyright' && <Copyright />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;
