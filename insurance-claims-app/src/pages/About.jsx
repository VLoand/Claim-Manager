import WebSocketTest from '../components/WebSocketTest';
import AdminTestPanel from '../components/AdminTestPanel';

export default function About() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Easy Claim Submission",
      description: "Submit insurance claims quickly with our intuitive form interface."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Real-time Processing",
      description: "Track your claim status in real-time with instant updates and notifications."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Secure & Confidential",
      description: "Your data is protected with enterprise-grade security and encryption."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Advanced Analytics",
      description: "Comprehensive dashboard with insights and reporting capabilities."
    }
  ];

  const technologies = [
    { name: "React 19", description: "Modern frontend framework" },
    { name: "Express.js", description: "Robust backend API" },
    { name: "PostgreSQL", description: "Reliable SQL database" },
    { name: "MongoDB", description: "Flexible NoSQL storage" },
    { name: "WebSocket", description: "Real-time communication" },
    { name: "JWT", description: "Secure authentication" }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About ClaimsPro</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A comprehensive insurance claims management system designed to streamline the entire claims process 
          from submission to resolution, providing transparency and efficiency for both customers and administrators.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-all duration-200">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full p-3 w-fit mx-auto mb-4">
                <div className="text-blue-600">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((tech, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                <p className="text-sm text-gray-600">{tech.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Overview</h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-6">
            This application demonstrates a full-stack development approach, implementing both theoretical knowledge 
            and practical skills in a real-world insurance claims management scenario. The system integrates 
            modern web technologies to create a seamless user experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Frontend Excellence</h3>
              <p className="text-sm text-gray-600">React-based responsive interface with modern UI/UX design patterns</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Backend Architecture</h3>
              <p className="text-sm text-gray-600">RESTful API with robust authentication and real-time capabilities</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Database Integration</h3>
              <p className="text-sm text-gray-600">Polyglot persistence with SQL and NoSQL database systems</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
        <p className="text-gray-600 mb-6">
          Ready to experience efficient claims management? Start by submitting your first claim.
        </p>
        <div className="flex justify-center space-x-4">
          <a 
            href="/" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            Submit a Claim
          </a>
          <a 
            href="/review" 
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
          >
            View Dashboard
          </a>
        </div>
      </div>

      {/* WebSocket Testing Panel - Development Only */}
      <div className="max-w-4xl mx-auto space-y-6">
        <AdminTestPanel />
        <WebSocketTest />
      </div>
    </div>
  );
}
