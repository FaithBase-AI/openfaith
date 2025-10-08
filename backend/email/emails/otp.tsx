import {
  Body,
  CodeInline,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

interface BetterAuthOTPEmailProps {
  otp?: string
  appName: string
  _tag: 'sign-in' | 'email-change'
}

export const OTPEmail = ({ otp = '123456', appName, _tag }: BetterAuthOTPEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {_tag === 'sign-in'
          ? `Your code to sign into ${appName} is ${otp}`
          : `Your code to verify your email is ${otp}`}
      </Preview>
      <Tailwind>
        <Body className='mx-auto my-auto bg-white px-2 font-sans'>
          <Container className='mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]'>
            <Heading className='mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black'>
              {_tag === 'sign-in' ? (
                <>
                  Sign into <strong>{appName}.</strong>
                </>
              ) : (
                <>
                  Verify your email for <strong>{appName}.</strong>
                </>
              )}
            </Heading>
            <Text className='text-[14px] text-black leading-[24px]'>Hello there,</Text>
            <Text className='text-[14px] text-black leading-[24px]'>
              {_tag === 'sign-in'
                ? `Here is your code to sign into ${appName}:`
                : `Here is your code to verify your email for ${appName}:`}
            </Text>
            <Section className='mt-[32px] mb-[32px] text-center'>
              <CodeInline className={'w-full rounded-md bg-gray-100 p-2 text-2xl'}>
                {otp}
              </CodeInline>
            </Section>
            <Text className='text-[14px] text-black leading-[24px]'>
              If you were not expecting this, you can ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function reactOTPEmail(props: BetterAuthOTPEmailProps) {
  return <OTPEmail {...props} />
}

export default OTPEmail
