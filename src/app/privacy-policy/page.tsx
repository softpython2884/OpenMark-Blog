import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Eye, UserRights, Mail, Server } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - OpenMark Blog',
  description: 'Learn how OpenMark Blog protects your privacy and handles your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              At OpenMark Blog, we are committed to protecting your privacy and personal data. 
              This Privacy Policy explains how we collect, use, and protect your information when 
              you use our blogging platform.
            </p>
            <p>
              Our platform is hosted on Google Cloud Platform, and we adhere to strict data 
              protection standards to ensure your information remains secure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Information</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Name and username</li>
                <li>Email address</li>
                <li>Profile picture (if provided)</li>
                <li>Bio and profile information</li>
                <li>Account role and permissions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Content Data</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Blog articles you create and publish</li>
                <li>Comments you post on articles</li>
                <li>Drafts and unpublished content</li>
                <li>Tags and metadata associated with your content</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Base Technical Data (Not Used)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>IP addresses (anonymized)</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent on our platform</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Protection & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Encryption:</strong> All data transmissions are encrypted using SSL/TLS</li>
              <li><strong>Secure Hosting:</strong> Hosted on Google Cloud Platform with advanced security features</li>
              <li><strong>Access Control:</strong> Strict access controls and authentication systems</li>
              <li><strong>Regular Updates:</strong> Security patches and updates applied regularly</li>
              <li><strong>Data Backup:</strong> Regular backups to prevent data loss</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRights className="h-5 w-5" />
              Your Rights (GDPR Compliance)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Portability:</strong> Transfer your data to another service</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Object:</strong> Object to certain types of data processing</li>
            </ul>
            <p className="text-sm">
              To exercise these rights, please contact us using the information provided below. contact@forgenet.fr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Data Hosting & Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>Hosting Provider:</strong> Google Cloud Platform
            </p>
            <p>
              <strong>Data Centers:</strong> Your data may be stored and processed in Google's data centers 
              located in the European Union to ensure compliance with GDPR requirements.
            </p>
            <p>
              <strong>Data Retention:</strong> We retain your personal data only as long as necessary 
              to provide our services and comply with legal obligations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have any questions about this Privacy Policy or want to exercise your data 
              protection rights, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-semibold">Privacy Contact</p>
              <p className="text-sm">Email: privacy@openmark.blog</p>
              <p className="text-sm">Response Time: Within 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
