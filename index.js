import express from "express";
import { RaySo, InvalidParameterException } from "rayso";
import puppeteer from "puppeteer";
import data from "./data/data.js";

const app = express();

app.use(express.json());

const raySoConfig = (params) => ({
    title: "Random Quotes for Programmer",
    theme: params.theme,
    padding: "64",
    language: "json",
    background: params.background,
});

const errorResponse = (res, status, message) => {
    res.status(status).json({ error: message });
};

const handleRaySo = async (req, res, codeExtractor) => {
    try {
        const code = codeExtractor(req);
        if (!code) {
            errorResponse(res, 400, "Code parameter is missing.");
            return;
        }

        const raySo = new RaySo(raySoConfig(req.query || req.body));
        const response = await raySo.cook(code);

        res.set("Content-Type", "image/jpeg");
        res.send(response);
    } catch (error) {
        if (error instanceof InvalidParameterException) {
            errorResponse(res, 400, error.message);
        } else {
            errorResponse(res, 500, "An Internal Server Error.");
        }
    }
};

const getRandomData = (data) => {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
};

app.get("/", async (req, res) => {
    try {
        const randomItem = getRandomData(data);

        const encodedCode = `{\n    "quoutes":"${randomItem.en}",\n    "autor":"${randomItem.author}"\n}`;
        const url = `${encodedCode}`;

        await handleRaySo(req, res, () => url);
    } catch (error) {
        console.error("Error:", error);
        errorResponse(res, 500, "An Internal Server Error.");
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
