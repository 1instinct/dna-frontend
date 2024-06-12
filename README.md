This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## NextJS

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Styles

Always use `@emotion/styled` wherever possible. If regular CSS is required, use one of the following style files.
We manage our global styles in several files:

- `./styles/global-styles.tsx` (global stylesheet)
- `./styles/fonts.css` (global @font-face rules)
- `./styles/all.css` (global styles injected in at app root)
- `./styles/theme.tsx` (global theme variables)
- `./emotion.d.ts` (theme typings)

## Gotchas:

- The app has a "Maintenance Mode" (branded fullscreen takeover), simply set `IS_MAINT_MODE=true`, and the `<Header/>` will disappear and `<Home/>` gets taken over by `<ComingSoon/>`. It's fun, try it!
- All the data for the app comes in from our staging server on Heroku, but you can also run the dna-admin CMS+API locally (hint: login only works with a localhost API)
- To run against the local API, set the `SPREE_API_URL` environment
  variable to the local API host/port
- Complains about missing `.next/build-manifest.json` are usually indications
  of a `next` build error. Try running `$(npm bin)/next build` to see the
  exact error.

## Deploy URLS:

POL Admin Interface & API
http://dna-admin-dev.instinct.is/
http://dna-admin-staging.instinct.is/

POL Frontend Interface
https://dna-frontend-dev.instinct.is/
https://dna-frontend-staging.instinct.is/

## Keeping Your Code Updated:

When there are lots of active changes occuring on this repo, make sure to regularly:

1. Commit (or stash) your local changes on your branch
1. `git fetch origin`
1. `git checkout main`
1. `git pull origin main`
1. `git checkout <your_branch>`
1. `git merge main`
1. Fix merge conflicts (if any)
1. `git add .`
1. `git commit -m 'merge in latest main'`

Done!
…now you will be up-to-date with latest code. Do this before you submit your PR, and you can be sure it will be a clean merge.

## Testing API Endpoints

https://localhost:8080/apidocs/swagger_ui#/

## Updating a fork:

- `git remote add upstream git@github.com:1instinct/dna-frontend.git`
- `git fetch upstream`
- `git checkout main`
- `git pull upstream main`

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Deploy to Microk8s (Kubernetes)

- `ssh clusterIP`
- `cd ./dna-frontend`
- `cp ./secret.example.yml ./secret.yml`

Convert .env values to base64:

```shell
echo -n 'The seed of a powerful beginning' | base64 && \
echo -n 'hello@instinct.is' | base64 && \
...
```

- It can be tricky, helps to use multiple cursors but:
- paste base64 values into `secret.yml`
- `microk8s kubectl apply -f secret.yml`

# TODO:

- Flow / Type Checking
- ~~React~~
- ~~SSR~~ (NextJS)
- ~~State Mgmt~~ (hooks/useContext... no Redux, yet)
- ~~Request Mgmt~~ (React Query)
- ~~Search~~ (Fuse.js)
- Pusher / API Integration
- ~~Styled Components~~ (@emotion/styled)
- Moving Letters
- UI Sounds (proprietary: "npm install beeper")
- Maps
- File upload (ReactDropzone)
- ~~Form validation (Formik)~~
- Animations / Transitions (ReactSpring, GSAP)
- Gestures
- UI Alerts
- Uptime Monitoring
- Twilio
- Unit Testing
- Chat widget
- Chatbot (Rasa)
- Browser Feature Detection
- Speed/Performance Benchmarking (GTMetrix.com API?)
- Header tags customization (NextJS: `next/header`)
- ~~Secrets management / Environment variables~~ (`dot-env`)
