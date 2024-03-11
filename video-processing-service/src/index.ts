import express from "express";
import {
    downloadRawVideo,
    setupDirectories,
    uploadProcessedVideo,
    convertVideo,
    deleteRawVideo,
    deleteProcessedVideo,
} from "./storage";
import { isVideoNew, setVideo } from "./firestore";

setupDirectories();
const app = express();
app.use(express.json());
app.post("/process-video", async (req, res) => {
    let data;
    try {
        const message = Buffer.from(req.body.message.data, "base64").toString(
            "utf8"
        );
        data = JSON.parse(message);

        if (!data.name) {
            throw new Error("Invalid message payload received");
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send("Bad request: missing filename");
    }
    const inputFileName = data.name; // Format of <UID>-<DATE>.<EXTENSION>
    const outputFileName = `processed-${inputFileName}`;
    const videoId = inputFileName.split('.')[0]
    console.log('inputFileName', inputFileName)

    if (!isVideoNew(videoId)){
        return res.status(400).send('Bad request: video already processing or processed')
    } else {
        await setVideo(videoId, {
            id: videoId,
            uid: videoId.split("-")[0],
            status: "processing"
        })
    }
    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);
    console.log('finished download ', inputFileName)

    // Convert the video to 360p
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (err) {
        Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName),
        ]);

        console.error(err);
        return res
            .status(500)
            .send("Internal Server Error: video processing failed.");
    }
    console.log('finished convert ', inputFileName)

    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);

    await setVideo(videoId, {
        status: "processed",
        filename: outputFileName
    })
    Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName),
    ]);
    console.log('finished upload ', outputFileName)

    return res.status(200).send('OK')
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(
        `Video processing service is running on http://localhost:${port}`
    );
});
