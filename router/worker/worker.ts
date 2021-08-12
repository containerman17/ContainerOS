import configGenerator from "./configGenerator";

configGenerator.onConfigChanged(config => {
    console.log("Config changed", config);
})