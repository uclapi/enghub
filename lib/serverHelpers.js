import { withSentry } from '@sentry/nextjs';

// https://github.com/vercel/next.js/discussions/17832#discussioncomment-945043
export const catchErrorsFrom = (handler) => withSentry(async (req, res) =>
  handler(req, res).catch((error) => {
    console.error("Uncaught error in API route", error);
    return res
      .status(500)
      .send({
        error: true,
        message:
          "An unexpected error occurred. Please try again later or contact us if the issue persists.",
      });
  }));
