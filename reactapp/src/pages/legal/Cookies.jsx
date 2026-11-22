import { Link } from "react-router-dom"
import LegalPage, { H2, LEGAL, P, Table } from "./LegalPage"

export default function Cookies() {
  return (
    <LegalPage title="Cookie policy">
      <P>
        {LEGAL.site} sets no cookies at all. There are no advertising, analytics or tracking tools, so there is nothing to
        opt out of and no cookie banner.
      </P>

      <H2>What we store in your browser</H2>
      <P>To keep you signed in, we save one item in your browser&apos;s local storage when you log in:</P>
      <Table
        head={["Name", "Purpose", "Type", "Lasts"]}
        rows={[
          [
            <code key="k">blog_token</code>,
            "Proves you are signed in when you write, comment or like.",
            "Strictly necessary",
            "Until you log out; it stops working after 1 day",
          ],
        ]}
      />
      <P>Readers who never log in have nothing stored.</P>

      <H2>Fonts</H2>
      <P>
        The site loads its typefaces from Google Fonts, which receives your IP address and browser details to deliver the
        font files.
      </P>

      <H2>Managing it</H2>
      <P>
        Logging out removes the token. You can also clear site data in your browser settings; you will then need to log in
        again.
      </P>

      <P>
        For everything else about your data, see the{" "}
        <Link to="/privacy" className="text-brand underline underline-offset-2">privacy policy</Link>.
      </P>
    </LegalPage>
  )
}
