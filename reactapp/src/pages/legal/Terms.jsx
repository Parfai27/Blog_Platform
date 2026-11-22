import { Link } from "react-router-dom"
import LegalPage, { H2, LEGAL, List, Mail, P } from "./LegalPage"

export default function Terms() {
  return (
    <LegalPage title="Terms of use">
      <P>
        These terms apply to everyone who reads or writes on {LEGAL.site}, run by {LEGAL.owner}. By creating an account
        or using the site you agree to them.
      </P>

      <H2>Your account</H2>
      <List
        items={[
          `You must be 16 or older to create an account.`,
          "Give accurate details and keep your password private. You are responsible for what is done with your account.",
          "One person, one account. Do not impersonate anyone.",
        ]}
      />

      <H2>Your content</H2>
      <P>
        You keep ownership of what you write. By publishing it, you give {LEGAL.site} a free, worldwide licence to host,
        display and share it on the site for as long as it stays published. You can unpublish or delete your posts at any
        time.
      </P>
      <P>Only publish what you have the right to share, including images.</P>

      <H2>Community rules</H2>
      <P>Do not post or send anything that:</P>
      <List
        items={[
          "harasses, threatens or attacks a person or group;",
          "is hateful, sexually explicit, or encourages violence or self-harm;",
          "is spam, a scam, or misleading on purpose;",
          "shares someone else's private information without their consent;",
          "copies others' work without permission or breaks the law.",
        ]}
      />
      <P>
        Anyone can report a post or comment. Admins may remove content and block accounts that break these rules, and
        may tell the authorities when the law requires it.
      </P>

      <H2>The AI assistant</H2>
      <P>
        The assistant suggests titles, summaries, tags and edits. Its suggestions can be wrong; you decide what to keep
        and you are responsible for what you publish. Daily use limits apply.
      </P>

      <H2>The service</H2>
      <P>
        {LEGAL.site} is free and provided &quot;as is&quot;. We may change features, and may pause or end the service.
        To the extent the law allows, we are not liable for content written by other members or for indirect losses.
      </P>

      <H2>Ending your account</H2>
      <P>
        You can stop using {LEGAL.site} at any time and ask us to delete your account (see the{" "}
        <Link to="/privacy" className="text-brand underline underline-offset-2">privacy policy</Link>). We may close
        accounts that seriously or repeatedly break these terms.
      </P>

      <H2>Law and contact</H2>
      <P>
        These terms are governed by the laws of {LEGAL.country}. Questions: <Mail />.
      </P>
    </LegalPage>
  )
}
