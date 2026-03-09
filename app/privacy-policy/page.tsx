"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PrivacyPolicyPage() {
  return (
    <DashboardLayout>
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-120px)]">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Privacy Policy
        </h2>

        <div className="prose max-w-none text-gray-700 space-y-6 leading-relaxed">
          <p className="font-semibold text-gray-900">
            Effective Date: [Insert Date]
          </p>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              1. Introduction
            </h3>
            <p>
              Welcome to the Nakoda TMT Admin Portal. We are committed to
              protecting the privacy and security of our users, including our
              staff, dealers, sub-dealers, and partners. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you access and use our administrative platform.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              2. Information We Collect
            </h3>
            <p className="mb-2">
              We collect information necessary to provide and manage our
              services, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Personal Data:</strong> Names, email addresses, phone
                numbers, and location details of dealers, sub-dealers, and staff
                members.
              </li>
              <li>
                <strong>Business Data:</strong> Company details, GST numbers,
                and transaction history related to orders and dispatches.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about your interactions
                with the admin panel, including IP addresses, login timestamps,
                and system activity logs for security and auditing purposes.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              3. How We Use Your Information
            </h3>
            <p className="mb-2">Your information is used to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Process and manage TMT bar orders, dispatches, and inventory.
              </li>
              <li>
                Authenticate and authorize users to access specific modules
                based on their roles.
              </li>
              <li>
                Communicate important updates, system notifications, and
                business-related information.
              </li>
              <li>
                Analyze system usage to improve portal performance and user
                experience.
              </li>
              <li>Comply with legal and regulatory obligations.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              4. Data Sharing and Disclosure
            </h3>
            <p className="mb-2">
              We do not sell your personal information. We may share information
              with:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Authorized third-party service providers who assist us in
                operating our platform (e.g., cloud hosting, SMS/email
                gateways).
              </li>
              <li>
                Legal authorities, if required by law or to protect our rights,
                property, or system security.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              5. Data Security
            </h3>
            <p>
              We implement industry-standard security measures to protect your
              data against unauthorized access, alteration, disclosure, or
              destruction.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              6. Your Rights
            </h3>
            <p>
              Depending on your role and applicable laws, you may have the right
              to access, correct, or request the deletion of your personal data
              stored within our system. Please contact the system administrator
              to exercise these rights.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              7. Changes to This Policy
            </h3>
            <p>
              We reserve the right to update this Privacy Policy at any time.
              Any changes will be published within the admin portal, and
              continued use of the platform constitutes acceptance of the
              revised policy.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              8. Contact Us
            </h3>
            <p>
              For any privacy-related queries or concerns, please contact our
              support team at{" "}
              <a
                href="mailto:support@nakodatmt.com"
                className="text-[#F87B1B] hover:underline"
              >
                support@nakodatmt.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
