# Working Log

## 20 July 2021

- Late start today, want to get cracking so I can show something substantial for Wednesday (Earthstar Picnic #4).
- Going to use Tailwind for styling. A bit confusing for beginners but will save a lot of time with styling at this early stage.

---

- Started work on getting threads.
- Wondering how to identify threads - by timestamp?
  - It's _possible_ for two people to post something exactly at the same time, but with small groups, and microseconds... I think we can safely use timestamps as IDs for threads.
  - The way I'm writing `getThread` a malicious user could know how threads are queried and make a doc that starts with `/letterbox/` and ends with `{timestamp}.md`. I guess... I should put the author pubkey in there. Okay.
    - Not exactly friendly URLs but it's not like anybody's going to be spidering these.
- Should everyone be able to tag a thread, or just the author? I'm going to go with just the author for now, we want to see the author's intent rather than everyone's personal filing system.
- Hard time choosing between paths for replying... right now it's `/{workspace}/thread/{authorPubKey}/{timestamp}/reply`, but I also like `/{workspace}/reply/{authorPubKey}/{timestamp}`.
  - Easier to do nested layout with the former, so you can still the whole thread you're replying to inline. Was tempted by opening reply box in a new window, though...
- Added thread view + thread replies. Horrendous layout, but it works.
- Put together an acceptable layout for a prototype.

## 19 July 2021

- Started work on an app for threaded discussions. I'm going to call it Letterbox.
  - Partly because I have a nice idea for a UI element that lets you open/close a letterbox, thereby preventing/allowing in incoming/outgoing posts. Not married to it.
- My motivation is that I'd like for us to dogfood Earthstar more, and have a non-discord place, more long-form space for discussion related to it. 
  - Something in the spaces between Slack, email, and forums.
- I'd like to have simple, linear threads without sub-threading.
- I have a natural disinclination towards channels for mid/long-form discussion. They seem to be really oriented around reducing noise between different departments. I am going to try using tags first.
- I feel like having fine control over posts' 'read' status will be key. I don't like interfaces where something automatically stops being new after it was served for the first time.

---

- **Started work on LetterboxLayer**.
- Simple class which takes a storage, and optional keypair.
- Posts are stored at `/letterbox/~{userKeypair}/{timestamp}.md`;
  - Using timestamps like lobby again - but this time in microseconds to match Earthstar. It's just such a nice way to get a post ID _and_ embed some kind of 'first published' metadata.
- `earthstar-graph-db` does the heavy lifting here.
  - Uses a `HAS_THREAD` edge where the source is the workspace and the destination is the .md document.
    - The author also owns the edge.
    
---

- Worked react-router into the app. I would like to be able to use the back button, basically.
  - It would also be nice for users of the same namespace to be able to link to threads.
    - Which depends on a lot of things, first and foremost them having the same workspaces already configured...
- In order not to put full workspace addresses in URLs (easy to leak via screenshots), I added a way to refer to workspaces using just their name (i.e. non-pubkey part).
  - If two workspaces have the same name, the second one will put its full workspace address in the URL. This can be improved.

--- 

- Made a basic posting UI.
  - Although the current letterbox spec does not enforce thread titles, I've gently enforced it with the UI by making a required title field, the value of which is just prepended to the markdown as a heading.

---

- Miscellaneous thoughts
  - Although I want to avoid subthreading for the time-being, it would be trivial to spawn new threads from replies by just creating a new `HAS_THREAD` edge between a reply and the workspace.
  - How am I going to deal with thread ordering (ie getting all threads by most recently posted to?) in an efficient way?
    - Can I even hope for pagination?
    
### Next time

- Make a thread view where you can add replies.
- Start using some styling.