import {
  Body,
  Button,
  Container,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ResetPasswordEmailProps = {
  name: string;
  resetUrl: string;
};

export default function ResetPasswordEmail({
  name,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Preview>Reset your Nawab Tech admin password</Preview>
      <Body
        style={{
          backgroundColor: "#f4f2ed",
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: "32px 12px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dedbd3",
            maxWidth: "560px",
            padding: "40px",
          }}
        >
          <Text
            style={{
              color: "#a74425",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            Nawab Tech / Admin
          </Text>
          <Heading style={{ color: "#221f1c", fontSize: "28px" }}>
            Reset your password
          </Heading>
          <Text style={{ color: "#554f49", fontSize: "15px", lineHeight: 1.6 }}>
            Hi {name || "there"}, we received a request to reset the password
            for your Nawab Tech admin account.
          </Text>
          <Section style={{ margin: "28px 0" }}>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: "#b94f2c",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "14px",
                fontWeight: 700,
                padding: "14px 22px",
                textDecoration: "none",
              }}
            >
              Reset password
            </Button>
          </Section>
          <Text style={{ color: "#746d66", fontSize: "13px", lineHeight: 1.6 }}>
            This link expires in one hour. If you did not request a password
            reset, you can safely ignore this email; your password will remain
            unchanged.
          </Text>
          <Text style={{ color: "#9a938c", fontSize: "12px", lineHeight: 1.5 }}>
            If the button does not work, copy this URL into your browser:
            <br />
            {resetUrl}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
