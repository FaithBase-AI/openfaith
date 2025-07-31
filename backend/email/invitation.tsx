import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import type { FC } from 'react'

interface BetterAuthInviteUserEmailProps {
  username?: string
  invitedByUsername?: string
  invitedByEmail?: string
  teamName?: string
  teamImage?: string
  inviteLink?: string
  appName: string
}

export const InviteUserEmail: FC<BetterAuthInviteUserEmailProps> = (props) => {
  const { username, invitedByUsername, invitedByEmail, teamName, teamImage, inviteLink, appName } =
    props
  const previewText = `Join ${invitedByUsername} on ${appName}`
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className='mx-auto my-auto bg-white px-2 font-sans'>
          <Container className='mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]'>
            <Heading className='mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black'>
              Join <strong>{invitedByUsername}</strong> on <strong>{appName}.</strong>
            </Heading>
            <Text className='text-[14px] text-black leading-[24px]'>Hello there,</Text>
            <Text className='text-[14px] text-black leading-[24px]'>
              <strong>{invitedByUsername}</strong> (
              <Link className='text-blue-600 no-underline' href={`mailto:${invitedByEmail}`}>
                {invitedByEmail}
              </Link>
              ) has invited you to the <strong>{teamName}</strong> team on{' '}
              <strong>{appName}</strong>.
            </Text>
            <Section>
              {teamImage ? (
                <Row>
                  <Column align='left'>
                    <Img
                      className='rounded-full'
                      fetchPriority='high'
                      height='64'
                      src={teamImage}
                      width='64'
                    />
                  </Column>
                </Row>
              ) : null}
            </Section>
            <Section className='mt-[32px] mb-[32px] text-center'>
              <Button
                className='rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline'
                href={inviteLink}
              >
                Join the team
              </Button>
            </Section>
            <Text className='text-[14px] text-black leading-[24px]'>
              or copy and paste this URL into your browser:{' '}
              <Link className='text-blue-600 no-underline' href={inviteLink}>
                {inviteLink}
              </Link>
            </Text>
            <Hr className='mx-0 my-[26px] w-full border border-[#eaeaea] border-solid' />
            <Text className='text-[#666666] text-[12px] leading-[24px]'>
              This invitation was intended for <span className='text-black'>{username}</span>. If
              you were not expecting this invitation, you can ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function reactInvitationEmail(props: BetterAuthInviteUserEmailProps) {
  return <InviteUserEmail {...props} />
}

export default InviteUserEmail
