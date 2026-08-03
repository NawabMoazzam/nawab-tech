import {
  Body,
  Container,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  name: string;
};

export default function ClientConfirmation({ name }: Props) {
  return (
    <Html>
      <Preview>Thanks for contacting Nawab Tech</Preview>

      <Body
        style={{
          backgroundColor: "#f8f8f8",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Container
          style={{
            background: "#ffffff",
            padding: "40px",
          }}
        >
          <Heading>Thanks, {name}!</Heading>

          <Text>
            We&apos;ve received your enquiry and will personally review it.
          </Text>

          <Text>
            You can usually expect a response within one business day.
          </Text>

          <Section>
            <Text>
              —
              <br />
              Nawab Tech
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
