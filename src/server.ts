import { app } from "./app";

const API_PORT = process.env.API_PORT ? parseInt(process.env.API_PORT) : 3000;

async function main() {
    app.listen(API_PORT, () => {
        console.log("Listening on port", API_PORT)
    });
}

main().catch((err) => {
    console.error("Top level error", err);
});
