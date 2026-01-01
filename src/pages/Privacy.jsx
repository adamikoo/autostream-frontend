import React from 'react';

export default function Privacy() {
    return (
        <div className="max-w-3xl mx-auto p-8 prose">
            <h1>Privacy Policy</h1>
            <p>Last updated: December 31, 2025</p>
            <p>Welcome to AutoStream ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.</p>

            <h2>1. Information We Collect</h2>
            <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website.</p>
            <ul>
                <li><strong>Personal Data:</strong> Name, email address, and authentication tokens (via OAuth) for third-party platforms like TikTok and YouTube.</li>
                <li><strong>Usage Data:</strong> Information like your IP address, browser type, device type, and operating system.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect or receive:</p>
            <ul>
                <li>To allow you to log in to third-party accounts (TikTok, YouTube) and upload content automatically.</li>
                <li>To facilitate account creation and logon process.</li>
                <li>To send you administrative information.</li>
            </ul>

            <h2>3. Third-Party Access</h2>
            <p>We integrate with third-party services. Please review their privacy policies:</p>
            <ul>
                <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                <li><a href="https://www.tiktok.com/legal/page/row/privacy-policy/en" target="_blank" rel="noopener noreferrer">TikTok Privacy Policy</a></li>
            </ul>
            <p>We do not sell your personal data to advertisers or other third parties.</p>

            <h2>4. Data Deletion</h2>
            <p>You may request deletion of your data at any time by contacting us at support@autostream.app or by revoking access via your Google/TikTok account security settings.</p>

            <h2>5. Contact Us</h2>
            <p>If you have questions or comments about this policy, you may email us at support@autostream.app.</p>
        </div>
    );
}
