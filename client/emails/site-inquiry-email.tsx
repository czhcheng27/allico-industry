import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type SiteInquiryEmailProps = {
  formName: string;
  source: string;
  name: string;
  email: string;
  description: string;
};

function SiteInquiryEmail({
  formName,
  source,
  name,
  email,
  description,
}: SiteInquiryEmailProps) {
  const previewText = `New ${formName} message from ${name}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={eyebrow}>ALLICO INDUSTRIES</Text>
            <Heading style={heading}>New Website Inquiry</Heading>
            <Text style={subheading}>
              A new message was submitted through the {formName} form.
            </Text>
          </Section>

          <Section style={contentSection}>
            <Text style={label}>Form</Text>
            <Text style={value}>{formName}</Text>

            <Text style={label}>Source</Text>
            <Text style={value}>{source}</Text>

            <Text style={label}>Name</Text>
            <Text style={value}>{name}</Text>

            <Text style={label}>Email</Text>
            <Text style={value}>{email}</Text>

            <Hr style={divider} />

            <Text style={label}>Description</Text>
            <Text style={message}>{description}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f4f4f4",
  color: "#111111",
  fontFamily: "Arial, sans-serif",
  margin: "0",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  margin: "0 auto",
  maxWidth: "640px",
  width: "100%",
};

const headerSection = {
  backgroundColor: "#111111",
  padding: "28px 32px",
};

const eyebrow = {
  color: "#fdc82f",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  margin: "0 0 10px",
};

const heading = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "800",
  margin: "0",
  textTransform: "uppercase" as const,
};

const subheading = {
  color: "#d4d4d8",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "12px 0 0",
};

const contentSection = {
  padding: "32px",
};

const label = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.16em",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const value = {
  color: "#111111",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 18px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const message = {
  color: "#111111",
  fontSize: "16px",
  lineHeight: "28px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

export { SiteInquiryEmail };
