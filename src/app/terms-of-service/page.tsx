import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, AlertTriangle, Ban, Mail, Server } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - OpenMark Blog',
  description: 'Read the terms and conditions for using OpenMark Blog platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By accessing and using OpenMark Blog, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>
            <p>
              These Terms of Service govern your use of our blogging platform, which is hosted 
              on Google Cloud Platform and operated by Forge Network.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Content Responsibility</h3>
              <p className="text-sm mb-2">
                <strong>IMPORTANT:</strong> Users are solely responsible for the content they publish. 
                Neither OpenMark Blog nor Forge Network is responsible for user-generated content.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You must ensure your content complies with applicable laws</li>
                <li>You retain ownership of your original content</li>
                <li>You grant us a license to display and distribute your content</li>
                <li>You are responsible for the accuracy and legality of your content</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Account Security</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>You are responsible for all activities under your account</li>
                <li>Do not share your login credentials with others</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Prohibited Content & Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The following content and activities are strictly prohibited on our platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Illegal Content:</strong> Content that violates any applicable laws or regulations</li>
              <li><strong>Hate Speech:</strong> Content that promotes discrimination, violence, or hatred</li>
              <li><strong>Spam:</strong> Unsolicited commercial content or repetitive posting</li>
              <li><strong>Malware:</strong> Code, scripts, or content that could harm our systems or users</li>
              <li><strong>Privacy Violations:</strong> Publishing private information without consent</li>
              <li><strong>Intellectual Property:</strong> Content that infringes on copyrights, trademarks, or patents</li>
              <li><strong>Adult Content:</strong> Explicit sexual content not appropriate for general audiences</li>
              <li><strong>Violence:</strong> Content that glorifies or depicts extreme violence</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Platform Liability & Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Platform Liability</h3>
              <p className="text-sm mb-2">
                OpenMark Blog acts as a hosting platform and is not responsible for user-generated content. 
                Our liability is limited to providing the technical infrastructure for content publishing.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>We are not liable for content accuracy or reliability</li>
                <li>We do not endorse or validate user content</li>
                <li>Views expressed by users are their own opinions</li>
                <li>We are not responsible for third-party links or references</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Service Availability</h3>
              <p className="text-sm">
                While we strive to maintain high availability, we cannot guarantee uninterrupted service. 
                The platform may be temporarily unavailable for maintenance, updates, or technical issues.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Content Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to moderate content and take appropriate actions including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Removing content that violates these terms</li>
              <li>Suspending or terminating accounts that repeatedly violate policies</li>
              <li>Reporting illegal content to appropriate authorities</li>
              <li>Responding to valid takedown notices and legal requests</li>
            </ul>
            <p className="text-sm">
              Users can report inappropriate content through our reporting system, and we will 
              review reports in accordance with our moderation policies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Service Terms & Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Service Modifications</h3>
              <p className="text-sm">
                We reserve the right to modify, suspend, or discontinue our service at any time, 
                with or without notice. We may also update these terms periodically.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Account Termination</h3>
              <p className="text-sm">
                We may terminate accounts that violate these terms or engage in prohibited activities. 
                Users may also delete their accounts at any time through their account settings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Data Retention</h3>
              <p className="text-sm">
                Upon account termination, we may retain certain data as required by law or for 
                legitimate business purposes, but will delete personal data when no longer needed.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact & Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              For questions about these Terms of Service or to report violations:
            </p>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-semibold">Legal Contact</p>
              <p className="text-sm">Email: legal@openmark.blog</p>
              <p className="text-sm">Response Time: Within 30 days</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Governing Law</h3>
              <p className="text-sm">
                These Terms of Service are governed by and construed in accordance with the laws 
                of the European Union and applicable French law, without regard to conflict of 
                law principles.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              The OpenMark Blog platform, including its design, code, and functionality, is owned 
              by Forge Network and protected by intellectual property laws. Users retain ownership 
              of their original content but grant us a license to display and distribute it on 
              our platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
