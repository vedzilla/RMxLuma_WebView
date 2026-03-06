# Privacy Policy

**Effective date: 23 February 2026**

---

## 1. Introduction

RedefineMe Ltd ("RedefineMe", "we", "us", or "our") operates the RedefineMe mobile application ("the App"), available on Android and iOS. RedefineMe is a university society event aggregator that helps students at UK universities discover events run by their societies.

This Privacy Policy explains what personal data we collect, why we collect it, how we use it, and your rights under UK data protection law (UK GDPR and the Data Protection Act 2018).

By using the App, you agree to the practices described in this policy. If you do not agree, please do not use the App.

**Data controller:** RedefineMe Ltd
**Contact:** admin@redefine-me.com
**Website:** redefine-me.com

---

## 2. Information We Collect

### (a) Information you provide to us

When you create an account, we collect:

| Data | Why we ask for it |
|---|---|
| Email address | To create and identify your account |
| Full name | To personalise your experience |
| University | To show you events relevant to your institution |
| Study level | To surface more relevant event recommendations |
| Interests | To personalise your event feed and recommendations |
| Profile picture (optional) | To personalise your account and in-app profile |

When you use the App, we also store:

- **Saved / bookmarked events** — events you mark as saved
- **RSVP / attending status** — events you indicate you are attending
- **Event shares** — events you share via the App's share feature

### (b) Information collected automatically

When you use the App, Supabase (our backend provider) issues and stores a **session authentication token** to keep you signed in. This token is stored securely on your device and transmitted only to Supabase servers to verify your identity. We do not log IP addresses beyond what Supabase retains for security and abuse prevention purposes in the normal course of operating its service.

We also collect **analytics data** through PostHog, our analytics provider. This includes:

- Screen views and time spent on each screen
- Interaction events (e.g. liking, RSVPing to, or sharing an event; tapping a category or university; performing a search)
- Authentication events (e.g. sign-in method used, onboarding completion)
- Non-identifying metadata associated with your account (university, study level, number of interests selected)

Analytics data is sent to PostHog's **EU servers** (Frankfurt, Germany). PostHog does not receive your name, email address, or other directly identifying information. When you are signed in, your anonymous user ID is linked to the above metadata to help us understand how the App is used and improve it.

### (c) Information we do NOT collect

To be clear about the limits of our data collection:

- We do **not** collect your device's GPS location or coarse network location
- We do **not** collect device identifiers (IDFA, Android Advertising ID, IMEI, etc.)
- We do **not** send push notification tokens to external services (notifications are scheduled locally on your device)
- We do **not** collect any financial or payment information
- We do **not** read, store, or process the content of any messages or communications
- We do **not** use advertising SDKs in the App

---

## 3. How We Use Your Information

| Data | Purpose | UK GDPR legal basis |
|---|---|---|
| Email address | Account creation, account recovery, service communications (e.g. security alerts) | Performance of a contract (Article 6(1)(b)) |
| Full name | Personalising your in-app experience | Performance of a contract (Article 6(1)(b)) |
| University | Filtering events to your institution | Performance of a contract (Article 6(1)(b)) |
| Study level | Improving the relevance of event recommendations | Legitimate interests (Article 6(1)(f)) — to provide a useful service |
| Interests | Personalising your event feed and recommendations | Legitimate interests (Article 6(1)(f)) — to provide a useful service |
| Profile picture | Displaying your avatar within the App | Performance of a contract (Article 6(1)(b)) |
| Saved events, RSVPs, shares | Persisting your preferences and activity across devices and sessions | Performance of a contract (Article 6(1)(b)) |
| Session token | Keeping you authenticated | Performance of a contract (Article 6(1)(b)) |
| Analytics data | Understanding how the App is used and improving the service | Legitimate interests (Article 6(1)(f)) — to improve and maintain the App |
| Aggregated event interaction data | Providing societies with anonymous analytics about their events via the Society Dashboard | Legitimate interests (Article 6(1)(f)) — to help societies understand and improve their events |

We do not use your personal data for automated decision-making or profiling that produces legal or similarly significant effects.

---

## 4. How We Share Your Information

We do not sell your personal data. We do not share your data with advertising networks or data brokers.

We share data only with the following parties, solely to operate the App:

**Supabase Inc.**
Our database and authentication provider. Supabase acts as a data processor on our behalf under a Data Processing Agreement. All data is stored in Supabase's **eu-central-1** region (Frankfurt, Germany), within the EU. Supabase's privacy policy is available at [supabase.com/privacy](https://supabase.com/privacy).

**PostHog Inc.**
Our analytics provider. PostHog acts as a data processor on our behalf. It receives anonymised interaction events, screen views, search queries, authentication method, and non-identifying account metadata (university, study level, interests count). All analytics data is processed on PostHog's **EU servers** (Frankfurt, Germany). PostHog does not receive your name or email address. PostHog's privacy policy is available at [posthog.com/privacy](https://posthog.com/privacy).

**Apple Inc. (Apple Sign In)**
If you choose to sign in with Apple, your name and email address are shared with Apple as part of the standard Apple Sign In authentication flow. Apple acts as an identity provider; we receive an authentication token from Apple to verify your identity. Apple's privacy policy is available at [apple.com/legal/privacy](https://www.apple.com/legal/privacy/).

**Google LLC (Google OAuth)**
If you choose to sign in with Google, your email address and profile information are shared with Google as part of the standard Google OAuth authentication flow. Google acts as an identity provider; we receive an authentication token from Google to verify your identity. Google's privacy policy is available at [policies.google.com/privacy](https://policies.google.com/privacy).

**University societies (via the Society Dashboard)**
We provide university societies with access to an analytics dashboard that displays **aggregated, anonymous statistics** about how users interact with their events. This may include the number of event views, clicks, RSVPs, shares, and other engagement metrics. **No personally identifiable information** (such as names, email addresses, or individual user profiles) is shared with societies. Societies cannot identify or contact individual users through the dashboard.

**Expo / Expo Application Services (EAS)**
The framework used to build and distribute the App. Expo may process limited technical metadata (e.g. build artefacts) during the app delivery process, but does not receive or process your personal account data. Expo's privacy policy is at [expo.dev/privacy](https://expo.dev/privacy).

**Law enforcement or regulatory authorities**
We may disclose personal data where required to do so by law, court order, or in response to a legitimate request from a law enforcement or regulatory authority.

---

## 5. Data Storage and Security

Your data is stored on Supabase infrastructure located in **Frankfurt, Germany (eu-central-1)**. This region is within the EU and subject to EU data protection standards, which are deemed adequate under UK GDPR.

We take the following measures to protect your data:

- All data transmitted between the App and our servers is encrypted in transit using TLS
- Data is encrypted at rest on Supabase infrastructure
- Access to the database is restricted by role-based access controls
- Authentication is handled by Supabase Auth, which follows industry-standard security practices

No method of transmission or storage is 100% secure. If you become aware of any security concern related to your account, please contact us at admin@redefine-me.com immediately.

---

## 6. Data Retention

**Active accounts:** We retain your personal data for as long as your account is active and you continue to use the App.

**Deleted accounts:** When you delete your account (via the in-app account deletion feature), your personal data is marked for deletion and permanently purged from our systems within **30 days**. This window allows us to recover from accidental deletions and to complete any backup rotation cycles.

After 30 days, no personally identifiable information relating to your account is retained.

---

## 7. Your Rights Under UK GDPR

As a UK resident, you have the following rights regarding your personal data:

- **Right of access** — You can request a copy of the personal data we hold about you.
- **Right to rectification** — You can ask us to correct inaccurate or incomplete data.
- **Right to erasure ("right to be forgotten")** — You can request deletion of your data. You can do this directly in the App (Settings → Delete Account) or by emailing us.
- **Right to data portability** — You can request your data in a structured, machine-readable format.
- **Right to restriction of processing** — You can ask us to pause processing your data in certain circumstances (e.g. while a rectification request is pending).
- **Right to object** — Where we process data on the basis of legitimate interests, you have the right to object. We will stop processing unless we can demonstrate compelling legitimate grounds.

To exercise any of these rights, email us at **admin@redefine-me.com** with your request. We will respond within **one calendar month**.

If you are unhappy with how we handle your data or your rights request, you have the right to lodge a complaint with the **Information Commissioner's Office (ICO)**:

- Website: [ico.org.uk](https://ico.org.uk)
- Telephone: 0303 123 1113

---

## 8. Children's Policy

The App is intended for use by university students aged **18 and over**.

We do not knowingly collect personal data from anyone under the age of 18. If you believe a child under 18 has provided us with personal data, please contact us at admin@redefine-me.com and we will delete that data promptly.

---

## 9. Guest Mode

You may browse the App without creating an account by using guest mode. When using guest mode:

- **No personal data** is stored on our servers. You do not provide a name, email address, or any other account information.
- **Anonymous analytics data** (such as screen views and interaction events) may still be collected by PostHog to help us understand how the App is used.
- Any interactions you make (e.g. liking or RSVPing to events) are **not saved** and will be lost when you leave guest mode or close the App.
- To access the full functionality of the App, you will need to create an account.

---

## 10. Third-Party Links

Event listings in the App may include links to external websites for event registration or further information (for example, a society's website or a ticketing platform). These links are provided for convenience and are not operated by RedefineMe.

We have no control over, and accept no responsibility for, the privacy practices or content of any third-party websites. We encourage you to read the privacy policy of any external site you visit.

---

## 11. Sponsored and Promoted Content

Some events displayed in the App may be sponsored or promoted by university societies or other organisations. Where this is the case, the event will be clearly labelled.

We do not collect any personal data from the societies or organisations whose events are promoted. No targeting of users based on personal data is used for sponsored content decisions.

Societies may have access to **aggregated, anonymous analytics** about how users interact with their promoted events (see Section 4 for details). This data does not identify individual users.

If our approach to sponsored content changes in a way that involves new data processing, this policy will be updated accordingly.

---

## 12. Notifications

The App uses a **local notification** system. The App periodically checks our server for any pending notifications relevant to you (such as event reminders or announcements) and schedules them as local notifications on your device.

- We do **not** collect or transmit push notification tokens to any external service (e.g. Apple Push Notification Service or Firebase Cloud Messaging).
- Notification permission is requested through your device's standard permission prompt. You can disable notifications at any time via your device's settings.
- Notification IDs are stored locally on your device to prevent duplicate notifications.

---

## 13. Changes to This Policy

We may update this Privacy Policy from time to time. When we make material changes, we will notify you by:

- Displaying a notice within the App on your next login, or
- Sending a notification to the email address associated with your account

The "Effective date" at the top of this page will always reflect when the policy was last updated. Continued use of the App after a policy update constitutes your acceptance of the revised terms.

We encourage you to review this policy periodically.

---

## 14. Contact Us

If you have any questions about this Privacy Policy, your data, or your rights, please get in touch:

**RedefineMe Ltd**
Email: admin@redefine-me.com
Website: redefine-me.com

We aim to respond to all enquiries within **5 business days**.
