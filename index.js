const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dataArray = [];
const blocksObject = {};

const createBlock = () => {
    const blocksSortedArray = Object.values(blocksObject).sort(
        (a, b) => a.timestamp - b.timestamp
    );
    const previousBlockHash = blocksSortedArray.length
        ? blocksSortedArray[blocksSortedArray.length - 1].block_hash
        : "0";
    const blockData = [...dataArray].splice(-3);
    const currentBlockHash = crypto
        .createHash("sha256")
        .update(blockData.join(""))
        .digest("hex");

    blocksObject[currentBlockHash] = {
        previous_block_hash: previousBlockHash,
        rows: [...dataArray].splice(-5),
        timestamp: Date.now(),
        block_hash: currentBlockHash
    };
};

app.post("/add_data", (req, res) => {
    const { data } = req.body;

    dataArray.push(data);

    if (dataArray.length % 5 === 0) {
        createBlock();
    }

    res.send("data saved");
});

app.get("/last_blocks/:lastBlocksLength", (req, res) => {
    const { lastBlocksLength } = req.params;

    res.json(
        Object.values(blocksObject)
            .sort((a, b) => b - a)
            .splice(-lastBlocksLength)
    );
});

app.listen(PORT);

console.log(`Server started! At http://localhost:${PORT}`);
