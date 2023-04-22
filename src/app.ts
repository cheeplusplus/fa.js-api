import * as express from "express";
import { CloudscraperHttpClient, FurAffinityClient, SearchQueryParams } from "fa.js";
import * as ea from "express-async-handler";
import { json } from "body-parser";

declare global {
    namespace Express {
        export interface Request {
            faClient?: FurAffinityClient;
            isLoggedIn?: boolean;
        }
    }
}

export const app = express();

// Add an API key to use this
const API_KEY = process.env.FAJSAPI_KEY || "fajs_local_dev";

app.use((req, res, next) => {
    if (req.headers['x-fajsapi-key'] !== API_KEY) {
        res.status(401).json({ error: true, message: "Not authenticated" });
    } else {
        next();
    }
});

// Set up an FA client for each request

const cloudscraper = new CloudscraperHttpClient();

app.use((req, res, next) => {
    const cookies = req.headers.cookies as string;
    req.isLoggedIn = !!cookies;
    res.setHeader("x-fa-guest", !!cookies ? "false" : "true");

    req.faClient = new FurAffinityClient({ cookies, disableRetry: true, throwErrors: true, httpClient: cloudscraper });
    next();
});

// Generic

app.get("/", (req, res) => {
    res.json({ hi: true });
});

// Self user

app.get("/me", ea(async (req, res) => {
    const msgs = await req.faClient.getMessages();
    res.json({ username: msgs.my_username });
}));

app.get("/me/messages/submissions", ea(async (req, res) => {
    const subs = await req.faClient.getSubmissionsPage();
    res.json(subs);
}));

app.get("/me/messages/other", ea(async (req, res) => {
    const msgs = await req.faClient.getMessages();
    res.json(msgs);
}));

app.get("/me/notes", ea(async (req, res) => {
    const notes = await req.faClient.getNotes();
    res.json(notes);
}));

app.get("/me/notes/:id", ea(async (req, res) => {
    const note = await req.faClient.getNote(req.params.id);
    res.json(note);
}));

// Target user

app.get("/user/:username", ea(async (req, res) => {
    const user = await req.faClient.getUserPage(req.params.username);
    res.json(user);
}));

app.get("/user/:username/gallery/:page", ea(async (req, res) => {
    const gallery = await req.faClient.getUserGalleryPage(req.params.username, req.params.page);
    res.json(gallery);
}));

app.get("/user/:username/scraps/:page", ea(async (req, res) => {
    const gallery = await req.faClient.getUserScrapsPage(req.params.username, req.params.page);
    res.json(gallery);
}));

app.get("/user/:username/favorites/:page", ea(async (req, res) => {
    const gallery = await req.faClient.getUserFavoritesPage(req.params.username, req.params.page);
    res.json(gallery);
}));

app.get("/user/:username/journals", ea(async (req, res) => {
    const journals = await req.faClient.getUserJournals(req.params.username);
    res.json(journals);
}));

app.get("/submission/:id", ea(async (req, res) => {
    const submission = await req.faClient.getSubmission(req.params.id);
    res.json(submission);
}));

app.get("/journal/:id", ea(async (req, res) => {
    const journal = await req.faClient.getJournal(req.params.id);
    res.json(journal);
}));

app.get("/comment/submission/:id", ea(async (req, res) => {
    const comment = await req.faClient.getCommentText(req.params.id, "submission");
    res.json(comment);
}));

app.get("/comment/journal/:id", ea(async (req, res) => {
    const comment = await req.faClient.getCommentText(req.params.id, "journal");
    res.json(comment);
}));

// Search

app.get("/search", ea(async (req, res) => {
    const queryStr = req.query.q as string;
    if (!queryStr) {
        res.status(400).json({ error: true, message: "Missing query parameter" });
        return;
    }

    const queryPage = parseInt(req.query.page as string || "1");

    const searchResults = await req.faClient.getSearchPage(queryStr, undefined, queryPage);
    res.json(searchResults);
}));


app.post("/search", json(), ea(async (req, res) => {
    const { q, page, ...params } = req.body as { q: string, page?: number } & Partial<SearchQueryParams>;
    const searchResults = await req.faClient.getSearchPage(q, params, page || 1);
    res.json(searchResults);
}));
