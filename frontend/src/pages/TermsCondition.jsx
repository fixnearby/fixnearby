import React, { useState } from 'react';
import { AlertTriangle, Shield, Ban, UserX, CreditCard, Wrench, Users, FileText, CheckCircle, XCircle, Scale, Clock } from 'lucide-react';

export default function TermsCondition() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const termsSections = [
    {
      id: 'platform-role',
      title: 'Platform Role & Limitations',
      icon: <Users className="w-5 h-5" />,
      critical: true,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              IMPORTANT: We Are Just a Connecting Platform
            </h4>
            <p className="text-red-800 mb-3">
              FixNearby operates solely as a digital platform that connects customers with independent repair service providers. We do not employ repairers, nor do we provide repair services directly.
            </p>
            <div className="bg-red-100 p-3 rounded">
              <h5 className="font-semibold text-red-900 mb-2">What This Means:</h5>
              <ul className="space-y-1 text-red-800 text-sm">
                <li>• We facilitate connections only - nothing more</li>
                <li>• All repair services are provided by independent third parties</li>
                <li>• We have no control over repairer behavior or service quality</li>
                <li>• Your agreement is directly with the repairer, not with us</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'no-responsibility',
      title: 'Company Disclaimers & No Responsibility',
      icon: <XCircle className="w-5 h-5" />,
      critical: true,
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
            <h4 className="font-bold text-orange-900 mb-3">🚫 FixNearby Is NOT Responsible For:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border-l-4 border-red-400">
                <h5 className="font-semibold text-red-800">Repairer Behavior</h5>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Unprofessional conduct</li>
                  <li>• Inappropriate behavior</li>
                  <li>• Theft or damage</li>
                  <li>• Late arrivals or no-shows</li>
                  <li>• Harassment or misconduct</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                <h5 className="font-semibold text-orange-800">Service Quality</h5>
                <ul className="text-sm text-orange-700 mt-2 space-y-1">
                  <li>• Poor workmanship</li>
                  <li>• Failed repairs</li>
                  <li>• Damaged devices</li>
                  <li>• Use of substandard parts</li>
                  <li>• Incomplete services</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                <h5 className="font-semibold text-blue-800">Payment Issues</h5>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Non-payment by customers</li>
                  <li>• Overcharging by repairers</li>
                  <li>• Payment disputes</li>
                  <li>• Hidden charges</li>
                  <li>• Refund requests</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-purple-400">
                <h5 className="font-semibold text-purple-800">Legal Issues</h5>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>• Contract disputes</li>
                  <li>• Legal proceedings</li>
                  <li>• Property damage claims</li>
                  <li>• Personal injury</li>
                  <li>• Insurance claims</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-red-100 p-4 rounded-lg">
            <h4 className="font-bold text-red-900 mb-2">⚠️ ZERO WARRANTIES OR GUARANTEES</h4>
            <p className="text-red-800 text-sm">
              FixNearby provides NO warranties, guarantees, or assurances regarding any repair work performed through our platform. 
              All work is performed "AS IS" by independent service providers at your own risk.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities & Obligations',
      icon: <CheckCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Customer Responsibilities
              </h4>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Pay repairers directly as agreed upon</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Verify repairer credentials yourself</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Communicate service requirements clearly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Provide accurate location and contact info</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Report issues through proper channels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Use platform respectfully and legally</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Repairer Responsibilities
              </h4>
              <ul className="space-y-2 text-green-800 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Provide accurate service descriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Maintain professional conduct</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Honor agreed pricing and timelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Provide genuine parts and quality service</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Complete services as promised</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>Maintain valid licenses and insurance</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">⚖️ Direct Relationship</h4>
            <p className="text-yellow-800 text-sm">
              By using FixNearby, you acknowledge that any service agreement is directly between you and the repairer. 
              FixNearby is not a party to this agreement and bears no responsibility for its fulfillment.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'account-termination',
      title: 'Account Termination & Bans',
      icon: <Ban className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
            <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Immediate Account Termination
            </h4>
            <p className="text-red-800 mb-3">
              We reserve the right to immediately suspend or permanently ban accounts for the following violations:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <h5 className="font-semibold text-red-800 mb-2">Fraudulent Activities</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Fake reviews or ratings</li>
                  <li>• False service claims</li>
                  <li>• Identity fraud</li>
                  <li>• Payment fraud or chargebacks</li>
                  <li>• Creating multiple fake accounts</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                <h5 className="font-semibold text-orange-800 mb-2">Platform Abuse</h5>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Spam or excessive messaging</li>
                  <li>• Harassment of users</li>
                  <li>• Circumventing commission payments</li>
                  <li>• Manipulating search rankings</li>
                  <li>• Automated bot usage</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                <h5 className="font-semibold text-purple-800 mb-2">Illegal Activities</h5>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Unlicensed service provision</li>
                  <li>• Theft or property damage</li>
                  <li>• Threatening behavior</li>
                  <li>• Violation of local laws</li>
                  <li>• Tax evasion or money laundering</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <h5 className="font-semibold text-blue-800 mb-2">Commission Fraud</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Avoiding platform commissions</li>
                  <li>• Direct payment circumvention</li>
                  <li>• False transaction reporting</li>
                  <li>• Collusion with customers</li>
                  <li>• Using platform for leads only</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🔨 Enforcement Actions</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-yellow-100 p-3 rounded text-center">
                <Clock className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                <h5 className="font-semibold text-yellow-800">Warning</h5>
                <p className="text-xs text-yellow-700">First-time minor violations</p>
              </div>
              <div className="bg-orange-100 p-3 rounded text-center">
                <Ban className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                <h5 className="font-semibold text-orange-800">Suspension</h5>
                <p className="text-xs text-orange-700">Repeated or serious violations</p>
              </div>
              <div className="bg-red-100 p-3 rounded text-center">
                <UserX className="w-6 h-6 mx-auto mb-1 text-red-600" />
                <h5 className="font-semibold text-red-800">Permanent Ban</h5>
                <p className="text-xs text-red-700">Severe or repeated violations</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'commission-payment',
      title: 'Commission & Payment Terms',
      icon: <CreditCard className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-green-900 mb-3">💰 How Our Commission Works</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-green-200 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <h5 className="font-semibold text-green-800">Service Completion</h5>
                  <p className="text-green-700 text-sm">Commission is calculated automatically when service is marked complete</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-200 rounded-full p-1">
                  <CreditCard className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <h5 className="font-semibold text-green-800">Automatic Deduction</h5>
                  <p className="text-green-700 text-sm">Commission is deducted from total payment before transfer to repairer</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-200 rounded-full p-1">
                  <Users className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <h5 className="font-semibold text-green-800">UPI Transfer</h5>
                  <p className="text-green-700 text-sm">Remaining amount transferred to repairer's registered UPI ID</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-bold text-red-900 mb-2">⚠️ Commission Evasion = Account Ban</h4>
            <p className="text-red-800 text-sm mb-2">
              Attempting to avoid platform commissions through direct payments or other methods will result in immediate account termination.
            </p>
            <div className="bg-red-100 p-2 rounded text-xs text-red-700">
              This includes: exchanging contact info to bypass platform, requesting cash payments, or any other method to circumvent our commission structure.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'liability-limitation',
      title: 'Liability Limitations & Legal',
      icon: <Scale className="w-5 h-5" />,
      critical: true,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-900 text-white p-6 rounded-lg">
            <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6" />
              Legal Disclaimers
            </h4>
            
            <div className="space-y-4">
              <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded">
                <h5 className="font-semibold text-red-500 mb-2">MAXIMUM LIABILITY LIMIT</h5>
                <p className="text-gray-600 text-sm">
                  In no event shall FixNearby's liability exceed the commission amount paid by the repairer for the specific transaction in question. 
                  This represents our maximum liability under any circumstances.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded">
                <h5 className="font-semibold text-orange-500 mb-2">NO CONSEQUENTIAL DAMAGES</h5>
                <p className="text-gray-600 text-sm">
                  We are not liable for any indirect, incidental, special, or consequential damages including but not limited to: 
                  lost profits, business interruption, loss of data, or any other commercial damages.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded">
                <h5 className="font-semibold text-blue-500 mb-2">INDEMNIFICATION</h5>
                <p className="text-gray-600 text-sm">
                  Users agree to indemnify and hold FixNearby harmless from any claims, damages, or expenses arising from their use of our platform 
                  or their relationships with other users.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">🏛️ Governing Law & Disputes</h4>
            <p className="text-yellow-800 text-sm">
              These terms are governed by Indian law. Any disputes must be resolved through binding arbitration in [Your City], India. 
              Users waive their right to participate in class action lawsuits.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'platform-changes',
      title: 'Platform Changes & Updates',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">📋 Terms Updates</h4>
            <p className="text-blue-800 text-sm mb-3">
              We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of new terms.
            </p>
            <div className="bg-blue-100 p-3 rounded">
              <p className="text-blue-700 text-xs">
                Major changes will be notified through the app. It's your responsibility to review terms periodically.
              </p>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3">🔧 Service Modifications</h4>
            <p className="text-purple-800 text-sm">
              We reserve the right to modify, suspend, or discontinue any part of our service at any time without notice. 
              We are not liable for any such modifications or discontinuations.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-700 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-opacity-20 backdrop-blur p-3 rounded-full">
                <FileText className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto mb-6">
              By using FixNearby, you agree to these terms. Please read carefully - we're just a connecting platform with limited responsibilities.
            </p>
            <div className="bg-red-500 bg-opacity-30 backdrop-blur p-4 rounded-lg inline-block">
              <p className="text-sm font-semibold">⚠️ CRITICAL: We are NOT responsible for repairer actions or service quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Warnings */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" />
            READ THIS FIRST - CRITICAL INFORMATION
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
              <h3 className="font-bold text-red-800 mb-2">We Are Just a Platform</h3>
              <p className="text-red-700 text-sm">
                FixNearby only connects you with repairers. We don't employ them, control them, or guarantee their work. 
                All agreements are directly between you and the repairer.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
              <h3 className="font-bold text-orange-800 mb-2">No Warranties or Guarantees</h3>
              <p className="text-orange-700 text-sm">
                We provide zero warranties on repair work. If something goes wrong with the service, 
                you must resolve it directly with the repairer - not with us.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-4">
          {termsSections.map((section) => (
            <div key={section.id} className={`bg-white rounded-xl shadow-lg overflow-hidden ${section.critical ? 'border-2 border-red-200' : ''}`}>
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${section.critical ? 'bg-red-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${section.critical ? 'bg-red-200' : 'bg-blue-100'}`}>
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                    {section.critical && (
                      <p className="text-red-600 text-sm font-medium">⚠️ Critical Section</p>
                    )}
                  </div>
                </div>
                <div className={`transform transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {expandedSection === section.id && (
                <div className="px-6 pb-6">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact & Support */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-3">Questions About These Terms?</h3>
            <p className="text-blue-800 mb-4">
              Contact our legal team for clarifications on terms and conditions.
            </p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <p className="text-blue-900 font-semibold">legal@fixnearby.com</p>
              <p className="text-blue-700 text-sm">Response within 48 hours</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Last Updated: June 2025 | 
            <span className="ml-2">FixNearby - Connecting Services, Limiting Liability</span>
          </p>
        </div>
      </div>
    </div>
  );
}