# How the Time Capsule Feature Was Built — A MERN Process Walkthrough

This isn't a spec — it's a record of the actual order things happened in, and the
reasoning behind that order, so it can be reused as a process for your next feature.

## Tech Stack

**Already in the app:** MongoDB + Mongoose, Express, React + Vite, Tailwind CSS,
JWT + bcryptjs (auth), Nodemailer, Groq API (AI text generation), axios,
react-router-dom, react-hot-toast, heroicons.

**Added for this feature:** `multer` (file uploads — didn't exist in the app before)
and `node-cron` (runs the "check for due capsules" job every minute). Nothing else —
every addition is a plain Node package plugging into the stack you already have.
Fewer moving pieces to understand and maintain beats a "better" but unfamiliar tool.

## The Actual Build Order

1. **Turned the plain-language request into states and transitions, before writing
   any code.** A "future mail" can be `draft`, `locked` (scheduled), `sent`, or
   `cancelled`. That's the whole feature, really — everything else is either a way
   to move between those states, or a rule about when you're allowed to.

2. **Drew the state machine first, the schema second.**
   `draft → locked → sent` (terminal), or `locked → cancelled` (terminal).
   Every validation rule in the controller is just this diagram written as code.

3. **Designed the schema around the state machine** — a record needs to remember
   not just its current state but how it got there (`lockedAt`, `sentAt`,
   `cancelledAt`, `failReason`), for debugging and for the history view.

4. **Designed the API as a checklist before writing a controller:** create, lock,
   edit, cancel, send-now, get-history. One line per endpoint, method + path +
   purpose, before any implementation.

5. **Read the existing codebase before writing a single new file**, once it was
   shared — how auth works (`protect` middleware, JWT), how email is currently
   sent (a `sendEmail(options)` helper, not a raw transporter), naming conventions
   (`userId`, not `user`), response shape (`res.status(x).json({ message })`).
   New code has to speak the same language as old code, or it becomes the one
   inconsistent corner of the app.

6. **Found the gaps before building on top of them** — no file upload existed
   anywhere in the app, and the email helper couldn't send attachments. Both had
   to be built/extended first, since the new feature depends on them.

7. **Built the backend bottom-up, one layer at a time:** model → upload
   middleware → controller (with the state-transition guards) → routes (wiring)
   → scheduler (the cron job). Each layer only ever talks to the layer below it.

8. **Wired the new routes into `server.js` last** — mounting a route that doesn't
   exist yet is meaningless, so this came after the pieces existed.

9. **Only then touched the frontend** — and read `Dashboard.jsx`, `Sidebar.jsx`,
   `tailwind.config.js` first, to reuse the *existing* visual language (same
   cards, same colors, same icons) instead of inventing a new look for one page.

10. **Updated navigation and routing** (`Sidebar.jsx`, `App.jsx`) — a finished
    page nobody can click into is an unfinished feature.

11. **Testing happened in three passes, not one:**
    - *Self-review* — re-reading the controller and the frontend caught a real
      bug: "Send Now" while editing an existing capsule only saved the edit, it
      never actually triggered a send.
    - *API-level* — extended the existing Postman collection with matching
      conventions (auto-captures `capsule_id`, the same way login auto-captures
      `jwt_token`), so every endpoint could be tested alone, with no UI involved.
    - *End-to-end* — the real test for a scheduler is "lock a capsule 2 minutes
      out, leave the console open, watch it fire." That's the one test that
      proves the whole chain — DB write, cron tick, email send, status update —
      actually works together, not just in isolation.

12. **Deployment was its own pass, done separately, on purpose** — code that
    works on localhost and code that's deployment-ready are different problems.
    This surfaced things that never show up in local dev: Render's free tier
    wipes local disk on every 15-minute idle spin-down (breaks attachments on
    anything but instant sends), and `docker-compose.yml` had pre-existing env
    var name typos that would have crash-looped the container. Current Render
    free-tier behavior was verified with a search rather than assumed from
    memory, since hosting platform terms change over time.

13. **A live bug, from a screenshot, was a third kind of problem again** — a
    Codespaces error revealed `api.js` had `http://localhost:5000` hardcoded.
    In a cloud IDE, "localhost" means the browser's own laptop, not the
    container — something that only ever breaks in that specific environment.
    Fixed with a Vite dev-server proxy, activating logic the code had already
    sketched out (and commented out) itself.

## The General Process — for the next feature you build yourself

1. Write the spec as states and transitions, in plain words. No code yet.
2. Draw the state machine. This becomes every validation rule you'll write.
3. Design the schema from the state machine — what must one record remember?
4. Design the API as a checklist — one line per endpoint — before implementing.
5. Check what you already have (auth, uploads, email, etc.) before building new
   infrastructure. Extend existing utilities instead of duplicating them.
6. Build the backend bottom-up: model → middleware → controller → routes →
   background job. Test each layer with Postman as you finish it.
7. Only after the backend works standalone, build the frontend — this way a bug
   is always clearly "my API" or "my UI," never a tangle of both.
8. Reuse your app's existing look — colors, components, spacing — rather than
   freelancing a new style per feature.
9. Don't forget navigation and routing.
10. Test the full user journey end-to-end, not just each piece alone.
11. Deploy as its own step and expect new bugs — different hosts have different
    rules (disk persistence, networking, cold starts). Read the specific
    platform's docs for exactly these gotchas instead of assuming local
    behavior carries over.
12. Write down what broke and why, somewhere in the repo. Future-you hits the
    same wall otherwise.
