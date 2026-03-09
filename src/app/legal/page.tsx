import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Server, Shield, Users, Mail, Phone, MapPin, FileText, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Legal Information - OpenMark Blog',
  description: 'Legal notices, company information, and hosting details for OpenMark Blog.',
};

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Legal Information</h1>
        <p className="text-lg text-muted-foreground">
          Legal notices and information about OpenMark Blog
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Publisher Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-3">Forge Network</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Legal Status:</strong> Technology Company</p>
                <p><strong>Registration:</strong> European Union Registered</p>
                <p><strong>Business Type:</strong> Software Development & Digital Services</p>
                <p><strong>VAT Number:</strong> EU123456789</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Platform Description</h3>
              <p className="text-sm">
                OpenMark Blog is a modern blogging platform developed and operated by Forge Network. 
                The platform provides content creation, publishing, and community features for writers 
                and readers worldwide.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Hosting Provider
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-3">Google Cloud Platform</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Service Provider:</strong> Google LLC</p>
                <p><strong>Address:</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
                <p><strong>European Headquarters:</strong> Gordon House, Barrow Street, Dublin 4, Ireland</p>
                <p><strong>Data Centers:</strong> Multiple locations within the European Union</p>
                <p><strong>Compliance:</strong> GDPR, ISO 27001, SOC 2 Type II</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Data Processing</h3>
              <p className="text-sm">
                All user data is processed and stored within Google Cloud's European data centers 
                to ensure compliance with European data protection regulations. Google Cloud provides 
                enterprise-grade security and reliability for our hosting infrastructure.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">GDPR Compliance</h3>
              <p className="text-sm mb-2">
                OpenMark Blog is fully compliant with the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Legal basis for processing: User consent and legitimate interest</li>
                <li>Data retention: Only as long as necessary for service provision</li>
                <li>Data subject rights: Full GDPR rights implemented</li>
                <li>Data Protection Officer: privacy@openmark.blog</li>
                <li>Supervisory authority: CNIL (France)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Security Measures</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>End-to-end encryption for all data transmissions</li>
                <li>Regular security audits and penetration testing</li>
                <li>ISO 27001 certified hosting infrastructure</li>
                <li>24/7 security monitoring and incident response</li>
                <li>Regular data backups and disaster recovery procedures</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Content & Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Content Responsibility</h3>
              <p className="text-sm mb-2">
                <strong>Important Notice:</strong> OpenMark Blog is a hosting platform and is not 
                responsible for user-generated content. The legal responsibility for published content 
                lies solely with the content creators.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Users retain full ownership of their original content</li>
                <li>Users are solely responsible for content legality and accuracy</li>
                <li>Forge Network is not liable for user opinions or statements</li>
                <li>Content moderation follows established community guidelines</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">DMCA & Copyright</h3>
              <p className="text-sm">
                We respect intellectual property rights and respond to valid DMCA takedown notices. 
                Copyright owners can report infringements through our designated agent.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Applicable Regulations</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>General Data Protection Regulation (GDPR) - EU 2016/679</li>
                <li>ePrivacy Directive - EU 2002/58/EC</li>
                <li>Digital Services Act - EU 2022/2065</li>
                <li>Copyright Directive - EU 2019/790</li>
                <li>French Data Protection Act - Loi Informatique et Libertés</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Terms & Policies</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><a href="/terms-of-service" className="text-primary hover:underline">Terms of Service</a></li>
                <li><a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a></li>
                <li>Community Guidelines</li>
                <li>Cookie Policy</li>
                <li>Acceptable Use Policy</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Contacts
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>General:</strong> contact@openmark.blog</p>
                  <p><strong>Legal:</strong> contact@forgenet.fr</p>
                  <p><strong>Privacy:</strong> privacy@openmark.blog</p>
                  <p><strong>Support:</strong> support@openmark.blog</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Support
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Business Hours:</strong> 9:00 - 18:00 CET</p>
                  <p><strong>Phone:</strong> +33 1 XX XX XX XX</p>
                  <p><strong>Emergency:</strong> emergency@openmark.blog</p>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Registered Office
              </h3>
              <div className="space-y-1 text-sm">
                <p>Forge Network</p>
                <p>123 Technology Boulevard</p>
                <p>75001 Paris, France</p>
                <p>European Union</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Governing Law</h3>
              <p className="text-sm">
                These legal notices are governed by the laws of the European Union and the French 
                Republic. Any disputes will be subject to the exclusive jurisdiction of the courts 
                of Paris, France.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Alternative Dispute Resolution</h3>
              <p className="text-sm">
                We encourage amicable resolution of disputes. Users may contact our legal department 
                or use the European Union's online dispute resolution platform for consumer complaints.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This legal notice was last updated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}. We regularly review and update our legal information to ensure compliance 
              with current regulations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
