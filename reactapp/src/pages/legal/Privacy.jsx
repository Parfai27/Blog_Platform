import { Link } from "react-router-dom"
import LegalPage, { H2, LEGAL, List, Mail, P, Table } from "./LegalPage"

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <P>
        {LEGAL.site} is a community blog run by {LEGAL.owner} in {LEGAL.country}. This policy explains what personal
        data we collect, why, who we share it with and your rights. It follows Rwanda&apos;s Law No. 058/2021 relating to
        the protection of personal data and privacy. {LEGAL.owner} is the controller of your data.
      </P>

      <H2>What we collect</H2>
      <List
        items={[
          <>
            <strong>Your account:</strong> first and last name, email address, a password stored only as a one-way hash,
            and, if you add them, a bio and profile photo.
          </>,
          <>
            <strong>What you write and do:</strong> posts and drafts, comments, likes, and any reports you file.
          </>,
          <>
            <strong>AI assistant use:</strong> the text you send to the assistant, and a daily count of how often you use
            it so we can apply fair-use limits.
          </>,
          <>
            <strong>Password resets:</strong> a short-lived reset code sent to your email.
          </>,
          <>
            <strong>Technical data:</strong> your IP address and basic request details, used for security and rate
            limiting.
          </>,
        ]}
      />

      <H2>Why we use it</H2>
      <List
        items={[
          "To run your account and publish what you choose to publish (needed to provide the service).",
          "To keep the community safe: handling reports, blocking accounts that break the rules, and stopping abuse (our legitimate interest).",
          "To give you AI writing suggestions when you ask for them.",
          "To email you a code when you reset your password.",
        ]}
      />
      <P>We do not sell your data, show ads, or use tracking or analytics tools.</P>

      <H2>What is public</H2>
      <P>
        Published posts, your name, bio and profile photo, and your comments can be read by anyone. Drafts, your email
        address and your reports stay private.
      </P>

      <H2>Who we share it with</H2>
      <Table
        head={["Provider", "What for", "Data involved"]}
        rows={[
          ["Render", "Hosting the site and API", "All requests, server logs"],
          ["MongoDB", "Database hosting", "Accounts, posts, comments, likes, reports"],
          ["Cloudinary", "Storing images", "Profile photos and post images"],
          ["OpenAI", "The AI writing assistant, only when you use it", "The text you send to the assistant"],
          ["Twilio SendGrid", "Sending password reset emails", "Your email address and the reset code"],
          ["Google Fonts", "Loading the site's typefaces", "Your IP address and browser details"],
        ]}
      />
      <P>
        Some of these providers process data outside {LEGAL.country}, relying on their contractual safeguards for
        international transfers. We share data with authorities only when the law requires it.
      </P>

      <H2>How long we keep it</H2>
      <P>
        We keep your account and content while your account exists. If you ask us to delete your account, we delete your
        personal data and drafts within 30 days; published posts are removed with it. Reset codes expire after a short
        time. Server logs are kept briefly by our host.
      </P>

      <H2>Your rights</H2>
      <P>
        You can see and correct most of your data in Settings. You can also ask to access, correct, delete or receive a
        copy of your data, or object to how we use it, by writing to <Mail />. You may complain to the National Cyber
        Security Authority (NCSA), Rwanda&apos;s data protection authority.
      </P>

      <H2>Age</H2>
      <P>{LEGAL.site} is for people aged 16 and over. If you are younger, please ask a parent or guardian before signing up.</P>

      <H2>Cookies and storage</H2>
      <P>
        We keep you signed in with a token stored in your browser, not with tracking cookies. See the{" "}
        <Link to="/cookies" className="text-brand underline underline-offset-2">cookie policy</Link>.
      </P>

      <H2>Changes and contact</H2>
      <P>
        If we change this policy we will update the date above. Questions: {LEGAL.owner}, {LEGAL.country}, <Mail />.
      </P>
    </LegalPage>
  )
}
