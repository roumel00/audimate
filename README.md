# OpenAI Realtime Twilio Integration

This is a port of the OpenAI Realtime Twilio demo into the Audimate project. It allows you to make phone calls using the OpenAI Realtime API through Twilio.

## Setup

1. Make sure you have the following environment variables set in your `.env.local` file:

```
# OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Twilio config
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# OpenAI Realtime Server config
REALTIME_PORT=8081
REALTIME_PUBLIC_URL=http://localhost:8081
NEXT_PUBLIC_REALTIME_WS_URL=ws://localhost:8081/logs
```

If deploying to production, make sure to update the URLs to your public-facing domain.

2. Start the OpenAI Realtime server:

```
npm run realtime-server
```

3. Start the Next.js development server:

```
npm run dev
```

```
ngrok https 8081
```

4. Visit http://localhost:3000/realtime-call to access the UI.

## Usage

1. Enter a phone number in the format required by Twilio (e.g., +1234567890).
2. Click "Start Call" to initiate a call.
3. The call will connect to the OpenAI Realtime API and start a conversation.
4. The transcript will appear in the UI.

## Customization

To modify the OpenAI agent's behavior, you can edit:

- The prompt in `lib/openai-realtime/sessionManager.js` 
- The available functions in `lib/openai-realtime/functionHandlers.js`
- The TwiML in `lib/openai-realtime/twiml.xml`

## Troubleshooting

If you encounter issues:

1. Make sure both the Realtime server and Next.js server are running.
2. Check that your Twilio and OpenAI API credentials are correct.
3. Ensure your Twilio phone number is properly configured.
4. Check the console logs for any error messages.

For local development with Twilio webhooks, consider using a service like ngrok to expose your local server to the internet. 