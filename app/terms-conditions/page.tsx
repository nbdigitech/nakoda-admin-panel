"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TermsConditionsPage() {
  return (
    <DashboardLayout>
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-120px)]">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Terms & Conditions
        </h2>

        <div className="prose max-w-none text-gray-700 space-y-6 leading-relaxed">
          <p className="font-semibold text-gray-900">
            Effective Date: [Insert Date]
          </p>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              1. Acceptance of Terms
            </h3>
            <p>
              By accessing or using the Nakoda TMT Admin Portal, you agree to be
              bound by these Terms & Conditions. This portal is intended
              strictly for authorized personnel, including internal staff,
              registered dealers, sub-dealers, and administrators.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              2. User Access and Responsibilities
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Confidentiality:</strong> You are responsible for
                maintaining the confidentiality of your login credentials. Any
                activity conducted under your account will be deemed your
                responsibility.
              </li>
              <li>
                <strong>Unauthorized Access:</strong> You must not share your
                account access with unauthorized individuals or attempt to
                bypass system security permissions.
              </li>
              <li>
                <strong>Accurate Data Entry:</strong> You agree to provide
                accurate and updated information when managing orders,
                registering dealers/sub-dealers, or logging system activities.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              3. Acceptable Use
            </h3>
            <p className="mb-2">
              The admin panel must be used solely for the legitimate business
              purposes of Nakoda TMT. Prohibited activities include:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Generating fraudulent orders or unauthorized transactions.
              </li>
              <li>
                Extracting or scraping proprietary data without explicit written
                authorization.
              </li>
              <li>
                Uploading malicious code or attempting to disrupt the system’s
                operation.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              4. Orders and Transactions
            </h3>
            <p>
              All orders created, managed, or dispatched through this platform
              are subject to the commercial agreements between Nakoda TMT and
              its respective partners. System records will serve as valid
              evidence of transactions. Nakoda TMT reserves the right to review,
              hold, or cancel orders that violate business compliance.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              5. Intellectual Property
            </h3>
            <p>
              All content, design, software, and trademarks displayed on the
              Nakoda TMT Admin Portal are the exclusive property of Nakoda TMT
              and are protected by applicable intellectual property laws.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              6. Limitation of Liability
            </h3>
            <p>
              While we strive for continuous system availability, Nakoda TMT
              does not guarantee uninterrupted access to the admin panel. We are
              not liable for any direct, indirect, or consequential damages
              resulting from system downtime, data loss, or unauthorized access.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              7. Account Termination
            </h3>
            <p>
              We reserve the right to suspend or terminate your access to the
              admin portal immediately, without prior notice, if you breach
              these Terms & Conditions or engage in any behavior detrimental to
              Nakoda TMT.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              8. Modifications
            </h3>
            <p>
              Nakoda TMT may revise these Terms & Conditions from time to time.
              You will be notified of significant changes, and your continued
              usage of the platform confirms your acceptance of the updated
              terms.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              9. Governing Law
            </h3>
            <p>
              These Terms & Conditions shall be governed by and construed in
              accordance with the laws of India. Any disputes arising out of the
              use of this portal will be subject to the exclusive jurisdiction
              of the competent courts.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-8">
            <p>
              For any queries regarding these Terms & Conditions, please contact
              the IT Administrator.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
