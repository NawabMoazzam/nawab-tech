import {
  Body,
  Container,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

import type { EnquiryInput } from "@/schemas/enquiry";

export default function NewEnquiry(data: EnquiryInput) {
  return (
    <Html>
      <Preview>New enquiry received</Preview>

      <Body>
        <Container>
          <Heading>New enquiry from {data.name}</Heading>

          <Text>Name: {data.name}</Text>

          <Text>Email: {data.email}</Text>

          <Text>Company: {data.company}</Text>

          <Text>Service: {data.service}</Text>

          <Text>Budget: {data.budget}</Text>

          <Text>Timeline: {data.timeline}</Text>

          <Text>Project:</Text>

          <Text>{data.project}</Text>
        </Container>
      </Body>
    </Html>
  );
}
