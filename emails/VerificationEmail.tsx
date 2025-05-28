import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Link,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

type VerificationEmailProps = {
  userName: string;
  verifycode: string;
 supportEmail?: string;
  companyName?: string;
  companyUrl?: string;
};

const VerificationEmail: React.FC<VerificationEmailProps> = ({
  userName,
  verifycode,
  supportEmail = 'support@example.com',
  companyName = 'Your Company',
  companyUrl = 'https://www.example.com',
}) => {
  const verificationLink = `${companyUrl}/verify?code=${encodeURIComponent(verifycode)}`;

  return (
    <Html>
      <Head />
    <Preview>Verify your email address</Preview>
    <Tailwind>
      {`
      body { background-color: #f4f4f4; }
      `}
    </Tailwind>
    <Body className="bg-gray-100 font-sans">
      <Container className="mx-auto bg-white rounded-xl shadow p-6 my-8 max-w-lg">
        <Section className="text-center bg-green-600 text-white py-4 rounded-t-lg">
          <Heading as="h1" className="text-2xl">
            {companyName}
          </Heading>
        </Section>

        <Section className="p-6">
          <Text className="text-gray-800 text-base mb-4">
            Hi {userName},
          </Text>
          <Text className="text-gray-800 text-base mb-4">
            Thank you for registering with {companyName}! Please verify your email address by clicking the button below.
          </Text>
          <Section className="text-center my-6">
            <Button
              className="bg-green-600 text-white rounded-lg no-underline py-3 px-6"
              href={verificationLink}
            >
              Verify Email Address
            </Button>
          </Section>
          <Text className="text-gray-600 text-sm">
            If the button above doesn’t work, copy and paste the link below into your browser:
          </Text>
          <Text className="text-blue-600 text-sm break-words mb-4">
            <Link href={verificationLink}>{verificationLink}</Link>
          </Text>
          <Text className="text-gray-800 text-base mb-4">
            If you didn’t sign up for a {companyName} account, you can safely ignore this email.
          </Text>
          <Text className="text-gray-800 text-base">
            If you need help, contact us at{' '}
            <Link href={`mailto:${supportEmail}`} className="text-blue-600 no-underline">
              {supportEmail}
            </Link>.
          </Text>
          <Text className="text-gray-800 text-base mt-6">
            Cheers,<br />The {companyName} Team
          </Text>
        </Section>

        <Section className="text-center text-gray-500 text-xs mt-6 pt-4 border-t">
          &copy; {new Date().getFullYear()}{' '}
          <Link href={companyUrl} className="text-gray-500 no-underline">
            {companyName}
          </Link>. All rights reserved.
        </Section>
      </Container>
    </Body>
  </Html>
);

};

export default VerificationEmail;
