# DNA Frontend

## Getting Started

### Running Locally

1. `cp .env.example .env.development`
1. Replace `.env.development` with variables from Aaron
1. `yarn dev`
1. Open [http://localhost:3000](http://localhost:3000) in your browser.

_Gotchas:_

- Does the backend (`dna-admin`) have menus, products, live streams
- Do you have the backend url & api key in `.env`?

## Styles

Always use `@emotion/styled` wherever possible. If regular CSS is required, use one of the following style files.
We manage our global styles in several files:

- `./styles/global-styles.tsx` (global stylesheet)
- `./styles/fonts.css` (global @font-face rules)
- `./styles/all.css` (global styles injected in at app root)
- `./styles/theme.tsx` (global theme variables)
- `./emotion.d.ts` (theme typings)

## Gotchas

- The app has a "Maintenance Mode" (branded fullscreen takeover), simply set `IS_MAINT_MODE=true`, and the `<Header/>` will disappear and `<Home/>` gets taken over by `<ComingSoon/>`. It's fun, try it!
- All the data for the app comes in from our staging server on Heroku, but you can also run the dna-admin CMS+API locally (hint: login only works with a localhost API)
- To run against the local API, set the `SPREE_API_URL` environment
  variable to the local API host/port
- Complains about missing `.next/build-manifest.json` are usually indications
  of a `next` build error. Try running `$(npm bin)/next build` to see the
  exact error.

## Deployment

- Create pipeline in Heroku
- add Github repo
- Create app
- heroku buildpacks:add <https://github.com/heroku/heroku-buildpack-nodejs> -a app-name
- heroku buildpacks:add heroku/nodejs -a app-name

Unset all Heroku env vars:
`heroku config:unset $(heroku config --shell | sed 's/=.*//' | xargs) -a app-name`
## Deploy URLS

POL Admin Interface & API
<http://dna-admin-dev.instinct.is/>
<http://dna-admin-staging.instinct.is/>

POL Frontend Interface
<https://dna-frontend-dev.instinct.is/>
<https://dna-frontend-staging.instinct.is/>

## Keeping Your Code Updated

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

<https://localhost:8080/apidocs/swagger_ui#/>

## Updating a fork

- `git remote add upstream git@github.com:1instinct/dna-frontend.git`
- `git fetch upstream`
- `git checkout main`
- `git pull upstream main`

## TODO

- Move data fetching into on `getInitialProps`
- Setup Redux

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
- `docker build . -t localhost:32000/dna-frontend:registry`
- `docker images` (copy ID of newly built image)
- `docker tag <image_id> localhost:32000/dna-frontend:registry`
- `docker push localhost:32000/dna-frontend:registry`
- `microk8s kubectl rollout restart deployment/dna-frontend`

# TODO:

- Move data fetching into on `getInitialProps`
- Setup Redux

- ~~Flow / Type Checking~~ (TypeScript)
- ~~React~~
- ~~SSR~~ (NextJS)
- ~~State Mgmt~~ (hooks/useContext... no Redux, yet)
- ~~Request Mgmt~~ (React Query)
- ~~Search~~ (Fuse.js)
- Pusher (real-time sockets)
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
- RSS feeds
- Chatbot (Rasa)
- Masonry ([react-responsive-masonry](https://www.npmjs.com/package/react-responsive-masonry))
- Browser Feature Detection
- Speed/Performance Benchmarking (GTMetrix.com API?)
- Header tags customization (NextJS: `next/header`)
- ~~Secrets management / Environment variables~~ (`dot-env`)