// in this folder we will define rules for http and wss

import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_ENV === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

if (!arcjetKey) {
  throw new Error('ARCJET_KEY is required');
}

export const httpArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        // detectBot({         // comment is added since, arcjet was treating postman request as a bot , remove the comment in production
        //     mode: arcjetMode,
        //     allow: [
        //         "CATEGORY:SEARCH_ENGINE",
        //         "CATEGORY:PREVIEW",
        //     ],
        // }),
        slidingWindow({ mode: arcjetMode, interval: '10s', max: 50 }),
      ],
    })
  : null;

export const wspArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
        }),
        slidingWindow({ mode: arcjetMode, interval: '2s', max: 5 }),
      ],
    })
  : null;

export function securityMiddleware() {
  return async (req, res, next) => {
    if (!httpArcjet) {
      return next();
    }

    try {
      const decision = await httpArcjet.protect(req);

      if (decision.isDenied()) {
        console.log('Reason:', decision.reason);
        return res.status(decision.reason.isRateLimit() ? 429 : 403).json({
          error: decision.reason.isRateLimit()
            ? 'Too many requests'
            : 'Forbidden',
        });
      }

      return next();
    } catch (e) {
      console.error(e);

      return res.status(500).json({
        error: 'Service Unavailable',
      });
    }
  };
}
