// Import the Gradio client from a CDN that supports ES modules
import { Client } from "https://esm.sh/@gradio/client";

// --- DOM Element Selectors ---
const widthSlider = document.getElementById("width");
const widthValueSpan = document.getElementById("width-value");
const heightSlider = document.getElementById("height");
const heightValueSpan = document.getElementById("height-value");
const stepsSlider = document.getElementById("steps");
const stepsValueSpan = document.getElementById("steps-value");
const generateBtn = document.getElementById("generate-btn");

// New loader and image elements
const loaderOverlay = document.getElementById("loader-overlay");
const randomWordDisplay = document.getElementById("random-word-display");
const generatedImage = document.getElementById("generated-image");

// --- API and UI Logic ---

/**
 * Fetches a single random word from the API.
 * @returns {Promise<string>} A promise that resolves to a random word.
 */
async function getRandomWord() {
    try {
        const res = await fetch("https://random-word-api.herokuapp.com/word?number=1");
        if (!res.ok) throw new Error(`API call failed with status: ${res.status}`);
        const data = await res.json();
        return data[0];
    } catch (error) {
        console.error("Failed to fetch random word:", error);
        return "robot"; // Fallback word
    }
}

/**
 * Shows the full-screen loader overlay.
 * @param {string} word - The word being generated.
 */
function showLoadingState(word) {
    randomWordDisplay.textContent = word;
    loaderOverlay.classList.remove("hidden");
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
}

/**
 * Hides the loader and displays the generated image with an animation.
 * @param {string} imageUrl - The URL of the generated image.
 */
function showResultState(imageUrl) {
    generatedImage.classList.remove("loaded"); // Reset animation class
    generatedImage.src = imageUrl;
    
    // Use the 'onload' event to ensure the image is ready before animating it in
    generatedImage.onload = () => {
        loaderOverlay.classList.add("hidden");
        generatedImage.classList.add("loaded");
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate ✨";
    };
}

/**
 * Handles errors during image generation.
 */
function showErrorState(message) {
    loaderOverlay.classList.add("hidden");
    alert(`An error occurred: ${message}`); // Simple error feedback
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate ✨";
}

/**
 * Main function to generate the image.
 */
async function handleGenerateClick() {
    const randomWord = await getRandomWord();
    showLoadingState(randomWord);

    try {
        const client = await Client.connect("black-forest-labs/FLUX.1-schnell");

        console.log(`Generating with params: ${randomWord}, ${widthSlider.value}x${heightSlider.value}, ${stepsSlider.value} steps`);

        const result = await client.predict("/infer", {
            prompt: `8 bit cartoonish photo of a ${randomWord}`,
            seed: Math.floor(Math.random() * 1_000_000),
            randomize_seed: true,
            width: Number(widthSlider.value),
            height: Number(heightSlider.value),
            num_inference_steps: Number(stepsSlider.value),
        });
        
        const imageUrl = result.data[0]?.url;
        if (!imageUrl) throw new Error("Image URL not found in API response.");

        showResultState(imageUrl);

    } catch (error) {
        console.error("Image generation failed:", error);
        showErrorState(error.message);
    }
}

// --- Event Listeners ---

function initializeApp() {
    generateBtn.addEventListener("click", handleGenerateClick);
    widthSlider.addEventListener("input", () => widthValueSpan.textContent = widthSlider.value);
    heightSlider.addEventListener("input", () => heightValueSpan.textContent = heightSlider.value);
    stepsSlider.addEventListener("input", () => stepsValueSpan.textContent = stepsSlider.value);
}

document.addEventListener("DOMContentLoaded", initializeApp);